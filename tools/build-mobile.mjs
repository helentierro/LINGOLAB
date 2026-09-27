// Genera dist-hermana/lingolab.html — app aparte, single-file, minificada.
// El proyecto original queda intacto.
import fs from "node:fs";
import path from "node:path";

const OUT = "dist-hermana";
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, "_check"), { recursive: true });

function cssMin(s) {
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  s = s.replace(/\s+/g, " ");
  s = s.replace(/\s*([{}:;,>+~])\s*/g, "$1");
  return s.trim();
}
// Minificador JS cuidadoso: respeta strings, templates y regex (heurística estándar).
function jsMin(s) {
  let out = "", i = 0;
  const n = s.length;
  let prev = ";"; // último char significativo
  const isWord = (c) => /[\w$]/.test(c || "");
  while (i < n) {
    const c = s[i], d = s[i + 1];
    // strings
    if (c === '"' || c === "'" || c === "`") {
      const q = c;
      out += c; i++;
      let tpl = 0;
      while (i < n) {
        const ch = s[i];
        out += ch;
        if (ch === "\\") { out += s[i + 1] || ""; i += 2; continue; }
        if (q === "`") {
          if (ch === "$" && s[i + 1] === "{") { out += "{"; i += 2; tpl++; continue; }
          if (ch === "}" && tpl > 0) { tpl--; i++; continue; }
          if (ch === "`" && tpl === 0) { i++; break; }
          i++; continue;
        }
        i++;
        if (ch === q) break;
      }
      prev = q;
      continue;
    }
    // comentarios
    if (c === "/" && d === "/") {
      // ¿regex o división? heurística: regex si prev es inicio de expresión
      const m = out.match(/([A-Za-z_$][\w$]*)\s*$/);
      const kw = m && /^(return|typeof|case|delete|do|else|in|new|void|yield|of)$/.test(m[1]);
      if (/[=(:,[!&|?{};+\-~^%*<>]/.test(prev) || kw || prev === ";") {
        // posible regex //... no existe regex vacío real; tratar como comentario solo si hay salto antes del cierre
        // Para nuestro código: // siempre es comentario (ningún regex empieza con //)
      }
      // es comentario de línea: saltar hasta \n
      while (i < n && s[i] !== "\n") i++;
      out += "\n";
      continue;
    }
    if (c === "/" && d === "*") {
      i += 2;
      while (i < n && !(s[i] === "*" && s[i + 1] === "/")) i++;
      i += 2;
      out += " ";
      continue;
    }
    // regex literal vs división
    if (c === "/") {
      const m = out.match(/([A-Za-z_$][\w$]*)\s*$/);
      const kw = m && /^(return|typeof|case|delete|do|else|in|new|void|yield|of)$/.test(m[1]);
      const isRegex = /[=(:,[!&|?{};+\-~^%*<>]/.test(prev) || kw || prev === ";";
      out += c; i++;
      if (isRegex) {
        let cls = false;
        while (i < n) {
          const ch = s[i];
          out += ch;
          if (ch === "\\") { out += s[i + 1] || ""; i += 2; continue; }
          if (ch === "[") cls = true;
          if (ch === "]") cls = false;
          i++;
          if (ch === "/" && !cls) break;
        }
        while (i < n && /[a-z]/i.test(s[i])) { out += s[i]; i++; }
      }
      prev = "/";
      continue;
    }
    if (/\s/.test(c)) {
      // conserva 1 espacio solo si separa dos palabras
      let j = i + 1;
      while (j < n && /\s/.test(s[j])) j++;
      const nx = s[j] || "";
      if (isWord(prev) && isWord(nx)) out += " ";
      i = j;
      continue;
    }
    out += c;
    prev = c;
    i++;
  }
  return out;
}

let html = fs.readFileSync("index.html", "utf8");

// 1. CSS inlinado
for (const f of ["css/app.css", "css/themes.css", "css/overhaul.css"]) {
  const min = cssMin(fs.readFileSync(f, "utf8"));
  html = html.replace(`<link rel="stylesheet" href="${f}">`, `<style>${min}</style>`);
}
// 2. Datos cultura embebidos (reemplaza el preload con fetch)
const culture = fs.readFileSync("data/culture.json", "utf8");
html = html.replace(
  /<script>\/\* precarga temprana[\s\S]*?<\/script>/,
  `<script>window.LingoCulture={list:${culture}};</script>`
);
// 3. JS inlinado en orden
const jsFiles = ["js/app-legacy.js", "js/db.js", "js/srs.js", "js/theme.js", "js/magic.js", "js/games.js", "js/shortcuts.js", "js/pet.js", "js/enhance.js"];
for (const f of jsFiles) {
  const raw = fs.readFileSync(f, "utf8");
  if (raw.includes("</script")) throw new Error("cierre script en " + f);
  const min = jsMin(raw);
  fs.writeFileSync(path.join(OUT, "_check", path.basename(f)), min);
  html = html.replace(`<script src="${f}" defer></script>`, `<script>${min}</script>`);
}
// games.js hace fetch que en file:// falla: ya tiene .catch, pero lo silenciamos del todo
html = html.replace('fetch("data/culture.json")', 'window.LingoCulture&&window.LingoCulture.list.length?Promise.reject("inline"):fetch("data/culture.json")');
// 4. Quita manifest/iconos relativos (404 en single-file); conserva theme-color
html = html.replace(/<link rel="manifest"[^>]*>\n?/, "");
html = html.replace(/<link rel="icon"[^>]*>\n?/, "");
// 5. Banner mic en file:// (usa toast legacy cuando carga)
html = html.replace("</body>", `<script>window.addEventListener("load",function(){setTimeout(function(){try{if(location.protocol==="file:"){toast("Consejo: ábreme desde el link con internet para usar el micrófono 🎤","💡");}}catch(e){}},1500);});</script>\n</body>`);

fs.writeFileSync(path.join(OUT, "lingolab.html"), html);
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(1);
console.log("lingolab.html:", kb(path.join(OUT, "lingolab.html")), "KB");
console.log("original index.html:", kb("index.html"), "KB + assets externos");
