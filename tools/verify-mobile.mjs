import fs from "node:fs";
import http from "node:http";
const h = fs.readFileSync("dist-hermana/lingolab.html", "utf8");
const must = ["dream-weaver", "alien", "crispyEcho", "gamesBox", "quizCatChips", "LingoCulture", "Repíteme", '"mexico"', '"country"'];
const gone = ['src="js/', 'href="css/', 'rel="manifest"', "pwa/sw.js"];
let bad = 0;
for (const c of must) {
  const ok = h.includes(c);
  console.log((ok ? "✔ tiene " : "✗ FALTA ") + c);
  if (!ok) bad++;
}
for (const c of gone) {
  const ok = !h.includes(c);
  console.log((ok ? "✔ libre de " : "✗ RESTO ") + c);
  if (!ok) bad++;
}
console.log("IDs legacy:", (h.match(/id="[a-zA-Z-]+"/g) || []).length, "atributos id");
// Servir y comprobar que no pide archivos locales (solo Google Fonts externo)
const srv = http.createServer((req, res) => {
  try { res.writeHead(200); res.end(fs.readFileSync("dist-hermana" + req.url.split("?")[0])); }
  catch { res.writeHead(404); res.end("nf"); }
});
srv.listen(8133, () => {
  http.get("http://localhost:8133/lingolab.html", (r) => {
    let b = "";
    r.on("data", (c) => (b += c));
    r.on("end", () => {
      console.log(b.length > 300000 ? "✔ servido completo (" + (b.length / 1024).toFixed(0) + " KB)" : "✗ incompleto");
      const ext = [...b.matchAll(/(src|href)="(?!#|data:)([^"]+)"/g)].map((m) => m[2]);
      console.log("referencias externas:", JSON.stringify([...new Set(ext)]));
      srv.close();
      process.exit(bad ? 1 : 0);
    });
  });
});
