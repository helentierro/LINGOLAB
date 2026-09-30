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

// ═══ SINCRONÍA CON LA APP ═══
// La app no hace fetch de estos JSON: lleva una copia embebida en js/app-legacy.js
// (obligatorio para el build single-file y la PWA). Si esa copia se desincroniza,
// la web sirve contenido viejo. data/ es la fuente de verdad (tools/build-content.mjs).
const JS_PATH = "js/app-legacy.js";
if (fs.existsSync(JS_PATH)) {
  const js = fs.readFileSync(JS_PATH, "utf8");
  // Extrae el literal que sigue a `const NOMBRE=` respetando strings y anidamiento
  const literal = (name) => {
    const at = js.indexOf(`const ${name}=`);
    if (at < 0) return null;
    let i = at + `const ${name}=`.length;
    while (/\s/.test(js[i])) i++;
    const open = js[i];
    const close = open === "{" ? "}" : "]";
    const start = i;
    let depth = 0, quote = null, esc = false;
    for (; i < js.length; i++) {
      const c = js[i];
      if (quote) {
        if (esc) esc = false;
        else if (c === "\\") esc = true;
        else if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
      if (c === open) depth++;
      else if (c === close) { depth--; if (!depth) return js.slice(start, i + 1); }
    }
    return null;
  };
  try {
    const antes = fails;
    const embST = JSON.parse(literal("STORIES"));
    const embDG = JSON.parse(literal("DIALOGS"));
    const embSE = JSON.parse(literal("SENTENCES"));

    // mismo conjunto de ids, en el mismo orden
    const chk = (name, emb, src) => {
      if (emb.length !== src.length) fail(`${name}: la app tiene ${emb.length} y data/ tiene ${src.length} — ejecuta node tools/build-content.mjs`);
      const ids = (a) => a.map((x) => x.id).join(",");
      if (ids(emb) !== ids(src)) fail(`${name}: los ids de la app no coinciden con data/ — ejecuta node tools/build-content.mjs`);
    };
    chk("STORIES", embST, stories);
    chk("DIALOGS", embDG, dialogs);

    // contenido idéntico, no solo los ids
    const iguales = (name, emb, src) => {
      if (JSON.stringify(emb) !== JSON.stringify(src)) fail(`${name}: la copia embebida difiere de data/ — ejecuta node tools/build-content.mjs`);
    };
    iguales("STORIES", embST, stories);
    iguales("DIALOGS", embDG, dialogs);
    iguales("SENTENCES", embSE, sentences);
    if (fails === antes) ok(`sincronía app↔data: ${embST.length} cuentos, ${embDG.length} diálogos, ${Object.keys(embSE).length} niveles idénticos`);

    // Alineación de traducciones en Lectura: rdNovel() recorta cada frase EN
    // contra SU ES. Se comprueba que no queden frases EN sin traducción, salvo
    // las coletillas (trozos de continuación de una misma frase), que van sin ES
    // a propósito.
    const cut = (sentence) => {
      const parts = String(sentence).split(/([,.;:!?—]+["”']?\s*)/);
      const out = [];
      let cur = "";
      parts.forEach((pt) => {
        cur += pt;
        if (/[,.;:!?—]+["”']?\s*$/.test(pt)) {
          const t = cur.trim();
          if (t.length > 1 && t.split(" ").length >= 2) out.push(t);
          cur = "";
        }
      });
      if (cur.trim().length > 1 && cur.trim().split(" ").length >= 2) out.push(cur.trim());
      return out;
    };
    let sinTrad = 0, frases = 0, desalineadas = 0;
    for (const s of embST) {
      const en = [], es = [];
      for (const p of s.pages) {
        const n = Math.max(p.en.length, p.es.length);
        for (let i = 0; i < n; i++) {
          const t = cut(p.en[i] || "");
          let puesto = false;
          t.forEach((x) => { en.push(x); es.push(puesto ? "" : (p.es[i] || "")); if (!puesto) puesto = true; });
        }
      }
      if (en.length !== es.length) desalineadas++;
      frases += en.length;
      // cada traducción presente debe existir en los datos del cuento
      const validas = new Set(s.pages.flatMap((p) => p.es));
      es.filter(Boolean).forEach((t) => { if (!validas.has(t)) sinTrad++; });
    }
    if (desalineadas) fail(`Lectura: ${desalineadas} cuentos con EN/ES desalineados`);
    if (sinTrad) fail(`Lectura: ${sinTrad} traducciones que no pertenecen a su cuento`);
    ok(`lectura: ${frases} frases de los ${embST.length} cuentos, traducción alineada`);

    // Toda frase de diálogo debe traer su español
    let turnosSinEs = 0;
    for (const d of embDG) d.turns.forEach((t) => { if (!t[2]) turnosSinEs++; });
    if (turnosSinEs) fail(`diálogos: ${turnosSinEs} turnos sin traducción`);
    ok("diálogos: todos los turnos con traducción");
  } catch (e) {
    fail(`no se pudo leer la copia embebida en ${JS_PATH}: ${e.message}`);
  }
} else {
  console.log("· js/app-legacy.js no encontrado: se omite la comprobación de sincronía");
}

if (fails) { console.error(`\n${fails} error(es)`); process.exit(1); }
console.log("\nTodo el contenido válido ✔");
