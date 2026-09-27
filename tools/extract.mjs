import fs from "node:fs";
const src = fs.readFileSync("index1.html", "utf8");

// 1. CSS
const cssMatch = src.match(/<style>([\s\S]*?)<\/style>/);
if (!cssMatch) throw new Error("no <style>");
fs.writeFileSync("css/app.css", cssMatch[1].trim() + "\n");

// 2. JS (único <script> sin src)
const jsMatch = src.match(/<script>([\s\S]*?)<\/script>/);
if (!jsMatch) throw new Error("no <script>");
const js = jsMatch[1];
fs.writeFileSync("js/app-legacy.js", js.trim() + "\n");

// 3. Datos -> JSON (evaluar los const en un sandbox)
function grab(name) {
  const re = new RegExp(`const ${name}=([\\s\\S]*?);\\n(?:const|\\/\\*|let|function|\\})`, "m");
  // fallback más simple: buscar "const NAME=" y tomar hasta "\n];" o "\n};"
  const idx = js.indexOf(`const ${name}=`);
  if (idx < 0) throw new Error("no " + name);
  const rest = js.slice(idx + (`const ${name}=`.length));
  // detectar terminador según primer char
  let end = rest.indexOf("\n];");
  let end2 = rest.indexOf("\n};");
  let cut = -1;
  if (rest.trimStart().startsWith("[")) cut = end + 3;
  else cut = end2 + 3;
  if (cut < 3) throw new Error("cut fail " + name);
  return rest.slice(0, cut).trim();
}
import vm from "node:vm";
const names = ["VOCAB", "SENTENCES", "STORIES", "DIALOGS", "LEVEL_INFO", "TICKER"];
const sandbox = {};
vm.createContext(sandbox);
for (const n of names) {
  const literal = grab(n);
  const clean = literal.replace(/;\s*$/, "");
  const val = vm.runInContext(`(${clean})`, sandbox);
  fs.writeFileSync(`data/${n.toLowerCase().replace("_", "-")}.json`, JSON.stringify(val, null, 2));
  console.log(n, "->", `data/${n.toLowerCase()}.json`, Array.isArray(val) ? val.length : Object.keys(val).length);
}
console.log("CSS bytes:", cssMatch[1].length, "JS bytes:", js.length);
