const fs = require("fs");

console.log("Generating app/assets/decorations/manifest.js");

const files = fs.readdirSync("app/assets/decorations", {extensions:/\.png$/});
const contents = "export const assets = " + JSON.stringify(files) + ";";
fs.writeFileSync("app/assets/decorations/manifest.js", contents, { encoding: "utf8" });