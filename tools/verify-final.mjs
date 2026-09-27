import fs from "node:fs";
import http from "node:http";
const srv = http.createServer((req, res) => {
  try { res.writeHead(200); res.end(fs.readFileSync("." + req.url.split("?")[0])); }
  catch { res.writeHead(404); res.end(); }
});
srv.listen(8132, () => {
  const get = (p) => new Promise((ok) => http.get(`http://localhost:8132/${p}`, (r) => {
    let b = ""; r.on("data", (c) => (b += c)); r.on("end", () => ok({ s: r.statusCode, b }));
  }));
  (async () => {
    let pass = 0, fail = 0;
    const t = (name, cond) => { console.log((cond ? "✔ " : "✗ ") + name); cond ? pass++ : fail++; };
    const pet = await get("js/pet.js");
    t("pet.js servido", pet.s === 200);
    t("boca: origin center + fill-box", pet.b.includes("#cMouth{transform-origin:center;transform-box:fill-box}"));
    t("ojos: origin center + fill-box", pet.b.includes(".ceye{transform-origin:center;transform-box:fill-box}"));
    t("corazón: origin center + fill-box", pet.b.includes("#cHeart{transform-origin:center;transform-box:fill-box}"));
    t("sin rastro del pivote viejo (100px 132px)", !pet.b.includes("100px 132px"));
    const leg = await get("js/app-legacy.js");
    t("lecciones: contador FRASE x/y", leg.b.includes('FRASE "+(lpI+1)+"/"+SENTENCES[lpLvl].length'));
    t("lecciones: celebrate(3) al completar", /LingoMagic\.celebrate\(3\);\}\s*catch\(e\)\{\}\s*\n\s*\$\("lpDone"\)/.test(leg.b));
    t("pronunciación: pop-in + tiers", leg.b.includes('pr.classList.add("pop-in")'));
    t("dictado: pill 🔊 ×n", leg.b.includes('"🔊 ×"+dicPlays'));
    t("dictado: tiers magic", leg.b.includes('dr.classList.add("pop-in")'));
    t("escritura: tiers magic", leg.b.includes('wr.classList.add("pop-in")'));
    t("30+30 intactos", leg.b.includes('"dream-weaver"') && leg.b.includes('"alien"'));
    const css = await get("css/overhaul.css");
    t("CSS: .pop-in", css.b.includes(".pop-in{animation:popIn"));
    t("CSS: #dicPlays pill", css.b.includes("#dicPlays{"));
    t("CSS: .diff-legend", css.b.includes(".diff-legend{"));
    t("CSS: panel hidden intacto", css.b.includes("#view-panel[hidden]{display:none!important}"));
    const html = await get("index.html");
    t("HTML: leyenda en escritura", html.b.includes("diff-legend"));
    t("HTML: tarjeta Crispy intacta", html.b.includes('id="crispyEcho"'));
    console.log(`\nTOTAL: ${pass} ✔ · ${fail} ✗`);
    srv.close();
    process.exit(fail ? 1 : 0);
  })();
});
