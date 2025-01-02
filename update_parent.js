import fetch from "node-fetch";

class UpdateParent {
  constructor(url, token) {
    this.url = url;
    this.headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  getNearestDate(dates) {
    console.log("Getting nearest date from:", dates);
    const validDates = dates.filter((date) => date && date.trim());
    const nearestDate =
      validDates.length > 0
        ? validDates.reduce((earliest, current) =>
            new Date(current) < new Date(earliest) ? current : earliest
          )
        : "";
    console.log("Nearest date found:", nearestDate);
    return nearestDate;
  }

  async searchRecords(parentId, fieldName) {
    console.log(
      `\nSearching records for parentId: ${parentId}, fieldName: ${fieldName}`
    );
    const searchBody = JSON.stringify({
      aql: `select id, pkey, title, ${fieldName} from __main__ where parent_id eq ${parentId} AND pkey co \"SCH\"`,
    });

    console.log("Search query:", searchBody);
    const response = await fetch(`${this.url}/records/search`, {
      method: "POST",
      headers: this.headers,
      body: searchBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Search failed for ${fieldName}:`, errorText);
      throw new Error(`Search failed: ${errorText}`);
    }

    const result = await response.json();
    console.log(
      `Search results for ${fieldName}:`,
      JSON.stringify(result, null, 2)
    );
    return result;
  }

  async updateParentRecord(parentId, attributes) {
    console.log("\nUpdating parent record:", parentId);
    console.log("Update attributes:", JSON.stringify(attributes, null, 2));

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
      const errorText = await response.text();
      console.error("Update failed:", errorText);
      throw new Error(`Update failed: ${errorText}`);
    }

    console.log("Parent record updated successfully");
    return response.text();
  }

  async updateParent(recordId) {
    try {
      console.log("\nStarting parent update process for record:", recordId);

      const metaResponse = await fetch(`${this.url}/records/${recordId}/meta`, {
        headers: this.headers,
      });

      if (!metaResponse.ok) {
        console.error("Failed to fetch metadata");
        return;
      }

      const metadata = await metaResponse.json();
      console.log("Record metadata:", JSON.stringify(metadata, null, 2));

      const parentId = metadata.data?.relationships?.parent?.data?.id;

      if (!parentId) {
        console.log("No parent ID found, skipping update");
        return;
      }

      console.log("Found parent ID:", parentId);

      console.log("\nFetching scheduler records...");
      const [maintenanceResult, calibrationResult, requalificationResult] =
        await Promise.all([
          this.searchRecords(parentId, "cf_next_pm_due_date"),
          this.searchRecords(parentId, "cf_next_calibration_due"),
          this.searchRecords(parentId, "cf_next_requalification"),
        ]);

      const getDates = (result, fieldName) => {
        const dates =
          result.data
            ?.map((record) => record.attributes[fieldName])
            .filter((date) => date) || [];
        console.log(`Extracted dates for ${fieldName}:`, dates);
        return dates;
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

      console.log("\nFinal update data:", JSON.stringify(updateData, null, 2));

      if (Object.keys(updateData).length) {
        await this.updateParentRecord(parentId, updateData);
        console.log("Parent record update completed successfully");
      } else {
        console.log("No updates needed for parent record");
      }
    } catch (error) {
      console.error("Error updating parent:", error);
      throw error;
    }
  }
}

export default UpdateParent;
