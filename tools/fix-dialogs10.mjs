import fs from "node:fs";
const a = JSON.parse(fs.readFileSync("data/dialogs.json", "utf8"));
const ES = {
"Classic! Rest now!": "¡Clásico! ¡Descansa ya!",
"Even witches giggle!": "¡Hasta las brujas ríen!",
"Salty promises hold!": "¡Promesas saladas valen!",
"Swim home before dusk!": "¡Nada a casa antes del anochecer!",
"Fleet waits beyond reef!": "¡La flota espera tras el arrecife!",
"Fair winds, riddle-child!": "¡Vientos justos, niña-acertijo!",
"Echoes remember you!": "¡Los ecos te recuerdan!",
"Elevenses are sacred!": "¡Las once son sagradas!",
"Night shift: fireflies!": "¡Turno noche: luciérnagas!",
"No tentacles? Arms fine!": "¿Sin tentáculos? ¡Brazos bien!",
"Chicken nuggets! Safe!": "¡Nuggets de pollo! ¡Seguro!",
"Brain freeze warning!": "¡Alerta de cerebro helado!",
"All three! Cheese!": "¡Los tres! ¡Sonríe!"
};
let n = 0;
for (const d of a) for (const t of d.turns) {
  if (!t[2] && ES[t[1]]) { t[2] = ES[t[1]]; n++; }
}
fs.writeFileSync("data/dialogs.json", JSON.stringify(a, null, 1));
console.log("translated:", n);
