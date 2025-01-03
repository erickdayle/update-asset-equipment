import "dotenv/config";
import UpdateParent from "./update_parent.js";

async function main() {
  const recordId = process.argv[2];
  const projectId = process.argv[3];

  try {
    const updateParent = new UpdateParent(process.env.url, process.env.token);
    await updateParent.updateParent(recordId);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
