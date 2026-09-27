import fs from "node:fs";
const a = JSON.parse(fs.readFileSync("data/dialogs.json", "utf8"));
for (const d of a) {
  if (d.id === "potion") {
    d.turns = d.turns.map((t) => (!t[2] ? [t[0], t[1], "¡Y tú, Zara!"] : t));
    console.log(JSON.stringify(d.turns[51]));
  }
}
fs.writeFileSync("data/dialogs.json", JSON.stringify(a, null, 1));
