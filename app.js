require("dotenv").config();
const UpdateParent = require("./update_parent");

async function main() {
  const recordId = process.argv[2];
  const projectId = process.argv[3];

  if (!recordId || !projectId) {
    console.error("Missing required arguments");
    process.exit(1);
  }

  try {
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
