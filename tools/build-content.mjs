// Regenera los literales STORIES y DIALOGS de js/app-legacy.js desde data/*.json.
// data/ es la fuente de verdad: la app lleva una copia embebida porque es
// single-file / PWA, pero esa copia SOLO se toca desde aquí.
//
//   node tools/build-content.mjs
//
// Reemplaza el array completo (no fusiona), así el JSON siempre gana.
import fs from "node:fs";

const P = "js/app-legacy.js";
let js = fs.readFileSync(P, "utf8");

const OPEN = { "[": "]", "{": "}" };

/** Devuelve {start,end} del literal `[...]` o `{...}` que sigue a `const NAME=` */
function span(name) {
  const key = `const ${name}=`;
  const at = js.indexOf(key);
  if (at < 0) throw new Error(`no encuentro ${key} en ${P}`);
  let i = at + key.length;
  while (/\s/.test(js[i])) i++;
  const open = js[i];
  if (!OPEN[open]) throw new Error(`${name}: esperaba [ o { y hay ${JSON.stringify(open)}`);
  const close = OPEN[open];
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
    else if (c === close) { depth--; if (depth === 0) return { start, end: i + 1 }; }
  }
  throw new Error(`${name}: literal sin cerrar`);
}

function replace(name, data, file) {
  const { start, end } = span(name);
  const lit = JSON.stringify(data);
  const kb = (n) => (n / 1024).toFixed(1) + " KB";
  console.log(`${name}: ${kb(end - start)} -> ${kb(lit.length)} · fuente ${file}`);
  js = js.slice(0, start) + lit + js.slice(end);
}

const stories = JSON.parse(fs.readFileSync("data/stories.json", "utf8"));
const dialogs = JSON.parse(fs.readFileSync("data/dialogs.json", "utf8"));
const sentences = JSON.parse(fs.readFileSync("data/sentences.json", "utf8"));

replace("STORIES", stories, "data/stories.json");
replace("DIALOGS", dialogs, "data/dialogs.json");

// SENTENCES: nivel = clave, valor = array de [en, es]
const s = span("SENTENCES");
const body = Object.entries(sentences)
  .map(([lvl, list]) => `${JSON.stringify(lvl)}:${JSON.stringify(list)}`)
  .join(",");
js = js.slice(0, s.start) + "{" + body + "}" + js.slice(s.end);
console.log(`SENTENCES: ${Object.keys(sentences).length} niveles · ${((s.end - s.start) / 1024).toFixed(1)} KB -> ${(body.length / 1024).toFixed(1)} KB`);

fs.writeFileSync(P, js);
console.log(`${P}: ${(js.length / 1024).toFixed(1)} KB · sincronizado OK`);
