const fetch = require("node-fetch");

class UpdateParent {
  constructor(url, token) {
    this.url = url;
    this.headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  getNearestDate(dates) {
    const validDates = dates.filter((date) => date && date.trim());
    return validDates.length > 0
      ? validDates.reduce((earliest, current) =>
          new Date(current) < new Date(earliest) ? current : earliest
        )
      : "";
  }

  async searchRecords(parentId, fieldName) {
    const searchBody = JSON.stringify({
      aql: `select id, pkey, title, ${fieldName} from __main__ where parent_id eq ${parentId} AND pkey co \"SCH\"`,
    });

    const response = await fetch(`${this.url}/records/search`, {
      method: "POST",
      headers: this.headers,
      body: searchBody,
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${await response.text()}`);
    }

    return await response.json();
  }

  async updateParentRecord(parentId, attributes) {
    const updateBody = {
      data: {
        type: "records",
        attributes,
      },
    };

    const response = await fetch(`${this.url}/records/${parentId}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(updateBody),
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${await response.text()}`);
    }

    return response.text();
  }

  async updateParent(recordId) {
    try {
      const metaResponse = await fetch(`${this.url}/records/${recordId}/meta`, {
        headers: this.headers,
      });

      if (!metaResponse.ok) return;

      const metadata = await metaResponse.json();
      const parentId = metadata.data?.relationships?.parent?.data?.id;

      if (!parentId) return;

      const [maintenanceResult, calibrationResult, requalificationResult] =
        await Promise.all([
          this.searchRecords(parentId, "cf_next_pm_due_date"),
          this.searchRecords(parentId, "cf_next_calibration_due"),
          this.searchRecords(parentId, "cf_next_requalification"),
        ]);

      const getDates = (result, fieldName) => {
        return (
          result.data
            ?.map((record) => record.attributes[fieldName])
            .filter((date) => date) || []
        );
      };

      const updateData = {};
      const maintenanceDates = getDates(
        maintenanceResult,
        "cf_next_pm_due_date"
      );
      const calibrationDates = getDates(
        calibrationResult,
        "cf_next_calibration_due"
      );
      const requalificationDates = getDates(
        requalificationResult,
        "cf_next_requalification"
      );

      if (maintenanceDates.length)
        updateData.cf_next_pm_due_date = this.getNearestDate(maintenanceDates);
      if (calibrationDates.length)
        updateData.cf_next_calibration_due =
          this.getNearestDate(calibrationDates);
      if (requalificationDates.length)
        updateData.cf_next_requalification =
          this.getNearestDate(requalificationDates);

      if (Object.keys(updateData).length) {
        await this.updateParentRecord(parentId, updateData);
      }
    } catch (error) {
      console.error("Error updating parent:", error);
      throw error;
    }
  }
}

module.exports = UpdateParent;
