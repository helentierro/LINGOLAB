import fs from "node:fs";
const arr = JSON.parse(fs.readFileSync("data/dialogs.json", "utf8"));
const T = (a, en, es) => [a, en, es];
const extra = {
pizza: [T("A", "Photo with Nonna?", "¿Foto con la Nonna?"), T("B", "Yes! Flour faces!", "¡Sí! ¡Caras de harina!")],
pub: [T("A", "Another tea, friend?", "¿Otro té, amigo?"), T("B", "Yes, please!", "¡Sí, por favor!"),
T("A", "Strong or mild?", "¿Fuerte o suave?"), T("B", "Strong like Dublin!", "¡Fuerte como Dublín!"),
T("A", "Tell me about home.", "Cuéntame de tu hogar."), T("B", "Sunny streets, loud family.", "Calles soleadas, familia ruidosa."),
T("A", "Ireland misses sun too!", "¡Irlanda extraña el sol también!"), T("B", "Trade: sun for music?", "¿Intercambio: sol por música?"),
T("A", "Deal! Shake on it!", "¡Trato! ¡Chócala!"), T("B", "Deal! Best pub ever!", "¡Trato! ¡Mejor pub!"),
T("A", "Write your name on the wall!", "¡Escribe tu nombre en la pared!"), T("B", "On the wall? Really?", "¿En la pared? ¿En serio?"),
T("A", "Travelers' wall! Look!", "¡Pared de viajeros! ¡Mira!"), T("B", "A hundred names!", "¡Cien nombres!"),
T("A", "Yours makes hundred-one!", "¡El tuyo hace ciento uno!"), T("B", "Forever in Dublin!", "¡Por siempre en Dublín!"),
T("A", "Slán! That means bye!", "¡Slán! ¡Eso es adiós!"), T("B", "Slán, Seamus!", "¡Slán, Seamus!")],
arepa: [T("A", "Hot chocolate too?", "¿Chocolate caliente también?"), T("B", "With cheese inside?", "¿Con queso adentro?"),
T("A", "Bogotano style! Try!", "¡Estilo bogotano! ¡Prueba!"), T("B", "Cheese in chocolate? Strange!", "¿Queso en chocolate? ¡Extraño!"),
T("A", "Strange and delicious!", "¡Extraño y delicioso!"), T("B", "Wow! Salty sweet!", "¡Guau! ¡Salado dulce!"),
T("A", "Andinos know secrets.", "Los andinos conocen secretos."), T("B", "Teach me more secrets!", "¡Enséñame más secretos!"),
T("A", "Secret two: ajiaco soup.", "Secreto dos: sopa ajiaco."), T("B", "Three potatoes? Really?", "¿Tres papas? ¿En serio?"),
T("A", "Three! Plus corn!", "¡Tres! ¡Más maíz!"), T("B", "Potato paradise!", "¡Paraíso de papas!"),
T("A", "Come hungry tomorrow!", "¡Ven hambriento mañana!"), T("B", "Tomorrow: ajiaco day!", "¡Mañana: día de ajiaco!"),
T("A", "I save you a table!", "¡Te guardo una mesa!"), T("B", "Corner table, same one!", "¡Mesa de esquina, la misma!"),
T("A", "Same one! Promise!", "¡La misma! ¡Prometido!"), T("B", "Gracias, abuela Rosa!", "¡Gracias, abuela Rosa!"),
T("A", "Abuela! I love that!", "¡Abuela! ¡Me encanta!"), T("B", "Abuela Rosa forever!", "¡Abuela Rosa por siempre!")],
asado: [T("A", "Mate now? Bitter tea?", "¿Mate ahora? ¿Té amargo?"), T("B", "Bitter? Like coffee?", "¿Amargo? ¿Como café?"),
T("A", "Stronger! Share the cup!", "¡Más fuerte! ¡Comparte el vaso!"), T("B", "One cup for all?", "¿Un vaso para todos?"),
T("A", "Friendship cup! Sip!", "¡Vaso de amistad! ¡Sorbe!"), T("B", "Bitter! Strong! Good!", "¡Amargo! ¡Fuerte! ¡Bueno!"),
T("A", "You are practically Argentine!", "¡Eres prácticamente argentino!"), T("B", "Practically? I want fully!", "¿Prácticamente? ¡Quiero total!"),
T("A", "Fully takes ten asados!", "¡Total toma diez asados!"), T("B", "Ten Sundays! Challenge!", "¡Diez domingos! ¡Reto!"),
T("A", "Challenge accepted, kid!", "¡Reto aceptado, pibe!"), T("B", "Count them! One done!", "¡Cuéntalos! ¡Uno listo!"),
T("A", "Nine to glory!", "¡Nueve a la gloria!"), T("B", "Glory tastes like smoke!", "¡La gloria sabe a humo!"),
T("A", "Take leftovers home!", "¡Lleva sobras a casa!"), T("B", "For midnight hunger!", "¡Para el hambre nocturna!"),
T("A", "Smart! Asado moon!", "¡Listo! ¡Luna de asado!"), T("B", "Best Sunday ever! Chau!", "¡Mejor domingo! ¡Chau!")],
rooftop: [T("A", "One more question for you.", "Una pregunta más para ti."), T("B", "Shoot.", "Dispara."),
T("A", "What will you sacrifice?", "¿Qué sacrificarás?"), T("B", "Sleep? Weekends?", "¿Sueño? ¿Fines de semana?"),
T("A", "Comfort. Certainty. Applause.", "Comodidad. Certeza. Aplausos."), T("B", "Heavy price.", "Precio pesado."),
T("A", "Dreams charge rent.", "Los sueños cobran renta."), T("B", "I will pay it.", "La pagaré."),
T("A", "Then you are ready.", "Entonces estás listo."), T("B", "Ready and scared.", "Listo y asustado."),
T("A", "Perfect combination.", "Combinación perfecta."), T("B", "Can I quote you?", "¿Puedo citarte?"),
T("A", "Quote the night, not me.", "Cita la noche, no a mí."), T("B", "The night said it.", "La noche lo dijo."),
T("A", "Train station opens at five.", "La estación abre a las cinco."), T("B", "Three hours of stars left.", "Tres horas de estrellas."),
T("A", "Spend them well.", "Gástalas bien."), T("B", "With coffee and plans.", "Con café y planes.")]
};
for (const d of arr) if (extra[d.id]) d.turns.push(...extra[d.id]);
fs.writeFileSync("data/dialogs.json", JSON.stringify(arr, null, 1));
for (const d of arr) if (extra[d.id]) console.log(d.id, d.turns.length);
