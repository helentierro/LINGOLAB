import fs from "node:fs";
import vm from "node:vm";
import http from "node:http";
const js = fs.readFileSync("js/app-legacy.js", "utf8");
function grab(name) {
  const key = `const ${name}=`;
  const idx = js.indexOf(key);
  let i = idx + key.length;
  while (/\s/.test(js[i])) i++;
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
const ST = vm.runInContext(`(${grab("STORIES")})`, sb);
const DG = vm.runInContext(`(${grab("DIALOGS")})`, sb);
// Simula lo que hace la app al abrir biblioteca: busca por id y valida estructura
let ok = true;
for (const s of ST) {
  if (!s.pages || s.pages.length !== 10 || !s.title) { console.log("CUENTO ROTO:", s.id); ok = false; }
}
for (const d of DG) {
  if (!d.turns || d.turns.length !== 60 || !d.name) { console.log("DIÁLOGO ROTO:", d.id); ok = false; }
}
console.log("Biblioteca renderizable:", ST.length, "cuentos +", DG.length, "diálogos", ok ? "✔" : "✗");
// Spot-check de los 10+10 nuevos pedidos
for (const id of ["dream-weaver", "troll-bridge", "alien", "dentist"]) {
  const hit = ST.find((x) => x.id === id) || DG.find((x) => x.id === id);
  console.log("spot", id, hit ? "VISIBLE ✔" : "FALTA ✗");
}
// Fix panel: la regla [hidden] debe existir DESPUÉS del flex
const css = fs.readFileSync("css/overhaul.css", "utf8");
const iFlex = css.indexOf("#view-panel{display:flex");
const iHid = css.indexOf("#view-panel[hidden]{display:none!important}");
console.log("Panel: flex existe:", iFlex >= 0, "| override [hidden] existe y va después:", iHid > iFlex ? "SÍ ✔" : "NO ✗");
// Prueba servida
const srv = http.createServer((req, res) => {
  try { res.writeHead(200); res.end(fs.readFileSync("." + req.url.split("?")[0])); }
  catch { res.writeHead(404); res.end(); }
});
srv.listen(8131, () => {
  const get = (p) => new Promise((ok2) => http.get(`http://localhost:8131/${p}`, (r) => {
    let b = ""; r.on("data", (c) => (b += c)); r.on("end", () => ok2({ s: r.statusCode, b }));
  }));
  (async () => {
    const c = await get("css/overhaul.css");
    console.log("overhaul servido con fix:", c.b.includes("#view-panel[hidden]{display:none!important}") ? "SÍ ✔" : "NO ✗");
    const j = await get("js/app-legacy.js");
    console.log("legacy servido con 30+30:", (j.b.includes('"dream-weaver"') && j.b.includes('"alien"')) ? "SÍ ✔" : "NO ✗");
    srv.close();
  })();
});
