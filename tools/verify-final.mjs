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
    t("lecciones: contador FRASE x/y", leg.b.includes('" · FRASE "+(lpI+1)+"/"+total'));
    t("lecciones: 4 pasos guiados", /const PASOS=\["Escucha","Entiende","Repite","Dominas"\]/.test(leg.b));
    t("lecciones: pregunta de comprensión", leg.b.includes("function lpMontarQuiz"));
    t("lecciones: corrección con el micro", leg.b.includes("function lpMic"));
    t("lecciones: progreso por nivel", leg.b.includes("function lpEstado"));
    t("lecciones: XP de nivel solo una vez", leg.b.includes("state.lessonsXp"));
    t("pronunciación: pop-in + tiers", leg.b.includes('pr.classList.add("pop-in")'));
    t("pronunciación: un solo resultado por intento", leg.b.includes("recResuelto"));
    t("dictado: pill 🔊 ×n", leg.b.includes('"🔊 ×"+dicPlays'));
    t("dictado: muestra el español", leg.b.includes('dicEs'));
    t("dictado: tiers magic", leg.b.includes('dr.classList.add("pop-in")'));
    t("escritura: tiers magic", leg.b.includes('wr.classList.add("pop-in")'));
    t("lectura: barra de acciones de frase", leg.b.includes("function mostrarAccionesFrase"));
    t("lectura: pausa del capítulo", leg.b.includes("function pintarParada"));
    t("audio: no speak() tras cancel() en el mismo tick", /if\(sonando\)\{speechSynthesis\.cancel\(\);setTimeout\(arrancar,\d+\);\}/.test(leg.b));
    t("audio: callarTTS al cambiar de sección", /callarTTS\(\);[\s\S]{0,200}Crispy\.callar/.test(leg.b));
    t("vocab: las tarjetas usan la lista filtrada", /btnFlash[\s\S]{0,400}vocabFiltrada\(\)/.test(leg.b));
    t("antirruido: se apaga al pausar", /function rdPause\(\)\{[\s\S]{0,500}Antirruido\.apagar\(\)/.test(leg.b));
    t("30+30 intactos", leg.b.includes('"dream-weaver"') && leg.b.includes('"alien"'));
    const sh = await get("js/shortcuts.js");
    t("enter global registrado en captura", sh.b.includes('addEventListener("keydown", enterGlobal, true)'));
    t("enter: envía y luego avanza", sh.b.includes("if (yaEnviado) avanzar()"));
    t("enter: shift no avanza", sh.b.includes("e.shiftKey"));
    const crispy = await get("js/pet.js");
    t("Crispy usa el motor de voz común", crispy.b.includes('typeof speak === "function"'));
    t("Crispy no pisa onvoiceschanged", !/speechSynthesis\.onvoiceschanged\s*=/.test(crispy.b));
    t("Crispy no roba el foco al arrancar", crispy.b.includes("crispyNameAsk"));
    const css = await get("css/overhaul.css");
    t("CSS: .pop-in", css.b.includes(".pop-in{animation:popIn"));
    t("CSS: #dicPlays pill", css.b.includes("#dicPlays{"));
    t("CSS: .diff-legend", css.b.includes(".diff-legend{"));
    t("CSS: panel hidden intacto", css.b.includes("#view-panel[hidden]{display:none!important}"));
    t("CSS: barra lateral con dvh y scroll", /nav\.side\{[\s\S]{0,300}100dvh/.test(css.b) && /nav\.side\{[\s\S]{0,400}overflow-y:auto/.test(css.b));
    // quitamos comentarios: el texto "scroll-snap" sigue apareciendo explicándolo
    const cssSinComentarios = css.b.replace(/\/\*[\s\S]*?\*\//g, "");
    t("CSS: sin scroll-snap forzado (movimiento fantasma)", !/scroll-snap-type\s*:/.test(cssSinComentarios));
    t("CSS: barra de acciones de frase", css.b.includes(".rd-actions"));
    t("CSS: pasos de la lección", css.b.includes(".lp-step"));
    const app = await get("css/app.css");
    t("cinta: hueco dentro de cada frase (sin salto)", app.b.includes(".ticker-track>span{padding-right"));
    const html = await get("index.html");
    t("HTML: leyenda en escritura", html.b.includes("diff-legend"));
    t("HTML: tarjeta Crispy intacta", html.b.includes('id="crispyEcho"'));
    t("HTML: barra de acciones presente", html.b.includes('id="rdActions"'));
    t("HTML: 4 pasos de lección presentes", ["lp1", "lp2", "lp3", "lp4"].every((x) => html.b.includes('id="' + x + '"')));
    console.log(`\nTOTAL: ${pass} ✔ · ${fail} ✗`);
    srv.close();
    process.exit(fail ? 1 : 0);
  })();
});
