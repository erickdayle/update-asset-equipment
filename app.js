// app.js
import "dotenv/config";
import express from "express";
import UpdateParent from "./update_parent.js";

const app = express();
const port = 8080;

// For API approach
app.post("/", async (req, res) => {
  const { record_id, project_id } = req.query;
  await processUpdate(record_id);
  res.json({ status: "success" });
});

// For command line approach
if (require.main === module) {
  const argv = process.argv.slice(2);
  if (argv.length) {
    processUpdate(argv[0]);
  }
}

async function processUpdate(recordId) {
  const updateParent = new UpdateParent(process.env.url, process.env.token);
  await updateParent.updateParent(recordId);
}

app.listen(port);
