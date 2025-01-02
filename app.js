import "dotenv/config";
import UpdateParent from "./update_parent.js";

async function main() {
  // Get arguments from process.argv
  // process.argv[0] is 'node'
  // process.argv[1] is 'app.js'
  // process.argv[2] will be recordId
  // process.argv[3] will be projectId
  const recordId = process.argv[2];
  const projectId = process.argv[3];

  if (!recordId || !projectId) {
    console.error("Missing required arguments");
    console.error("Usage: node app.js <recordId> <projectId>");
    process.exit(1);
  }

  try {
    console.log(
      `Starting update for Record ID: ${recordId}, Project ID: ${projectId}`
    );
    const updateParent = new UpdateParent(
      process.env.ENDPOINT_DOMAIN,
      process.env.ACCESS_TOKEN
    );
    await updateParent.updateParent(recordId);
    console.log("Successfully updated parent record");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
