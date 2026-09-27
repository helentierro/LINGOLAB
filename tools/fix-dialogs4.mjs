import fs from "node:fs";
const a = JSON.parse(fs.readFileSync("data/dialogs.json", "utf8"));
for (const d of a) {
  if (d.id === "arepa") d.turns.push(["A", "Bogota hugs you, child.", "Bogotá te abraza, hijo."], ["B", "Hugged and full! Adiós!", "¡Abrazado y lleno! ¡Adiós!"]);
  if (d.id === "asado") d.turns.push(["A", "Hugs, not handshakes here.", "Abrazos, no apretones aquí."], ["B", "Big hug, asador!", "¡Gran abrazo, asador!"]);
}
fs.writeFileSync("data/dialogs.json", JSON.stringify(a, null, 1));
console.log("fixed");
