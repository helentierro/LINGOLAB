import fs from "node:fs";
import http from "node:http";
let pass = 0, fail = 0;
const t = (n, c) => { console.log((c ? "✔ " : "✗ ") + n); c ? pass++ : fail++; };
const html = fs.readFileSync("index.html", "utf8");
const mani = JSON.parse(fs.readFileSync("pwa/manifest.webmanifest", "utf8"));
const sw = fs.readFileSync("sw.js", "utf8");
const enh = fs.readFileSync("js/enhance.js", "utf8");
const over = fs.readFileSync("css/overhaul.css", "utf8");
const app = fs.readFileSync("css/app.css", "utf8");

console.log("── 1. INSTALABLE ──");
t("viewport móvil", html.includes('width=device-width, initial-scale=1.0'));
t("theme-color", html.includes('name="theme-color"'));
t("manifest link", html.includes("pwa/manifest.webmanifest"));
t("manifest: nombre + short_name", !!(mani.name && mani.short_name));
t("manifest: display standalone", mani.display === "standalone");
t("manifest: 192 + 512 existen", fs.existsSync("pwa/icon-192.png") && fs.existsSync("pwa/icon-512.png"));
t("manifest: start_url/scope relativos (subruta /LINGOLAB/ OK)", mani.start_url.startsWith("../") && mani.scope === "../");
console.log("── 2. OFFLINE (SW raíz, alcance total) ──");
t("sw.js en raíz", fs.existsSync("sw.js"));
t("sw viejo eliminado", !fs.existsSync("pwa/sw.js"));
t("registro apunta a sw.js raíz", enh.includes('register("sw.js")'));
const core = [...sw.matchAll(/"([^"]+\.(html|css|js|json|png|webmanifest))"/g)].map((m) => m[1]);
t("CORE tiene index + shell (" + core.length + " archivos)", core.includes("index.html") && core.includes("js/app-legacy.js"));
const missing = core.filter((p) => !fs.existsSync(p));
t("todos los CORE existen en disco", missing.length === 0);
if (missing.length) console.log("  faltan:", missing.join(","));
console.log("── 3. TÁCTIL + RESPONSIVE ──");
t("breakpoints 980/640", app.includes("980px") && app.includes("640px"));
t("nav móvil ≥56px", over.includes("min-height:56px"));
t("chips ≥36px", over.includes("min-height:36px"));
t("mic ≥96px", over.includes("min-width:96px"));
t("inputs heredan 16px (sin zoom iOS/Android)", /body\{[^}]*font-size:16px/.test(app));
console.log("── 4. MICRÓFONO (HTTPS) ──");
t("SW solo en http/https", enh.includes('/^https?:$/'));
const srv = http.createServer((req, res) => {
  try { res.writeHead(200); res.end(fs.readFileSync("." + req.url.split("?")[0])); }
  catch { res.writeHead(404); res.end(); }
});
srv.listen(8134, () => {
  const get = (p) => new Promise((ok) => http.get(`http://localhost:8134/${p}`, (r) => {
    let b = ""; r.on("data", (c) => (b += c)); r.on("end", () => ok({ s: r.statusCode, b }));
  }));
  (async () => {
    const m = await get("sw.js");
    t("sw.js servido en raíz", m.s === 200 && m.b.includes("lingolab-v8"));
    const maniR = await get("pwa/manifest.webmanifest");
    t("manifest servido", maniR.s === 200);
    console.log(`\nTOTAL MÓVIL: ${pass} ✔ · ${fail} ✗`);
    srv.close();
    process.exit(fail ? 1 : 0);
  })();
});
