const { exec } = require("child_process");
const path = require("path");

const path_to_scripts = __dirname;

exec(`node "${path.join(path_to_scripts, "NST-fetchCSV.js")}"`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error fetching CSV files: ${error.message}`);
    return;
  }
  console.log("CSV Files Fetched:");
  console.log(stdout);

  exec(`node "${path.join(path_to_scripts, "NST-updateDB.js")}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Could not update database: ${error.message}`);
      return;
    }
    console.log("Database Updated Successfully:");
    console.log(stdout);

    console.log("All graphs updated successfully!");
  });
});
