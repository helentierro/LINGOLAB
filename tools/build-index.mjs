import fs from "node:fs";
let src = fs.readFileSync("index1.html", "utf8");
src = src.replace(/<style>[\s\S]*?<\/style>/, [
  '<link rel="stylesheet" href="css/app.css">',
  '<link rel="stylesheet" href="css/themes.css">'
].join("\n"));
src = src.replace(/<script>[\s\S]*?<\/script>/, [
  '<script src="js/app-legacy.js" defer></script>',
  '<script src="js/db.js" defer></script>',
  '<script src="js/srs.js" defer></script>',
  '<script src="js/theme.js" defer></script>',
  '<script src="js/enhance.js" defer></script>'
].join("\n"));
src = src.replace("</head>", '<link rel="manifest" href="pwa/manifest.webmanifest">\n<meta name="theme-color" content="#0a141d">\n<link rel="icon" href="pwa/icon-192.png">\n</head>');
// Botón de tema en el header (junto al HUD)
src = src.replace('<div class="hud">', '<div class="hud">\n    <button class="pill" id="themeBtn" title="Cambiar tema">🌙</button>');
// Panel: sección repaso SRS (después de la meta diaria)
src = src.replace('<div class="grid g4 mg-t2">', '<div class="card mg-t2" id="srsCard"><div class="row" style="justify-content:space-between"><span class="eyebrow">Repaso pendiente (SRS)</span><button class="btn mint sm" data-goto="vocab">Repasar ahora</button></div><p class="mut mg-t" id="srsLine">Cargando…</p><div class="chips mg-t" id="srsChips"></div></div>\n  <div class="grid g4 mg-t2">');
fs.writeFileSync("index.html", src);
console.log("index.html OK", src.length);
