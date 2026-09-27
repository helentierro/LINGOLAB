import fs from "node:fs";
const pet = fs.readFileSync("js/pet.js", "utf8");
const cssStart = pet.indexOf("const CSS = ");
const css = pet.slice(cssStart, pet.indexOf('";', cssStart));
const checks = [
  ["#cMouth{transform-origin:100px 132px;transform-box:fill-box}", "BUG boca: origin en coords SVG pero fill-box lo mide desde el bbox => pivote fuera => la boca se desplaza/cae al escalar"],
  [".ceye{animation:cblink", "BUG ojos: blink scaleY sin origin => view-box 0,0 => los ojos saltan hacia arriba al parpadear"],
  ["#cHeart:not([hidden]){animation:cheart", "BUG corazón: escala sin origin => crece desde la esquina del SVG"],
  [".talking #cMouth{animation:ctalk", "Disparador: la boca cae CADA VEZ que Crispy habla (tts/echo)"],
  ["transform-box:fill-box", "Solo aparece 1 vez (boca). Ojos/corazón/boca-hablando sin caja definida"],
];
for (const [s, msg] of checks) console.log((css.includes(s) ? "CONFIRMADO " : "no ") + msg);
// bbox real de la boca open: ellipse cx100 cy132 rx7 ry9 => x 93..107, y 123..141
console.log("Boca mide ~14x18px; origin 100px/132px desde su esquina = ~7 anchos fuera. Efecto pelotita: EXPLICADO");
// Auditoría paneles: ¿usan magia/sonidos?
const leg = fs.readFileSync("js/app-legacy.js", "utf8");
const has = (fn, pat) => {
  const i = leg.indexOf("function " + fn);
  const j = leg.indexOf("/*", i + 100);
  const end = leg.indexOf("function ", i + 20);
  const body = leg.slice(i, end > 0 ? end : i + 4000);
  return pat.test(body);
};
console.log("--- Paneles sin magia ---");
console.log("lecciones usa LingoMagic:", /LingoMagic/.test(leg.slice(leg.indexOf("renderLessons"), leg.indexOf("renderLessons") + 3000)) ? "sí" : "NO");
console.log("pronunciación usa LingoMagic:", /LingoMagic/.test(leg.slice(leg.indexOf("showPrResult"), leg.indexOf("showPrResult") + 2500)) ? "sí" : "NO");
console.log("dictado usa LingoMagic:", /LingoMagic/.test(leg.slice(leg.indexOf("btnDicCheck"), leg.indexOf("btnDicCheck") + 2500)) ? "sí" : "NO");
console.log("escritura usa LingoMagic:", /LingoMagic/.test(leg.slice(leg.indexOf("btnWrCheck"), leg.indexOf("btnWrCheck") + 2500)) ? "sí" : "NO");
