import fs from "node:fs";
import vm from "node:vm";
const P = "js/app-legacy.js";
let js = fs.readFileSync(P, "utf8");
function grab(name) {
  const key = `const ${name}=`;
  const idx = js.indexOf(key);
  if (idx < 0) throw new Error("no " + name);
  let i = idx + key.length;
  while (js[i] === " " || js[i] === "\n" || js[i] === "\t") i++;
  const start = i;
  let dc = 0, db = 0, inS = null, esc = false;
  for (; i < js.length; i++) {
    const c = js[i];
    if (inS) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === inS) inS = null; continue; }
    if (c === '"' || c === "'" || c === "`") { inS = c; continue; }
    if (c === "{") dc++; else if (c === "}") dc--;
    else if (c === "[") db++; else if (c === "]") db--;
    else if (c === ";" && dc === 0 && db === 0) break;
  }
  return { literal: js.slice(start, i).trim(), end: i };
}
const sb = {};
vm.createContext(sb);
for (const [name, file] of [["STORIES", "data/stories.json"], ["DIALOGS", "data/dialogs.json"]]) {
  const { literal } = grab(name);
  const leg = vm.runInContext(`(${literal})`, sb);
  const have = new Set(leg.map((x) => x.id));
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const fresh = data.filter((x) => !have.has(x.id));
  console.log(name, "legacy:", leg.length, "| nuevos:", fresh.map((x) => x.id).join(",") || "(ninguno)");
  if (!fresh.length) continue;
  const add = JSON.stringify(fresh);
  const inner = add.slice(1, -1); // quita [ ]
  const merged = literal.slice(0, -1) + "," + inner + "]";
  js = js.replace(literal, merged);
}
fs.writeFileSync(P, js);
console.log("sync OK");
