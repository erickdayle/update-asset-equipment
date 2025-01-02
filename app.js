import "dotenv/config";
import UpdateParent from "./update_parent.js";

async function main() {
  // Get arguments from process.argv
  const args = process.argv.slice(2);
  let recordId, projectId;

  // Parse arguments
  for (let i = 0; i < args.length; i += 2) {
    if (args[i] === "--recordId") {
      recordId = args[i + 1];
    } else if (args[i] === "--projectId") {
      projectId = args[i + 1];
    }
  }

  if (!recordId || !projectId) {
    console.error("Missing required arguments");
    console.error("Usage: node app.js --recordId <id> --projectId <id>");
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
