import "dotenv/config";
import UpdateParent from "./update_parent.js";

async function main() {
  const args = process.argv.slice(2);
  let recordId, projectId;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--recordId" && args[i + 1]) {
      recordId = args[i + 1];
      i++; // Skip next argument since we used it
    } else if (args[i] === "--projectId" && args[i + 1]) {
      projectId = args[i + 1];
      i++; // Skip next argument since we used it
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
