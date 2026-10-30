import fs from "node:fs";
import { marked } from "marked";

const markdown = fs.readFileSync("07_clean_code.md", "utf8");
const html = marked.parse(markdown);

fs.writeFileSync("07_clean_code.html", html);
console.log("Converted 07_clean_code.md to 07_clean_code.html");
