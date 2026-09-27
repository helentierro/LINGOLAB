import fs from "node:fs";
const html = fs.readFileSync("index.html", "utf8");
const pet = fs.readFileSync("js/pet.js", "utf8");
// IDs que pet.js busca con $("...") o getElementById("...")
const ids = [...new Set([...pet.matchAll(/\$\("([\w-]+)"\)/g)].map((m) => m[1]).concat([...pet.matchAll(/getElementById\("([\w-]+)"\)/g)].map((m) => m[1])))];
const dyn = new Set(["crispySvg", "crispyEchoIn", "crispyEchoGo", "crispyNameIn", "crispyNameGo", "cEyes", "cMouth", "cTears", "cHeart", "crispyFloat", "crispyTail", "crispyHead"]); // creados por el propio SVG/burbuja
let bad = 0;
for (const id of ids) {
  const inHTML = html.includes('id="' + id + '"');
  const inPet = pet.includes('id="' + id + '"') || dyn.has(id);
  if (!inHTML && !inPet) { console.log("FALTA:", id); bad++; }
}
console.log(ids.length + " IDs usados en pet.js,", bad ? bad + " faltantes" : "todos existen ✔");
// emociones definidas vs usadas
const eyeDefs = [...pet.matchAll(/^\s{4}(\w+): '<path|^ {4}(\w+): '<g|^ {4}(\w+): '<ellipse|^ {4}(\w+): '<text/gm)].map((m) => m[1] || m[2] || m[3] || m[4]);
console.log("ojos definidos:", [...new Set(eyeDefs)].join(","));
