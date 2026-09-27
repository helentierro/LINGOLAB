import fs from "node:fs";
const a = JSON.parse(fs.readFileSync("data/dialogs.json", "utf8"));
for (const d of a) d.turns.forEach((t, i) => {
  if (!t[2]) console.log(d.id, i, JSON.stringify(t[1]));
});
