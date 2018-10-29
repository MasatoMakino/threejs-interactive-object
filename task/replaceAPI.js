const replace = require("replace-in-file");

const options = {
  //Glob(s)
  files: ["docs/api/**/*.html"],
  //Replacement to make (string or regex)
  from: /\/Users.*node_modules\//g,
  to: "node_modules/"
};

try {
  let changedFiles = replace.sync(options);
  console.log("Modified files:", changedFiles.join(", "));
} catch (error) {
  console.error("Error occurred:", error);
}
