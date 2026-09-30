// Comprueba que todo id que el JS busca con $("...") exista en el HTML.
//   node tools/check-ids.mjs
import fs from "node:fs";
const html = fs.readFileSync("index.html", "utf8");
const js = fs.readFileSync("js/app-legacy.js", "utf8");

/* ids que la propia app crea en caliente y por eso no están en el HTML */
const DINAMICOS = new Set(["quizCatChips", "btnSelfListen", "wtEs", "lpNoSe", "crispyNameAsk"]);

const ids = [...new Set([...js.matchAll(/\$\("([\w-]+)"\)/g)].map((m) => m[1]))];
const faltan = ids.filter((id) => !html.includes('id="' + id + '"') && !DINAMICOS.has(id));

console.log("IDs usados por el JS:", ids.length);
// ids presentes en el HTML que el JS nunca consulta (aviso, no error)
const huerfanos = [...new Set([...html.matchAll(/id="([\w-]+)"/g)].map((m) => m[1]))]
  .filter((id) => !ids.includes(id) && !DINAMICOS.has(id)
    && !/^(view-|nav|rd|dg|wr|dic|pr|q|lp|gm|cn|crispy|wt|pg|sp|cn)/.test(id));

console.log(faltan.length ? "✗ FALTAN: " + faltan.join(", ") : "✔ Todos los IDs existen OK");
if (huerfanos.length) console.log("  (ids en el HTML que el JS no usa: " + huerfanos.join(", ") + ")");
process.exit(faltan.length ? 1 : 0);
