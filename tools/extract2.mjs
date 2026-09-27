import fs from "node:fs";
import vm from "node:vm";
const js = fs.readFileSync("js/app-legacy.js", "utf8");
function grab(name) {
  const key = `const ${name}=`;
  const idx = js.indexOf(key);
  if (idx < 0) throw new Error("no " + name);
  let i = idx + key.length;
  while (js[i] === " " || js[i] === "\n" || js[i] === "\t") i++;
  const start = i;
  let depthC = 0, depthB = 0, inS = null, esc = false;
  for (; i < js.length; i++) {
    const c = js[i];
    if (inS) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === inS) inS = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { inS = c; continue; }
    if (c === "{") depthC++;
    else if (c === "}") depthC--;
    else if (c === "[") depthB++;
    else if (c === "]") depthB--;
    else if (c === ";" && depthC === 0 && depthB === 0) break;
  }
  return js.slice(start, i).trim();
}
const sandbox = {};
vm.createContext(sandbox);
for (const n of ["VOCAB", "SENTENCES", "STORIES", "DIALOGS", "LEVEL_INFO", "TICKER"]) {
  const literal = grab(n);
  const val = vm.runInContext(`(${literal})`, sandbox);
  const out = `data/${n.toLowerCase().replace("_", "-")}.json`;
  // VOCAB viene como objeto {cat:[...]} lo guardamos tal cual
  fs.writeFileSync(out, JSON.stringify(val, null, 1));
  console.log(n, "OK", out, JSON.stringify(val).length, "chars");
}
