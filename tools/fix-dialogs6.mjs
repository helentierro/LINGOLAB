import fs from "node:fs";
const a = JSON.parse(fs.readFileSync("data/dialogs.json", "utf8"));
const T = (s, e, x) => [s, e, x];
for (const d of a) {
  if (d.id === "potion") {
    d.turns = d.turns.map((t) => (t.length === 2 ? [t[0], t[1], t[1]] : t));
    d.turns.push(T("A", "One last wink of magic!", "¡Último guiño de magia!"), T("B", "Winking back! Bye!", "¡Guiño devuelto! ¡Adiós!"));
  }
  if (d.id === "fairy") d.turns.push(T("A", "Stars applaud believers!", "¡Estrellas aplauden creyentes!"), T("B", "Applauding stars back!", "¡Aplaudo estrellas!"), T("A", "Encore of sparkles!", "¡Otra de brillos!"), T("B", "Sparkliest goodbye!", "¡Adiós más brillante!"));
  if (d.id === "ghostpirate") d.turns.push(T("A", "Anchor of mist, away!", "¡Ancla de niebla, leva!"), T("B", "Smooth haunting!", "¡Buen acecho!"), T("A", "Compass of moons guides!", "¡Brújula de lunas guía!"), T("B", "Following moons!", "¡Sigo lunas!"), T("A", "Yo-ho forever!", "¡Yo-jo por siempre!"), T("B", "Forever yo-ho!", "¡Por siempre yo-jo!"));
  if (d.id === "elfbaker") d.turns.push(T("A", "Ovens cooling, hearts warm!", "¡Hornos fríos, corazones tibios!"), T("B", "Warmest goodbye!", "¡Adiós más tibio!"), T("A", "Rise like dough!", "¡Crece como masa!"), T("B", "Rising daily!", "¡Creciendo diario!"), T("A", "Flour power forever!", "¡Poder harina por siempre!"), T("B", "Forever floury!", "¡Por siempre harinoso!"));
}
fs.writeFileSync("data/dialogs.json", JSON.stringify(a, null, 1));
console.log("fixed");
