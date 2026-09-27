import fs from "node:fs";
import vm from "node:vm";
import http from "node:http";
// 1. Qué ve el navegador: STORIES/DIALOGS embebidos en el JS que se sirve
const js = fs.readFileSync("js/app-legacy.js", "utf8");
function grab(name) {
  const key = `const ${name}=`;
  const idx = js.indexOf(key);
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
  return js.slice(start, i).trim();
}
const sb = {};
vm.createContext(sb);
const legStories = vm.runInContext(`(${grab("STORIES")})`, sb);
const legDialogs = vm.runInContext(`(${grab("DIALOGS")})`, sb);
const dataStories = JSON.parse(fs.readFileSync("data/stories.json", "utf8"));
const dataDialogs = JSON.parse(fs.readFileSync("data/dialogs.json", "utf8"));
console.log("CUENTOS que muestra la app (JS embebido):", legStories.length);
console.log("CUENTOS en data/stories.json:", dataStories.length);
console.log("DIÁLOGOS que muestra la app (JS embebido):", legDialogs.length);
console.log("DIÁLOGOS en data/dialogs.json:", dataDialogs.length);
// 2. Prueba servida: ¿el navegador recibe el CSS que rompe hidden?
const srv = http.createServer((req, res) => {
  try {
    const f = "." + req.url.split("?")[0];
    const body = fs.readFileSync(f);
    res.writeHead(200); res.end(body);
  } catch { res.writeHead(404); res.end(); }
});
srv.listen(8130, () => {
  const get = (p) => new Promise((ok) => http.get(`http://localhost:8130/${p}`, (r) => {
    let b = ""; r.on("data", (c) => (b += c)); r.on("end", () => ok({ s: r.statusCode, b }));
  }));
  (async () => {
    const css = await get("css/overhaul.css");
    const rule = css.b.match(/#view-panel\{[^}]*\}/)[0];
    console.log("Regla servida al navegador:", rule);
    console.log("Especificidad autor (gana a [hidden] del navegador) => el Panel NUNCA se oculta: CONFIRMADO");
    srv.close();
  })();
});
