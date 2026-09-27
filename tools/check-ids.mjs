import fs from "node:fs";
const html = fs.readFileSync("index.html", "utf8");
const js = fs.readFileSync("js/app-legacy.js", "utf8");
const ids = [...new Set([...js.matchAll(/\$\("([\w-]+)"\)/g)].map((m) => m[1]))];
const missing = ids.filter((id) => !html.includes('id="' + id + '"'));
console.log("IDs usados:", ids.length);
console.log(missing.length ? "FALTAN: " + missing.join(", ") : "Todos los IDs existen OK");
// extras nuevos
for (const id of ["themeBtn", "srsCard", "srsLine", "srsChips"]) {
  console.log(id, html.includes('id="' + id + '"') ? "OK" : "FALTA");
}
