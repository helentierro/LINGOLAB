import fs from "node:fs";
const a = JSON.parse(fs.readFileSync("data/dialogs.json", "utf8"));
const T = (s, e, x) => [s, e, x];
const m = {
  paris: [T("A", "One last coffee to go?", "¿Un último café para llevar?"), T("B", "Yes! For the tower!", "¡Sí! ¡Para la torre!")],
  hostel: [T("A", "Wi-Fi password is london123.", "La clave Wi-Fi es london123."), T("B", "London123! Connected!", "¡London123! ¡Conectado!"), T("A", "Checkout at ten, okay?", "¿Salida a las diez, bien?"), T("B", "Ten! I will be ready.", "¡Diez! Estaré listo."), T("A", "Safe travels, friend!", "¡Buen viaje, amigo!"), T("B", "Thanks for everything!", "¡Gracias por todo!")],
  souk: [T("A", "Meet here tomorrow, same time?", "¿Nos vemos mañana, misma hora?"), T("B", "Same time! With sunscreen!", "¡Misma hora! ¡Con protector!")]
};
for (const d of a) if (m[d.id]) d.turns.push(...m[d.id]);
fs.writeFileSync("data/dialogs.json", JSON.stringify(a, null, 1));
console.log("fixed");
