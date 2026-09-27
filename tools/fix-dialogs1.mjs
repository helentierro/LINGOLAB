import fs from "node:fs";
const arr = JSON.parse(fs.readFileSync("data/dialogs.json", "utf8"));
const T = (a, en, es) => [a, en, es];
const extra = {
taco: [
T("A","One photo for the wall?","¿Una foto para la pared?"),T("B","Yes! With my tacos!","¡Sí! ¡Con mis tacos!"),
T("A","Smile! Perfect shot!","¡Sonríe! ¡Foto perfecta!"),T("B","Send it to me, please.","Envíamela, por favor."),
T("A","What is your number?","¿Cuál es tu número?"),T("B","I will write it here.","Lo escribo aquí."),
T("A","Photo sent! Good night!","¡Foto enviada! ¡Buenas noches!"),T("B","Best tacos ever! Bye!","¡Mejores tacos! ¡Adiós!")],
sushi: [
T("A","Green tea now?","¿Té verde ahora?"),T("B","Yes, please.","Sí, por favor."),
T("A","Hot tea cleans the mouth.","El té caliente limpia la boca."),T("B","Warm and bitter. Nice.","Tibio y amargo. Rico."),
T("A","You are a real sushi eater.","Eres un verdadero comedor de sushi."),T("B","Can I have the recipe?","¿Me das la receta?"),
T("A","Secret recipe! Sorry!","¡Receta secreta! ¡Perdón!"),T("B","Haha, I understand." ,"Jaja, entiendo."),
T("A","But take this fan, gift.","Pero toma este abanico, regalo."),T("B","Beautiful! Thank you!","¡Hermoso! ¡Gracias!"),
T("A","Sayonara, sushi friend!","¡Sayonara, amigo del sushi!"),T("B","Sayonara, Kenji!","¡Sayonara, Kenji!")],
paris: [
T("A","One more lesson: merci.","Una lección más: merci."),T("B","Merci means thank you.","Merci significa gracias."),
T("A","And s'il vous plaît?","¿Y s'il vous plaît?"),T("B","Means please!","¡Significa por favor!"),
T("A","You learn so fast!","¡Aprendes rapidísimo!"),T("B","Good teacher, good student.","Buena maestra, buen alumno."),
T("A","Visit the tower today?","¿Visitas la torre hoy?"),T("B","Yes! The Eiffel Tower!","¡Sí! ¡La Torre Eiffel!"),
T("A","Go at sunset. Best light.","Ve al atardecer. Mejor luz."),T("B","Sunset! Noted!","¡Atardecer! ¡Anotado!"),
T("A","Buy tickets online. Faster.","Compra boletos en línea. Más rápido."),T("B","Online! Smart!","¡En línea! ¡Lista!"),
T("A","And eat a crêpe there.","Y come una crepa allá."),T("B","Crêpe with chocolate!","¡Crepa con chocolate!"),
T("A","Exactement! You are French!","¡Exactement! ¡Eres francés!"),T("B","Un peu! A little!","¡Un peu! ¡Un poco!"),
T("A","Bonne journée, ami!","¡Buen día, amigo!"),T("B","Bonne journée, Chloé!","¡Buen día, Chloé!")],
hostel: [
T("A","Kitchen is upstairs.","La cocina está arriba."),T("B","Can I cook there?","¿Puedo cocinar ahí?"),
T("A","Yes! Pots are free.","¡Sí! Las ollas son gratis."),T("B","I will cook pasta!","¡Cocinaré pasta!"),
T("A","Italian night! I join!","¡Noche italiana! ¡Me uno!"),T("B","Pasta for everyone!","¡Pasta para todos!"),
T("A","Quiet hours at eleven.","Silencio a las once."),T("B","Eleven! Understood.","¡Once! Entendido."),
T("A","Lockers for your bag?","¿Taquilla para tu mochila?"),T("B","Yes, big backpack." ,"Sí, mochila grande."),
T("A","Locker 8, same number!","¡Taquilla 8, mismo número!"),T("B","Easy to remember!","¡Fácil de recordar!"),
T("A","Laundry downstairs, cheap.","Lavandería abajo, barata."),T("B","My socks say thanks.","Mis calcetines agradecen."),
T("A","Haha! See you at breakfast!","¡Jaja! ¡Nos vemos al desayuno!"),T("B","Beans and eggs! Bye!","¡Frijoles y huevos! ¡Adiós!")],
souk: [
T("A","Now smell saffron.","Ahora huele azafrán."),T("B","Expensive smell!","¡Olor caro!"),
T("A","Gold of the kitchen.","Oro de la cocina."),T("B","One gram, please.","Un gramo, por favor."),
T("A","For you: three dollars.","Para ti: tres dólares."),T("B","Deal! For my mother.","¡Trato! Para mi madre."),
T("A","Mothers love saffron.","Las madres aman el azafrán."),T("B","She cooks Friday couscous.","Ella cocina cuscús los viernes."),
T("A","Invite me one Friday!","¡Invítame un viernes!"),T("B","Morocco meets my mother!","¡Marruecos conoce a mi madre!"),
T("A","The sun sets soon.","El sol se pone pronto."),T("B","The square fills with smoke.","La plaza se llena de humo."),
T("A","Food stalls wake up!","¡Los puestos despiertan!"),T("B","Eat with me, please?","¿Comes conmigo, por favor?"),
T("A","Harira soup, my treat.","Sopa harira, invito yo."),T("B","Best guide ever!","¡Mejor guía del mundo!"),
T("A","Tomorrow the desert?","¿Mañana el desierto?"),T("B","Camels at dawn! Bye!","¡Camellos al amanecer! ¡Adiós!")]
};
for (const d of arr) {
  if (extra[d.id]) {
    d.turns.push(...extra[d.id]);
    console.log(d.id, "->", d.turns.length);
  }
}
fs.writeFileSync("data/dialogs.json", JSON.stringify(arr, null, 1));
