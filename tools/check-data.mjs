// Validador de contenido LingoLab 2.0 — gratis, sin dependencias.
import fs from "node:fs";
let fails = 0;
const fail = (m) => { fails++; console.error("✗ " + m); };
const ok = (m) => console.log("✓ " + m);

const vocab = JSON.parse(fs.readFileSync("data/vocab.json", "utf8"));
const sentences = JSON.parse(fs.readFileSync("data/sentences.json", "utf8"));
const stories = JSON.parse(fs.readFileSync("data/stories.json", "utf8"));
const dialogs = JSON.parse(fs.readFileSync("data/dialogs.json", "utf8"));
const culture = JSON.parse(fs.readFileSync("data/culture.json", "utf8")); const seenC = new Set();
culture.forEach((c, i) => {
  if (!c.id || !c.emoji || !c.country || !c.capital || !c.dish || !c.fact) fail(`culture[${i}]: campos incompletos`);
  else {
    for (const k of ["country", "capital", "dish", "fact"]) {
      if (!c[k].en || !c[k].es) fail(`culture ${c.id}.${k}: sin EN/ES`);
    }
  }
  if (seenC.has(c.id)) fail(`culture duplicado: ${c.id}`);
  seenC.add(c.id);
});
ok(`culture: ${culture.length} países`);

// VOCAB: {cat: [[en,es,ipa,ex,exEs],...]}
let n = 0;
const seen = new Set();
for (const [cat, list] of Object.entries(vocab)) {
  if (!Array.isArray(list) || !list.length) fail(`categoría vacía: ${cat}`);
  for (const w of list) {
    n++;
    if (!Array.isArray(w) || w.length !== 5) fail(`vocab formato [en,es,ipa,ex,exEs]: ${JSON.stringify(w).slice(0, 60)}`);
    const [en, es, ipa, ex] = w;
    if (!en || !es || !ipa || !ex) fail(`vocab incompleto: ${en}`);
    const k = String(en).toLowerCase();
    if (seen.has(k)) fail(`vocab duplicado: ${en}`);
    seen.add(k);
  }
}
ok(`vocab: ${n} palabras en ${Object.keys(vocab).length} categorías`);

// SENTENCES por nivel
for (const [lvl, list] of Object.entries(sentences)) {
  if (!list.length) fail(`nivel vacío: ${lvl}`);
  list.forEach((s, i) => {
    if (!Array.isArray(s) || s.length !== 2 || !s[0] || !s[1]) fail(`${lvl}[${i}] sin EN/ES`);
  });
}
ok(`sentences: niveles ${Object.keys(sentences).join(", ")}`);

// STORIES: 10 páginas x 2 frases + vocab por página
stories.forEach((s) => {
  if (!s.id || !s.title || !s.pages) fail("cuento sin id/título/páginas");
  if (s.pages.length !== 10) fail(`${s.id}: tiene ${s.pages.length} páginas, esperado 10`);
  s.pages.forEach((p, i) => {
    if (p.en.length !== 2 || p.es.length !== 2) fail(`${s.id} p${i}: esperado 2 frases EN/ES`);
    if (!p.vocab || !Object.keys(p.vocab).length) fail(`${s.id} p${i}: sin vocab`);
  });
});
ok(`stories: ${stories.length} cuentos`);

// DIALOGS: 30 intercambios A/B
dialogs.forEach((d) => {
  if (!d.id || !d.turns) fail("diálogo sin id/turnos");
  if (d.turns.length !== 60) fail(`${d.id}: tiene ${d.turns.length} turnos, esperado 60 (30 A/B)`);
  d.turns.forEach((t, i) => {
    if (t.length !== 3 || (t[0] !== "A" && t[0] !== "B") || !t[1] || !t[2]) fail(`${d.id} turno ${i}: formato [A|B,en,es]`);
  });
});
ok(`dialogs: ${dialogs.length} diálogos`);

if (fails) { console.error(`\n${fails} error(es)`); process.exit(1); }
console.log("\nTodo el contenido válido ✔");
