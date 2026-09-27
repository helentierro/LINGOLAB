import fs from "node:fs";
const js = fs.readFileSync("js/app-legacy.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
// ¿La app usa los JSON de datos o los const embebidos?
console.log("legacy define const STORIES:", js.includes("const STORIES="));
console.log("legacy define const DIALOGS:", js.includes("const DIALOGS="));
console.log("legacy hace fetch a stories.json:", js.includes("stories.json"));
console.log("legacy hace fetch a dialogs.json:", js.includes("dialogs.json"));
console.log("index.html referencia stories.json:", html.includes("stories.json"));
console.log("index.html referencia dialogs.json:", html.includes("dialogs.json"));
// ¿overhaul rompe hidden?
const css = fs.readFileSync("css/overhaul.css", "utf8");
console.log("overhaul pone display:flex a #view-panel:", css.includes("#view-panel{display:flex"));
console.log("overhaul respeta [hidden]:", css.includes("[hidden]"));
