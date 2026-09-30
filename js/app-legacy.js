"use strict";
/* ═══════════════════════════════ UTILIDADES ═══════════════════════════════ */
const $=id=>document.getElementById(id);
const escH=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const escA=s=>String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const todayStr=()=>new Date().toISOString().slice(0,10);
const yestStr=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10);};
const dayKey=n=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().slice(0,10);};

function toast(msg,icon){icon=icon||"✨";const t=document.createElement("div");t.className="toast";t.innerHTML="<span>"+icon+"</span><span>"+escH(msg)+"</span>";$("toasts").appendChild(t);setTimeout(()=>{t.classList.add("out");setTimeout(()=>t.remove(),400);},3400);}
function floatXP(n){const f=document.createElement("div");f.className="xp-float";f.textContent="+"+n+" XP";f.style.left=(window.innerWidth-180+Math.random()*80)+"px";f.style.top="90px";$("floatLayer").appendChild(f);setTimeout(()=>f.remove(),1500);}

/* Confetti */
const confCv=$("confetti"),confCtx=confCv.getContext("2d");let confP=[],confRunning=false;
function sizeConf(){confCv.width=innerWidth;confCv.height=innerHeight;}sizeConf();addEventListener("resize",sizeConf);
function confetti(){const cols=["#ffcf5c","#4fe3a5","#6cc8ff","#ff7d7d","#c4a5ff"];for(let i=0;i<130;i++){confP.push({x:innerWidth/2+(Math.random()-.5)*220,y:innerHeight*.3,vx:(Math.random()-.5)*9,vy:-(3+Math.random()*7),g:.22,s:4+Math.random()*5,c:cols[i%5],r:Math.random()*6,vr:(Math.random()-.5)*.3,life:90+Math.random()*50});}if(!confRunning){confRunning=true;confLoop();}}
function confLoop(){confCtx.clearRect(0,0,confCv.width,confCv.height);confP=confP.filter(p=>p.life>0);confP.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.r+=p.vr;p.life--;confCtx.save();confCtx.translate(p.x,p.y);confCtx.rotate(p.r);confCtx.fillStyle=p.c;confCtx.globalAlpha=Math.min(1,p.life/40);confCtx.fillRect(-p.s/2,-p.s/2,p.s,p.s);confCtx.restore();});if(confP.length)requestAnimationFrame(confLoop);else{confRunning=false;confCtx.clearRect(0,0,confCv.width,confCv.height);}}

/* ═══════════════════════════════ BASE DE DATOS ═══════════════════════════════ */
const VOCAB={
"Esenciales":[
["hello","hola","həˈloʊ","Hello! It's great to see you.","¡Hola! Qué gusto verte."],
["please","por favor","pliːz","Please, take a seat.","Por favor, toma asiento."],
["thank you","gracias","θæŋk juː","Thank you for your help.","Gracias por tu ayuda."],
["sorry","lo siento","ˈsɑːri","Sorry, I didn't mean to.","Lo siento, no fue mi intención."],
["friend","amigo / amiga","frend","She is my best friend.","Ella es mi mejor amiga."],
["family","familia","ˈfæməli","Family always comes first.","La familia siempre va primero."],
["time","tiempo / hora","taɪm","What time is it?","¿Qué hora es?"],
["today","hoy","təˈdeɪ","Today is a beautiful day.","Hoy es un día hermoso."],
["tomorrow","mañana","təˈmɑːroʊ","See you tomorrow!","¡Nos vemos mañana!"],
["people","gente / personas","ˈpiːpl","Many people live in this city.","Mucha gente vive en esta ciudad."]],
"Comida":[
["breakfast","desayuno","ˈbrekfəst","Breakfast is my favorite meal.","El desayuno es mi comida favorita."],
["water","agua","ˈwɔːtər","A glass of water, please.","Un vaso de agua, por favor."],
["bread","pan","bred","This bread is freshly baked.","Este pan está recién horneado."],
["chicken","pollo","ˈtʃɪkɪn","The chicken soup smells great.","La sopa de pollo huele genial."],
["fruit","fruta","fruːt","Eat more fruit every day.","Come más fruta cada día."],
["hungry","hambriento","ˈhʌŋɡri","I'm so hungry right now!","¡Tengo muchísima hambre ahora!"],
["taste","sabor","teɪst","This cake has an amazing taste.","Este pastel tiene un sabor increíble."],
["dinner","cena","ˈdɪnər","Dinner is ready, come to the table.","La cena está lista, ven a la mesa."],
["delicious","delicioso","dɪˈlɪʃəs","The dinner was absolutely delicious.","La cena estaba absolutamente deliciosa."],
["recipe","receta","ˈresəpi","This recipe is from my grandmother.","Esta receta es de mi abuela."]],
"Viajes":[
["airport","aeropuerto","ˈerpɔːrt","The airport is far from downtown.","El aeropuerto está lejos del centro."],
["ticket","boleto / pasaje","ˈtɪkɪt","I bought a one-way ticket.","Compré un boleto de ida."],
["luggage","equipaje","ˈlʌɡɪdʒ","My luggage weighs twenty kilos.","Mi equipaje pesa veinte kilos."],
["passport","pasaporte","ˈpæspɔːrt","Don't forget your passport.","No olvides tu pasaporte."],
["journey","viaje / trayecto","ˈdʒɜːrni","The journey took five hours.","El viaje duró cinco horas."],
["abroad","al extranjero","əˈbrɔːd","She moved abroad last year.","Ella se mudó al extranjero el año pasado."],
["map","mapa","mæp","Let's check the map again.","Revisemos el mapa otra vez."],
["train","tren","treɪn","The train leaves at noon.","El tren sale al mediodía."],
["delay","retraso","dɪˈleɪ","The flight has a small delay.","El vuelo tiene un pequeño retraso."],
["destination","destino","ˌdestɪˈneɪʃn","We finally reached our destination.","Por fin llegamos a nuestro destino."]],
"Trabajo":[
["meeting","reunión","ˈmiːtɪŋ","The meeting starts at nine.","La reunión empieza a las nueve."],
["deadline","fecha límite","ˈdedlaɪn","The deadline is next Friday.","La fecha límite es el próximo viernes."],
["schedule","horario / agenda","ˈskedʒuːl","My schedule is full today.","Mi agenda está llena hoy."],
["skill","habilidad","skɪl","Practice improves any skill.","La práctica mejora cualquier habilidad."],
["goal","meta / objetivo","ɡoʊl","Set a clear goal and pursue it.","Fija una meta clara y persíguela."],
["colleague","colega","ˈkɑːliːɡ","My colleague helped me a lot.","Mi colega me ayudó mucho."],
["boss","jefe / jefa","bɔːs","The boss approved the project.","El jefe aprobó el proyecto."],
["research","investigación","ˈriːsɜːrtʃ","The research took two years.","La investigación tomó dos años."],
["training","capacitación","ˈtreɪnɪŋ","The training was really useful.","La capacitación fue muy útil."],
["achievement","logro","əˈtʃiːvmənt","Winning was a huge achievement.","Ganar fue un logro enorme."]],
"Emociones":[
["happy","feliz","ˈhæpi","I feel happy when I sing.","Me siento feliz cuando canto."],
["sad","triste","sæd","The movie made her sad.","La película la puso triste."],
["angry","enojado","ˈæŋɡri","Don't be angry, it was an accident.","No te enojes, fue un accidente."],
["excited","emocionado","ɪkˈsaɪtɪd","The kids are excited about the trip.","Los niños están emocionados por el viaje."],
["worried","preocupado","ˈwɜːrid","She's worried about the exam.","Ella está preocupada por el examen."],
["proud","orgulloso","praʊd","We are proud of you.","Estamos orgullosos de ti."],
["surprised","sorprendido","sərˈpraɪzd","I was surprised by the news.","Me sorprendió la noticia."],
["grateful","agradecido","ˈɡreɪtfl","I'm grateful for your support.","Estoy agradecido por tu apoyo."],
["confident","seguro de sí mismo","ˈkɑːnfɪdənt","Practice makes you confident.","La práctica te da seguridad."],
["bored","aburrido","bɔːrd","He got bored during the lecture.","Se aburrió durante la charla."]],
"Casa y rutina":[
["kitchen","cocina","ˈkɪtʃɪn","The kitchen smells wonderful.","La cocina huele de maravilla."],
["mirror","espejo","ˈmɪrər","She looked at herself in the mirror.","Ella se miró en el espejo."],
["blanket","manta","ˈblæŋkɪt","This blanket is so warm.","Esta manta es muy cálida."],
["shower","ducha","ˈʃaʊər","I take a shower every morning.","Me ducho cada mañana."],
["chore","tarea doméstica","tʃɔːr","We split the chores evenly.","Repartimos las tareas por igual."],
["laundry","lavandería / ropa sucia","ˈlɔːndri","I do the laundry on Sundays.","Lavo la ropa los domingos."],
["nap","siesta","næp","A short nap gives you energy.","Una siesta corta te da energía."],
["grocery store","supermercado","ˈɡroʊsəri stɔːr","We need to go to the grocery store.","Tenemos que ir al supermercado."],
["tidy","ordenado","ˈtaɪdi","Keep your room tidy.","Mantén tu cuarto ordenado."],
["routine","rutina","ruːˈtiːn","Exercise is part of my routine.","El ejercicio es parte de mi rutina."]],
"Naturaleza":[
["mountain","montaña","ˈmaʊntən","The mountain was covered in snow.","La montaña estaba cubierta de nieve."],
["river","río","ˈrɪvər","The river flows to the sea.","El río fluye hacia el mar."],
["forest","bosque","ˈfɔːrɪst","We hiked through the forest.","Caminamos por el bosque."],
["weather","clima","ˈweðər","The weather is perfect today.","El clima está perfecto hoy."],
["storm","tormenta","stɔːrm","A big storm is coming tonight.","Se acerca una gran tormenta esta noche."],
["sunrise","amanecer","ˈsʌnraɪz","The sunrise was breathtaking.","El amanecer fue impresionante."],
["breeze","brisa","briːz","A cool breeze came from the sea.","Una brisa fresca llegó del mar."],
["wildlife","fauna","ˈwaɪldlaɪf","The park protects local wildlife.","El parque protege la fauna local."],
["rainbow","arcoíris","ˈreɪnboʊ","A rainbow appeared after the rain.","Apareció un arcoíris después de la lluvia."],
["shore","orilla / costa","ʃɔːr","Waves reached the shore.","Las olas llegaban a la orilla."]],
"Salud":[
["headache","dolor de cabeza","ˈhedeɪk","I have a terrible headache.","Tengo un dolor de cabeza terrible."],
["fever","fiebre","ˈfiːvər","The child has a high fever.","El niño tiene fiebre alta."],
["cough","tos","kɔːf","That cough sounds bad.","Esa tos suena mal."],
["medicine","medicina","ˈmedɪsn","Take your medicine after meals.","Toma tu medicina después de comer."],
["healthy","saludable","ˈhelθi","Eat healthy and feel great.","Come saludable y siéntete genial."],
["exercise","ejercicio","ˈeksərsaɪz","Daily exercise keeps you strong.","El ejercicio diario te mantiene fuerte."],
["injury","lesión","ˈɪndʒəri","The player recovered from his injury.","El jugador se recuperó de su lesión."],
["appointment","cita","əˈpɔɪntmənt","I have a doctor's appointment.","Tengo una cita con el médico."],
["symptom","síntoma","ˈsɪmptəm","Describe your symptoms, please.","Describe tus síntomas, por favor."],
["recover","recuperarse","rɪˈkʌvər","She recovered in two weeks.","Se recuperó en dos semanas."]],
"Tecnología":[
["keyboard","teclado","ˈkiːbɔːrd","This keyboard is very comfortable.","Este teclado es muy cómodo."],
["screen","pantalla","skriːn","Clean the screen with a soft cloth.","Limpia la pantalla con un paño suave."],
["download","descargar","ˈdaʊnloʊd","Download the app for free.","Descarga la aplicación gratis."],
["password","contraseña","ˈpæswɜːrd","Choose a strong password.","Elige una contraseña segura."],
["update","actualización","ˈʌpdeɪt","The update fixes several bugs.","La actualización corrige varios errores."],
["device","dispositivo","dɪˈvaɪs","Turn off the device at night.","Apaga el dispositivo por la noche."],
["wireless","inalámbrico","ˈwɪrləs","These headphones are wireless.","Estos audífonos son inalámbricos."],
["browser","navegador","ˈbraʊzər","Open a new browser tab.","Abre una nueva pestaña del navegador."],
["file","archivo","faɪl","Save the file before closing.","Guarda el archivo antes de cerrar."],
["storage","almacenamiento","ˈstɔːrɪdʒ","My phone is out of storage.","Mi teléfono no tiene almacenamiento."]],
"Social":[
["party","fiesta","ˈpɑːrti","The party starts at eight.","La fiesta empieza a las ocho."],
["joke","chiste / broma","dʒoʊk","He told a funny joke.","Contó un chiste gracioso."],
["laugh","reír / risa","læf","Her laugh is contagious.","Su risa es contagiosa."],
["invite","invitar","ɪnˈvaɪt","They invited us to dinner.","Nos invitaron a cenar."],
["neighbor","vecino / vecina","ˈneɪbər","Our neighbor is very kind.","Nuestro vecino es muy amable."],
["stranger","desconocido","ˈstreɪndʒər","Don't accept rides from strangers.","No aceptes viajes de desconocidos."],
["crowd","multitud","kraʊd","A crowd gathered in the square.","Una multitud se reunió en la plaza."],
["conversation","conversación","ˌkɑːnvərˈseɪʃn","We had a long conversation.","Tuvimos una larga conversación."],
["advice","consejo","ədˈvaɪs","Her advice was very helpful.","Su consejo fue muy útil."],
["trust","confianza","trʌst","Trust takes time to build.","La confianza toma tiempo en construirse."]],
"Adjetivos":[
["clever","astuto / inteligente","ˈklevər","That's a clever solution.","Es una solución astuta."],
["brave","valiente","breɪv","The brave dog saved the child.","El perro valiente salvó al niño."],
["gentle","amable / delicado","ˈdʒentl","She has a gentle voice.","Ella tiene una voz delicada."],
["huge","enorme","hjuːdʒ","They live in a huge house.","Viven en una casa enorme."],
["narrow","estrecho","ˈnæroʊ","The street is very narrow.","La calle es muy estrecha."],
["steep","empinado","stiːp","The hill is quite steep.","La colina es bastante empinada."],
["shiny","brillante","ˈʃaɪni","Her new bike is shiny.","Su bici nueva es brillante."],
["rough","áspero / agitado","rʌf","The sea was rough yesterday.","El mar estaba agitado ayer."],
["smooth","suave / liso","smuːð","The surface feels smooth.","La superficie se siente suave."],
["sharp","afilado","ʃɑːrp","Be careful, the knife is sharp.","Cuidado, el cuchillo está afilado."]],
"Verbos":[
["achieve","lograr","əˈtʃiːv","You can achieve anything.","Puedes lograr lo que sea."],
["borrow","pedir prestado","ˈbɑːroʊ","Can I borrow your pen?","¿Puedo pedir prestado tu bolígrafo?"],
["build","construir","bɪld","They built a wooden cabin.","Construyeron una cabaña de madera."],
["catch","atrapar / tomar","kætʃ","Catch the ball, quick!","¡Atrapa la pelota, rápido!"],
["choose","elegir","tʃuːz","Choose your favorite color.","Elige tu color favorito."],
["decide","decidir","dɪˈsaɪd","It's time to decide.","Es hora de decidir."],
["escape","escapar","ɪˈskeɪp","The cat escaped from the garden.","El gato escapó del jardín."],
["gather","reunirse / juntar","ˈɡæðər","We gather every Friday.","Nos reunimos cada viernes."],
["guess","adivinar","ɡes","Guess what I bought!","¡Adivina qué compré!"],
["improve","mejorar","ɪmˈpruːv","Read daily to improve.","Lee a diario para mejorar."],
["join","unirse","dʒɔɪn","Join us for lunch!","¡Únete a almorzar!"],
["reach","alcanzar","riːtʃ","We reached the summit at dawn.","Alcanzamos la cima al amanecer."]]
};
const WORDS=[];Object.entries(VOCAB).forEach(([cat,list],ci)=>list.forEach(w=>WORDS.push({cat,ci,en:w[0],es:w[1],ipa:w[2],ex:w[3],exEs:w[4]})));

const SENTENCES={"A1":[["Good morning! How are you?","¡Buenos días! ¿Cómo estás?"],["My name is Ana, nice to meet you.","Me llamo Ana, un gusto conocerte."],["I have two brothers and one sister.","Tengo dos hermanos y una hermana."],["She drinks water every morning.","Ella bebe agua cada mañana."],["The book is on the table.","El libro está sobre la mesa."],["I like music and chocolate ice cream.","Me gusta la música y el helado de chocolate."],["Where is the bathroom, please?","¿Dónde está el baño, por favor?"],["He goes to school by bus.","Él va a la escuela en autobús."],["Today is a very happy day.","Hoy es un día muy feliz."],["Can you help me, please?","¿Puedes ayudarme, por favor?"],["I want to learn English.","Quiero aprender inglés."],["See you tomorrow, my friend.","Hasta mañana, amigo mío."]],"A2":[["I usually wake up at seven o'clock.","Normalmente me despierto a las siete."],["Last summer we traveled to the beach.","El verano pasado viajamos a la playa."],["Could you speak a little slower?","¿Podrías hablar un poco más despacio?"],["I'm looking for a gift for my mother.","Estoy buscando un regalo para mi madre."],["There isn't any milk left in the fridge.","No queda nada de leche en el refrigerador."],["You should wear a coat, it's cold outside.","Deberías usar abrigo, hace frío afuera."],["How long does the movie last?","¿Cuánto dura la película?"],["I have never seen such a beautiful sunset.","Nunca he visto un atardecer tan hermoso."],["Please turn off the lights before leaving.","Por favor apaga las luces antes de salir."],["My sister is taller than me.","Mi hermana es más alta que yo."],["We are going to visit our grandparents on Sunday.","Vamos a visitar a mis abuelos el domingo."],["I forgot my keys at home again.","Olvidé mis llaves en casa otra vez."]],"B1":[["If it rains tomorrow, we will cancel the picnic.","Si llueve mañana, cancelaremos el picnic."],["I've been studying English for three years.","He estado estudiando inglés durante tres años."],["The meeting was postponed until next week.","La reunión fue pospuesta hasta la próxima semana."],["You'd better leave early to avoid the traffic.","Más te vale salir temprano para evitar el tráfico."],["I'm not used to drinking coffee at night.","No estoy acostumbrado a tomar café de noche."],["She asked me whether I had finished the report.","Ella me preguntó si había terminado el informe."],["The more you practice, the faster you improve.","Cuanto más practicas, más rápido mejoras."],["He managed to fix the car by himself.","Él logró arreglar el coche él solo."],["I'd rather stay home than go to that party.","Preferiría quedarme en casa que ir a esa fiesta."],["Despite the storm, the flight arrived on time.","A pesar de la tormenta, el vuelo llegó a tiempo."],["You should take advantage of every opportunity.","Deberías aprovechar cada oportunidad."],["The neighborhood has changed a lot recently.","El vecindario ha cambiado mucho últimamente."]],"B2":[["Had I known about the delay, I would have left earlier.","De haber sabido del retraso, habría salido antes."],["The proposal was turned down by the committee.","La propuesta fue rechazada por el comité."],["I can't put up with this noise any longer.","No puedo soportar este ruido por más tiempo."],["Should you need further information, contact us.","Si necesita más información, contáctenos."],["It's high time we made a decision about this.","Ya es hora de que tomemos una decisión sobre esto."],["He spoke as though he had witnessed the accident.","Habló como si hubiera presenciado el accidente."],["The results fell short of everyone's expectations.","Los resultados quedaron por debajo de las expectativas."],["I wish I hadn't said that during the meeting.","Ojalá no hubiera dicho eso durante la reunión."],["Not only did she win, she also broke the record.","No solo ganó, sino que también rompió el récord."],["We need to come up with a better strategy.","Necesitamos idear una mejor estrategia."],["Little did he know what was about to happen.","Poco sabía él lo que estaba a punto de pasar."],["The issue was dealt with promptly by the team.","El problema fue resuelto con prontitud por el equipo."]],"C1":[["Under no circumstances should you sign that contract.","Bajo ninguna circunstancia deberías firmar ese contrato."],["The theory was met with widespread skepticism.","La teoría fue recibida con escepticismo generalizado."],["Seldom have I encountered such dedication.","Rara vez me he encontrado con tanta dedicación."],["The outcome hinges on a handful of key variables.","El resultado depende de un puñado de variables clave."],["Her argument, however compelling, lacks solid evidence.","Su argumento, por convincente que sea, carece de evidencia sólida."],["We took it for granted that the deal was closed.","Dábamos por hecho que el trato estaba cerrado."],["The report sheds light on previously hidden flaws.","El informe arroja luz sobre fallos antes ocultos."],["He resigned rather than compromise his principles.","Renunció antes que comprometer sus principios."],["In retrospect, the warning signs were obvious.","En retrospectiva, las señales de advertencia eran obvias."],["The policy gave rise to considerable controversy.","La política dio lugar a una controversia considerable."],["Scarcely had we arrived when the alarm went off.","Apenas habíamos llegado cuando sonó la alarma."],["The witness account was nothing short of remarkable.","El relato del testigo fue sencillamente extraordinario."]],"Conversación":[["Long time no see! How have you been?","¡Cuánto sin verte! ¿Cómo has estado?"],["What do you do for a living?","¿A qué te dedicas?"],["I couldn't agree more with you.","Estoy totalmente de acuerdo contigo."],["It's on the tip of my tongue.","Lo tengo en la punta de la lengua."],["Let's grab a coffee and catch up.","Tomemos un café y pongámonos al día."],["No worries, it happens to everyone.","No te preocupes, le pasa a todos."],["I'm really into learning new languages.","Me encanta aprender idiomas nuevos."],["Could you say that one more time?","¿Podrías decir eso una vez más?"],["By the way, did you watch the game?","Por cierto, ¿viste el partido?"],["I'll figure it out, one way or another.","Lo resolveré, de una forma u otra."],["Sounds like a plan, count me in!","¡Suena bien, cuenta conmigo!"],["Break a leg on your presentation!","¡Mucho éxito en tu presentación!"]]};
const LEVELS=Object.keys(SENTENCES);
/* ═══════ 10 CUENTOS OSCUROS (clásicos en dominio público, versión adaptada) ═══════
   10 páginas × 2 frases por cuento. vocab: diccionario EN→ES por página. */
const STORIES=[{"id":"dracula-shadow","title":"The Shadow of the Castle","orig":"Bram Stoker · Dracula","level":"A1","icon":"🧛","desc":"Un joven visita un castillo oscuro y descubre el secreto del conde.","pages":[{"en":["The night is dark and cold.","A young man walks to the old castle."],"es":["La noche es oscura y fría.","Un joven camina al castillo viejo."],"vocab":{"night":"noche","dark":"oscuro/a","cold":"frío/a","young":"joven","walks":"camina","castle":"castillo","old":"viejo/a"}},{"en":["Wolves cry far in the forest.","The man is afraid, but he continues."],"es":["Los lobos aúllan lejos en el bosque.","El hombre tiene miedo, pero continúa."],"vocab":{"wolves":"lobos","cry":"aúllan / lloran","far":"lejos","forest":"bosque","afraid":"asustado (tener miedo)","continues":"continúa"}},{"en":["A tall count opens the black door.","Welcome to my house, he says."],"es":["Un conde alto abre la puerta negra.","Bienvenido a mi casa, dice él."],"vocab":{"tall":"alto","count":"conde","opens":"abre","door":"puerta","welcome":"bienvenido","house":"casa","says":"dice"}},{"en":["The castle is big and silent.","Shadows move on the old walls."],"es":["El castillo es grande y silencioso.","Las sombras se mueven en las paredes viejas."],"vocab":{"big":"grande","silent":"silencioso","shadows":"sombras","move":"se mueven","walls":"paredes"}},{"en":["The count is pale and strange.","He never eats and never sleeps."],"es":["El conde está pálido y es extraño.","Él nunca come y nunca duerme."],"vocab":{"pale":"pálido","strange":"extraño","never":"nunca","eats":"come","sleeps":"duerme"}},{"en":["The young man sees no mirror.","The count has no reflection."],"es":["El joven no ve ningún espejo.","El conde no tiene reflejo."],"vocab":{"sees":"ve","mirror":"espejo","reflection":"reflejo"}},{"en":["At night the count drinks red wine.","But it is not wine, it is blood."],"es":["De noche el conde bebe vino rojo.","Pero no es vino, es sangre."],"vocab":{"drinks":"bebe","red":"rojo","wine":"vino","blood":"sangre"}},{"en":["The young man wants to escape.","The door is closed with big chains."],"es":["El joven quiere escapar.","La puerta está cerrada con grandes cadenas."],"vocab":{"wants":"quiere","escape":"escapar","closed":"cerrada","chains":"cadenas"}},{"en":["The sun rises over the mountains.","The shadows run away from the light."],"es":["El sol sale sobre las montañas.","Las sombras huyen de la luz."],"vocab":{"sun":"sol","rises":"sale (amanecer)","mountains":"montañas","run":"huyen / corren","away":"lejos / fuera","light":"luz"}},{"en":["The man runs to his village.","He is free, and the shadow is gone."],"es":["El hombre corre a su aldea.","Está libre, y la sombra se ha ido."],"vocab":{"runs":"corre","village":"aldea","free":"libre","gone":"se ha ido / desaparecido"}}]},{"id":"frankenstein-slave","title":"The Slave of the Creator","orig":"Mary Shelley · Frankenstein","level":"A1","icon":"⚡","desc":"Un científico crea vida, pero su criatura solo quiere un amigo.","pages":[{"en":["Victor is a young scientist.","He works day and night in his room."],"es":["Víctor es un joven científico.","Trabaja día y noche en su cuarto."],"vocab":{"scientist":"científico","works":"trabaja","room":"cuarto / habitación"}},{"en":["He wants to create a new man.","He uses old parts from graves."],"es":["Quiere crear un hombre nuevo.","Usa partes viejas de tumbas."],"vocab":{"create":"crear","new":"nuevo","uses":"usa","parts":"partes","graves":"tumbas"}},{"en":["One stormy night, there is light.","The creature opens its yellow eyes."],"es":["Una noche de tormenta, hay luz.","La criatura abre sus ojos amarillos."],"vocab":{"stormy":"de tormenta","light":"luz","creature":"criatura","opens":"abre","eyes":"ojos","yellow":"amarillo"}},{"en":["The creature is big and strong.","But its heart is sad and alone."],"es":["La criatura es grande y fuerte.","Pero su corazón está triste y solo."],"vocab":{"strong":"fuerte","heart":"corazón","sad":"triste","alone":"solo"}},{"en":["Victor is afraid and runs away.","The creature cries in the dark."],"es":["Víctor tiene miedo y huye.","La criatura llora en la oscuridad."],"vocab":{"afraid":"asustado","runs":"huye / corre","away":"lejos","cries":"llora","dark":"oscuridad"}},{"en":["The creature learns to speak.","It reads books by the fire."],"es":["La criatura aprende a hablar.","Lee libros junto al fuego."],"vocab":{"learns":"aprende","speak":"hablar","reads":"lee","books":"libros","fire":"fuego"}},{"en":["Please, make me a friend, it says.","I do not want to be alone."],"es":["Por favor, créame un amigo, dice.","No quiero estar solo."],"vocab":{"make":"crea / haz","friend":"amigo","says":"dice"}},{"en":["Victor says no and destroys his work.","The creature is angry and cold."],"es":["Víctor dice no y destruye su trabajo.","La criatura está enojada y fría."],"vocab":{"destroys":"destruye","work":"trabajo","angry":"enojado","cold":"frío"}},{"en":["They fight in the snow and ice.","Two slaves of hate and pain."],"es":["Pelean en la nieve y el hielo.","Dos esclavos del odio y el dolor."],"vocab":{"fight":"pelean","snow":"nieve","ice":"hielo","hate":"odio","pain":"dolor"}},{"en":["In the end, only silence remains.","The shadow of man must rest."],"es":["Al final, solo queda el silencio.","La sombra del hombre debe descansar."],"vocab":{"end":"final","silence":"silencio","remains":"queda / permanece","rest":"descansar"}}]},{"id":"jekyll-night","title":"The Slave of the Night","orig":"R. L. Stevenson · Dr Jekyll & Mr Hyde","level":"A2","icon":"🌙","desc":"Un doctor bueno esconde un monstruo que sale de noche.","pages":[{"en":["Dr Jekyll is a good and quiet man.","Everyone in London respects him."],"es":["El Dr. Jekyll es un hombre bueno y tranquilo.","Todos en Londres lo respetan."],"vocab":{"quiet":"tranquilo","everyone":"todos","respects":"respeta"}},{"en":["But he has a dark secret.","He makes a strange drink in his lab."],"es":["Pero tiene un secreto oscuro.","Prepara una bebida extraña en su laboratorio."],"vocab":{"secret":"secreto","makes":"prepara / hace","drink":"bebida","lab":"laboratorio"}},{"en":["One night he drinks the potion.","Pain runs through his body."],"es":["Una noche bebe la poción.","El dolor recorre su cuerpo."],"vocab":{"potion":"poción","pain":"dolor","runs":"recorre / corre","body":"cuerpo"}},{"en":["He changes into a cruel man.","His new name is Mr Hyde."],"es":["Se transforma en un hombre cruel.","Su nuevo nombre es Sr. Hyde."],"vocab":{"changes":"se transforma / cambia","cruel":"cruel","name":"nombre"}},{"en":["Hyde walks in the dark streets.","He pushes people and laughs."],"es":["Hyde camina por las calles oscuras.","Empuja a la gente y se ríe."],"vocab":{"streets":"calles","pushes":"empuja","people":"gente","laughs":"se ríe"}},{"en":["In the morning, Jekyll returns.","He cries and feels great shame."],"es":["Por la mañana, Jekyll regresa.","Llora y siente gran vergüenza."],"vocab":{"morning":"mañana","returns":"regresa","cries":"llora","shame":"vergüenza"}},{"en":["His friend Utterson is worried.","Who is this evil Hyde, he asks."],"es":["Su amigo Utterson está preocupado.","Quién es este Hyde malvado, pregunta."],"vocab":{"friend":"amigo","worried":"preocupado","evil":"malvado","asks":"pregunta"}},{"en":["Hyde becomes stronger every night.","Jekyll becomes a slave of Hyde."],"es":["Hyde se vuelve más fuerte cada noche.","Jekyll se vuelve esclavo de Hyde."],"vocab":{"stronger":"más fuerte","every":"cada","slave":"esclavo"}},{"en":["Jekyll locks the laboratory door.","He writes his sad confession."],"es":["Jekyll cierra con llave la puerta del laboratorio.","Escribe su triste confesión."],"vocab":{"locks":"cierra con llave","writes":"escribe","confession":"confesión"}},{"en":["When the light comes, Hyde is gone.","Only the good doctor remains."],"es":["Cuando llega la luz, Hyde se ha ido.","Solo queda el buen doctor."],"vocab":{"light":"luz","gone":"se ha ido","only":"solo","remains":"queda"}}]},{"id":"dorian-mirror","title":"The Cursed Portrait","orig":"Oscar Wilde · Dorian Gray","level":"A2","icon":"🪞","desc":"Un joven hermoso vende su alma; su retrato envejece por él.","pages":[{"en":["Dorian is young and very handsome.","His friend paints his portrait."],"es":["Dorian es joven y muy apuesto.","Su amigo pinta su retrato."],"vocab":{"handsome":"apuesto","paints":"pinta","portrait":"retrato"}},{"en":["The portrait is beautiful and perfect.","Dorian makes a dark wish."],"es":["El retrato es hermoso y perfecto.","Dorian pide un deseo oscuro."],"vocab":{"beautiful":"hermoso","perfect":"perfecto","wish":"deseo"}},{"en":["Let the portrait grow old, he says.","Let me stay young forever."],"es":["Deja que el retrato envejezca, dice.","Déjame seguir joven por siempre."],"vocab":{"grow":"crecer / volverse","old":"viejo","stay":"seguir / quedarse","forever":"por siempre"}},{"en":["Dorian lives a selfish life.","He hurts friends and feels nothing."],"es":["Dorian vive una vida egoísta.","Lastima a amigos y no siente nada."],"vocab":{"selfish":"egoísta","hurts":"lastima","feels":"siente","nothing":"nada"}},{"en":["But his face never changes.","The portrait hides his dark soul."],"es":["Pero su cara nunca cambia.","El retrato esconde su alma oscura."],"vocab":{"face":"cara","changes":"cambia","hides":"esconde","soul":"alma"}},{"en":["One night he looks at the portrait.","It is old, cruel and ugly."],"es":["Una noche mira el retrato.","Está viejo, cruel y feo."],"vocab":{"looks":"mira","ugly":"feo"}},{"en":["This monster is me, he cries.","I am a slave of my beauty."],"es":["Este monstruo soy yo, llora.","Soy un esclavo de mi belleza."],"vocab":{"monster":"monstruo","beauty":"belleza"}},{"en":["He takes a knife in anger.","He attacks the cursed portrait."],"es":["Toma un cuchillo con ira.","Ataca el retrato maldito."],"vocab":{"knife":"cuchillo","anger":"ira","attacks":"ataca","cursed":"maldito"}},{"en":["The servants hear a terrible scream.","They run up the stairs."],"es":["Los sirvientes oyen un grito terrible.","Suben corriendo las escaleras."],"vocab":{"servants":"sirvientes","scream":"grito","stairs":"escaleras"}},{"en":["On the floor lies an old man.","On the wall, a young Dorian smiles."],"es":["En el suelo yace un anciano.","En la pared, un Dorian joven sonríe."],"vocab":{"floor":"suelo","lies":"yace","smiles":"sonríe","wall":"pared"}}]},{"id":"sherlock-mist","title":"The Hound in the Mist","orig":"A. Conan Doyle · Sherlock Holmes","level":"B1","icon":"🔍","desc":"Holmes y Watson cazan un sabueso fantasma en la niebla.","pages":[{"en":["A nervous visitor arrives at Baker Street.","He speaks of a curse on the moor."],"es":["Un visitante nervioso llega a Baker Street.","Habla de una maldición en el páramo."],"vocab":{"nervous":"nervioso","visitor":"visitante","arrives":"llega","curse":"maldición","moor":"páramo"}},{"en":["A giant hound hunts the Baskerville family.","Its eyes burn like fire in the mist."],"es":["Un sabueso gigante caza a la familia Baskerville.","Sus ojos arden como fuego en la niebla."],"vocab":{"giant":"gigante","hound":"sabueso","hunts":"caza","burn":"arden","mist":"niebla"}},{"en":["Holmes listens in silence and smiles.","There are no ghosts, only men, he says."],"es":["Holmes escucha en silencio y sonríe.","No hay fantasmas, solo hombres, dice."],"vocab":{"listens":"escucha","ghosts":"fantasmas","only":"solo"}},{"en":["Watson travels to the dark moor.","The wind cries over the black stones."],"es":["Watson viaja al páramo oscuro.","El viento llora sobre las piedras negras."],"vocab":{"travels":"viaja","wind":"viento","stones":"piedras"}},{"en":["Every night he hears terrible steps.","A shadow moves between the rocks."],"es":["Cada noche oye pasos terribles.","Una sombra se mueve entre las rocas."],"vocab":{"steps":"pasos","rocks":"rocas"}},{"en":["The neighbor keeps a hungry beast.","He starves it to make it cruel."],"es":["El vecino esconde una bestia hambrienta.","La mata de hambre para volverla cruel."],"vocab":{"neighbor":"vecino","beast":"bestia","hungry":"hambrienta","starves":"mata de hambre"}},{"en":["Holmes returns in secret at dawn.","Tonight we catch the slave of fear, he whispers."],"es":["Holmes regresa en secreto al amanecer.","Esta noche atrapamos al esclavo del miedo, susurra."],"vocab":{"secret":"secreto","dawn":"amanecer","catch":"atrapamos","whispers":"susurra","fear":"miedo"}},{"en":["The mist opens and the hound jumps.","Watson fires his gun without shaking."],"es":["La niebla se abre y el sabueso salta.","Watson dispara su arma sin temblar."],"vocab":{"jumps":"salta","fires":"dispara","gun":"arma","shaking":"temblar"}},{"en":["The monster falls on the wet ground.","Its mouth shines with false fire."],"es":["El monstruo cae al suelo mojado.","Su boca brilla con fuego falso."],"vocab":{"falls":"cae","wet":"mojado","mouth":"boca","shines":"brilla","false":"falso"}},{"en":["The curse was only paint and hunger.","Reason breaks the chains of shadow."],"es":["La maldición era solo pintura y hambre.","La razón rompe las cadenas de la sombra."],"vocab":{"paint":"pintura","hunger":"hambre","reason":"razón","breaks":"rompe","chains":"cadenas"}}]},{"id":"moby-abyss","title":"The White Shadow of the Sea","orig":"H. Melville · Moby Dick","level":"B1","icon":"🐋","desc":"El capitán Ahab, esclavo de su odio, caza a la ballena blanca.","pages":[{"en":["Ishmael joins a whaling ship in winter.","He wants to see the world and forget his sadness."],"es":["Ismael se une a un ballenero en invierno.","Quiere ver el mundo y olvidar su tristeza."],"vocab":{"joins":"se une","ship":"barco","winter":"invierno","forget":"olvidar","sadness":"tristeza"}},{"en":["Captain Ahab has one wooden leg.","A white whale took the other one."],"es":["El capitán Ahab tiene una pierna de madera.","Una ballena blanca le quitó la otra."],"vocab":{"wooden":"de madera","leg":"pierna","whale":"ballena","took":"quitó / tomó"}},{"en":["Find Moby Dick, Ahab shouts.","I will chase that shadow to hell."],"es":["Encuentren a Moby Dick, grita Ahab.","Perseguiré esa sombra hasta el infierno."],"vocab":{"shouts":"grita","chase":"perseguir","hell":"infierno"}},{"en":["The crew becomes a slave of his anger.","Even the kind Starbuck cannot stop him."],"es":["La tripulación se vuelve esclava de su ira.","Ni el amable Starbuck puede detenerlo."],"vocab":{"crew":"tripulación","anger":"ira","kind":"amable","stop":"detener"}},{"en":["Storms hit the ship for weeks.","Still Ahab looks at the black sea."],"es":["Las tormentas golpean el barco por semanas.","Aun así Ahab mira el mar negro."],"vocab":{"storms":"tormentas","hit":"golpean","weeks":"semanas","still":"aun así","sea":"mar"}},{"en":["One clear morning, a sailor screams.","There she blows, white like death."],"es":["Una mañana clara, un marinero grita.","Ahí sopla, blanca como la muerte."],"vocab":{"clear":"despejada","sailor":"marinero","blows":"sopla","death":"muerte"}},{"en":["The white shadow rises from the abyss.","Water and terror cover the boats."],"es":["La sombra blanca surge del abismo.","Agua y terror cubren los botes."],"vocab":{"rises":"surge / se eleva","abyss":"abismo","terror":"terror","cover":"cubren","boats":"botes"}},{"en":["Ahab throws his harpoon with hate.","The line pulls him into the deep."],"es":["Ahab lanza su arpón con odio.","La cuerda lo arrastra a lo profundo."],"vocab":{"throws":"lanza","harpoon":"arpón","hate":"odio","pulls":"arrastra","deep":"lo profundo"}},{"en":["The great whale breaks the ship.","Wood and men sink into silence."],"es":["La gran ballena rompe el barco.","Madera y hombres se hunden en el silencio."],"vocab":{"breaks":"rompe","sink":"se hunden","silence":"silencio"}},{"en":["Only Ishmael floats on a coffin.","The sea keeps slaves and masters alike."],"es":["Solo Ismael flota sobre un ataúd.","El mar guarda esclavos y amos por igual."],"vocab":{"floats":"flota","coffin":"ataúd","keeps":"guarda","masters":"amos","alike":"por igual"}}]},{"id":"jane-ash","title":"The House of Whispers","orig":"C. Brontë · Jane Eyre","level":"B2","icon":"🕯️","desc":"Jane, huérfana y pobre, halla amor y un secreto en Thornfield.","pages":[{"en":["Jane, poor and orphaned, becomes a governess.","She travels to the gloomy Thornfield Hall."],"es":["Jane, pobre y huérfana, se hace institutriz.","Viaja al sombrío Thornfield Hall."],"vocab":{"poor":"pobre","orphaned":"huérfana","governess":"institutriz","gloomy":"sombrío","hall":"mansión"}},{"en":["Her pupil Adele laughs through the corridors.","Yet a strange laugh answers from above."],"es":["Su alumna Adele ríe por los pasillos.","Pero una risa extraña responde desde arriba."],"vocab":{"pupil":"alumna","corridors":"pasillos","yet":"pero / sin embargo","answers":"responde","above":"arriba"}},{"en":["Mr Rochester, dark and proud, questions her.","You are no slave to fear, he admits."],"es":["El Sr. Rochester, oscuro y orgulloso, la interroga.","No eres esclava del miedo, admite."],"vocab":{"proud":"orgulloso","questions":"interroga","admits":"admite"}},{"en":["At night, whispers crawl behind the walls.","Someone tries to burn the master in his bed."],"es":["De noche, susurros se arrastran tras las paredes.","Alguien intenta quemar al amo en su cama."],"vocab":{"whispers":"susurros","crawl":"se arrastran","behind":"tras","burn":"quemar","master":"amo"}},{"en":["Jane saves him from smoke and fire.","Gratitude slowly turns into forbidden love."],"es":["Jane lo salva del humo y el fuego.","La gratitud se vuelve lentamente amor prohibido."],"vocab":{"saves":"salva","smoke":"humo","gratitude":"gratitud","forbidden":"prohibido"}},{"en":["He proposes beneath the old chestnut tree.","Her heart, so long chained, trembles."],"es":["Él propone matrimonio bajo el viejo castaño.","Su corazón, tanto tiempo encadenado, tiembla."],"vocab":{"proposes":"propone matrimonio","beneath":"bajo","trembles":"tiembla","chained":"encadenado"}},{"en":["On the wedding day, a stranger shouts the truth.","Rochester hides a wife, mad and enslaved by illness."],"es":["El día de la boda, un extraño grita la verdad.","Rochester esconde una esposa, loca y esclava de la enfermedad."],"vocab":{"wedding":"boda","stranger":"extraño","truth":"verdad","mad":"loca","illness":"enfermedad"}},{"en":["Jane flees into the cold moor night.","She would rather starve than live as a shadow."],"es":["Jane huye a la fría noche del páramo.","Prefiere morir de hambre que vivir como sombra."],"vocab":{"flees":"huye","rather":"preferiría","starve":"morir de hambre"}},{"en":["Thornfield burns; the secret dies in flames.","Rochester, blinded, wanders among ashes."],"es":["Thornfield arde; el secreto muere en llamas.","Rochester, ciego, vaga entre cenizas."],"vocab":{"burns":"arde","flames":"llamas","blinded":"ciego","wanders":"vaga","ashes":"cenizas"}},{"en":["Jane returns, free and strong at last.","Love, she learns, must never be a chain."],"es":["Jane regresa, libre y fuerte al fin.","El amor, aprende, nunca debe ser cadena."],"vocab":{"returns":"regresa","chain":"cadena"}}]},{"id":"wuthering-echo","title":"Slaves of the Wind","orig":"E. Brontë · Wuthering Heights","level":"B2","icon":"⛈️","desc":"Heathcliff y Catherine, esclavos de un amor salvaje en la colina.","pages":[{"en":["On the windy heights, an orphan arrives.","The Earnshaws name him Heathcliff."],"es":["En las alturas ventosas, llega un huérfano.","Los Earnshaw lo llaman Heathcliff."],"vocab":{"windy":"ventosas","heights":"alturas","orphan":"huérfano","name":"llaman"}},{"en":["Catherine and he run wild over the moors.","Two souls chained by the same storm."],"es":["Catherine y él corren libres por los páramos.","Dos almas encadenadas por la misma tormenta."],"vocab":{"wild":"libres / salvajes","souls":"almas","storm":"tormenta"}},{"en":["Hindley humiliates the dark boy daily.","Heathcliff silently feeds his hatred."],"es":["Hindley humilla al muchacho oscuro a diario.","Heathcliff alimenta en silencio su odio."],"vocab":{"humiliates":"humilla","daily":"a diario","silently":"en silencio","hatred":"odio"}},{"en":["Catherine chooses a rich, gentle husband.","I am Heathcliff, she cries too late."],"es":["Catherine elige un esposo rico y gentil.","Yo soy Heathcliff, llora demasiado tarde."],"vocab":{"chooses":"elige","rich":"rico","gentle":"gentil","too":"demasiado","late":"tarde"}},{"en":["Betrayed, Heathcliff vanishes into the night.","He returns years later, rich and cold."],"es":["Traicionado, Heathcliff desaparece en la noche.","Regresa años después, rico y frío."],"vocab":{"betrayed":"traicionado","vanishes":"desaparece","later":"después"}},{"en":["He buys the Heights and enslaves Hindley.","Revenge is his only warm blanket."],"es":["Compra las Cumbres y esclaviza a Hindley.","La venganza es su única manta cálida."],"vocab":{"buys":"compra","enslaves":"esclaviza","revenge":"venganza"}},{"en":["Catherine dies calling his name in fever.","Her ghost scratches at the frozen window."],"es":["Catherine muere llamando su nombre con fiebre.","Su fantasma araña la ventana helada."],"vocab":{"dies":"muere","fever":"fiebre","ghost":"fantasma","scratches":"araña","frozen":"helada"}},{"en":["Heathcliff digs for her echo in every grave.","Neither prayer nor wine can free him."],"es":["Heathcliff excava buscando su eco en cada tumba.","Ni la oración ni el vino pueden liberarlo."],"vocab":{"digs":"excava","echo":"eco","grave":"tumba","prayer":"oración","free":"liberar"}},{"en":["Old and hollow, he starves himself for love.","Let me go to her, he begs the wind."],"es":["Viejo y hueco, se deja morir de hambre por amor.","Déjame ir con ella, ruega al viento."],"vocab":{"hollow":"hueco","starves":"se deja morir de hambre","begs":"ruega"}},{"en":["Villagers swear two shadows walk the moor.","At last, no chain can hold them."],"es":["Los aldeanos juran que dos sombras caminan el páramo.","Al fin, ninguna cadena puede retenerlos."],"vocab":{"villagers":"aldeanos","swear":"juran","hold":"retener"}}]},{"id":"time-dark","title":"The Slave of Time","orig":"H. G. Wells · The Time Machine","level":"C1","icon":"⏳","desc":"Un viajero huye al futuro y halla humanidad esclavizada bajo tierra.","pages":[{"en":["The inventor unveils a machine of brass and shadow.","I shall ride the very current of time, he declares."],"es":["El inventor revela una máquina de latón y sombra.","Cabalgaré la corriente misma del tiempo, declara."],"vocab":{"inventor":"inventor","unveils":"revela","brass":"latón","current":"corriente","declares":"declara"}},{"en":["Levers scream; the laboratory dissolves into grey.","Days flicker past like wounded moths."],"es":["Las palancas chirrían; el laboratorio se disuelve en gris.","Los días parpadean como polillas heridas."],"vocab":{"levers":"palancas","dissolves":"se disuelve","flicker":"parpadean","wounded":"heridas","moths":"polillas"}},{"en":["He lands among the fragile, childlike Eloi.","They feast, sing, and fear the dark."],"es":["Aterriza entre los frágiles e infantiles Eloi.","Festejan, cantan y temen la oscuridad."],"vocab":{"lands":"aterriza","fragile":"frágiles","feast":"festejan","fear":"temen"}},{"en":["By night, ape-like Morlocks rise from the abyss.","They enslave the Eloi through hunger and dread."],"es":["De noche, Morlocks simiescos surgen del abismo.","Esclavizan a los Eloi con hambre y pavor."],"vocab":{"dread":"pavor"}},{"en":["They steal his machine and drag it below.","Without it, he is a slave of eternity."],"es":["Roban su máquina y la arrastran abajo.","Sin ella, es un esclavo de la eternidad."],"vocab":{"steal":"roban","drag":"arrastran","below":"abajo","eternity":"eternidad"}},{"en":["He descends with matches trembling in his fist.","Eyes gleam; the underground exhales cold."],"es":["Desciende con fósforos temblando en su puño.","Ojos brillan; el subsuelo exhala frío."],"vocab":{"descends":"desciende","matches":"fósforos","fist":"puño","gleam":"brillan","underground":"subsuelo","exhales":"exhala"}},{"en":["Fire, the ancient master, scatters the horde.","He reclaims his machine amid smoke and screams."],"es":["El fuego, amo ancestral, dispersa la horda.","Recupera su máquina entre humo y gritos."],"vocab":{"ancient":"ancestral","scatters":"dispersa","horde":"horda","reclaims":"recupera","amid":"entre"}},{"en":["He flees further, to the dying red sun.","Crabs crawl on a silent, blood-colored beach."],"es":["Huye más lejos, hacia el sol rojo moribundo.","Cangrejos se arrastran en una playa silenciosa color sangre."],"vocab":{"dying":"moribundo","crabs":"cangrejos"}},{"en":["Time, he understands, devours masters and slaves.","Only kindness might break its jaws."],"es":["El tiempo, comprende, devora amos y esclavos.","Solo la bondad podría romper sus fauces."],"vocab":{"devours":"devora","kindness":"bondad","jaws":"fauces"}},{"en":["He returns with two strange flowers as proof.","Yet no one believes the slave who escaped time."],"es":["Regresa con dos flores extrañas como prueba.","Pero nadie cree al esclavo que escapó del tiempo."],"vocab":{"proof":"prueba","believes":"cree","escaped":"escapó"}}]},{"id":"invisible-chains","title":"Chains of Shadow","orig":"H. G. Wells · The Invisible Man","level":"C1","icon":"👻","desc":"Griffin logra la invisibilidad y se vuelve esclavo de su poder.","pages":[{"en":["A bandaged stranger rents a room in winter.","He demands silence, fire, and solitude."],"es":["Un extraño vendado alquila un cuarto en invierno.","Exige silencio, fuego y soledad."],"vocab":{"bandaged":"vendado","stranger":"extraño","rents":"alquila","demands":"exige","solitude":"soledad"}},{"en":["Griffin has erased his own reflection.","Science has made him a living shadow."],"es":["Griffin ha borrado su propio reflejo.","La ciencia lo ha vuelto sombra viviente."],"vocab":{"erased":"ha borrado","reflection":"reflejo","living":"viviente"}},{"en":["At first, invisibility tastes like freedom.","He steals, mocks, and vanishes laughing."],"es":["Al principio, la invisibilidad sabe a libertad.","Roba, se burla y desaparece riendo."],"vocab":{"tastes":"sabe","freedom":"libertad","steals":"roba","mocks":"se burla","vanishes":"desaparece"}},{"en":["But the village hunts what it cannot see.","Footprints in snow betray the unseen slave."],"es":["Pero la aldea caza lo que no puede ver.","Huellas en la nieve delatan al esclavo invisible."],"vocab":{"hunts":"caza","footprints":"huellas","betray":"delatan","unseen":"invisible"}},{"en":["He flees naked through the freezing night.","Power, he learns, is another chain."],"es":["Huye desnudo en la noche helada.","El poder, aprende, es otra cadena."],"vocab":{"naked":"desnudo","freezing":"helada","power":"poder","chain":"cadena"}},{"en":["He seeks Kemp, his old fellow student.","Help me rule the shadows, he pleads."],"es":["Busca a Kemp, su antiguo condiscípulo.","Ayúdame a gobernar las sombras, suplica."],"vocab":{"seeks":"busca","fellow":"condiscípulo","rule":"gobernar","pleads":"suplica"}},{"en":["Kemp, horrified, summons the police instead.","Reason refuses to kneel before terror."],"es":["Kemp, horrorizado, llama a la policía.","La razón se niega a arrodillarse ante el terror."],"vocab":{"horrified":"horrorizado","summons":"llama / convoca","kneel":"arrodillarse"}},{"en":["Griffin declares a reign of invisible terror.","I will strangle the town with unseen hands."],"es":["Griffin declara un reinado de terror invisible.","Estrangularé el pueblo con manos invisibles."],"vocab":{"reign":"reinado","strangle":"estrangular"}},{"en":["The crowd traps him with glass and powder.","Beaten hands paint his outline in dust."],"es":["La multitud lo atrapa con vidrio y polvo.","Manos golpeadas dibujan su contorno en polvo."],"vocab":{"crowd":"multitud","traps":"atrapa","beaten":"golpeadas","outline":"contorno","dust":"polvo"}},{"en":["Dying, he slowly becomes visible again.","A bruised man sleeps free of shadows at last."],"es":["Al morir, lentamente se vuelve visible otra vez.","Un hombre magullado duerme al fin libre de sombras."],"vocab":{"dying":"al morir","visible":"visible","bruised":"magullado"}}]},{"id":"sleepy-hollow","title":"The Headless Rider","orig":"W. Irving · Sleepy Hollow","level":"A2","icon":"🎃","desc":"Un maestro miedoso cruza el puente viejo… algo lo sigue sin cabeza.","pages":[{"en":["Ichabod is a thin school teacher.","He loves food, songs, and ghost stories."],"es":["Ichabod es un maestro delgado.","Ama la comida, las canciones y los cuentos de fantasmas."],"vocab":{"thin":"delgado","teacher":"maestro","loves":"ama","songs":"canciones","ghost":"fantasma"}},{"en":["He lives in the quiet town of Sleepy Hollow.","Everyone there believes in spirits."],"es":["Vive en el tranquilo pueblo de Sleepy Hollow.","Todos allí creen en espíritus."],"vocab":{"quiet":"tranquilo","town":"pueblo","believes":"creen","spirits":"espíritus"}},{"en":["Ichabod loves the beautiful Katrina.","But Brom, a strong boy, loves her too."],"es":["Ichabod ama a la hermosa Katrina.","Pero Brom, un muchacho fuerte, también la ama."],"vocab":{"beautiful":"hermosa","strong":"fuerte","loves":"ama"}},{"en":["One night there is a big party.","Ichabod eats cake and dances badly."],"es":["Una noche hay una gran fiesta.","Ichabod come pastel y baila mal."],"vocab":{"party":"fiesta","eats":"come","cake":"pastel","dances":"baila","badly":"mal"}},{"en":["Old men tell scary stories by the fire.","A headless rider hunts at night, they say."],"es":["Los ancianos cuentan historias de miedo junto al fuego.","Un jinete sin cabeza caza de noche, dicen."],"vocab":{"scary":"de miedo","fire":"fuego","headless":"sin cabeza","rider":"jinete","hunts":"caza"}},{"en":["Ichabod rides home on his old horse.","The road is dark and silent."],"es":["Ichabod cabalga a casa en su viejo caballo.","El camino está oscuro y silencioso."],"vocab":{"rides":"cabalga","horse":"caballo","road":"camino","silent":"silencioso"}},{"en":["Behind him, hooves sound fast.","A black rider follows without a head!"],"es":["Tras él, cascos suenan rápido.","¡Un jinete negro lo sigue sin cabeza!"],"vocab":{"behind":"tras","hooves":"cascos","fast":"rápido","follows":"sigue","without":"sin"}},{"en":["Ichabod screams and hits the horse.","Run, Gunpowder, run for your life!"],"es":["Ichabod grita y golpea al caballo.","¡Corre, Pólvora, corre por tu vida!"],"vocab":{"screams":"grita","hits":"golpea","run":"corre","life":"vida"}},{"en":["The old bridge is near now.","Spirits cannot cross running water."],"es":["El puente viejo está cerca ahora.","Los espíritus no pueden cruzar agua corriente."],"vocab":{"bridge":"puente","spirits":"espíritus","cross":"cruzar","water":"agua"}},{"en":["In the morning, only a hat remains.","And Brom smiles with Katrina forever."],"es":["Por la mañana, solo queda un sombrero.","Y Brom sonríe con Katrina por siempre."],"vocab":{"morning":"mañana","hat":"sombrero","remains":"queda","smiles":"sonríe","forever":"por siempre"}}]},{"id":"oz-road","title":"The Yellow Road","orig":"L. F. Baum · Oz","level":"A1","icon":"🌈","desc":"Dorothy y su perro siguen el camino amarillo al mago.","pages":[{"en":["Dorothy lives in a gray house.","Her little dog is Toto."],"es":["Dorothy vive en una casa gris.","Su perrito es Toto."],"vocab":{"lives":"vive","gray":"gris","house":"casa","little":"pequeño","dog":"perro"}},{"en":["A big wind takes the house away.","The house flies through the sky."],"es":["Un gran viento se lleva la casa.","La casa vuela por el cielo."],"vocab":{"wind":"viento","takes":"lleva","away":"lejos","flies":"vuela","sky":"cielo"}},{"en":["The house lands in a magic land.","Flowers sing and colors shine."],"es":["La casa aterriza en una tierra mágica.","Las flores cantan y los colores brillan."],"vocab":{"lands":"aterriza","magic":"mágica","land":"tierra","flowers":"flores","shine":"brillan"}},{"en":["A good witch gives a kiss.","It will protect you, she says."],"es":["Una bruja buena le da un beso.","Te protegerá, dice ella."],"vocab":{"witch":"bruja","gives":"da","kiss":"beso","protect":"protegerá","says":"dice"}},{"en":["Follow the yellow road, she says.","The Wizard lives in the green city."],"es":["Sigue el camino amarillo, dice.","El Mago vive en la ciudad verde."],"vocab":{"follow":"sigue","road":"camino","wizard":"mago","green":"verde","city":"ciudad"}},{"en":["Dorothy meets a man of straw.","He wants a brain to think."],"es":["Dorothy conoce a un hombre de paja.","Él quiere un cerebro para pensar."],"vocab":{"meets":"conoce","straw":"paja","wants":"quiere","brain":"cerebro","think":"pensar"}},{"en":["They meet a man of metal.","He wants a warm heart."],"es":["Conocen a un hombre de metal.","Él quiere un corazón cálido."],"vocab":{"metal":"metal","warm":"cálido","heart":"corazón"}},{"en":["A big lion joins the friends.","He is afraid, but he is kind."],"es":["Un gran león se une a los amigos.","Tiene miedo, pero es amable."],"vocab":{"lion":"león","joins":"se une","friends":"amigos","afraid":"miedo","kind":"amable"}},{"en":["The friends walk and sing together.","No slave walks this road alone."],"es":["Los amigos caminan y cantan juntos.","Ningún esclavo camina solo este camino."],"vocab":{"walk":"caminan","sing":"cantan","together":"juntos","alone":"solo"}},{"en":["The green city shines far away.","Home is where the heart smiles."],"es":["La ciudad verde brilla a lo lejos.","El hogar es donde el corazón sonríe."],"vocab":{"shines":"brilla","far":"lejos","home":"hogar","smiles":"sonríe"}}]},{"id":"wonderland-rabbit","title":"Down the Rabbit Hole","orig":"L. Carroll · Alice","level":"A2","icon":"🐇","desc":"Alicia sigue un conejo con reloj y cae a un mundo loco.","pages":[{"en":["Alice sits bored by the river.","A white rabbit runs past her."],"es":["Alicia se sienta aburrida junto al río.","Un conejo blanco pasa corriendo."],"vocab":{"bored":"aburrida","river":"río","rabbit":"conejo","runs":"corre"}},{"en":["The rabbit looks at his watch.","I am late, I am late! he cries."],"es":["El conejo mira su reloj.","¡Llego tarde, llego tarde! llora."],"vocab":{"watch":"reloj","late":"tarde","cries":"llora"}},{"en":["Alice follows him to a hole.","She falls down, down, down."],"es":["Alicia lo sigue a un agujero.","Ella cae abajo, abajo, abajo."],"vocab":{"follows":"sigue","hole":"agujero","falls":"cae","down":"abajo"}},{"en":["She lands in a strange hall.","Many little doors lock every wall."],"es":["Aterriza en un salón extraño.","Muchas puertitas cierran cada pared."],"vocab":{"lands":"aterriza","strange":"extraño","hall":"salón","doors":"puertas","lock":"cierran","wall":"pared"}},{"en":["A small bottle says DRINK ME.","Alice drinks and shrinks fast."],"es":["Una botellita dice BÉBEME.","Alicia bebe y se encoge rápido."],"vocab":{"bottle":"botella","drinks":"bebe","shrinks":"se encoge"}},{"en":["A small cake says EAT ME.","She grows tall like a tree."],"es":["Un pastelito dice CÓMEME.","Ella crece alta como un árbol."],"vocab":{"cake":"pastel","grows":"crece","tall":"alta","tree":"árbol"}},{"en":["A blue caterpillar smokes slowly.","Who are YOU? he asks."],"es":["Una oruga azul fuma despacio.","¿Quién eres TÚ? pregunta."],"vocab":{"caterpillar":"oruga","smokes":"fuma","slowly":"despacio","asks":"pregunta"}},{"en":["Alice drinks tea with a mad hare.","The clock always says tea time."],"es":["Alicia toma té con una liebre loca.","El reloj siempre dice hora del té."],"vocab":{"tea":"té","mad":"loca","hare":"liebre","clock":"reloj","always":"siempre"}},{"en":["The Queen screams for heads.","Alice is not afraid anymore."],"es":["La Reina grita por cabezas.","Alicia ya no tiene miedo."],"vocab":{"queen":"reina","screams":"grita","heads":"cabezas","afraid":"miedo","anymore":"ya"}},{"en":["Alice wakes by the river.","It was all a bright dream."],"es":["Alicia despierta junto al río.","Todo fue un sueño brillante."],"vocab":{"wakes":"despierta","dream":"sueño","bright":"brillante"}}]},{"id":"samurai-honor","title":"The Last Cherry Blossom","orig":"Tale of old Japan","level":"B1","icon":"⚔️","desc":"Un joven samurái debe elegir entre obedecer y proteger su aldea.","pages":[{"en":["Kenji trains with his wooden sword at dawn.","Cherry petals fall like pink snow."],"es":["Kenji entrena con su espada de madera al amanecer.","Pétalos de cerezo caen como nieve rosa."],"vocab":{"trains":"entrena","wooden":"de madera","sword":"espada","petals":"pétalos","snow":"nieve"}},{"en":["The old master watches in silence.","Your arm is fast, but your heart is faster, he says."],"es":["El viejo maestro mira en silencio.","Tu brazo es rápido, pero tu corazón es más rápido, dice."],"vocab":{"master":"maestro","silence":"silencio","fast":"rápido","heart":"corazón"}},{"en":["A cruel lord demands rice from the village.","Winter is coming and the barns are empty."],"es":["Un señor cruel exige arroz de la aldea.","El invierno viene y los graneros están vacíos."],"vocab":{"cruel":"cruel","lord":"señor","demands":"exige","rice":"arroz","village":"aldea","empty":"vacíos"}},{"en":["Kenji must obey his lord by law.","But his mother was born in that village."],"es":["Kenji debe obedecer a su señor por ley.","Pero su madre nació en esa aldea."],"vocab":{"obey":"obedecer","law":"ley","born":"nació"}},{"en":["At night he visits the old temple.","The monk serves bitter tea and wisdom."],"es":["De noche visita el templo viejo.","El monje sirve té amargo y sabiduría."],"vocab":{"temple":"templo","monk":"monje","bitter":"amargo","wisdom":"sabiduría"}},{"en":["A sword without justice is a chain, the monk whispers.","Kenji bows and understands."],"es":["Una espada sin justicia es una cadena, susurra el monje.","Kenji se inclina y comprende."],"vocab":{"justice":"justicia","chain":"cadena","whispers":"susurra","understands":"comprende"}},{"en":["Kenji returns the rice at midnight.","He leaves his sword as payment."],"es":["Kenji devuelve el arroz a medianoche.","Deja su espada como pago."],"vocab":{"returns":"devuelve","midnight":"medianoche","payment":"pago"}},{"en":["The lord's guards arrest him at dawn.","Kenji does not raise his hands."],"es":["Los guardias del señor lo arrestan al amanecer.","Kenji no levanta sus manos."],"vocab":{"guards":"guardias","arrest":"arrestan","raise":"levanta"}},{"en":["The villagers march to the castle together.","Free him, they sing without fear."],"es":["Los aldeanos marchan juntos al castillo.","Libérenlo, cantan sin miedo."],"vocab":{"march":"marchan","castle":"castillo","free":"liberen","fear":"miedo"}},{"en":["The lord frees Kenji in shame.","Honor blooms longer than cherry trees."],"es":["El señor libera a Kenji avergonzado.","El honor florece más que los cerezos."],"vocab":{"frees":"libera","shame":"vergüenza","honor":"honor","blooms":"florece"}}]},{"id":"condor-andes","title":"The Condor's Gift","orig":"Andean legend","level":"A1","icon":"🦅","desc":"Una niña sube la montaña y el gran cóndor le da un regalo.","pages":[{"en":["Lucia lives under the big mountains.","She loves birds and songs."],"es":["Lucía vive bajo las grandes montañas.","Ama los pájaros y las canciones."],"vocab":{"lives":"vive","mountains":"montañas","loves":"ama","birds":"pájaros","songs":"canciones"}},{"en":["Her grandmother is sick in bed.","Lucia wants a magic flower."],"es":["Su abuela está enferma en cama.","Lucía quiere una flor mágica."],"vocab":{"sick":"enferma","bed":"cama","wants":"quiere","flower":"flor"}},{"en":["The flower grows on the high peak.","Only the condor knows the road."],"es":["La flor crece en el pico alto.","Solo el cóndor conoce el camino."],"vocab":{"grows":"crece","high":"alto","peak":"pico","knows":"conoce","road":"camino"}},{"en":["Lucia climbs up in the morning.","The air is cold and thin."],"es":["Lucía sube por la mañana.","El aire es frío y delgado."],"vocab":{"climbs":"sube","morning":"mañana","air":"aire","cold":"frío","thin":"delgado"}},{"en":["A big shadow covers the sun.","The great condor lands near her."],"es":["Una gran sombra cubre el sol.","El gran cóndor aterriza cerca de ella."],"vocab":{"shadow":"sombra","covers":"cubre","sun":"sol","lands":"aterriza","near":"cerca"}},{"en":["Little girl, why do you climb? he asks.","For my grandmother, she answers."],"es":["Niñita, ¿por qué subes? pregunta.","Por mi abuela, responde ella."],"vocab":{"little":"pequeña","climb":"subes","answers":"responde"}},{"en":["The condor opens his huge wings.","Climb on, brave heart, he says."],"es":["El cóndor abre sus enormes alas.","Sube, corazón valiente, dice."],"vocab":{"wings":"alas","brave":"valiente","heart":"corazón","says":"dice"}},{"en":["They fly over clouds and snow.","Lucia laughs with happy tears."],"es":["Vuelan sobre nubes y nieve.","Lucía ríe con lágrimas felices."],"vocab":{"fly":"vuelan","clouds":"nubes","snow":"nieve","laughs":"ríe","tears":"lágrimas"}},{"en":["The flower shines on the peak.","Lucia takes it with soft hands."],"es":["La flor brilla en el pico.","Lucía la toma con manos suaves."],"vocab":{"shines":"brilla","takes":"toma","soft":"suaves","hands":"manos"}},{"en":["Grandmother smiles and is well.","Love flies higher than condors."],"es":["La abuela sonríe y está bien.","El amor vuela más alto que los cóndores."],"vocab":{"smiles":"sonríe","love":"amor","higher":"más alto"}}]},{"id":"viking-compass","title":"The Stone Compass","orig":"Northern saga","level":"B1","icon":"🧭","desc":"Una joven vikinga roba la brújula de piedra y navega a lo desconocido.","pages":[{"en":["Freya mends nets while men plan war.","Her eyes always look past the horizon."],"es":["Freya remienda redes mientras los hombres planean la guerra.","Sus ojos siempre miran más allá del horizonte."],"vocab":{"mends":"remienda","nets":"redes","war":"guerra","horizon":"horizonte"}},{"en":["Her father guards a stone compass.","It points to lands no map remembers."],"es":["Su padre guarda una brújula de piedra.","Apunta a tierras que ningún mapa recuerda."],"vocab":{"guards":"guarda","compass":"brújula","points":"apunta","remembers":"recuerda"}},{"en":["One stormy night Freya takes it.","Forgive me, father, she whispers to the wind."],"es":["Una noche de tormenta Freya la toma.","Perdóname, padre, susurra al viento."],"vocab":{"stormy":"de tormenta","takes":"toma","forgive":"perdóname","whispers":"susurra","wind":"viento"}},{"en":["She sails west with three friends.","The sea is a slave to no king."],"es":["Navega al oeste con tres amigos.","El mar no es esclavo de ningún rey."],"vocab":{"sails":"navega","west":"oeste","sea":"mar","king":"rey"}},{"en":["For days, fog eats the sun.","The crew sings to kill the fear."],"es":["Por días, la niebla devora el sol.","La tripulación canta para matar el miedo."],"vocab":{"fog":"niebla","crew":"tripulación","fear":"miedo"}},{"en":["On the seventh dawn, birds scream.","Land! Land! cries the youngest sailor."],"es":["Al séptimo amanecer, los pájaros gritan.","¡Tierra! ¡Tierra! llora el marinero más joven."],"vocab":{"dawn":"amanecer","birds":"pájaros","sailor":"marinero"}},{"en":["Green cliffs rise from white foam.","Berries shine like red stars."],"es":["Acantilados verdes surgen de espuma blanca.","Bayas brillan como estrellas rojas."],"vocab":{"cliffs":"acantilados","foam":"espuma","berries":"bayas","stars":"estrellas"}},{"en":["Strangers bring bread, not swords.","Freya offers amber for salt."],"es":["Extraños traen pan, no espadas.","Freya ofrece ámbar por sal."],"vocab":{"strangers":"extraños","bread":"pan","swords":"espadas","offers":"ofrece","salt":"sal"}},{"en":["They return before the first snow.","Her father's anger melts into pride."],"es":["Regresan antes de la primera nieve.","La ira de su padre se derrite en orgullo."],"vocab":{"return":"regresan","snow":"nieve","anger":"ira","pride":"orgullo"}},{"en":["The compass now points home.","Courage is the truest north."],"es":["La brújula ahora apunta a casa.","El valor es el verdadero norte."],"vocab":{"home":"casa","courage":"valor","north":"norte"}}]},{"id":"sahara-secret","title":"The Well of Stars","orig":"Desert tale","level":"B2","icon":"🏜️","desc":"Una guía tuareg busca el pozo que solo aparece sin luna.","pages":[{"en":["Amina guides caravans through the dunes.","She reads sand the way others read books."],"es":["Amina guía caravanas por las dunas.","Lee la arena como otros leen libros."],"vocab":{"guides":"guía","caravans":"caravanas","dunes":"dunas","sand":"arena"}},{"en":["Her grandfather spoke of a hidden well.","It opens only on moonless nights, he swore."],"es":["Su abuelo habló de un pozo oculto.","Solo se abre en noches sin luna, juró."],"vocab":{"hidden":"oculto","well":"pozo","moonless":"sin luna","swore":"juró"}},{"en":["A merchant offers gold for its water.","Water that never dries, he dreams aloud."],"es":["Un mercader ofrece oro por su agua.","Agua que nunca se seca, sueña en voz alta."],"vocab":{"merchant":"mercader","gold":"oro","dries":"se seca","dreams":"sueña"}},{"en":["Amina refuses to sell the desert.","Some chains shine like coins, she answers."],"es":["Amina se niega a vender el desierto.","Algunas cadenas brillan como monedas, responde."],"vocab":{"refuses":"se niega","sell":"vender","chains":"cadenas","coins":"monedas"}},{"en":["On the darkest night they ride out.","Three camels, two skins of water, one secret."],"es":["En la noche más oscura cabalgan.","Tres camellos, dos odres de agua, un secreto."],"vocab":{"darkest":"más oscura","ride":"cabalgan","camels":"camellos","secret":"secreto"}},{"en":["The merchant follows in secret.","Greed rides faster than camels."],"es":["El mercader los sigue en secreto.","La codicia cabalga más rápido que los camellos."],"vocab":{"greed":"codicia"}},{"en":["At midnight the sand begins to sing.","Stars fall and open a black mirror."],"es":["A medianoche la arena empieza a cantar.","Las estrellas caen y abren un espejo negro."],"vocab":{"midnight":"medianoche","sing":"cantar","mirror":"espejo"}},{"en":["Amina drinks and fills one skin.","Enough for all, never for sale, she vows."],"es":["Amina bebe y llena un odre.","Suficiente para todos, nunca en venta, jura."],"vocab":{"drinks":"bebe","enough":"suficiente","sale":"venta","vows":"jura"}},{"en":["The merchant dives in with his bags.","The well closes over his greed."],"es":["El mercader se lanza con sus bolsas.","El pozo se cierra sobre su codicia."],"vocab":{"dives":"se lanza","closes":"se cierra"}},{"en":["Amina leads the caravan home.","The desert keeps slaves and freed alike."],"es":["Amina guía la caravana a casa.","El desierto guarda esclavos y libres por igual."],"vocab":{"leads":"guía","keeps":"guarda","freed":"libres","alike":"por igual"}}]},{"id":"mermaid-zanzibar","title":"The Pearl Singer","orig":"Swahili legend","level":"A2","icon":"🧜","desc":"Un pescador oye cantar bajo el mar y halla una sirena herida.","pages":[{"en":["Juma fishes at dawn every day.","His boat is small but his heart is big."],"es":["Juma pesca al amanecer cada día.","Su barca es pequeña pero su corazón es grande."],"vocab":{"fishes":"pesca","dawn":"amanecer","boat":"barca","heart":"corazón"}},{"en":["One morning he hears sweet singing.","It comes from under the blue waves."],"es":["Una mañana oye un dulce canto.","Viene de debajo de las olas azules."],"vocab":{"hears":"oye","singing":"canto","waves":"olas"}},{"en":["A mermaid lies hurt on the sand.","A net holds her silver tail."],"es":["Una sirena yace herida en la arena.","Una red sujeta su cola plateada."],"vocab":{"mermaid":"sirena","hurt":"herida","sand":"arena","net":"red","tail":"cola"}},{"en":["Do not be afraid, Juma says softly.","I will free you now."],"es":["No tengas miedo, dice Juma suave.","Te liberaré ahora."],"vocab":{"afraid":"miedo","softly":"suave","free":"liberaré"}},{"en":["He cuts the net with his knife.","The mermaid cries happy tears."],"es":["Corta la red con su cuchillo.","La sirena llora lágrimas felices."],"vocab":{"cuts":"corta","knife":"cuchillo","tears":"lágrimas"}},{"en":["Take this pearl for your kindness, she sings.","It shines when danger is near."],"es":["Toma esta perla por tu bondad, canta.","Brilla cuando el peligro está cerca."],"vocab":{"pearl":"perla","kindness":"bondad","shines":"brilla","danger":"peligro","near":"cerca"}},{"en":["Juma sells fish and saves money.","He buys medicine for his village."],"es":["Juma vende pescado y ahorra dinero.","Compra medicina para su aldea."],"vocab":{"sells":"vende","fish":"pescado","money":"dinero","medicine":"medicina","village":"aldea"}},{"en":["One night pirates attack the village.","The pearl burns red in his pocket."],"es":["Una noche piratas atacan la aldea.","La perla arde roja en su bolsillo."],"vocab":{"pirates":"piratas","attack":"atacan","burns":"arde","pocket":"bolsillo"}},{"en":["Juma throws the pearl to the sea.","Waves rise and push the pirates away."],"es":["Juma lanza la perla al mar.","Las olas se alzan y empujan a los piratas."],"vocab":{"throws":"lanza","rise":"se alzan","push":"empujan","away":"lejos"}},{"en":["The village is safe and sings.","Kindness returns like the tide."],"es":["La aldea está a salvo y canta.","La bondad regresa como la marea."],"vocab":{"safe":"a salvo","kindness":"bondad","tide":"marea"}}]},{"id":"atlantis-bell","title":"The Bell of Atlantis","orig":"Sea myth","level":"B2","icon":"🔔","desc":"Una buceadora halla una campana que toca sola… y la ciudad despierta.","pages":[{"en":["Mara dives deeper than anyone dares.","Her grandfather vanished in these waters."],"es":["Mara bucea más hondo de lo que nadie se atreve.","Su abuelo desapareció en estas aguas."],"vocab":{"dives":"bucea","deeper":"más hondo","dares":"se atreve","vanished":"desapareció","waters":"aguas"}},{"en":["At forty meters the light turns green.","A bronze bell sleeps in the sand."],"es":["A cuarenta metros la luz se vuelve verde.","Una campana de bronce duerme en la arena."],"vocab":{"light":"luz","bell":"campana","sand":"arena"}},{"en":["Mara touches it; it rings alone.","Sound travels where light cannot."],"es":["Mara la toca; suena sola.","El sonido viaja donde la luz no puede."],"vocab":{"rings":"suena","sound":"sonido","travels":"viaja"}},{"en":["The sand opens like an eye.","Stairs of white stone invite her down."],"es":["La arena se abre como un ojo.","Escalones de piedra blanca la invitan a bajar."],"vocab":{"opens":"se abre","stairs":"escalones","stone":"piedra","invite":"invitan"}},{"en":["A city of glass wakes slowly.","Fishermen with silver eyes stare at her."],"es":["Una ciudad de cristal despierta despacio.","Pescadores de ojos plateados la miran."],"vocab":{"city":"ciudad","glass":"cristal","stare":"miran"}},{"en":["You rang the debt bell, they chant.","One of ours for one of yours, they demand."],"es":["Tocaste la campana de la deuda, corean.","Uno de los nuestros por uno de los tuyos, exigen."],"vocab":{"debt":"deuda","chant":"corean","demand":"exigen"}},{"en":["Mara understands: her grandfather stayed.","He traded his years for their storm wall."],"es":["Mara comprende: su abuelo se quedó.","Cambió sus años por su muro de tormentas."],"vocab":{"understands":"comprende","traded":"cambió","storm":"tormentas","wall":"muro"}},{"en":["Take me instead, Mara offers.","The bell rings twice and accepts."],"es":["Tómame a mí en cambio, ofrece Mara.","La campana suena dos veces y acepta."],"vocab":{"instead":"en cambio","offers":"ofrece","accepts":"acepta"}},{"en":["An old man with her eyes steps forward.","Grandfather! Time kept him young."],"es":["Un anciano con sus ojos avanza.","¡Abuelo! El tiempo lo mantuvo joven."],"vocab":{"steps":"avanza","young":"joven"}},{"en":["They rise together toward the sun.","Some chains break when love pays."],"es":["Suben juntos hacia el sol.","Algunas cadenas se rompen cuando el amor paga."],"vocab":{"rise":"suben","sun":"sol","break":"se rompen","love":"amor"}}]},{"id":"last-library","title":"The Last Library","orig":"A tale for readers","level":"C1","icon":"📚","desc":"En un mundo sin libros, una niña guarda la última biblioteca bajo tierra.","pages":[{"en":["In the gray city, screens replaced every book.","Forgetting became the law of comfort."],"es":["En la ciudad gris, las pantallas reemplazaron cada libro.","Olvidar se volvió la ley de la comodidad."],"vocab":{"screens":"pantallas","replaced":"reemplazaron","forgetting":"olvidar","comfort":"comodidad"}},{"en":["Wren, twelve, inherits a brass key.","Her grandmother's whisper guides her moves."],"es":["Wren, doce años, hereda una llave de latón.","El susurro de su abuela guía sus pasos."],"vocab":{"inherits":"hereda","brass":"latón","whisper":"susurro","guides":"guía"}},{"en":["Beneath the bakery, stairs descend into warmth.","Ten thousand spines breathe in the dark."],"es":["Bajo la panadería, escalones descienden al calor.","Diez mil lomos respiran en la oscuridad."],"vocab":{"beneath":"bajo","descend":"descienden","warmth":"calor","breathe":"respiran"}},{"en":["The Inspectors hunt remaining paper.","Ink, they preach, enslaves the mind."],"es":["Los Inspectores cazan el papel restante.","La tinta, predican, esclaviza la mente."],"vocab":{"hunt":"cazan","remaining":"restante","preach":"predican","enslaves":"esclaviza"}},{"en":["Wren memorizes one poem each night.","Words become birds she cannot cage."],"es":["Wren memoriza un poema cada noche.","Las palabras se vuelven pájaros que no puede enjaular."],"vocab":{"memorizes":"memoriza","poem":"poema","birds":"pájaros","cage":"enjaular"}},{"en":["She teaches fragments to trusted friends.","Each child carries one forbidden verse."],"es":["Enseña fragmentos a amigos de confianza.","Cada niño lleva un verso prohibido."],"vocab":{"teaches":"enseña","trusted":"de confianza","forbidden":"prohibido","verse":"verso"}},{"en":["Betrayed by hunger, she is caught at dawn.","The key burns cold in her fist."],"es":["Traicionada por el hambre, la atrapan al amanecer.","La llave quema fría en su puño."],"vocab":{"betrayed":"traicionada","hunger":"hambre","caught":"atrapan","fist":"puño"}},{"en":["Burn them, orders the pale Inspector.","Wren smiles: they live in us now."],"es":["Quémenlos, ordena el pálido Inspector.","Wren sonríe: ahora viven en nosotros."],"vocab":{"burn":"quemen","orders":"ordena","pale":"pálido"}},{"en":["Forty voices recite in the square.","The fire forgets whom to devour."],"es":["Cuarenta voces recitan en la plaza.","El fuego olvida a quién devorar."],"vocab":{"recite":"recitan","square":"plaza","devour":"devorar"}},{"en":["The city learns to read again.","No wall outlives a whispered tale."],"es":["La ciudad aprende a leer de nuevo.","Ningún muro sobrevive a un cuento susurrado."],"vocab":{"learns":"aprende","outlives":"sobrevive","tale":"cuento"}}]},{"id":"moon-garden","title":"The Moon Garden","orig":"A bedtime tale","level":"A1","icon":"🌙","desc":"Lila planta semillas de noche y el jardín despierta con la luna.","pages":[{"en":["Lila loves night flowers.","She plants seeds after dinner."],"es":["A Lila le encantan las flores nocturnas.","Planta semillas después de cenar."],"vocab":{"loves":"le encantan","flowers":"flores","plants":"planta","seeds":"semillas","dinner":"cena"}},{"en":["Grandpa gives her silver seeds.","Plant them with a song, he says."],"es":["El abuelo le da semillas plateadas.","Plántalas con una canción, dice."],"vocab":{"silver":"plateadas","song":"canción","says":"dice"}},{"en":["Lila sings to the dark soil.","The soil smells like rain."],"es":["Lila le canta a la tierra oscura.","La tierra huele a lluvia."],"vocab":{"sings":"canta","soil":"tierra","smells":"huele","rain":"lluvia"}},{"en":["The moon rises round and kind.","Moonlight touches the garden."],"es":["La luna sale redonda y amable.","La luz de luna toca el jardín."],"vocab":{"moon":"luna","kind":"amable","touches":"toca","garden":"jardín"}},{"en":["Tiny sprouts open silver eyes.","Hello, Lila, they whisper."],"es":["Brotes pequeños abren ojos plateados.","Hola, Lila, susurran."],"vocab":{"sprouts":"brotes","open":"abren","eyes":"ojos","whisper":"susurran"}},{"en":["Bluebells ring soft songs.","Fireflies dance over them."],"es":["Campanillas tocan canciones suaves.","Luciérnagas bailan sobre ellas."],"vocab":{"songs":"canciones","soft":"suaves","dance":"bailan"}},{"en":["A sleepy owl lands near.","Beautiful garden, he hoots."],"es":["Un búho soñoliento aterriza cerca.","Hermoso jardín, ulula."],"vocab":{"sleepy":"soñoliento","owl":"búho","lands":"aterriza","beautiful":"hermoso"}},{"en":["Lila gives him a moonflower.","For your night flights, she says."],"es":["Lila le da una flor lunar.","Para tus vuelos nocturnos, dice."],"vocab":{"gives":"da","flights":"vuelos","night":"nocturnos"}},{"en":["The garden glows till dawn.","Stars clap with tiny hands."],"es":["El jardín brilla hasta el amanecer.","Las estrellas aplauden con manitas."],"vocab":{"glows":"brilla","dawn":"amanecer","stars":"estrellas"}},{"en":["Lila sleeps with a smile.","Dreams smell like moonflowers."],"es":["Lila duerme con sonrisa.","Los sueños huelen a flores lunares."],"vocab":{"sleeps":"duerme","smile":"sonrisa","dreams":"sueños","smell":"huelen"}}]},{"id":"cloud-shepherd","title":"The Cloud Shepherd","orig":"A sky tale","level":"A1","icon":"☁️","desc":"Nico cuida nubes traviesas con un silbato de viento.","pages":[{"en":["Nico lives on a high hill.","He keeps clouds, not sheep."],"es":["Nico vive en una colina alta.","Cuida nubes, no ovejas."],"vocab":{"lives":"vive","hill":"colina","keeps":"cuida","clouds":"nubes","sheep":"ovejas"}},{"en":["His whistle is made of wind.","Clouds come when he calls."],"es":["Su silbato es de viento.","Las nubes vienen cuando llama."],"vocab":{"whistle":"silbato","wind":"viento","calls":"llama"}},{"en":["Morning clouds are white lambs.","They drink sunshine happily."],"es":["Las nubes mañaneras son corderos blancos.","Beben sol felices."],"vocab":{"morning":"mañaneras","lambs":"corderos","drink":"beben","sunshine":"sol"}},{"en":["One gray cloud always runs.","Catch me, shepherd! it laughs."],"es":["Una nube gris siempre corre.","¡Atrápame, pastor! ríe."],"vocab":{"gray":"gris","runs":"corre","catch":"atrapa","laughs":"ríe"}},{"en":["Nico runs after it fast.","Wait for me, little storm!"],"es":["Nico corre tras ella rápido.","¡Espérame, tormentita!"],"vocab":{"after":"tras","fast":"rápido","storm":"tormenta"}},{"en":["The cloud cries rainy tears.","I only want to play, it sobs."],"es":["La nube llora lágrimas de lluvia.","Solo quiero jugar, solloza."],"vocab":{"cries":"llora","tears":"lágrimas","play":"jugar"}},{"en":["Nico hugs the soft cloud.","Play with me, not alone, he says."],"es":["Nico abraza la nube suave.","Juega conmigo, no sola, dice."],"vocab":{"hugs":"abraza","soft":"suave","alone":"sola","says":"dice"}},{"en":["They race across the sky.","Villages below get soft rain."],"es":["Corren por el cielo.","Las aldeas reciben lluvia suave."],"vocab":{"race":"corren","sky":"cielo","rain":"lluvia"}},{"en":["At night clouds sleep in blue.","Nico sings them to rest."],"es":["De noche las nubes duermen en azul.","Nico les canta para dormir."],"vocab":{"night":"noche","sleep":"duermen","sings":"canta","rest":"dormir"}},{"en":["The gray cloud smiles now.","Shepherd of my heart, it sighs."],"es":["La nube gris sonríe ahora.","Pastor de mi corazón, suspira."],"vocab":{"smiles":"sonríe","heart":"corazón"}}]},{"id":"troll-bridge","title":"The Troll Who Charged Tales","orig":"A bridge tale","level":"A1","icon":"🌉","desc":"Bajo el puente, Gruñón no quiere monedas: quiere cuentos.","pages":[{"en":["A troll lives under the bridge.","His name is Grumpy."],"es":["Un troll vive bajo el puente.","Se llama Gruñón."],"vocab":{"lives":"vive","bridge":"puente","name":"llama"}},{"en":["He stops every traveler.","Pay with a story, he growls."],"es":["Detiene a cada viajero.","Paga con un cuento, gruñe."],"vocab":{"stops":"detiene","traveler":"viajero","story":"cuento"}},{"en":["Coins? No! Keep your gold.","Stories feed my heart, he says."],"es":["¿Monedas? ¡No! Guarda tu oro.","Los cuentos alimentan mi corazón, dice."],"vocab":{"gold":"oro","feed":"alimentan","heart":"corazón","says":"dice"}},{"en":["A baker tells of warm bread.","Grumpy smiles a little."],"es":["Un panadero cuenta del pan tibio.","Gruñón sonríe un poco."],"vocab":{"baker":"panadero","bread":"pan","smiles":"sonríe"}},{"en":["A child tells of a lost kite.","Grumpy wipes one tear."],"es":["Un niño cuenta de una cometa perdida.","Gruñón seca una lágrima."],"vocab":{"child":"niño","lost":"perdida","tear":"lágrima"}},{"en":["A sailor tells of wild waves.","Grumpy claps his big hands."],"es":["Un marinero cuenta de olas salvajes.","Gruñón aplaude con sus manotas."],"vocab":{"sailor":"marinero","waves":"olas","hands":"manos"}},{"en":["One day nobody comes.","The bridge stands silent and gray."],"es":["Un día nadie viene.","El puente queda gris y callado."],"vocab":{"nobody":"nadie","silent":"callado","gray":"gris"}},{"en":["Grumpy feels empty inside.","Stories were my sunshine, he sighs."],"es":["Gruñón se siente vacío.","Los cuentos eran mi sol, suspira."],"vocab":{"empty":"vacío","sunshine":"sol"}},{"en":["A small girl brings a book.","Read to me, troll, she asks."],"es":["Una niñita trae un libro.","Léeme, troll, pide."],"vocab":{"brings":"trae","book":"libro","asks":"pide"}},{"en":["Now they trade tales nightly.","The happiest toll in the world."],"es":["Ahora cambian cuentos cada noche.","El peaje más feliz del mundo."],"vocab":{"trade":"cambian","nightly":"cada noche","happy":"feliz"}}]},{"id":"star-whale","title":"The Whale Who Swam the Stars","orig":"A cosmic tale","level":"A2","icon":"🐋","desc":"Una ballena vieja nada al cielo para encender estrellas apagadas.","pages":[{"en":["Old Mara swims the deep sea.","She is the oldest whale alive."],"es":["La vieja Mara nada el mar hondo.","Es la ballena viva más vieja."],"vocab":{"swims":"nada","deep":"hondo","sea":"mar","oldest":"más vieja","alive":"viva"}},{"en":["One night stars begin to fall.","The sky loses its lights."],"es":["Una noche las estrellas caen.","El cielo pierde sus luces."],"vocab":{"stars":"estrellas","fall":"caen","sky":"cielo","lights":"luces"}},{"en":["Mara sings to the dark sky.","Let me help, she hums."],"es":["Mara le canta al cielo oscuro.","Déjame ayudar, tararea."],"vocab":{"sings":"canta","dark":"oscuro","help":"ayudar"}},{"en":["The moon lends a silver road.","Swim up, grandmother, it smiles."],"es":["La luna presta un camino plateado.","Nada arriba, abuela, sonríe."],"vocab":{"moon":"luna","road":"camino","smiles":"sonríe"}},{"en":["Mara beats her mighty tail.","Water turns to clouds of light."],"es":["Mara bate su cola potente.","El agua se vuelve nubes de luz."],"vocab":{"tail":"cola","water":"agua","clouds":"nubes","light":"luz"}},{"en":["She gathers stars in her mouth.","Gently, like lost babies."],"es":["Recoge estrellas en su boca.","Suave, como bebés perdidos."],"vocab":{"mouth":"boca","lost":"perdidos"}},{"en":["She blows them back to the sky.","Each one burns bright again."],"es":["Las sopla de vuelta al cielo.","Cada una arde brillante otra vez."],"vocab":{"burns":"arde","bright":"brillante","again":"otra vez"}},{"en":["The smallest star is afraid.","Hold my fin, Mara sings."],"es":["La estrellita tiene miedo.","Toma mi aleta, canta Mara."],"vocab":{"smallest":"más pequeña","afraid":"miedo","fin":"aleta"}},{"en":["Now the sky shines fully.","Sailors thank the whale's song."],"es":["Ahora el cielo brilla entero.","Los marineros agradecen su canto."],"vocab":{"shines":"brilla","song":"canto"}},{"en":["Mara sleeps among comets.","Even whales can touch heaven."],"es":["Mara duerme entre cometas.","Hasta las ballenas tocan el cielo."],"vocab":{"sleeps":"duerme","heaven":"cielo"}}]},{"id":"witch-apprentice","title":"Soup Spells","orig":"A cozy tale","level":"A2","icon":"🧙","desc":"Pipa mezcla un hechizo con la sopa y la aldea flota un poco.","pages":[{"en":["Pipa learns magic from Granny.","Her wand is a wooden spoon."],"es":["Pipa aprende magia de la Abuela.","Su varita es una cuchara de madera."],"vocab":{"learns":"aprende","magic":"magia","wand":"varita","spoon":"cuchara"}},{"en":["Today: soup for the village.","Carrots, laughs, and thyme."],"es":["Hoy: sopa para la aldea.","Zanahorias, risas y tomillo."],"vocab":{"soup":"sopa","village":"aldea","laughs":"risas"}},{"en":["Pipa adds a flying spell.","Just a pinch, she giggles."],"es":["Pipa agrega un hechizo volador.","Solo una pizca, ríe."],"vocab":{"adds":"agrega","spell":"hechizo","giggles":"ríe"}},{"en":["The pot bubbles blue and gold.","The kitchen smells like clouds."],"es":["La olla burbujea azul y oro.","La cocina huele a nubes."],"vocab":{"pot":"olla","kitchen":"cocina","clouds":"nubes"}},{"en":["Villagers taste one spoon.","Suddenly shoes feel light!"],"es":["Los aldeanos prueban una cucharada.","¡Los zapatos se sienten ligeros!"],"vocab":{"taste":"prueban","shoes":"zapatos","light":"ligeros"}},{"en":["The baker floats to his roof.","My pies! Come back! he laughs."],"es":["El panadero flota a su techo.","¡Mis pays! ¡Vuelvan! ríe."],"vocab":{"floats":"flota","roof":"techo","laughs":"ríe"}},{"en":["Children bounce like balloons.","Best soup ever! they cheer."],"es":["Los niños rebotan como globos.","¡Mejor sopa! vitorean."],"vocab":{"children":"niños","balloons":"globos","cheer":"vitorean"}},{"en":["Granny lands softly laughing.","Too much pinch, little cook!"],"es":["La Abuela aterriza riendo suave.","¡Mucha pizca, cocinera!"],"vocab":{"lands":"aterriza","cook":"cocinera"}},{"en":["Pipa serves grounding bread.","Eat, floaters! Down you go!"],"es":["Pipa sirve pan de aterrizaje.","¡Coman, flotadores! ¡Abajo!"],"vocab":{"bread":"pan","down":"abajo"}},{"en":["The village naps happily.","Magic tastes like carrot soup."],"es":["La aldea duerme feliz.","La magia sabe a sopa de zanahoria."],"vocab":{"tastes":"sabe"}}]},{"id":"dragon-library","title":"The Last Dragon Librarian","orig":"A fireproof tale","level":"B1","icon":"🐉","desc":"Bajo la ciudad, un dragón guarda libros que nadie lee… hasta hoy.","pages":[{"en":["Tom finds a bronze door at midnight.","It breathes warm air like soup."],"es":["Tom halla una puerta de bronce a medianoche.","Respira aire tibio como sopa."],"vocab":{"finds":"halla","door":"puerta","breathes":"respira","warm":"tibio","air":"aire"}},{"en":["Stairs spiral into golden dark.","A dragon snores among shelves."],"es":["Escalones bajan al dorado oscuro.","Un dragón ronca entre estantes."],"vocab":{"stairs":"escalones","snores":"ronca","shelves":"estantes"}},{"en":["Who dares? rumbles the beast.","One eye opens like a lamp."],"es":["¿Quién se atreve? retumba la bestia.","Un ojo se abre como lámpara."],"vocab":{"beast":"bestia","eye":"ojo","lamp":"lámpara"}},{"en":["I love books, Tom whispers.","The dragon laughs smoke rings."],"es":["Amo los libros, susurra Tom.","El dragón ríe anillos de humo."],"vocab":{"books":"libros","laughs":"ríe","smoke":"humo","rings":"anillos"}},{"en":["Then you are hired, boy.","Dust them with your dreams, he orders."],"es":["Quedas contratado, niño.","Empólvalos con tus sueños, ordena."],"vocab":{"hired":"contratado","dreams":"sueños","orders":"ordena"}},{"en":["Tom reads aloud every evening.","Dragons cry at sad endings."],"es":["Tom lee en voz alta cada noche.","Los dragones lloran con finales tristes."],"vocab":{"reads":"lee","evening":"noche","cry":"lloran","endings":"finales"}},{"en":["One book is chained and cold.","Never open the gray one, warns the dragon."],"es":["Un libro está encadenado y frío.","Nunca abras el gris, advierte el dragón."],"vocab":{"chained":"encadenado","cold":"frío","warns":"advierte"}},{"en":["Curiosity burns Tom's fingers.","He opens one forbidden page."],"es":["La curiosidad quema sus dedos.","Abre una página prohibida."],"vocab":{"burns":"quema","forbidden":"prohibida","page":"página"}},{"en":["The page eats the library's light.","Sorry! Tom shouts to the dark."],"es":["La página devora la luz.","¡Perdón! grita Tom a la oscuridad."],"vocab":{"eats":"devora","light":"luz","dark":"oscuridad"}},{"en":["The dragon breathes story-fire.","Light returns; Tom becomes the librarian."],"es":["El dragón sopla fuego de cuentos.","La luz vuelve; Tom se vuelve bibliotecario."],"vocab":{"returns":"vuelve","librarian":"bibliotecario"}}]},{"id":"firebird-feather","title":"The Firebird's Feather","orig":"A slavic tale","level":"B1","icon":"🔥","desc":"Iván roba una pluma ardiente y el bosque entero despierta.","pages":[{"en":["Ivan guards wheat at night.","A light brighter than dawn appears."],"es":["Iván cuida trigo de noche.","Una luz más brillante que el alba aparece."],"vocab":{"guards":"cuida","wheat":"trigo","light":"luz","dawn":"alba"}},{"en":["A firebird lands on the fence.","Her feathers sing like bells."],"es":["Un pájaro de fuego baja a la cerca.","Sus plumas cantan como campanas."],"vocab":{"lands":"baja","fence":"cerca","feathers":"plumas","bells":"campanas"}},{"en":["Ivan catches one fallen feather.","It burns cold in his hand."],"es":["Iván atrapa una pluma caída.","Quema fría en su mano."],"vocab":{"catches":"atrapa","fallen":"caída","burns":"quema","hand":"mano"}},{"en":["The forest wakes around him.","Wolves bow, owls salute."],"es":["El bosque despierta en torno.","Lobos se inclinan, búhos saludan."],"vocab":{"forest":"bosque","wolves":"lobos","owls":"búhos"}},{"en":["A gray wolf speaks slowly.","Thief of light, ride my back."],"es":["Un lobo gris habla despacio.","Ladrón de luz, monta mi lomo."],"vocab":{"speaks":"habla","thief":"ladrón","ride":"monta"}},{"en":["They fly over sleeping rivers.","The feather guides like a star."],"es":["Vuelan sobre ríos dormidos.","La pluma guía como estrella."],"vocab":{"rivers":"ríos","guides":"guía","star":"estrella"}},{"en":["The tsar demands the whole bird.","Bring it, or lose your head!"],"es":["El zar exige el ave entera.","¡Tráela o pierde tu cabeza!"],"vocab":{"demands":"exige","lose":"pierde","head":"cabeza"}},{"en":["Ivan frees the firebird instead.","Fly, sister of dawn, he cries."],"es":["Iván libera al ave en cambio.","Vuela, hermana del alba, llora."],"vocab":{"frees":"libera","instead":"en cambio","cries":"llora"}},{"en":["She gifts him dawn in a jar.","The tsar's gold turns to leaves."],"es":["Ella le regala alba en un frasco.","El oro del zar se vuelve hojas."],"vocab":{"gifts":"regala","gold":"oro","leaves":"hojas"}},{"en":["Ivan returns to his wheat.","Kindness outshines every feather."],"es":["Iván vuelve a su trigo.","La bondad brilla más que plumas."],"vocab":{"returns":"vuelve","kindness":"bondad"}}]},{"id":"goblin-market","title":"The Goblin Market","orig":"A cunning tale","level":"B2","icon":"👺","desc":"En el mercado goblin se paga con recuerdos: Lisa vende uno caro.","pages":[{"en":["Behind the laundry door, bells ring.","The goblin market opens at dusk."],"es":["Tras la puerta del lavadero, suenan campanas.","El mercado goblin abre al atardecer."],"vocab":{"behind":"tras","bells":"campanas","market":"mercado","dusk":"atardecer"}},{"en":["Stalls sell bottled thunder.","Second-hand shadows, half price."],"es":["Puestos venden trueno embotellado.","Sombras de segunda, mitad de precio."],"vocab":{"sell":"venden","shadows":"sombras","price":"precio"}},{"en":["No coins here, snarls a merchant.","We trade in memories, sweet ones cost more."],"es":["Aquí no hay monedas, gruñe un mercader.","Comerciamos recuerdos; los dulces cuestan más."],"vocab":{"trade":"comerciamos","memories":"recuerdos","sweet":"dulces","cost":"cuestan"}},{"en":["Lisa wants medicine for her brother.","Her purse holds three bright summers."],"es":["Lisa quiere medicina para su hermano.","Su bolsa guarda tres veranos brillantes."],"vocab":{"medicine":"medicina","brother":"hermano","summers":"veranos"}},{"en":["A goblin sniffs her happiest day.","Birthday cake, your grandmother singing. Sold?"],"es":["Un goblin huele su día más feliz.","Pastel, tu abuela cantando. ¿Vendido?"],"vocab":{"birthday":"cumpleaños","cake":"pastel","singing":"cantando"}},{"en":["Lisa hugs the memory tight.","This one is not for sale, she says."],"es":["Lisa abraza el recuerdo fuerte.","Este no está en venta, dice."],"vocab":{"hugs":"abraza","tight":"fuerte","sale":"venta","says":"dice"}},{"en":["Then she offers a rainy Monday.","Nobody wants gray hours, they laugh."],"es":["Ofrece un lunes lluvioso.","Nadie quiere horas grises, ríen."],"vocab":{"offers":"ofrece","rainy":"lluvioso","laugh":"ríen"}},{"en":["The smallest goblin weeps softly.","I collect sad days to feel less alone."],"es":["El goblin menor llora suave.","Colecciono días tristes para sentirme menos solo."],"vocab":{"collect":"colecciono","alone":"solo"}},{"en":["Lisa trades Monday for medicine.","Both smile; the bells approve."],"es":["Lisa cambia el lunes por medicina.","Ambos sonríen; las campanas aprueban."],"vocab":{"trades":"cambia","smile":"sonríen","approve":"aprueban"}},{"en":["She keeps her summers burning.","The richest purse holds no coins."],"es":["Guarda sus veranos ardiendo.","La bolsa más rica no lleva monedas."],"vocab":{"keeps":"guarda","richest":"más rica","coins":"monedas"}}]},{"id":"mirror-twins","title":"The Mirror Twins","orig":"A reflecting tale","level":"B2","icon":"🪞","desc":"Nia halla su gemela al otro lado del espejo… y sus mundos se mezclan.","pages":[{"en":["Nia brushes her hair at seven.","The mirror brushes back, late by one second."],"es":["Nia cepilla su pelo a las siete.","El espejo cepilla tarde, un segundo después."],"vocab":{"brushes":"cepilla","hair":"pelo","mirror":"espejo","second":"segundo"}},{"en":["Her reflection winks first.","I am Aina, she mouths silently."],"es":["Su reflejo guiña primero.","Soy Aina, articula en silencio."],"vocab":{"winks":"guiña","silently":"en silencio"}},{"en":["They trade names through glass.","Cold fingers meet warm ones."],"es":["Cambian nombres por el vidrio.","Dedos fríos tocan tibios."],"vocab":{"trade":"cambian","names":"nombres","glass":"vidrio","warm":"tibios"}},{"en":["Aina's world rains upward.","Umbrellas open toward the ground."],"es":["En el mundo de Aina llueve hacia arriba.","Paraguas se abren al suelo."],"vocab":{"rains":"llueve","upward":"hacia arriba","ground":"suelo"}},{"en":["Nia passes a paper boat.","It sails the mirror river slowly."],"es":["Nia pasa un barquito.","Navega lento el río espejo."],"vocab":{"boat":"barquito","sails":"navega","river":"río","slowly":"lento"}},{"en":["Aina returns a starfold letter.","Read it only at midnight, she warns."],"es":["Aina devuelve carta plegada estrella.","Léela solo a medianoche, advierte."],"vocab":{"letter":"carta","midnight":"medianoche","warns":"advierte"}},{"en":["The letter says: we are one.","Halves of a dropped moon, it explains."],"es":["La carta dice: somos una.","Mitades de luna caída, explica."],"vocab":{"halves":"mitades","moon":"luna","explains":"explica"}},{"en":["Both mirrors crack at dawn.","Which side is real? Neither knows."],"es":["Ambos espejos se agrietan al alba.","¿Qué lado es real? Ninguna sabe."],"vocab":{"crack":"se agrietan","dawn":"alba","real":"real"}},{"en":["They step through together.","Two girls, one shared shadow."],"es":["Cruzan juntas.","Dos niñas, una sombra compartida."],"vocab":{"together":"juntas","shared":"compartida","shadow":"sombra"}},{"en":["Now each mirrors the other.","Sisters across every glass."],"es":["Ahora cada una refleja a la otra.","Hermanas en cada vidrio."],"vocab":{"sisters":"hermanas","glass":"vidrio"}}]},{"id":"dream-weaver","title":"The Dreamweaver's Snapped Thread","orig":"A midnight tale","level":"C1","icon":"🌌","desc":"Cuando el hilo de los sueños se rompe, una tejedora debe hilar con recuerdos.","pages":[{"en":["Above the sleeping town, looms hum.","The weaver threads stars into children's sleep."],"es":["Sobre el pueblo dormido, zumban telares.","La tejedora hila estrellas en el sueño infantil."],"vocab":{"looms":"telares","threads":"hila","stars":"estrellas","sleep":"sueño"}},{"en":["Her silver thread snaps at three.","A thousand dreams unravel at once."],"es":["Su hilo de plata se rompe a las tres.","Mil sueños se deshilachan a la vez."],"vocab":{"snaps":"se rompe","unravel":"se deshilachan","once":"a la vez"}},{"en":["Nightmares leak through the cracks.","The town tosses in tangled sheets."],"es":["Pesadillas se filtran por grietas.","El pueblo se revuelve en sábanas enredadas."],"vocab":{"leak":"se filtran","cracks":"grietas","sheets":"sábanas"}},{"en":["The weaver descends, barefoot and furious.","Lend me your kindest memory, she begs each door."],"es":["La tejedora baja, descalza y furiosa.","Préstame tu recuerdo más amable, ruega puerta a puerta."],"vocab":{"barefoot":"descalza","furious":"furiosa","begs":"ruega"}},{"en":["A baker lends first-day snow.","A widow lends her wedding dance."],"es":["Un panadero presta la primera nieve.","Una viuda presta su baile de bodas."],"vocab":{"lends":"presta","snow":"nieve","wedding":"bodas","dance":"baile"}},{"en":["She spins them on a moonlit wheel.","Grief and gold twist into dawn-colored yarn."],"es":["Los hila en rueca de luna.","Pena y oro se tuercen en hilo color alba."],"vocab":{"spins":"hila","grief":"pena","gold":"oro","yarn":"hilo"}},{"en":["She reweaves the torn sky.","Each patch glows with borrowed joy."],"es":["Reteje el cielo rasgado.","Cada parche brilla con alegría prestada."],"vocab":{"sky":"cielo","glows":"brilla","joy":"alegría"}},{"en":["The town dreams in chorus.","A thousand borrowed mornings bloom."],"es":["El pueblo sueña en coro.","Mil mañanas prestadas florecen."],"vocab":{"dreams":"sueña","chorus":"coro","bloom":"florecen"}},{"en":["At dawn she returns every memory.","With interest: one nightmare, mended."],"es":["Al alba devuelve cada recuerdo.","Con interés: una pesadilla, remendada."],"vocab":{"returns":"devuelve","interest":"interés","mended":"remendada"}},{"en":["Her loom now weaves itself.","Kindness, she learns, needs no hands."],"es":["Su telar ahora teje solo.","La bondad, aprende, no necesita manos."],"vocab":{"loom":"telar","kindness":"bondad","hands":"manos"}}]}];
/* ═══════ 10 DIÁLOGOS (5 vida real + 5 oscuros · 30 intercambios A/B cada uno) ═══════
   A = personaje (lo actúa la app con su voz), B = YOU (lo lees tú con el mic).
   Formato compacto: ["A"|"B", en, es] */
const DIALOGS=[{"id":"barista","name":"Maya the Barista","icon":"☕","level":"A1","place":"Sunny Café · morning rush","desc":"Lunes con prisa, un pedido mal y una galleta gratis.","voice":{"gender":"f","pitch":1.2,"rate":1},"story":{"en":"It is Monday morning and the café is full of sleepy people. You only want one good coffee before work.","es":"Es lunes por la mañana y el café está lleno de gente con sueño. Solo quieres un buen café antes del trabajo."},"vocab":{"cup":"vaso / taza","oat":"avena","sugar":"azúcar","line":"fila","across":"enfrente","late":"tarde","wrong":"equivocado","mistake":"error","taste":"probar / sabor","cookie":"galleta","change":"cambio (dinero)"},"turns":[["A","Good morning! Welcome to Sunny Café.","¡Buenos días! Bienvenido a Sunny Café."],["B","Good morning! One coffee, please.","¡Buenos días! Un café, por favor."],["A","Hot or cold today?","¿Caliente o frío hoy?"],["B","Hot, please. I am very cold.","Caliente, por favor. Tengo mucho frío."],["A","Small, medium, or large?","¿Pequeño, mediano o grande?"],["B","Medium, please.","Mediano, por favor."],["A","With milk or black?","¿Con leche o negro?"],["B","With milk, please.","Con leche, por favor."],["A","Whole milk or oat milk?","¿Leche entera o de avena?"],["B","Oat milk, please.","De avena, por favor."],["A","Sugar? We have white and brown.","¿Azúcar? Tenemos blanca y morena."],["B","Brown sugar, one spoon.","Morena, una cucharada."],["A","Name for the cup?","¿Nombre para el vaso?"],["B","My name is Alex.","Me llamo Alex."],["A","Alex! It is very busy today.","¡Alex! Hoy hay mucha gente."],["B","Yes, the line is very long.","Sí, la fila es muy larga."],["A","Do you work near here?","¿Trabajas cerca de aquí?"],["B","Yes, in the office across the street.","Sí, en la oficina de enfrente."],["A","Are you late for work?","¿Llegas tarde al trabajo?"],["B","A little late, but it is okay.","Un poco tarde, pero está bien."],["A","Your coffee is ready, Sam?","¿Tu café está listo, Sam?"],["B","Sorry, my name is Alex, not Sam.","Perdón, me llamo Alex, no Sam."],["A","Oh no! Is this your cup?","¡Oh no! ¿Este es tu vaso?"],["B","No, that cup says Sam.","No, ese vaso dice Sam."],["A","Let me check the order again.","Déjame revisar el pedido."],["B","Medium oat milk, brown sugar.","Mediano con avena, azúcar morena."],["A","You are right, this is wrong.","Tienes razón, está mal."],["B","No problem, mistakes happen.","No importa, los errores pasan."],["A","I will make a new one fast.","Haré otro nuevo rápido."],["B","Thank you, you are very kind.","Gracias, eres muy amable."],["A","Do you want a cookie too?","¿Quieres una galleta también?"],["B","Yes, a chocolate cookie, please.","Sí, una de chocolate, por favor."],["A","The cookie is free today.","La galleta es gratis hoy."],["B","Really? That is great news!","¿En serio? ¡Qué buena noticia!"],["A","Here is your new coffee.","Aquí está tu café nuevo."],["B","It smells very good.","Huele muy bien."],["A","Taste it, is the milk correct?","Pruébalo, ¿la leche está bien?"],["B","Yes, perfect oat milk taste.","Sí, perfecto sabor a avena."],["A","And the sugar, is it good?","¿Y el azúcar, está bien?"],["B","Just right, thank you.","Justo, gracias."],["A","Sorry again for the mistake.","Perdón otra vez por el error."],["B","Do not worry, I am happy.","No te preocupes, estoy feliz."],["A","Do you come here every day?","¿Vienes aquí cada día?"],["B","Almost every morning, yes.","Casi cada mañana, sí."],["A","Then I will remember your name.","Entonces recordaré tu nombre."],["B","Alex, with oat milk!","¡Alex, con leche de avena!"],["A","Alex with oat milk, promise!","¡Alex con avena, lo prometo!"],["B","Haha, I will test you tomorrow.","Jaja, te pondré a prueba mañana."],["A","Please do! I like a challenge.","¡Hazlo! Me gustan los retos."],["B","Here is five dollars, keep the change.","Aquí tienes cinco dólares, quédate el cambio."],["A","Thank you! Have a nice day.","¡Gracias! Que tengas buen día."],["B","You too, see you tomorrow!","¡Tú también, nos vemos mañana!"],["A","Wait, your cookie! Do not forget.","¡Espera, tu galleta! No la olvides."],["B","Oh thank you, almost forgot!","¡Oh gracias, casi la olvido!"],["A","Enjoy your coffee and cookie.","Disfruta tu café y galleta."],["B","I will, goodbye Maya!","Lo haré, ¡adiós Maya!"],["A","Goodbye Alex, good luck at work!","¡Adiós Alex, suerte en el trabajo!"],["B","Thanks! The coffee is delicious.","¡Gracias! El café está delicioso."],["A","Come back soon, friend!","¡Vuelve pronto, amigo!"],["B","I will, every single morning!","¡Lo haré, cada mañana!"]]},{"id":"taxi","name":"Jimmy the Driver","icon":"🚕","level":"A1","place":"Downtown · rush hour","desc":"Tu vuelo sale en una hora y la avenida está bloqueada.","voice":{"gender":"m","pitch":0.7,"rate":0.95},"story":{"en":"Your flight leaves in one hour and the avenue is blocked. A friendly driver promises a secret shortcut.","es":"Tu vuelo sale en una hora y la avenida está bloqueada. Un conductor amable promete un atajo secreto."},"vocab":{"terminal":"terminal","bag":"maleta","heavy":"pesado/a","flight":"vuelo","nervous":"nervioso/a","traffic":"tráfico","shortcut":"atajo","afraid":"con miedo","near":"cerca","airline":"aerolínea","change":"cambio (dinero)","receipt":"recibo","safe":"seguro"},"turns":[["A","Hello! Where to, friend?","¡Hola! ¿A dónde, amigo?"],["B","To the airport, please.","Al aeropuerto, por favor."],["A","Terminal one or terminal two?","¿Terminal uno o terminal dos?"],["B","Terminal two, please.","Terminal dos, por favor."],["A","Big bag! Let me help you.","¡Gran maleta! Déjame ayudarte."],["B","Thank you, it is very heavy.","Gracias, es muy pesada."],["A","Are you traveling alone?","¿Viajas solo?"],["B","Yes, only for two days.","Sí, solo por dos días."],["A","Business or vacation?","¿Negocios o vacaciones?"],["B","Business, a short meeting.","Negocios, una reunión corta."],["A","What time is your flight?","¿A qué hora es tu vuelo?"],["B","At ten o'clock.","A las diez."],["A","Oh! It is nine already.","¡Oh! Ya son las nueve."],["B","Yes, I am a little nervous.","Sí, estoy un poco nervioso."],["A","Do not worry, I am fast.","No te preocupes, soy rápido."],["B","But the traffic is terrible!","¡Pero el tráfico es terrible!"],["A","Look at all these cars.","Mira todos estos coches."],["B","Will we arrive on time?","¿Llegaremos a tiempo?"],["A","I know a secret shortcut.","Conozco un atajo secreto."],["B","Really? Please take it!","¿En serio? ¡Tómalo por favor!"],["A","Hold on, here we go!","¡Agárrate, allá vamos!"],["B","Wow, this street is empty.","Guau, esta calle está vacía."],["A","I drive this way every day.","Manejo por aquí cada día."],["B","You are a very good driver.","Eres un muy buen conductor."],["A","How long is your flight?","¿Cuánto dura tu vuelo?"],["B","About three hours.","Unas tres horas."],["A","Do you like to fly?","¿Te gusta volar?"],["B","Yes, I love the window seat.","Sí, me encanta el asiento de ventana."],["A","I am afraid of planes.","Me dan miedo los aviones."],["B","Really? But you drive fast!","¿En serio? ¡Pero manejas rápido!"],["A","Cars I control, planes I do not.","Los coches los controlo, los aviones no."],["B","Haha, that is very true.","Jaja, eso es muy cierto."],["A","Look, the airport is near.","Mira, el aeropuerto está cerca."],["B","Great! I see terminal two.","¡Genial! Veo la terminal dos."],["A","Which airline are you flying?","¿Con qué aerolínea vuelas?"],["B","Blue Sky Airlines.","Blue Sky Airlines."],["A","Terminal two, door three.","Terminal dos, puerta tres."],["B","Perfect, you know everything.","Perfecto, lo sabes todo."],["A","Here we are, safe and fast.","Aquí estamos, sanos y rápidos."],["B","Amazing! How much is it?","¡Increíble! ¿Cuánto es?"],["A","Twenty dollars, please.","Veinte dólares, por favor."],["B","Here is twenty-five, keep the change.","Aquí hay veinticinco, quédate el cambio."],["A","Thank you, very generous!","¡Gracias, muy generoso!"],["B","You saved my flight today.","Salvaste mi vuelo hoy."],["A","Can I get your bag?","¿Tomo tu maleta?"],["B","Yes please, it is heavy.","Sí por favor, es pesada."],["A","Careful with the wheels.","Cuidado con las ruedas."],["B","Got it, thank you so much.","La tengo, muchas gracias."],["A","Do you need a receipt?","¿Necesitas recibo?"],["B","Yes, for my company, please.","Sí, para mi empresa, por favor."],["A","Here is your receipt.","Aquí está tu recibo."],["B","Perfect, thank you.","Perfecto, gracias."],["A","Good luck in your meeting!","¡Suerte en tu reunión!"],["B","Thanks! Drive safely back.","¡Gracias! Maneja con cuidado."],["A","Always! Goodbye, friend.","¡Siempre! Adiós, amigo."],["B","Goodbye, and thank you!","¡Adiós, y gracias!"],["A","Fly safe up there!","¡Vuela seguro allá arriba!"],["B","I will! See you next time.","¡Lo haré! Nos vemos."],["A","Next time, ask for Jimmy!","¡La próxima, pregunta por Jimmy!"],["B","I will ask for Jimmy!","¡Preguntaré por Jimmy!"]]},{"id":"doctor","name":"Dr. Elena","icon":"🩺","level":"A2","place":"City Clinic · checkup","desc":"Te duermes cada tarde. La doctora hallará al culpable.","voice":{"gender":"f","pitch":0.9,"rate":0.9},"story":{"en":"You fall asleep at your desk every afternoon. The doctor will find the guilty suspect: your phone.","es":"Te duermes en tu escritorio cada tarde. La doctora encontrará al culpable: tu teléfono."},"vocab":{"tired":"cansado/a","throat":"garganta","headache":"dolor de cabeza","screen":"pantalla","rule":"regla","trick":"truco","midnight":"medianoche","milk":"leche","exercise":"ejercicio","heart":"corazón","notebook":"cuaderno","sleep":"dormir / sueño"},"turns":[["A","Good morning, what brings you here?","Buenos días, ¿qué te trae por aquí?"],["B","I feel tired every day, doctor.","Me siento cansado cada día, doctora."],["A","How many hours do you sleep?","¿Cuántas horas duermes?"],["B","Only four or five hours.","Solo cuatro o cinco horas."],["A","That is very little sleep.","Eso es muy poco sueño."],["B","I know, but I cannot sleep.","Lo sé, pero no puedo dormir."],["A","What do you do at night?","¿Qué haces de noche?"],["B","I watch videos on my phone.","Veo videos en mi teléfono."],["A","Until what time, honestly?","¿Hasta qué hora, honestamente?"],["B","Until two in the morning.","Hasta las dos de la mañana."],["A","No wonder you are tired!","¡Con razón estás cansado!"],["B","The videos are so interesting.","Los videos son tan interesantes."],["A","Your eyes look very red.","Tus ojos se ven muy rojos."],["B","Yes, they hurt a little.","Sí, me duelen un poco."],["A","Let me check your throat.","Déjame revisar tu garganta."],["B","Okay, say ahh... ahhh.","Bien, di ahh... ahhh."],["A","Your throat is fine, good.","Tu garganta está bien, bueno."],["B","And my head hurts sometimes.","Y a veces me duele la cabeza."],["A","Where exactly does it hurt?","¿Dónde exactamente duele?"],["B","Here, behind my eyes.","Aquí, detrás de mis ojos."],["A","That is classic screen headache.","Eso es clásico dolor de pantalla."],["B","Screen headache? Really?","¿Dolor de pantalla? ¿En serio?"],["A","Yes, too much phone at night.","Sí, mucho teléfono de noche."],["B","What should I do, doctor?","¿Qué debo hacer, doctora?"],["A","First rule: no phone in bed.","Primera regla: nada de teléfono en la cama."],["B","No phone in bed? Difficult!","¿Nada de teléfono? ¡Difícil!"],["A","Charge it in the kitchen.","Cárgalo en la cocina."],["B","Hmm, that is a smart trick.","Hmm, ese es un truco listo."],["A","Second: sleep before midnight.","Segundo: duerme antes de la medianoche."],["B","Before midnight, I promise to try.","Antes de la medianoche, prometo intentarlo."],["A","Third: read a paper book.","Tercero: lee un libro de papel."],["B","I have a book about the sea.","Tengo un libro sobre el mar."],["A","Perfect, read ten pages nightly.","Perfecto, lee diez páginas cada noche."],["B","Ten pages, then sleep?","¿Diez páginas, y luego dormir?"],["A","Exactly. And warm milk helps.","Exacto. Y la leche tibia ayuda."],["B","My grandmother says the same!","¡Mi abuela dice lo mismo!"],["A","Grandmothers are always right.","Las abuelas siempre tienen razón."],["B","Haha, she will love to hear that.","Jaja, le encantará oír eso."],["A","Any coffee after six?","¿Café después de las seis?"],["B","Two cups... in the evening.","Dos tazas... en la noche."],["A","That must stop, only mornings.","Eso debe parar, solo mañanas."],["B","Only mornings, understood.","Solo mañanas, entendido."],["A","Do you exercise sometimes?","¿Haces ejercicio a veces?"],["B","I walk to work daily.","Camino al trabajo a diario."],["A","Excellent, keep walking.","Excelente, sigue caminando."],["B","Thirty minutes every day.","Treinta minutos cada día."],["A","Let me check your heart.","Déjame revisar tu corazón."],["B","Is everything okay?","¿Está todo bien?"],["A","Your heart sounds strong.","Tu corazón suena fuerte."],["B","That is good news!","¡Esa es buena noticia!"],["A","Come back in one month.","Vuelve en un mes."],["B","In one month, with better sleep.","En un mes, con mejor sueño."],["A","Write your sleep hours daily.","Escribe tus horas de sueño a diario."],["B","I will bring my notebook.","Traeré mi cuaderno."],["A","Any questions for me?","¿Alguna pregunta?"],["B","Is chocolate bad for sleep?","¿El chocolate es malo para dormir?"],["A","Dark chocolate in the morning only.","Chocolate oscuro solo en la mañana."],["B","Morning chocolate, noted!","¡Chocolate matutino, anotado!"],["A","Take care, and sleep well!","¡Cuídate, y duerme bien!"],["B","Thank you, doctor, goodbye!","¡Gracias, doctora, adiós!"]]},{"id":"interview","name":"Mr. Grant","icon":"💼","level":"B1","place":"Green Studio · job interview","desc":"La entrevista soñada, con pregunta trampa incluida.","voice":{"gender":"m","pitch":1,"rate":1},"story":{"en":"Your dream job interview. Thirty questions between you and the contract, including one trick question.","es":"La entrevista de tus sueños. Treinta preguntas entre tú y el contrato, incluida una pregunta trampa."},"vocab":{"interview":"entrevista","hire":"contratar","salary":"salario","deadline":"fecha límite","criticism":"crítica","strength":"fortaleza","weakness":"debilidad","expect":"esperar (sueldo)","offer":"ofrecer","remote":"remoto","sharp":"en punto","aboard":"a bordo"},"turns":[["A","Good morning, please sit down.","Buenos días, siéntate por favor."],["B","Good morning, thank you.","Buenos días, gracias."],["A","Did you find us easily?","¿Nos encontraste fácil?"],["B","Yes, the map was very clear.","Sí, el mapa era muy claro."],["A","Tell me about yourself.","Cuéntame sobre ti."],["B","I am a designer with five years experience.","Soy diseñador con cinco años de experiencia."],["A","Why do you want this job?","¿Por qué quieres este trabajo?"],["B","I love your eco products.","Me encantan sus productos ecológicos."],["A","What does eco mean to you?","¿Qué significa eco para ti?"],["B","Respect for nature in every design.","Respeto por la naturaleza en cada diseño."],["A","Describe a difficult project.","Describe un proyecto difícil."],["B","A bookshop site with one month deadline.","Un sitio de librería con un mes de plazo."],["A","How did you manage the time?","¿Cómo manejaste el tiempo?"],["B","I split it in weekly goals.","Lo dividí en metas semanales."],["A","Did the client like it?","¿Le gustó al cliente?"],["B","They loved it and sales grew.","Les encantó y las ventas crecieron."],["A","How do you handle criticism?","¿Cómo manejas la crítica?"],["B","I listen first, then I improve.","Escucho primero, luego mejoro."],["A","Give me a real example.","Dame un ejemplo real."],["B","A client hated blue, we found green together.","Un cliente odiaba el azul, hallamos el verde juntos."],["A","Do you prefer team or solo?","¿Prefieres equipo o solo?"],["B","Team for ideas, solo for focus.","Equipo para ideas, solo para concentrarme."],["A","What is your greatest strength?","¿Cuál es tu mayor fortaleza?"],["B","I explain complex things simply.","Explico cosas complejas de forma simple."],["A","And your greatest weakness?","¿Y tu mayor debilidad?"],["B","I check details three times, too slow sometimes.","Reviso detalles tres veces, a veces muy lento."],["A","Honest answer, I like that.","Respuesta honesta, me gusta."],["B","Thank you, I practice honesty daily.","Gracias, practico la honestidad a diario."],["A","Where do you see yourself in five years?","¿Dónde te ves en cinco años?"],["B","Leading small green projects here.","Liderando pequeños proyectos verdes aquí."],["A","Why should we hire you?","¿Por qué debemos contratarte?"],["B","Because I care about the mission.","Porque me importa la misión."],["A","What salary do you expect?","¿Qué salario esperas?"],["B","Around two thousand monthly.","Alrededor de dos mil mensuales."],["A","We offer eighteen hundred plus bonus.","Ofrecemos mil ochocientos más bono."],["B","That sounds fair to me.","Me parece justo."],["A","When can you start?","¿Cuándo puedes empezar?"],["B","In two weeks, after my old job.","En dos semanas, tras mi antiguo trabajo."],["A","Do you have questions for us?","¿Tienes preguntas para nosotros?"],["B","Yes, is remote work possible?","Sí, ¿el trabajo remoto es posible?"],["A","Two days remote per week.","Dos días remotos por semana."],["B","Perfect balance for me.","Equilibrio perfecto para mí."],["A","Who is your hero designer?","¿Quién es tu diseñador héroe?"],["B","My grandmother, queen of colors.","Mi abuela, reina de los colores."],["A","Unexpected! Tell me more.","¡Inesperado! Cuéntame más."],["B","She painted our whole house herself.","Ella pintó toda nuestra casa sola."],["A","Creativity runs in the family.","La creatividad corre en la familia."],["B","Yes, I learned from the best.","Sí, aprendí de la mejor."],["A","One last test: sell me this pen.","Última prueba: véndeme este bolígrafo."],["B","This pen plants a tree per box.","Este bolígrafo planta un árbol por caja."],["A","Clever! Trees and pens.","¡Listo! Árboles y bolígrafos."],["B","Green marketing is my passion.","El marketing verde es mi pasión."],["A","We will call you on Friday.","Te llamaremos el viernes."],["B","I will wait for your call.","Esperaré tu llamada."],["A","Actually... welcome aboard!","¡De hecho... bienvenido a bordo!"],["B","Really? Thank you so much!","¿En serio? ¡Muchas gracias!"],["A","Contracts on Monday, nine sharp.","Contratos el lunes, nueve en punto."],["B","Monday nine sharp, I will be there.","Lunes nueve en punto, ahí estaré."],["A","See you Monday, partner.","Nos vemos el lunes, socio."],["B","See you Monday, and thanks again!","¡Nos vemos el lunes, y gracias de nuevo!"]]},{"id":"airport","name":"Agent Ruiz","icon":"✈️","level":"B1","place":"Connections desk · night","desc":"Perdiste la conexión. Una agente, una boda mañana.","voice":{"gender":"f","pitch":1.1,"rate":1},"story":{"en":"A delay in Madrid made you miss your connection. One agent, one wedding tomorrow, zero margin.","es":"Un retraso en Madrid te hizo perder la conexión. Una agente, una boda mañana, cero margen."},"vocab":{"missed":"perdido/a","connection":"conexión","ticket":"boleto","delay":"retraso","proof":"comprobante","destination":"destino","wedding":"boda","via":"vía","passport":"pasaporte","boarding":"abordaje","voucher":"vale","shuttle":"bus lanzadera","gate":"puerta (embarque)"},"turns":[["A","Hello, how can I help you?","Hola, ¿cómo puedo ayudarte?"],["B","I missed my connection flight.","Perdí mi vuelo de conexión."],["A","Oh no! May I see your ticket?","¡Oh no! ¿Puedo ver tu boleto?"],["B","Here it is, flight 204.","Aquí está, vuelo 204."],["A","Flight 204 left twenty minutes ago.","El vuelo 204 salió hace veinte minutos."],["B","My first flight was delayed.","Mi primer vuelo se retrasó."],["A","Do you have the delay proof?","¿Tienes el comprobante del retraso?"],["B","Yes, this paper from Madrid.","Sí, este papel de Madrid."],["A","Perfect, this changes everything.","Perfecto, esto lo cambia todo."],["B","Does it? Good news, I hope.","¿Sí? Buenas noticias, espero."],["A","The airline must rebook you free.","La aerolínea debe reprogramarte gratis."],["B","Free? That would be amazing.","¿Gratis? Sería increíble."],["A","Where is your final destination?","¿Cuál es tu destino final?"],["B","Lisbon, for my sister's wedding.","Lisboa, para la boda de mi hermana."],["A","A wedding! When is it?","¡Una boda! ¿Cuándo es?"],["B","Tomorrow at noon, I am nervous.","Mañana al mediodía, estoy nervioso."],["A","Do not worry, we have options.","No te preocupes, tenemos opciones."],["B","Thank you, I feel better already.","Gracias, ya me siento mejor."],["A","Option one: tonight via London.","Opción uno: esta noche vía Londres."],["B","What time does it arrive?","¿A qué hora llega?"],["A","Eleven at night, hotel included.","Once de la noche, hotel incluido."],["B","Hotel included? Nice!","¿Hotel incluido? ¡Bien!"],["A","Option two: direct, six morning.","Opción dos: directo, seis de la mañana."],["B","That arrives at eight, too risky.","Eso llega a las ocho, muy arriesgado."],["A","I agree, take option one.","Estoy de acuerdo, toma la opción uno."],["B","Yes, London tonight, please.","Sí, Londres esta noche, por favor."],["A","Passport, please.","Pasaporte, por favor."],["B","Here is my passport.","Aquí está mi pasaporte."],["A","New boarding pass, hot off the press.","Nuevo pase de abordar, recién impreso."],["B","Seat 14A, window! Perfect.","Asiento 14A, ¡ventana! Perfecto."],["A","Your bag goes straight to Lisbon.","Tu maleta va directo a Lisboa."],["B","So I travel light tonight?","¿Así que viajo ligero esta noche?"],["A","Exactly, only your small backpack.","Exacto, solo tu mochila pequeña."],["B","Great, less to carry.","Genial, menos que cargar."],["A","Hotel voucher for the Airport Hotel.","Vale de hotel para el Airport Hotel."],["B","Dinner included too?","¿Cena incluida también?"],["A","Dinner and breakfast, both included.","Cena y desayuno, ambos incluidos."],["B","This delay turned into a gift!","¡Este retraso se volvió un regalo!"],["A","Shuttle leaves every fifteen minutes.","El bus sale cada quince minutos."],["B","Where do I catch it?","¿Dónde lo tomo?"],["A","Door five, blue sign.","Puerta cinco, señal azul."],["B","Door five, blue sign, noted.","Puerta cinco, señal azul, anotado."],["A","Your London flight boards at nine.","Tu vuelo a Londres aborda a las nueve."],["B","At which gate, please?","¿En qué puerta, por favor?"],["A","Gate B12, second floor.","Puerta B12, segundo piso."],["B","B12, second floor.","B12, segundo piso."],["A","Security line is short now.","La fila de seguridad está corta ahora."],["B","I will go right away.","Iré enseguida."],["A","Keep this paper for Lisbon.","Guarda este papel para Lisboa."],["B","The wedding rescue paper!","¡El papel del rescate de la boda!"],["A","Haha, exactly! Enjoy the wedding.","¡Jaja, exacto! Disfruta la boda."],["B","I will dance one song for you.","Bailaré una canción por ti."],["A","Deal! Eat cake for me too.","¡Trato! Come pastel por mí también."],["B","Two cakes, promise!","¡Dos pasteles, lo prometo!"],["A","Anything else I can do?","¿Algo más que pueda hacer?"],["B","You saved my trip, thank you.","Salvaste mi viaje, gracias."],["A","It is my job and my pleasure.","Es mi trabajo y mi placer."],["B","You are the best agent ever.","Eres la mejor agente del mundo."],["A","Safe skies, see you in Lisbon!","¡Cielos seguros, nos vemos en Lisboa!"],["B","See you! And thanks again!","¡Nos vemos! ¡Y gracias de nuevo!"]]},{"id":"count","name":"The Count","icon":"🧛","level":"A2","place":"Castle hall · midnight","desc":"La puerta se abre antes de tocar. El Conde esperaba.","voice":{"gender":"m","pitch":0.5,"rate":0.85},"story":{"en":"The castle door opens before you knock. The Count has been waiting — for you, or for someone like you.","es":"La puerta del castillo se abre antes de tocar. El Conde ha estado esperando, a ti o a alguien como tú."},"vocab":{"traveler":"viajero/a","wolves":"lobos","fire":"fuego","road":"camino","soup":"sopa","wine":"vino","mirror":"espejo","afraid":"asustado","dawn":"amanecer","door":"puerta","weather":"clima","remember":"recordar"},"turns":[["A","Welcome to my castle, traveler.","Bienvenido a mi castillo, viajero."],["B","Thank you, Count. It is very big.","Gracias, Conde. Es muy grande."],["A","You walked far through the wolves.","Caminaste lejos entre los lobos."],["B","Yes, I heard them cry.","Sí, los oí aullar."],["A","The wolves are my friends.","Los lobos son mis amigos."],["B","Your... friends? Interesting.","¿Tus... amigos? Interesante."],["A","Come in, the night is cold.","Entra, la noche es fría."],["B","Thank you, the fire looks warm.","Gracias, el fuego se ve cálido."],["A","Sit here, near the fire.","Siéntate aquí, cerca del fuego."],["B","This chair is very old.","Esta silla es muy vieja."],["A","Everything here is very old.","Todo aquí es muy viejo."],["B","How old is the castle?","¿Qué tan viejo es el castillo?"],["A","Older than your grandfather's dreams.","Más viejo que los sueños de tu abuelo."],["B","Wow, that is really old.","Guau, eso es realmente viejo."],["A","Are you hungry from the road?","¿Tienes hambre del camino?"],["B","A little hungry, yes.","Un poco de hambre, sí."],["A","We have bread and hot soup.","Tenemos pan y sopa caliente."],["B","Soup sounds perfect now.","La sopa suena perfecta ahora."],["A","Eat slowly, enjoy it.","Come despacio, disfrútala."],["B","The soup is delicious, thanks.","La sopa está deliciosa, gracias."],["A","Do you like red wine?","¿Te gusta el vino tinto?"],["B","No wine for me, water please.","Nada de vino para mí, agua por favor."],["A","Water... of course, traveler.","Agua... por supuesto, viajero."],["B","Why do you look at me so?","¿Por qué me miras así?"],["A","You remind me of an old friend.","Me recuerdas a un viejo amigo."],["B","An old friend? From where?","¿Un viejo amigo? ¿De dónde?"],["A","From a land far away.","De una tierra lejana."],["B","I love stories about far lands.","Me encantan las historias de tierras lejanas."],["A","Stories are hungry things too.","Las historias también son hambrientas."],["B","Hungry? What do you mean?","¿Hambrientas? ¿Qué quieres decir?"],["A","Look at the mirror... nothing?","Mira el espejo... ¿nada?"],["B","I see me, but not you!","¡Me veo a mí, pero no a ti!"],["A","Mirrors do not love me.","Los espejos no me aman."],["B","That is strange and scary.","Eso es extraño y da miedo."],["A","Do not be afraid of me.","No tengas miedo de mí."],["B","I want to leave at dawn.","Quiero irme al amanecer."],["A","The door sleeps until sunrise.","La puerta duerme hasta el amanecer."],["B","Then I will wait for the sun.","Entonces esperaré al sol."],["A","The sun is a jealous friend.","El sol es un amigo celoso."],["B","But it is my best friend.","Pero es mi mejor amigo."],["A","Sleep now, the room is ready.","Duerme ahora, el cuarto está listo."],["B","Will you sleep too, Count?","¿Dormirás tú también, Conde?"],["A","I never sleep, I watch.","Nunca duermo, vigilo."],["B","Watch? That sounds cold.","¿Vigilas? Eso suena frío."],["A","Cold is my natural weather.","El frío es mi clima natural."],["B","I prefer warm mornings.","Prefiero las mañanas cálidas."],["A","Morning will come, always.","La mañana llegará, siempre."],["B","Then I will say goodbye.","Entonces me despediré."],["A","Travelers always say goodbye.","Los viajeros siempre se despiden."],["B","But I will remember this night.","Pero recordaré esta noche."],["A","Remember the soup, not the fear.","Recuerda la sopa, no el miedo."],["B","The soup was really good.","La sopa estaba realmente buena."],["A","Listen... the birds sing already.","Escucha... los pájaros ya cantan."],["B","Dawn! The sky is gray.","¡Amanecer! El cielo está gris."],["A","The door wakes with the light.","La puerta despierta con la luz."],["B","I see the village below!","¡Veo la aldea abajo!"],["A","Go quickly, and do not return.","Ve rápido, y no regreses."],["B","Thank you... and goodbye, Count.","Gracias... y adiós, Conde."],["A","Goodbye, traveler. The night remembers you.","Adiós, viajero. La noche te recuerda."],["B","And I will remember the night!","¡Y yo recordaré la noche!"]]},{"id":"detective","name":"Detective Stone","icon":"🔍","level":"B1","place":"Police station · night","desc":"Un collar de cien años y tú, el único testigo.","voice":{"gender":"m","pitch":0.8,"rate":0.95},"story":{"en":"A necklace a hundred years old, a woman in a red coat, and you — the only witness. The detective needs every detail.","es":"Un collar de cien años, una mujer de abrigo rojo, y tú, el único testigo. El detective necesita cada detalle."},"vocab":{"witness":"testigo","exactly":"exactamente","coat":"abrigo","shouted":"gritó","grabbed":"agarró","necklace":"collar","priceless":"invaluable","plates":"placas","notebook":"cuaderno","bridge":"puente","bakery":"panadería","case":"caso"},"turns":[["A","Sit down. Name, please?","Siéntate. ¿Nombre, por favor?"],["B","Alex Rivera, officer.","Alex Rivera, oficial."],["A","Detective, not officer. When did you see her?","Detective, no oficial. ¿Cuándo la viste?"],["B","Yesterday, at eight in the evening.","Ayer, a las ocho de la noche."],["A","Where exactly were you?","¿Dónde exactamente estabas?"],["B","At the Green Park café.","En el café Green Park."],["A","Alone or with someone?","¿Solo o con alguien?"],["B","Alone, reading a book.","Solo, leyendo un libro."],["A","What did the woman look like?","¿Cómo se veía la mujer?"],["B","Tall, red coat, black hat.","Alta, abrigo rojo, sombrero negro."],["A","Did you see her face?","¿Viste su cara?"],["B","Only for one second.","Solo por un segundo."],["A","What was she doing?","¿Qué estaba haciendo?"],["B","She was running fast.","Estaba corriendo rápido."],["A","Running from what?","¿Huyendo de qué?"],["B","A man in gray followed her.","Un hombre de gris la seguía."],["A","Describe the man.","Describe al hombre."],["B","Short, gray coat, silver hair.","Bajo, abrigo gris, cabello plateado."],["A","Did they speak?","¿Hablaron?"],["B","She shouted: leave me alone!","Ella gritó: ¡déjame en paz!"],["A","Exact words, good. Then?","Palabras exactas, bien. ¿Luego?"],["B","He grabbed her bag.","Él agarró su bolso."],["A","The red bag with the necklace?","¿El bolso rojo con el collar?"],["B","Yes! How do you know?","¡Sí! ¿Cómo lo sabes?"],["A","The necklace is why I am here.","El collar es por lo que estoy aquí."],["B","Is it very valuable?","¿Es muy valioso?"],["A","A hundred years old, priceless.","Cien años, invaluable."],["B","Wow, a real treasure.","Guau, un verdadero tesoro."],["A","Did you call the police?","¿Llamaste a la policía?"],["B","Yes, immediately, twice.","Sí, de inmediato, dos veces."],["A","Brave. Did he see you?","Valiente. ¿Él te vio?"],["B","I think so, I hid fast.","Creo que sí, me escondí rápido."],["A","Smart move. What then?","Movimiento listo. ¿Luego?"],["B","A blue car took them away.","Un coche azul se los llevó."],["A","Plates? Even partial?","¿Placas? ¿Aunque sea parcial?"],["B","It started with seven... 7KL.","Empezaba con siete... 7KL."],["A","7KL, excellent memory.","7KL, excelente memoria."],["B","I write everything in my notebook.","Escribo todo en mi cuaderno."],["A","A witness with notes, perfect.","Un testigo con notas, perfecto."],["B","Page five, yesterday's date.","Página cinco, fecha de ayer."],["A","Read it to me, slowly.","Léemelo, despacio."],["B","Eight pm, red coat runs north.","Ocho pm, abrigo rojo corre al norte."],["A","North toward the bridge?","¿Al norte hacia el puente?"],["B","Yes, toward the old bridge.","Sí, hacia el puente viejo."],["A","Did the car cross it?","¿El coche lo cruzó?"],["B","No, it turned left before.","No, giró a la izquierda antes."],["A","Left into Mill Street?","¿Izquierda hacia Mill Street?"],["B","Exactly, Mill Street, dark street.","Exacto, Mill Street, calle oscura."],["A","Any cameras there?","¿Hay cámaras ahí?"],["B","One, above the bakery.","Una, sobre la panadería."],["A","The bakery camera! Brilliant.","¡La cámara de la panadería! Brillante."],["B","I buy bread there daily.","Compro pan ahí a diario."],["A","You just solved half the case.","Acabas de resolver medio caso."],["B","Really? I only watched.","¿En serio? Solo miré."],["A","Watching carefully is everything.","Mirar con cuidado lo es todo."],["B","Will you catch them tonight?","¿Los atraparás esta noche?"],["A","Tonight, with your notes.","Esta noche, con tus notas."],["B","Take my notebook, good luck!","Toma mi cuaderno, ¡suerte!"],["A","The city thanks you, witness.","La ciudad te agradece, testigo."],["B","Just doing my part, detective.","Solo cumplo mi parte, detective."]]},{"id":"ghost","name":"The Lady","icon":"🕯️","level":"B2","place":"Thornfield · midnight","desc":"Una dama muerta hace cien años necesita una mano viva.","voice":{"gender":"f","pitch":1.3,"rate":0.8},"story":{"en":"Midnight in Thornfield. A lady who died a hundred years ago needs one living hand to deliver her last letter.","es":"Medianoche en Thornfield. Una dama muerta hace cien años necesita una mano viva para entregar su última carta."},"vocab":{"corridor":"pasillo","midnight":"medianoche","guest":"invitado/a","chance":"casualidad","portrait":"retrato","attic":"ático","vase":"jarrón","carry":"llevar","sailor":"marinero","forgive":"perdonar","mill":"molino","candle":"vela","bell":"campana","farewell":"adiós"},"turns":[["A","Who walks my corridor at midnight?","¿Quién camina mi pasillo a medianoche?"],["B","Only me... I lost my way.","Solo yo... perdí mi camino."],["A","No guest wanders here by chance.","Ningún invitado vaga aquí por casualidad."],["B","Are you... the lady of the portrait?","¿Eres... la dama del retrato?"],["A","I was, a hundred years ago.","Lo fui, hace cien años."],["B","A hundred years! Impossible.","¡Cien años! Imposible."],["A","Time is thin in this house.","El tiempo es delgado en esta casa."],["B","The air feels cold around you.","El aire se siente frío junto a ti."],["A","Cold is all I have left.","El frío es todo lo que me queda."],["B","Why do you stay here?","¿Por qué te quedas aquí?"],["A","A letter never reached my sister.","Una carta nunca llegó a mi hermana."],["B","A letter? After so long?","¿Una carta? ¿Tras tanto tiempo?"],["A","Love does not count the years.","El amor no cuenta los años."],["B","Where is the letter now?","¿Dónde está la carta ahora?"],["A","Behind the third attic stone.","Tras la tercera piedra del ático."],["B","The attic? It is locked.","¿El ático? Está cerrado."],["A","The key sleeps under the blue vase.","La llave duerme bajo el jarrón azul."],["B","Under the blue vase, noted.","Bajo el jarrón azul, anotado."],["A","Promise you will carry it.","Promete que la llevarás."],["B","I promise, on my honor.","Lo prometo, por mi honor."],["A","Then listen to my story first.","Entonces escucha mi historia primero."],["B","I am listening, go on.","Estoy escuchando, continúa."],["A","I married a sailor with green eyes.","Me casé con un marinero de ojos verdes."],["B","A sailor? Like the songs.","¿Un marinero? Como las canciones."],["A","He sailed north and never returned.","Navegó al norte y nunca regresó."],["B","Never? That is heartbreaking.","¿Nunca? Eso rompe el corazón."],["A","I wrote every night for a year.","Escribí cada noche por un año."],["B","A whole year of letters...","Un año entero de cartas..."],["A","Only this last one matters.","Solo esta última importa."],["B","What does it say?","¿Qué dice?"],["A","That I forgive the sea.","Que perdono al mar."],["B","Forgive the sea... beautiful.","Perdonar al mar... hermoso."],["A","Will you read it at dawn?","¿La leerás al amanecer?"],["B","At dawn, by the window.","Al amanecer, junto a la ventana."],["A","My sister lives past the mill.","Mi hermana vive pasando el molino."],["B","Past the mill, the white house?","¿Pasando el molino, la casa blanca?"],["A","White door, roses, a black cat.","Puerta blanca, rosas, un gato negro."],["B","I know that house well.","Conozco bien esa casa."],["A","Give her the letter yourself.","Dale la carta tú mismo."],["B","Myself, I understand.","Yo mismo, entiendo."],["A","Do not let the master see.","No dejes que el amo vea."],["B","The master? Mr Rochester?","¿El amo? ¿El Sr. Rochester?"],["A","He fears what he cannot burn.","Él teme lo que no puede quemar."],["B","Burn? Like the old wing?","¿Quemar? ¿Como el ala vieja?"],["A","Fire forgets nothing, child.","El fuego no olvida nada, niño."],["B","I will be very careful.","Seré muy cuidadoso."],["A","Take this candle against the dark.","Toma esta vela contra la oscuridad."],["B","It burns blue... strange.","Arde azul... extraño."],["A","Blue for truth, gold for lies.","Azul por la verdad, oro por mentiras."],["B","Then I carry the truth.","Entonces llevo la verdad."],["A","When the bell rings twelve...","Cuando la campana dé las doce..."],["B","Twelve already? So fast.","¿Las doce ya? Tan rápido."],["A","My time thins with the hour.","Mi tiempo se adelgaza con la hora."],["B","Do not go yet, please.","No te vayas aún, por favor."],["A","Remember: the third stone.","Recuerda: la tercera piedra."],["B","Third stone, blue vase, white door.","Tercera piedra, jarrón azul, puerta blanca."],["A","You have a faithful heart.","Tienes un corazón fiel."],["B","And you have my promise.","Y tú tienes mi promesa."],["A","Then I can finally sleep. Farewell.","Entonces por fin puedo dormir. Adiós."],["B","Sleep well, lady. Farewell.","Duerme bien, dama. Adiós."]]},{"id":"captain","name":"Captain Ahab","icon":"🌊","level":"B2","place":"The Pequod · dawn","desc":"Marea subiendo, un arpón y un juramento te esperan.","voice":{"gender":"m","pitch":0.6,"rate":0.9},"story":{"en":"Dawn, tide rising, a one-legged captain pointing at the horizon. He offers you a harpoon and an oath.","es":"Amanecer, marea subiendo, un capitán de una pierna señalando el horizonte. Te ofrece un arpón y un juramento."},"vocab":{"aboard":"a bordo","deck":"cubierta","rope":"cuerda","tight":"apretado","oath":"juramento","tide":"marea","harpoon":"arpón","heavy":"pesado/a","storm":"tormenta","pity":"compasión","coward":"cobarde"},"turns":[["A","You! Land rat, come aboard!","¡Tú! ¡Rata de tierra, a bordo!"],["B","Me? I only came to watch.","¿Yo? Solo vine a mirar."],["A","Watching is for gulls. Work!","Mirar es para gaviotas. ¡Trabaja!"],["B","What should I do, Captain?","¿Qué debo hacer, Capitán?"],["A","Coil that rope, tight and fast.","Enrolla esa cuerda, fuerte y rápido."],["B","Like this? Tight enough?","¿Así? ¿Suficientemente fuerte?"],["A","Tighter! The sea forgives nothing.","¡Más fuerte! El mar no perdona nada."],["B","Yes sir, tighter now.","Sí señor, más fuerte ahora."],["A","Name and business, quickly.","Nombre y oficio, rápido."],["B","Alex, I study maps, sir.","Alex, estudio mapas, señor."],["A","Maps! The sea laughs at maps.","¡Mapas! El mar se ríe de los mapas."],["B","But maps saved many ships.","Pero los mapas salvaron muchos barcos."],["A","Only eyes save ships, boy.","Solo los ojos salvan barcos, muchacho."],["B","Then teach my eyes, Captain.","Entonces enseña a mis ojos, Capitán."],["A","Hah! Spirit. I like spirit.","¡Ja! Espíritu. Me gusta el espíritu."],["B","Thank you, sir. What ship is this?","Gracias, señor. ¿Qué barco es este?"],["A","The Pequod, hunter of shadows.","El Pequod, cazador de sombras."],["B","Hunter of... what exactly?","¿Cazador de... qué exactamente?"],["A","One whale. White as death.","Una ballena. Blanca como la muerte."],["B","White as death? Terrifying.","¿Blanca como la muerte? Aterrador."],["A","Moby Dick took my leg.","Moby Dick tomó mi pierna."],["B","Your leg! Is that true?","¡Tu pierna! ¿Es verdad?"],["A","Wood replaces bone. Hate replaces fear.","La madera reemplaza al hueso. El odio reemplaza al miedo."],["B","That sounds very heavy.","Eso suena muy pesado."],["A","Will you sail with us?","¿Navegarás con nosotros?"],["B","Where does she swim now?","¿Dónde nada ella ahora?"],["A","South, where the water burns cold.","Al sur, donde el agua quema fría."],["B","When do we leave?","¿Cuándo partimos?"],["A","At dawn, with the tide.","Al amanecer, con la marea."],["B","I must warn my mother first.","Debo avisar a mi madre primero."],["A","Write fast, the tide waits for none.","Escribe rápido, la marea no espera a nadie."],["B","One letter, two minutes.","Una carta, dos minutos."],["A","Time! Swear the sailor's oath.","¡Hora! Jura el juramento marinero."],["B","What are the words, sir?","¿Cuáles son las palabras, señor?"],["A","Repeat: I fear no wave.","Repite: No temo a ninguna ola."],["B","I fear no wave.","No temo a ninguna ola."],["A","I chase no gold, only purpose.","No persigo oro, solo propósito."],["B","I chase no gold, only purpose.","No persigo oro, solo propósito."],["A","If I run, call me coward.","Si huyo, llámame cobarde."],["B","If I run, call me coward.","Si huyo, llámame cobarde."],["A","Good. Take this harpoon.","Bien. Toma este arpón."],["B","It is heavier than it looks.","Es más pesado de lo que parece."],["A","Everything true is heavy.","Todo lo verdadero es pesado."],["B","I will remember that.","Recordaré eso."],["A","Storm clouds gather east.","Nubes de tormenta se juntan al este."],["B","Should we wait it out?","¿Debemos esperarla?"],["A","Ahab waits for nothing!","¡Ahab no espera nada!"],["B","Then we sail into it?","¿Entonces navegamos hacia ella?"],["A","Into it, through it, beyond!","¡Hacia ella, a través, más allá!"],["B","Beyond... I like that word.","Más allá... me gusta esa palabra."],["A","Sleep now, deck at four.","Duerme ahora, cubierta a las cuatro."],["B","Deck at four, understood.","Cubierta a las cuatro, entendido."],["A","One last thing, sailor.","Una última cosa, marinero."],["B","Yes, Captain?","¿Sí, Capitán?"],["A","Never pity the whale.","Nunca compadezcas a la ballena."],["B","Why? She is our enemy.","¿Por qué? Ella es nuestra enemiga."],["A","Pity dulls the arm.","La compasión embota el brazo."],["B","No pity, sharp arm.","Sin compasión, brazo afilado."],["A","Welcome aboard the Pequod!","¡Bienvenido a bordo del Pequod!"],["B","Thank you, Captain Ahab!","¡Gracias, Capitán Ahab!"]]},{"id":"traveler","name":"Nova","icon":"⏳","level":"C1","place":"Rooftop · 11:47 pm","desc":"Dice ser tú, doce años mayor, con flores que brillan.","voice":{"gender":"f","pitch":1.1,"rate":1.05},"story":{"en":"A woman who claims to be you, twelve years older, with rain predictions, a scar story, and glowing flowers.","es":"Una mujer que dice ser tú, doce años mayor, con predicciones de lluvia, una cicatriz y flores brillantes."},"vocab":{"tomorrow":"mañana","prove":"demostrar","envelope":"sobre","grant":"beca","rot":"pudrirse","postponed":"pospuesto","scar":"cicatriz","paradoxes":"paradojas","panic":"pánico","refuse":"rechazar","contract":"contrato","glow":"brillar","bravely":"con valentía"},"turns":[["A","Do not be afraid. I am from tomorrow.","No temas. Vengo del mañana."],["B","From tomorrow? That is impossible.","¿Del mañana? Eso es imposible."],["A","Yesterday I said the same thing.","Ayer dije lo mismo."],["B","Wait... that makes strange sense.","Espera... eso tiene extraño sentido."],["A","I have little time, listen well.","Tengo poco tiempo, escucha bien."],["B","I am listening. Who are you?","Estoy escuchando. ¿Quién eres?"],["A","A traveler. Call me Nova.","Una viajera. Llámame Nova."],["B","Nova. Okay... prove it.","Nova. Bien... demuéstralo."],["A","Tomorrow it rains at noon exactly.","Mañana llueve al mediodía exacto."],["B","It never rains in August here.","Nunca llueve en agosto aquí."],["A","Check the sky at twelve.","Mira el cielo a las doce."],["B","I will. What else?","Lo haré. ¿Qué más?"],["A","Your blue envelope matters more than you think.","Tu sobre azul importa más de lo que crees."],["B","How do you know about the envelope?!","¿Cómo sabes del sobre?"],["A","Because you never send it.","Porque nunca lo envías."],["B","I... was afraid to send it.","Yo... tenía miedo de enviarlo."],["A","Send it tonight, before midnight.","Envíalo esta noche, antes de la medianoche."],["B","What happens if I do?","¿Qué pasa si lo hago?"],["A","A door opens that stayed closed.","Una puerta se abre que estaba cerrada."],["B","What door? Be specific.","¿Qué puerta? Sé específica."],["A","The grant, the lab, Lisbon.","La beca, el laboratorio, Lisboa."],["B","Lisbon?! My dream project.","¿Lisboa? Mi proyecto soñado."],["A","Dreams rot when postponed.","Los sueños se pudren al posponerse."],["B","That hurts because it is true.","Eso duele porque es verdad."],["A","I am you, twelve years later.","Soy tú, doce años después."],["B","Me? Older? Prove it deeper.","¿Yo? ¿Mayor? Demuéstralo más."],["A","Your scar, left knee, bicycle, age nine.","Tu cicatriz, rodilla izquierda, bicicleta, nueve años."],["B","Nobody knows that story!","¡Nadie conoce esa historia!"],["A","I do. I am the story.","Yo sí. Yo soy la historia."],["B","My head is spinning now.","Mi cabeza gira ahora."],["A","Breathe. Paradoxes hate panic.","Respira. Las paradojas odian el pánico."],["B","Okay... breathing. What must I change?","Bien... respirando. ¿Qué debo cambiar?"],["A","Three things. First: send the letter.","Tres cosas. Primera: envía la carta."],["B","Tonight, midnight, done.","Esta noche, medianoche, hecho."],["A","Second: call your father Sunday.","Segunda: llama a tu padre el domingo."],["B","Sunday. I always forget.","Domingo. Siempre lo olvido."],["A","He will not always answer.","Él no siempre responderá."],["B","...I understand. And third?","...Entiendo. ¿Y tercera?"],["A","Third: refuse the gray contract.","Tercera: rechaza el contrato gris."],["B","The gray contract pays double!","¡El contrato gris paga el doble!"],["A","And costs triple in years.","Y cuesta el triple en años."],["B","Years? What does it steal?","¿Años? ¿Qué roba?"],["A","Mornings. It eats your mornings.","Mañanas. Devora tus mañanas."],["B","My morning walks... no.","Mis caminatas matutinas... no."],["A","Exactly. Protect your dawns.","Exacto. Protege tus amaneceres."],["B","I promise. Anything else?","Lo prometo. ¿Algo más?"],["A","These flowers. Proof, not metaphor.","Estas flores. Prueba, no metáfora."],["B","They glow! What are they?","¡Brillan! ¿Qué son?"],["A","What grows when kindness wins.","Lo que crece cuando la bondad gana."],["B","When kindness wins... I like that.","Cuando la bondad gana... me gusta eso."],["A","Plant one by your window.","Planta una junto a tu ventana."],["B","And the second flower?","¿Y la segunda flor?"],["A","Give it to someone doubting.","Dásela a alguien que dude."],["B","Pass the future on. Got it.","Pasar el futuro. Entendido."],["A","My time thins. The rain comes.","Mi tiempo se adelgaza. Viene la lluvia."],["B","Wait! Will I see you again?","¡Espera! ¿Te veré de nuevo?"],["A","Every time you choose bravely.","Cada vez que elijas con valentía."],["B","Then I will be brave daily.","Entonces seré valiente a diario."],["A","Goodbye, past self. Send the letter!","Adiós, yo pasada. ¡Envía la carta!"],["B","Goodbye, Nova. The letter flies tonight!","¡Adiós, Nova. La carta vuela esta noche!"]]},{"id":"taco","name":"Lupita Taco Truck","icon":"🌮","level":"A1","place":"Mexico City · night market","desc":"Hambre a medianoche, salsa valiente y un trompo gigante.","voice":{"gender":"f","pitch":1.2,"rate":1},"story":{"en":"Midnight in Mexico City. Your stomach growls louder than the traffic. A pink truck promises the best tacos al pastor.","es":"Medianoche en CDMX. Tu estómago ruge más que el tráfico. Un camión rosa promete los mejores tacos al pastor."},"vocab":{"hungry":"hambriento/a","order":"pedido","spicy":"picante","salsa":"salsa","onion":"cebolla","lime":"limón","corn":"maíz","bill":"cuenta","change":"cambio","delicious":"delicioso"},"turns":[["A","Hello, hungry traveler!","¡Hola, viajero hambriento!"],["B","Hello! Everything smells amazing.","¡Hola! Todo huele increíble."],["A","First time in Mexico?","¿Primera vez en México?"],["B","Yes! I arrived today.","¡Sí! Llegué hoy."],["A","Then you need tacos al pastor.","Entonces necesitas tacos al pastor."],["B","What is al pastor?","¿Qué es al pastor?"],["A","Pork, pineapple, onion, magic.","Cerdo, piña, cebolla, magia."],["B","Magic? I like magic.","¿Magia? Me gusta la magia."],["A","How many tacos do you want?","¿Cuántos tacos quieres?"],["B","Three tacos, please.","Tres tacos, por favor."],["A","With everything?","¿Con todo?"],["B","Yes, with everything!","¡Sí, con todo!"],["A","Spicy salsa? Green or red?","¿Salsa picante? ¿Verde o roja?"],["B","Green, a little.","Verde, un poco."],["A","A little? Brave choice!","¿Un poco? ¡Valiente!"],["B","I am very brave.","Soy muy valiente."],["A","Corn or flour tortilla?","¿Tortilla de maíz o harina?"],["B","Corn, please.","Maíz, por favor."],["A","Good! Real tacos use corn.","¡Bien! Los tacos reales usan maíz."],["B","I want to be real.","Quiero ser real."],["A","Drink? Horchata or jamaica?","¿Bebida? ¿Horchata o jamaica?"],["B","What is horchata?","¿Qué es horchata?"],["A","Sweet rice milk with cinnamon.","Leche dulce de arroz con canela."],["B","One horchata, please.","Una horchata, por favor."],["A","Name for your order?","¿Nombre para tu pedido?"],["B","My name is Sam.","Me llamo Sam."],["A","Sam! Sit here, please.","¡Sam! Siéntate aquí, por favor."],["B","This chair is small.","Esta silla es pequeña."],["A","Small chairs, big flavor!","¡Sillas pequeñas, gran sabor!"],["B","Haha, I love that.","Jaja, me encanta eso."],["A","Your tacos are ready!","¡Tus tacos están listos!"],["B","They look beautiful.","Se ven hermosos."],["A","Add lime, like this.","Pon limón, así."],["B","Like this?","¿Así?"],["A","Perfect! Now taste.","¡Perfecto! Ahora prueba."],["B","Wow! So delicious!","¡Guau! ¡Deliciosos!"],["A","The salsa? Too spicy?","¿La salsa? ¿Muy picante?"],["B","A little spicy, but good.","Un poco picante, pero buena."],["A","You are officially Mexican now.","Ya eres oficialmente mexicano."],["B","Really? So fast?","¿En serio? ¿Tan rápido?"],["A","Tacos make citizens fast.","Los tacos hacen ciudadanos rápido."],["B","I need ten more tacos!","¡Necesito diez tacos más!"],["A","Slow down, champion!","¡Despacio, campeón!"],["B","Okay, one more only.","Bien, solo uno más."],["A","One more taco coming!","¡Otro taco en camino!"],["B","With extra pineapple.","Con piña extra."],["A","The bill: five dollars.","La cuenta: cinco dólares."],["B","So cheap! Here you go.","¡Barato! Aquí tienes."],["A","Keep the change?","¿Te quedas el cambio?"],["B","No, keep it, thanks!","No, quédatelo, ¡gracias!"],["A","Thank you! Come back soon.","¡Gracias! Vuelve pronto."],["B","Tomorrow, same time!","¡Mañana, a la misma hora!"],["A","One photo for the wall?","¿Una foto para la pared?"],["B","Yes! With my tacos!","¡Sí! ¡Con mis tacos!"],["A","Smile! Perfect shot!","¡Sonríe! ¡Foto perfecta!"],["B","Send it to me, please.","Envíamela, por favor."],["A","What is your number?","¿Cuál es tu número?"],["B","I will write it here.","Lo escribo aquí."],["A","Photo sent! Good night!","¡Foto enviada! ¡Buenas noches!"],["B","Best tacos ever! Bye!","¡Mejores tacos! ¡Adiós!"]]},{"id":"sushi","name":"Kenji the Chef","icon":"🍣","level":"A1","place":"Tokyo · tiny sushi bar","desc":"Seis sillas, un chef serio y tu primer wasabi.","voice":{"gender":"m","pitch":0.9,"rate":0.95},"story":{"en":"A six-seat sushi bar in Tokyo. The chef watches every bite. Your first wasabi awaits.","es":"Un bar de sushi de seis asientos en Tokio. El chef mira cada bocado. Tu primer wasabi te espera."},"vocab":{"fish":"pescado","rice":"arroz","wasabi":"wasabi","chopsticks":"palillos","fresh":"fresco/a","menu":"menú","bill":"cuenta","tasty":"sabroso/a","chef":"chef","bite":"bocado"},"turns":[["A","Welcome! Sit here, please.","¡Bienvenido! Siéntate aquí, por favor."],["B","Thank you! Small place!","¡Gracias! ¡Lugar pequeño!"],["A","Six seats only. I am Kenji.","Solo seis asientos. Soy Kenji."],["B","Nice to meet you, Kenji.","Mucho gusto, Kenji."],["A","First time with sushi?","¿Primera vez con sushi?"],["B","Yes, I am nervous.","Sí, estoy nervioso."],["A","No fear. I guide you.","Sin miedo. Yo te guío."],["B","Thank you, chef!","¡Gracias, chef!"],["A","Can you use chopsticks?","¿Sabes usar palillos?"],["B","A little bit.","Un poco."],["A","Like this. Easy.","Así. Fácil."],["B","Like this?","¿Así?"],["A","Very good hands!","¡Muy buenas manos!"],["B","Really? Great!","¿En serio? ¡Genial!"],["A","First: salmon sushi.","Primero: sushi de salmón."],["B","The fish is orange!","¡El pescado es naranja!"],["A","Fresh salmon from today.","Salmón fresco de hoy."],["B","It looks beautiful.","Se ve hermoso."],["A","One bite, all together.","Un bocado, todo junto."],["B","All together? Okay.","¿Todo junto? Bien."],["A","Eat now!","¡Come ahora!"],["B","Mmm! So fresh!","¡Mmm! ¡Fresco!"],["A","You smile. Good sign.","Sonríes. Buena señal."],["B","I love it!","¡Me encanta!"],["A","Second: tuna sushi.","Segundo: sushi de atún."],["B","Red fish this time.","Pescado rojo esta vez."],["A","With a little wasabi.","Con un poco de wasabi."],["B","What is wasabi?","¿Qué es wasabi?"],["A","Green fire. Very little!","Fuego verde. ¡Muy poco!"],["B","Fire? Oh no.","¿Fuego? Oh no."],["A","Trust me. Tiny bit.","Confía en mí. Poquito."],["B","Tiny bit. Okay.","Poquito. Bien."],["A","Eat!","¡Come!"],["B","Wow! Spicy nose!","¡Guau! ¡Picante en la nariz!"],["A","Haha! Water here.","¡Jaja! Agua aquí."],["B","Thank you! Better now.","¡Gracias! Mejor ahora."],["A","Last one: sweet egg.","Último: huevo dulce."],["B","Egg sushi? Interesting.","¿Sushi de huevo? Interesante."],["A","My grandmother's recipe.","Receta de mi abuela."],["B","Sweet and soft!","¡Dulce y suave!"],["A","You did very well.","Lo hiciste muy bien."],["B","Thank you, teacher!","¡Gracias, maestro!"],["A","The bill, please.","La cuenta, por favor."],["B","How much is it?","¿Cuánto es?"],["A","Ten dollars.","Diez dólares."],["B","Here you go!","¡Aquí tienes!"],["A","Come back, sushi friend!","¡Vuelve, amigo del sushi!"],["B","Every week, promise!","¡Cada semana, lo prometo!"],["A","Green tea now?","¿Té verde ahora?"],["B","Yes, please.","Sí, por favor."],["A","Hot tea cleans the mouth.","El té caliente limpia la boca."],["B","Warm and bitter. Nice.","Tibio y amargo. Rico."],["A","You are a real sushi eater.","Eres un verdadero comedor de sushi."],["B","Can I have the recipe?","¿Me das la receta?"],["A","Secret recipe! Sorry!","¡Receta secreta! ¡Perdón!"],["B","Haha, I understand.","Jaja, entiendo."],["A","But take this fan, gift.","Pero toma este abanico, regalo."],["B","Beautiful! Thank you!","¡Hermoso! ¡Gracias!"],["A","Sayonara, sushi friend!","¡Sayonara, amigo del sushi!"],["B","Sayonara, Kenji!","¡Sayonara, Kenji!"]]},{"id":"paris","name":"Chloé the Waitress","icon":"🥐","level":"A2","place":"Paris · corner café","desc":"Lluvia, un cruasán perfecto y francés de supervivencia.","voice":{"gender":"f","pitch":1.2,"rate":0.95},"story":{"en":"Rain in Paris. A corner café smells of butter. A waitress teaches you survival French.","es":"Lluvia en París. Un café de esquina huele a mantequilla. Una mesera te enseña francés de supervivencia."},"vocab":{"rain":"lluvia","table":"mesa","window":"ventana","croissant":"cruasán","coffee":"café","milk":"leche","bill":"cuenta","beautiful":"hermoso/a","street":"calle","umbrella":"paraguas"},"turns":[["A","Bonjour! Welcome to Paris!","¡Bonjour! ¡Bienvenido a París!"],["B","Bonjour! Table for one.","¡Bonjour! Mesa para uno."],["A","Window or inside?","¿Ventana o adentro?"],["B","Window, please. I love rain.","Ventana, por favor. Amo la lluvia."],["A","Romantic! Menu here.","¡Romántico! Menú aquí."],["B","Everything is in French!","¡Todo está en francés!"],["A","I translate. Coffee?","Yo traduzco. ¿Café?"],["B","Yes, with milk.","Sí, con leche."],["A","Un café crème. Perfect.","Un café crème. Perfecto."],["B","Café crème! Fancy!","¡Café crème! ¡Elegante!"],["A","And to eat? Croissant?","¿Y para comer? ¿Cruasán?"],["B","Yes! One croissant.","¡Sí! Un cruasán."],["A","Warm or cold?","¿Caliente o frío?"],["B","Warm, please.","Caliente, por favor."],["A","Excellent choice, monsieur.","Excelente elección, monsieur."],["B","Monsieur! I feel French!","¡Monsieur! ¡Me siento francés!"],["A","Say: s'il vous plaît.","Di: s'il vous plaît."],["B","Seel voo play?","¿Seel voo play?"],["A","Close! It means please.","¡Casi! Significa por favor."],["B","S'il vous plaît!","¡S'il vous plaît!"],["A","Magnifique! Here is coffee.","¡Magnífico! Aquí está el café."],["B","It smells wonderful.","Huele maravilloso."],["A","Taste the croissant.","Prueba el cruasán."],["B","Buttery and crispy!","¡Mantecoso y crujiente!"],["A","The best in Paris.","El mejor de París."],["B","I believe you.","Te creo."],["A","Do you like the rain?","¿Te gusta la lluvia?"],["B","Yes, the street shines.","Sí, la calle brilla."],["A","Paris shines in rain.","París brilla con lluvia."],["B","Like in the movies.","Como en las películas."],["A","Another coffee?","¿Otro café?"],["B","No, the bill, please.","No, la cuenta, por favor."],["A","L'addition: six euros.","L'addition: seis euros."],["B","Here are ten euros.","Aquí hay diez euros."],["A","Merci beaucoup!","¡Merci beaucoup!"],["B","Merci! Au revoir!","¡Merci! ¡Au revoir!"],["A","Do you have an umbrella?","¿Tienes paraguas?"],["B","No, I forgot it.","No, lo olvidé."],["A","Take mine! Small gift.","¡Toma el mío! Pequeño regalo."],["B","Really? Merci mille fois!","¿En serio? ¡Mil gracias!"],["A","One more lesson: merci.","Una lección más: merci."],["B","Merci means thank you.","Merci significa gracias."],["A","And s'il vous plaît?","¿Y s'il vous plaît?"],["B","Means please!","¡Significa por favor!"],["A","You learn so fast!","¡Aprendes rapidísimo!"],["B","Good teacher, good student.","Buena maestra, buen alumno."],["A","Visit the tower today?","¿Visitas la torre hoy?"],["B","Yes! The Eiffel Tower!","¡Sí! ¡La Torre Eiffel!"],["A","Go at sunset. Best light.","Ve al atardecer. Mejor luz."],["B","Sunset! Noted!","¡Atardecer! ¡Anotado!"],["A","Buy tickets online. Faster.","Compra boletos en línea. Más rápido."],["B","Online! Smart!","¡En línea! ¡Lista!"],["A","And eat a crêpe there.","Y come una crepa allá."],["B","Crêpe with chocolate!","¡Crepa con chocolate!"],["A","Exactement! You are French!","¡Exactement! ¡Eres francés!"],["B","Un peu! A little!","¡Un peu! ¡Un poco!"],["A","Bonne journée, ami!","¡Buen día, amigo!"],["B","Bonne journée, Chloé!","¡Buen día, Chloé!"],["A","One last coffee to go?","¿Un último café para llevar?"],["B","Yes! For the tower!","¡Sí! ¡Para la torre!"]]},{"id":"hostel","name":"Ruby the Host","icon":"🎒","level":"A2","place":"London · riverside hostel","desc":"Litera 7, mapa con secretos y té a las cinco.","voice":{"gender":"f","pitch":1.1,"rate":1},"story":{"en":"A riverside hostel in London. Bunk 7 is yours. The host marks secret spots on your map.","es":"Un hostal junto al río en Londres. La litera 7 es tuya. La anfitriona marca lugares secretos en tu mapa."},"vocab":{"bed":"cama","top":"arriba","bottom":"abajo","key":"llave","shower":"ducha","towel":"toalla","map":"mapa","bridge":"puente","museum":"museo","free":"gratis"},"turns":[["A","Hiya! Welcome to London!","¡Hola! ¡Bienvenido a Londres!"],["B","Hi! I booked a bed.","¡Hola! Reservé una cama."],["A","Name, please?","¿Nombre, por favor?"],["B","Alex, from Spain.","Alex, de España."],["A","Spain! I love paella!","¡España! ¡Amo la paella!"],["B","My mother makes the best!","¡Mi madre hace la mejor!"],["A","Passport, please.","Pasaporte, por favor."],["B","Here it is.","Aquí está."],["A","Bed 7, top bunk.","Cama 7, litera arriba."],["B","Top? I am afraid of heights.","¿Arriba? Me dan miedo las alturas."],["A","Bottom is free too. Take 8.","La de abajo está libre. Toma la 8."],["B","Bed 8, bottom. Perfect.","Cama 8, abajo. Perfecto."],["A","Here is your key.","Aquí está tu llave."],["B","A real metal key!","¡Una llave real de metal!"],["A","Old building, old keys.","Edificio viejo, llaves viejas."],["B","I love old places.","Amo los lugares viejos."],["A","Showers are downstairs.","Las duchas están abajo."],["B","Is there hot water?","¿Hay agua caliente?"],["A","Always hot, I promise.","Siempre caliente, lo prometo."],["B","And towels?","¿Y toallas?"],["A","One towel per guest.","Una toalla por huésped."],["B","Good, I forgot mine.","Bien, olvidé la mía."],["A","Breakfast at eight.","Desayuno a las ocho."],["B","English breakfast?","¿Desayuno inglés?"],["A","Beans, eggs, toast, tea.","Frijoles, huevos, pan, té."],["B","Beans for breakfast? Wow.","¿Frijoles al desayuno? Guau."],["A","You must try it once.","Debes probarlo una vez."],["B","Once! Promise.","¡Una vez! Lo prometo."],["A","Look at your map.","Mira tu mapa."],["B","So many red marks!","¡Tantas marcas rojas!"],["A","Free museum here. Secret bridge there.","Museo gratis aquí. Puente secreto allá."],["B","Secret bridge? Tell me!","¿Puente secreto? ¡Dime!"],["A","Walk at sunset. Magic light.","Camina al atardecer. Luz mágica."],["B","Sunset walk, noted.","Caminata al atardecer, anotado."],["A","Tea time at five, free.","Té a las cinco, gratis."],["B","Free tea? I am in!","¿Té gratis? ¡Me apunto!"],["A","Sleep well, traveler!","¡Duerme bien, viajero!"],["B","Thanks, Ruby! Good night!","¡Gracias, Ruby! ¡Buenas noches!"],["A","Kitchen is upstairs.","La cocina está arriba."],["B","Can I cook there?","¿Puedo cocinar ahí?"],["A","Yes! Pots are free.","¡Sí! Las ollas son gratis."],["B","I will cook pasta!","¡Cocinaré pasta!"],["A","Italian night! I join!","¡Noche italiana! ¡Me uno!"],["B","Pasta for everyone!","¡Pasta para todos!"],["A","Quiet hours at eleven.","Silencio a las once."],["B","Eleven! Understood.","¡Once! Entendido."],["A","Lockers for your bag?","¿Taquilla para tu mochila?"],["B","Yes, big backpack.","Sí, mochila grande."],["A","Locker 8, same number!","¡Taquilla 8, mismo número!"],["B","Easy to remember!","¡Fácil de recordar!"],["A","Laundry downstairs, cheap.","Lavandería abajo, barata."],["B","My socks say thanks.","Mis calcetines agradecen."],["A","Haha! See you at breakfast!","¡Jaja! ¡Nos vemos al desayuno!"],["B","Beans and eggs! Bye!","¡Frijoles y huevos! ¡Adiós!"],["A","Wi-Fi password is london123.","La clave Wi-Fi es london123."],["B","London123! Connected!","¡London123! ¡Conectado!"],["A","Checkout at ten, okay?","¿Salida a las diez, bien?"],["B","Ten! I will be ready.","¡Diez! Estaré listo."],["A","Safe travels, friend!","¡Buen viaje, amigo!"],["B","Thanks for everything!","¡Gracias por todo!"]]},{"id":"souk","name":"Yasmine the Guide","icon":"🕌","level":"A2","place":"Marrakech · the souk","desc":"Mil callejones, regateo amable y té de menta.","voice":{"gender":"f","pitch":1,"rate":0.95},"story":{"en":"The Marrakech souk: a thousand alleys, smells of spice, and the art of friendly bargaining.","es":"El zoco de Marrakech: mil callejones, olor a especias y el arte del regateo amable."},"vocab":{"market":"mercado","spice":"especia","carpet":"alfombra","lamp":"lámpara","price":"precio","expensive":"caro/a","cheap":"barato/a","tea":"té","mint":"menta","bargain":"regateo"},"turns":[["A","Welcome to the souk!","¡Bienvenido al zoco!"],["B","So many colors!","¡Tantos colores!"],["A","I am Yasmine, your guide.","Soy Yasmine, tu guía."],["B","I am lost already!","¡Ya estoy perdido!"],["A","Everyone gets lost. Beautiful lost.","Todos se pierden. Pérdida hermosa."],["B","Haha, okay!","¡Jaja, bien!"],["A","First rule: always bargain.","Primera regla: siempre regatea."],["B","Bargain? How?","¿Regatear? ¿Cómo?"],["A","Smile, offer half, drink tea.","Sonríe, ofrece la mitad, toma té."],["B","Half? Really?","¿La mitad? ¿En serio?"],["A","Really! Watch me.","¡En serio! Mírame."],["B","Okay, teach me!","¡Bien, enséñame!"],["A","Beautiful lamp! How much?","¡Hermosa lámpara! ¿Cuánto?"],["B","Fifty dollars.","Cincuenta dólares."],["A","Too much! Twenty?","¡Mucho! ¿Veinte?"],["B","Thirty, friend.","Treinta, amigo."],["A","Twenty-five, and tea?","¿Veinticinco, y té?"],["B","Deal! Mint tea!","¡Trato! ¡Té de menta!"],["A","You see? Easy magic.","¿Ves? Magia fácil."],["B","I want to try!","¡Quiero intentar!"],["A","That carpet. Ask the price.","Esa alfombra. Pregunta el precio."],["B","How much is this carpet?","¿Cuánto cuesta esta alfombra?"],["A","Eighty dollars.","Ochenta dólares."],["B","Too expensive! Forty?","¡Caro! ¿Cuarenta?"],["A","Sixty, best price.","Sesenta, mejor precio."],["B","Fifty, my last offer.","Cincuenta, mi última oferta."],["A","Sold! You learn fast!","¡Vendido! ¡Aprendes rápido!"],["B","I am a natural!","¡Soy un natural!"],["A","Now the spice market.","Ahora el mercado de especias."],["B","It smells amazing!","¡Huele increíble!"],["A","Smell this: cumin.","Huele esto: comino."],["B","Strong and warm!","¡Fuerte y cálido!"],["A","And this: cinnamon.","Y esto: canela."],["B","Sweet! For tea!","¡Dulce! ¡Para el té!"],["A","Small bag, gift for you.","Bolsa pequeña, regalo para ti."],["B","For me? Shukran!","¿Para mí? ¡Gracias!"],["A","You speak Arabic!","¡Hablas árabe!"],["B","One word only!","¡Solo una palabra!"],["A","One word opens doors.","Una palabra abre puertas."],["B","Shukran, Yasmine!","¡Gracias, Yasmine!"],["A","Now smell saffron.","Ahora huele azafrán."],["B","Expensive smell!","¡Olor caro!"],["A","Gold of the kitchen.","Oro de la cocina."],["B","One gram, please.","Un gramo, por favor."],["A","For you: three dollars.","Para ti: tres dólares."],["B","Deal! For my mother.","¡Trato! Para mi madre."],["A","Mothers love saffron.","Las madres aman el azafrán."],["B","She cooks Friday couscous.","Ella cocina cuscús los viernes."],["A","Invite me one Friday!","¡Invítame un viernes!"],["B","Morocco meets my mother!","¡Marruecos conoce a mi madre!"],["A","The sun sets soon.","El sol se pone pronto."],["B","The square fills with smoke.","La plaza se llena de humo."],["A","Food stalls wake up!","¡Los puestos despiertan!"],["B","Eat with me, please?","¿Comes conmigo, por favor?"],["A","Harira soup, my treat.","Sopa harira, invito yo."],["B","Best guide ever!","¡Mejor guía del mundo!"],["A","Tomorrow the desert?","¿Mañana el desierto?"],["B","Camels at dawn! Bye!","¡Camellos al amanecer! ¡Adiós!"],["A","Meet here tomorrow, same time?","¿Nos vemos mañana, misma hora?"],["B","Same time! With sunscreen!","¡Misma hora! ¡Con protector!"]]},{"id":"pizza","name":"Nonna Elena","icon":"🍕","level":"B1","place":"Rome · family pizzeria","desc":"La nonna te enseña pizza de verdad y te adopta.","voice":{"gender":"f","pitch":1,"rate":0.9},"story":{"en":"A tiny pizzeria in Rome. Nonna Elena has made pizza for fifty years and accepts no excuses.","es":"Una pizzería pequeña en Roma. La nonna Elena hace pizza desde hace cincuenta años y no acepta excusas."},"vocab":{"dough":"masa","flour":"harina","tomato":"tomate","cheese":"queso","oven":"horno","recipe":"receta","slice":"rebanada","hungry":"hambriento/a","bill":"cuenta","grandmother":"abuela"},"turns":[["A","Benvenuto! Hungry, yes?","¡Bienvenido! Hambriento, ¿sí?"],["B","Very hungry, Nonna!","¡Muy hambriento, Nonna!"],["A","I am Elena. Sit, sit!","Soy Elena. ¡Siéntate!"],["B","This place smells wonderful.","Este lugar huele maravilloso."],["A","Fifty years of pizza smell!","¡Cincuenta años de olor a pizza!"],["B","Fifty years! Wow!","¡Cincuenta años! ¡Guau!"],["A","You want real pizza?","¿Quieres pizza de verdad?"],["B","Only real pizza!","¡Solo pizza de verdad!"],["A","No pineapple! Capito?","¡Sin piña! ¿Capito?"],["B","Capito! No pineapple!","¡Capito! ¡Sin piña!"],["A","Good child. Margherita?","Buen niño. ¿Margarita?"],["B","What is Margherita?","¿Qué es Margarita?"],["A","Tomato, mozzarella, basil.","Tomate, mozzarella, albahaca."],["B","Simple and perfect.","Simple y perfecta."],["A","Like life should be.","Como la vida debe ser."],["B","You are a philosopher!","¡Eres filósofa!"],["A","Flour, water, hands. Look.","Harina, agua, manos. Mira."],["B","The dough dances!","¡La masa baila!"],["A","You try! Hands dirty!","¡Tú intenta! ¡Manos sucias!"],["B","Like this? Round?","¿Así? ¿Redonda?"],["A","Rounder! Use love!","¡Más redonda! ¡Usa amor!"],["B","Love and flour everywhere!","¡Amor y harina por todas partes!"],["A","Haha! Natural pizzaiolo!","¡Jaja! ¡Pizzero natural!"],["B","My mother would laugh.","Mi madre se reiría."],["A","Mothers always laugh. Good.","Las madres siempre ríen. Bien."],["B","Now the tomato?","¿Ahora el tomate?"],["A","Little sauce, in circles.","Poca salsa, en círculos."],["B","Circles! Like art!","¡Círculos! ¡Como arte!"],["A","Cheese! Not too much!","¡Queso! ¡No mucho!"],["B","Just a little?","¿Solo un poco?"],["A","Basta! Into the oven!","¡Basta! ¡Al horno!"],["B","How hot is it?","¿Qué tan caliente?"],["A","Hot like August in Rome!","¡Caliente como agosto en Roma!"],["B","Four hundred degrees?","¿Cuatrocientos grados?"],["A","Fire does the math.","El fuego hace la cuenta."],["B","Two minutes?","¿Dos minutos?"],["A","Ninety seconds! Watch!","¡Noventa segundos! ¡Mira!"],["B","It grows! Bubbles!","¡Crece! ¡Burbujas!"],["A","Out! Basil! Oil!","¡Fuera! ¡Albahaca! ¡Aceite!"],["B","It looks like a flag!","¡Parece una bandera!"],["A","Italy on a plate!","¡Italia en un plato!"],["B","First bite... amazing!","Primer bocado... ¡increíble!"],["A","Crispy outside, soft inside.","Crujiente fuera, suave dentro."],["B","Best pizza of my life!","¡Mejor pizza de mi vida!"],["A","You cry? Pizza moves hearts.","¿Lloras? La pizza mueve corazones."],["B","Happy tears, Nonna!","¡Lágrimas felices, Nonna!"],["A","Second slice?","¿Segunda rebanada?"],["B","Obviously yes!","¡Obviamente sí!"],["A","Eat slowly, taste everything.","Come despacio, saborea todo."],["B","I will remember this.","Recordaré esto."],["A","Recipe on paper, for you.","Receta en papel, para ti."],["B","The secret recipe?","¿La receta secreta?"],["A","Secrets are for sharing.","Los secretos son para compartir."],["B","Grazie mille, Nonna!","¡Gracias mil, Nonna!"],["A","You are family now.","Ya eres familia."],["B","Famiglia! I love it!","¡Famiglia! ¡Me encanta!"],["A","Come back Sunday. Free pizza.","Vuelve el domingo. Pizza gratis."],["B","Sunday! Promise! Ciao!","¡Domingo! ¡Lo prometo! ¡Ciao!"],["A","Photo with Nonna?","¿Foto con la Nonna?"],["B","Yes! Flour faces!","¡Sí! ¡Caras de harina!"]]},{"id":"pub","name":"Seamus the Bartender","icon":"🍀","level":"B1","place":"Dublin · old pub","desc":"Música en vivo, historia rebelde y tu primer ceili.","voice":{"gender":"m","pitch":0.8,"rate":0.95},"story":{"en":"A 200-year-old Dublin pub. Seamus pours stories with every pint and teaches you an Irish dance.","es":"Un pub de Dublín de 200 años. Seamus sirve historias con cada pinta y te enseña un baile irlandés."},"vocab":{"beer":"cerveza","music":"música","song":"canción","dance":"baile","story":"historia","old":"viejo/a","friend":"amigo/a","cheers":"salud","night":"noche","fun":"diversión"},"turns":[["A","Welcome to Dublin, friend!","¡Bienvenido a Dublín, amigo!"],["B","Thanks! Cozy place!","¡Gracias! ¡Lugar acogedor!"],["A","Two hundred years old!","¡Doscientos años!"],["B","Older than my country!","¡Más viejo que mi país!"],["A","I am Seamus. Drink?","Soy Seamus. ¿Bebida?"],["B","What do you recommend?","¿Qué recomiendas?"],["A","Apple juice? Or tea?","¿Jugo de manzana? ¿O té?"],["B","Tea, please.","Té, por favor."],["A","Irish breakfast tea. Strong!","Té irlandés. ¡Fuerte!"],["B","Strong tea for rain.","Té fuerte para la lluvia."],["A","It always rains. We sing!","Siempre llueve. ¡Cantamos!"],["B","Live music tonight?","¿Música en vivo hoy?"],["A","Fiddles at nine!","¡Violines a las nueve!"],["B","I love fiddles!","¡Amo los violines!"],["A","Know any Irish song?","¿Conoces alguna canción irlandesa?"],["B","Only name: Molly Malone.","Solo un nombre: Molly Malone."],["A","Our sad sweet Molly!","¡Nuestra triste dulce Molly!"],["B","Tell me her story.","Cuéntame su historia."],["A","Fish seller, Dublin streets.","Vendedora de pescado, calles de Dublín."],["B","Beautiful and poor?","¿Hermosa y pobre?"],["A","Died young, sung forever.","Murió joven, cantada por siempre."],["B","Sad but beautiful.","Triste pero hermoso."],["A","All good songs are sad!","¡Todas las buenas canciones son tristes!"],["B","Haha, true in my country too!","¡Jaja, cierto en mi país también!"],["A","Music starts! Listen!","¡Empieza la música! ¡Escucha!"],["B","Fast fingers! Amazing!","¡Dedos rápidos! ¡Increíble!"],["A","This is a jig. Dance?","Esto es una giga. ¿Bailas?"],["B","I have two left feet!","¡Tengo dos pies izquierdos!"],["A","Perfect! Irish feet! Up!","¡Perfecto! ¡Pies irlandeses! ¡Arriba!"],["B","One-two-three, hop?","¿Uno-dos-tres, salto?"],["A","Exactly! Again! Faster!","¡Exacto! ¡Otra vez! ¡Más rápido!"],["B","I am flying!","¡Estoy volando!"],["A","Natural dancer! Cheers!","¡Bailarín natural! ¡Salud!"],["B","Cheers! Sláinte!","¡Salud! ¡Sláinte!"],["A","Sláinte! You learn fast!","¡Sláinte! ¡Aprendes rápido!"],["B","One more song, please!","¡Otra canción, por favor!"],["A","Last song: home sweet home.","Última canción: hogar dulce hogar."],["B","I feel at home here.","Me siento en casa aquí."],["A","Pubs are homes with music.","Los pubs son hogares con música."],["B","I will bring my friends!","¡Traeré a mis amigos!"],["A","Bring them Friday! Free dance!","¡Tráelos el viernes! ¡Baile gratis!"],["B","Friday! Good night, Seamus!","¡Viernes! ¡Buenas noches, Seamus!"],["A","Another tea, friend?","¿Otro té, amigo?"],["B","Yes, please!","¡Sí, por favor!"],["A","Strong or mild?","¿Fuerte o suave?"],["B","Strong like Dublin!","¡Fuerte como Dublín!"],["A","Tell me about home.","Cuéntame de tu hogar."],["B","Sunny streets, loud family.","Calles soleadas, familia ruidosa."],["A","Ireland misses sun too!","¡Irlanda extraña el sol también!"],["B","Trade: sun for music?","¿Intercambio: sol por música?"],["A","Deal! Shake on it!","¡Trato! ¡Chócala!"],["B","Deal! Best pub ever!","¡Trato! ¡Mejor pub!"],["A","Write your name on the wall!","¡Escribe tu nombre en la pared!"],["B","On the wall? Really?","¿En la pared? ¿En serio?"],["A","Travelers' wall! Look!","¡Pared de viajeros! ¡Mira!"],["B","A hundred names!","¡Cien nombres!"],["A","Yours makes hundred-one!","¡El tuyo hace ciento uno!"],["B","Forever in Dublin!","¡Por siempre en Dublín!"],["A","Slán! That means bye!","¡Slán! ¡Eso es adiós!"],["B","Slán, Seamus!","¡Slán, Seamus!"]]},{"id":"arepa","name":"Doña Rosa","icon":"🌽","level":"B2","place":"Bogota · corner arepa stand","desc":"Arepas, aguacate y una lección de vida a 2.600 metros.","voice":{"gender":"f","pitch":1,"rate":0.9},"story":{"en":"A corner stand in chilly Bogota. Doña Rosa presses arepas and wisdom at 2,600 meters high.","es":"Un puesto en la fría Bogotá. Doña Rosa prensa arepas y sabiduría a 2.600 metros de altura."},"vocab":{"corn":"maíz","cheese":"queso","avocado":"aguacate","cold":"frío/a","mountain":"montaña","recipe":"receta","grandmother":"abuela","work":"trabajo","proud":"orgulloso/a","tasty":"sabroso/a"},"turns":[["A","Frío, ¿cierto? Come in, child.","Cold, right? Come in, child."],["B","Bogota is freezing!","¡Bogotá es helada!"],["A","Two thousand six hundred meters!","¡Dos mil seiscientos metros!"],["B","My lungs feel it!","¡Mis pulmones lo sienten!"],["A","Arepa fixes everything.","La arepa lo arregla todo."],["B","What is an arepa?","¿Qué es una arepa?"],["A","Corn soul, round and golden.","Alma de maíz, redonda y dorada."],["B","Soul you can eat?","¿Alma que se puede comer?"],["A","The best kind of soul.","La mejor clase de alma."],["B","With cheese?","¿Con queso?"],["A","Cheese inside, always.","Queso adentro, siempre."],["B","Melting cheese! Yes!","¡Queso derretido! ¡Sí!"],["A","And avocado on top.","Y aguacate encima."],["B","Green gold!","¡Oro verde!"],["A","You speak like family.","Hablas como familia."],["B","How long have you cooked?","¿Cuánto llevas cocinando?"],["A","Thirty years, same corner.","Treinta años, misma esquina."],["B","Thirty years of arepas!","¡Treinta años de arepas!"],["A","Rain, sun, strikes: I open.","Lluvia, sol, paros: yo abro."],["B","Nothing stops you?","¿Nada te detiene?"],["A","Hunger never sleeps, child.","El hambre nunca duerme, hijo."],["B","Wise and true.","Sabio y cierto."],["A","My grandmother taught me.","Mi abuela me enseñó."],["B","Recipes travel in blood.","Las recetas viajan en la sangre."],["A","Beautiful words! Eat!","¡Hermosas palabras! ¡Come!"],["B","Crispy outside, soft soul!","¡Crujiente fuera, alma suave!"],["A","You understand arepas now.","Ya entiendes las arepas."],["B","I feel Colombian!","¡Me siento colombiano!"],["A","Colombia adopts good eaters.","Colombia adopta buenos comedores."],["B","One more, with extra cheese!","¡Otra, con queso extra!"],["A","Extra cheese for family!","¡Queso extra para la familia!"],["B","How much do I owe?","¿Cuánto te debo?"],["A","Two dollars. Cheap happiness.","Dos dólares. Felicidad barata."],["B","Happiness should be cheap!","¡La felicidad debe ser barata!"],["A","Come back with hunger!","¡Vuelve con hambre!"],["B","Always hungry, Doña Rosa!","¡Siempre hambriento, Doña Rosa!"],["A","And bring a jacket next time!","¡Y trae chaqueta la próxima!"],["B","Jacket! Noted! Chao!","¡Chaqueta! ¡Anotado! ¡Chao!"],["A","Hot chocolate too?","¿Chocolate caliente también?"],["B","With cheese inside?","¿Con queso adentro?"],["A","Bogotano style! Try!","¡Estilo bogotano! ¡Prueba!"],["B","Cheese in chocolate? Strange!","¿Queso en chocolate? ¡Extraño!"],["A","Strange and delicious!","¡Extraño y delicioso!"],["B","Wow! Salty sweet!","¡Guau! ¡Salado dulce!"],["A","Andinos know secrets.","Los andinos conocen secretos."],["B","Teach me more secrets!","¡Enséñame más secretos!"],["A","Secret two: ajiaco soup.","Secreto dos: sopa ajiaco."],["B","Three potatoes? Really?","¿Tres papas? ¿En serio?"],["A","Three! Plus corn!","¡Tres! ¡Más maíz!"],["B","Potato paradise!","¡Paraíso de papas!"],["A","Come hungry tomorrow!","¡Ven hambriento mañana!"],["B","Tomorrow: ajiaco day!","¡Mañana: día de ajiaco!"],["A","I save you a table!","¡Te guardo una mesa!"],["B","Corner table, same one!","¡Mesa de esquina, la misma!"],["A","Same one! Promise!","¡La misma! ¡Prometido!"],["B","Gracias, abuela Rosa!","¡Gracias, abuela Rosa!"],["A","Abuela! I love that!","¡Abuela! ¡Me encanta!"],["B","Abuela Rosa forever!","¡Abuela Rosa por siempre!"],["A","Bogota hugs you, child.","Bogotá te abraza, hijo."],["B","Hugged and full! Adiós!","¡Abrazado y lleno! ¡Adiós!"]]},{"id":"asado","name":"Don Carlos","icon":"🥩","level":"B2","place":"Buenos Aires · Sunday asado","desc":"Domingo, fuego lento y el ritual sagrado del asado.","voice":{"gender":"m","pitch":0.7,"rate":0.9},"story":{"en":"Sunday in Buenos Aires. Don Carlos guards the grill like a temple and explains the sacred ritual.","es":"Domingo en Buenos Aires. Don Carlos cuida la parrilla como un templo y explica el ritual sagrado."},"vocab":{"meat":"carne","fire":"fuego","grill":"parrilla","slow":"lento/a","salt":"sal","wine":"vino","friend":"amigo/a","sunday":"domingo","smoke":"humo","patience":"paciencia"},"turns":[["A","Sunday is sacred, kid.","El domingo es sagrado, pibe."],["B","Sacred? Why?","¿Sagrado? ¿Por qué?"],["A","Asado day. No exceptions.","Día de asado. Sin excepciones."],["B","I am honored to join!","¡Honrado de unirme!"],["A","First rule: never rush fire.","Primera regla: nunca apures el fuego."],["B","Fire needs patience?","¿El fuego necesita paciencia?"],["A","Fire is a lady. Court her.","El fuego es una dama. Cortéjala."],["B","Poetic grill master!","¡Poético parrillero!"],["A","Wood, not gas. Ever.","Leña, nunca gas."],["B","Gas is faster, no?","¿El gas es más rápido, no?"],["A","Faster is not better!","¡Más rápido no es mejor!"],["B","Lesson learned!","¡Lección aprendida!"],["A","Salt only. Meat speaks.","Solo sal. La carne habla."],["B","Meat speaks? I listen!","¿La carne habla? ¡Escucho!"],["A","Three hours, slow smoke.","Tres horas, humo lento."],["B","Three hours? Wow!","¿Tres horas? ¡Guau!"],["A","Good things take time.","Lo bueno toma tiempo."],["B","Like friendship.","Como la amistad."],["A","Exactly! Wine?","¡Exacto! ¿Vino?"],["B","A little Malbec.","Un poco de Malbec."],["A","Malbec was born for asado.","El Malbec nació para el asado."],["B","Red, deep, perfect.","Rojo, profundo, perfecto."],["A","Choripán first. Appetizer.","Choripán primero. Entrada."],["B","Sausage sandwich? Yes!","¿Sándwich de chorizo? ¡Sí!"],["A","Chimichurri on top.","Chimichurri encima."],["B","Green, fresh, tasty!","¡Verde, fresco, sabroso!"],["A","Now the vacío. Main star.","Ahora el vacío. Estrella principal."],["B","Tender like butter!","¡Tierno como mantequilla!"],["A","Cut against the grain.","Corta contra la fibra."],["B","Against the grain. Got it.","Contra la fibra. Entendido."],["A","You eat like family.","Comes como familia."],["B","I feel Argentine!","¡Me siento argentino!"],["A","Argentina is a feeling.","Argentina es un sentimiento."],["B","Deep words, Don Carlos.","Palabras profundas, Don Carlos."],["A","Dessert: vigilante! Cheese!","¡Postre: vigilante! ¡Queso!"],["B","Cheese with sweet?","¿Queso con dulce?"],["A","Trust the ritual!","¡Confía en el ritual!"],["B","Sweet and salty heaven!","¡Cielo dulce y salado!"],["A","Every Sunday, your chair waits.","Cada domingo, tu silla espera."],["B","My chair! Gracias! Chau!","¡Mi silla! ¡Gracias! ¡Chau!"],["A","Mate now? Bitter tea?","¿Mate ahora? ¿Té amargo?"],["B","Bitter? Like coffee?","¿Amargo? ¿Como café?"],["A","Stronger! Share the cup!","¡Más fuerte! ¡Comparte el vaso!"],["B","One cup for all?","¿Un vaso para todos?"],["A","Friendship cup! Sip!","¡Vaso de amistad! ¡Sorbe!"],["B","Bitter! Strong! Good!","¡Amargo! ¡Fuerte! ¡Bueno!"],["A","You are practically Argentine!","¡Eres prácticamente argentino!"],["B","Practically? I want fully!","¿Prácticamente? ¡Quiero total!"],["A","Fully takes ten asados!","¡Total toma diez asados!"],["B","Ten Sundays! Challenge!","¡Diez domingos! ¡Reto!"],["A","Challenge accepted, kid!","¡Reto aceptado, pibe!"],["B","Count them! One done!","¡Cuéntalos! ¡Uno listo!"],["A","Nine to glory!","¡Nueve a la gloria!"],["B","Glory tastes like smoke!","¡La gloria sabe a humo!"],["A","Take leftovers home!","¡Lleva sobras a casa!"],["B","For midnight hunger!","¡Para el hambre nocturna!"],["A","Smart! Asado moon!","¡Listo! ¡Luna de asado!"],["B","Best Sunday ever! Chau!","¡Mejor domingo! ¡Chau!"],["A","Hugs, not handshakes here.","Abrazos, no apretones aquí."],["B","Big hug, asador!","¡Gran abrazo, asador!"]]},{"id":"rooftop","name":"Zoe the Founder","icon":"🌃","level":"C1","place":"New York · midnight rooftop","desc":"Una fundadora insomne te ofrece café, ciudad y verdad.","voice":{"gender":"f","pitch":1.1,"rate":1.05},"story":{"en":"Midnight on a Manhattan rooftop. An insomniac founder offers coffee, skyline, and uncomfortable truths.","es":"Medianoche en una azotea de Manhattan. Una fundadora insomne ofrece café, ciudad y verdades incómodas."},"vocab":{"dream":"sueño","failure":"fracaso","risk":"riesgo","future":"futuro","city":"ciudad","coffee":"café","midnight":"medianoche","startup":"startup","fear":"miedo","brave":"valiente"},"turns":[["A","Can't sleep either? Join me.","¿Tampoco puedes dormir? Únete."],["B","The city is too loud.","La ciudad es muy ruidosa."],["A","Loud means alive. Coffee?","Ruidosa significa viva. ¿Café?"],["B","At midnight? Really?","¿A medianoche? ¿En serio?"],["A","Founders run on midnight oil.","Los fundadores corren con aceite de medianoche."],["B","Are you a founder?","¿Eres fundadora?"],["A","Third startup. Two funerals.","Tercera startup. Dos funerales."],["B","Funerals? You mean failures?","¿Funerales? ¿Quieres decir fracasos?"],["A","Failures with flowers. Prettier.","Fracasos con flores. Más bonito."],["B","Dark humor. I like it.","Humor negro. Me gusta."],["A","What brings you up here?","¿Qué te trae aquí arriba?"],["B","I missed my last train.","Perdí mi último tren."],["A","Best accidents happen at midnight.","Los mejores accidentes pasan a medianoche."],["B","Like meeting founders?","¿Como conocer fundadoras?"],["A","Exactly. So: your dream?","Exacto. Entonces: ¿tu sueño?"],["B","I want to build things.","Quiero construir cosas."],["A","Vague. Sharpen it.","Vago. Afílalo."],["B","Apps that teach languages.","Apps que enseñan idiomas."],["A","Better. Who pays?","Mejor. ¿Quién paga?"],["B","Hmm. Schools? Parents?","Hmm. ¿Escuelas? ¿Padres?"],["A","Good. Pain first, product second.","Bien. Dolor primero, producto después."],["B","What pain do I solve?","¿Qué dolor resuelvo?"],["A","Boredom. Fear. Loneliness.","Aburrimiento. Miedo. Soledad."],["B","Learning feels lonely. True.","Aprender se siente solo. Cierto."],["A","There is your compass.","Ahí está tu brújula."],["B","Compass, not map?","¿Brújula, no mapa?"],["A","Maps lie. Compasses persist.","Los mapas mienten. Las brújulas persisten."],["B","I am writing that down.","Eso lo escribo."],["A","My first investor said no.","Mi primer inversor dijo no."],["B","How many said yes?","¿Cuántos dijeron sí?"],["A","The eleventh. Persistence compounds.","El undécimo. La persistencia compone."],["B","Eleven doors. Noted.","Once puertas. Anotado."],["A","Fear ever stops you?","¿El miedo te detiene?"],["B","Daily. I walk anyway.","A diario. Camino igual."],["A","Courage is fear with coffee.","El valor es miedo con café."],["B","Haha! Another quote!","¡Jaja! ¡Otra cita!"],["A","Take my card. Email me.","Toma mi tarjeta. Escríbeme."],["B","Really? Thank you, Zoe!","¿En serio? ¡Gracias, Zoe!"],["A","Midnight people help each other.","La gente de medianoche se ayuda."],["B","I will build it. Promise.","Lo construiré. Lo prometo."],["A","Then sleep. Builders need dreams.","Entonces duerme. Los constructores necesitan sueños."],["B","Good night, rooftop oracle!","¡Buenas noches, oráculo de azotea!"],["A","One more question for you.","Una pregunta más para ti."],["B","Shoot.","Dispara."],["A","What will you sacrifice?","¿Qué sacrificarás?"],["B","Sleep? Weekends?","¿Sueño? ¿Fines de semana?"],["A","Comfort. Certainty. Applause.","Comodidad. Certeza. Aplausos."],["B","Heavy price.","Precio pesado."],["A","Dreams charge rent.","Los sueños cobran renta."],["B","I will pay it.","La pagaré."],["A","Then you are ready.","Entonces estás listo."],["B","Ready and scared.","Listo y asustado."],["A","Perfect combination.","Combinación perfecta."],["B","Can I quote you?","¿Puedo citarte?"],["A","Quote the night, not me.","Cita la noche, no a mí."],["B","The night said it.","La noche lo dijo."],["A","Train station opens at five.","La estación abre a las cinco."],["B","Three hours of stars left.","Tres horas de estrellas."],["A","Spend them well.","Gástalas bien."],["B","With coffee and plans.","Con café y planes."]]},{"id":"tamer","name":"Chief Tamer Bruna","icon":"🐲","level":"A1","place":"Dragon fields · dawn","desc":"Entrevista para domador: ¿pasas la prueba de fuego?","voice":{"gender":"f","pitch":0.9,"rate":0.95},"story":{"en":"Dawn over the dragon fields. The chief tamer interviews you for the bravest job alive.","es":"Amanecer sobre los campos de dragones. La jefa te entrevista para el trabajo más valiente."},"vocab":{"dragon":"dragón","fire":"fuego","brave":"valiente","fly":"volar","egg":"huevo","scale":"escama","wing":"ala","roar":"rugido","job":"trabajo","test":"prueba"},"turns":[["A","Want the job, little one?","¿Quieres el trabajo, pequeño?"],["B","Yes! I love dragons!","¡Sí! ¡Amo los dragones!"],["A","Dragons love breakfast first.","Los dragones aman desayunar primero."],["B","What do they eat?","¿Qué comen?"],["A","Hot rocks and honey.","Rocas calientes y miel."],["B","Honey? Sweet!","¿Miel? ¡Dulce!"],["A","Feed Sizzle here.","Alimenta a Chispa aquí."],["B","Hello, Sizzle!","¡Hola, Chispa!"],["A","Slow hands, soft voice.","Manos lentas, voz suave."],["B","Like this?","¿Así?"],["A","Perfect! She purrs fire.","¡Perfecto! Ronronea fuego."],["B","Tiny flames! Cute!","¡Llamitas! ¡Tierna!"],["A","Now brush her scales.","Ahora cepilla sus escamas."],["B","Green and shiny!","¡Verdes y brillantes!"],["A","Count her teeth.","Cuenta sus dientes."],["B","One, two… thirty!","¡Uno, dos… treinta!"],["A","Never touch the nose!","¡Nunca toques la nariz!"],["B","Why not?","¿Por qué no?"],["A","Sneeze means fire!","¡Estornudo es fuego!"],["B","Noted! No nose!","¡Anotado! ¡Nada de nariz!"],["A","Ride test now. Helmet?","Prueba de vuelo. ¿Casco?"],["B","Helmet on!","¡Casco puesto!"],["A","Hold the saddle tight!","¡Agárrate fuerte!"],["B","Tight! Go, Sizzle!","¡Fuerte! ¡Vamos, Chispa!"],["A","Up we go!","¡Arriba vamos!"],["B","Wow! Clouds below!","¡Guau! ¡Nubes abajo!"],["A","Open your wings of courage!","¡Abre tus alas de valor!"],["B","I am flying!","¡Estoy volando!"],["A","Loop time! Ready?","¡Pirueta! ¿Lista?"],["B","Ready! Wheee!","¡Lista! ¡Yujuu!"],["A","Land softly now.","Aterriza suave ahora."],["B","Soft landing! Yes!","¡Aterrizaje suave! ¡Sí!"],["A","Egg check: warm?","Huevo: ¿tibio?"],["B","Warm and singing!","¡Tibio y cantando!"],["A","Singing means hatching soon.","Cantar es nacer pronto."],["B","A baby dragon!","¡Un dragón bebé!"],["A","Name him, tamer.","Nómbralo, domador."],["B","Ember! Little Ember!","¡Brasa! ¡Brasita!"],["A","Ember likes you.","Brasa te quiere."],["B","I love him too!","¡Yo también lo amo!"],["A","Job is yours!","¡El trabajo es tuyo!"],["B","Really? Best day!","¿En serio? ¡Mejor día!"],["A","Badge of fire, take it.","Insignia de fuego, toma."],["B","Shiny! Thank you!","¡Brillante! ¡Gracias!"],["A","Feed dragons at dawn.","Alimenta dragones al alba."],["B","Dawn! Every day!","¡Alba! ¡Cada día!"],["A","Night shift: sing lullabies.","Turno noche: canta nanas."],["B","Dragons sleep to songs?","¿Dragones duermen con songs?"],["A","Deep songs, deep sleep.","Canción honda, sueño hondo."],["B","La la… sleep, Ember!","¡La la… duerme, Brasa!"],["A","He snores smoke rings!","¡Ronca anillos de humo!"],["B","Cute snore!","¡Ronquido tierno!"],["A","You pass everything!","¡Pasas todo!"],["B","Best interview ever!","¡Mejor entrevista!"],["A","Welcome, dragon tamer!","¡Bienvenido, domador!"],["B","Roar with me: rawr!","¡Ruge conmigo: raur!"],["A","Rawr indeed!","¡Raur de verdad!"],["B","See you at dawn!","¡Nos vemos al alba!"],["A","Dawn it is!","¡Al alba será!"],["B","Bye, Chief Bruna!","¡Adiós, jefa Bruna!"]]},{"id":"potion","name":"Zara the Alchemist","icon":"🧪","level":"A1","place":"Bubbling botica · dusk","desc":"Compras pociones: una te hace cantar ópera.","voice":{"gender":"f","pitch":1.2,"rate":1},"story":{"en":"A bubbling botica at dusk. The alchemist sells potions with… surprising side effects.","es":"Una botica burbujeante al atardecer. La alquimista vende pociones con efectos sorprendentes."},"vocab":{"potion":"poción","bottle":"botella","magic":"magia","sleep":"sueño","laugh":"risa","dance":"baile","sing":"canto","price":"precio","coin":"moneda","effect":"efecto"},"turns":[["A","Potions! Fresh today!","¡Pociones! ¡Frescas hoy!"],["B","What do they do?","¿Qué hacen?"],["A","Blue: deep sleep.","Azul: sueño profundo."],["B","Red?","¿Roja?"],["A","Red: wild dancing!","¡Roja: baile salvaje!"],["B","Fun! And green?","¡Diversión! ¿Y verde?"],["A","Green: opera singing!","¡Verde: canto ópera!"],["B","Opera?! No thanks!","¡¿Ópera?! ¡No, gracias!"],["A","Haha! Wise choice!","¡Jaja! ¡Sabia elección!"],["B","I need sleep potion.","Necesito poción de sueño."],["A","Small or big bottle?","¿Botella chica o grande?"],["B","Small, please.","Chica, por favor."],["A","Three drops at night.","Tres gotas de noche."],["B","Only three?","¿Solo tres?"],["A","Four means snoring thunder!","¡Cuatro es ronquido trueno!"],["B","Three! Promise!","¡Tres! ¡Prometo!"],["A","Also giggle syrup?","¿También jarabe de risa?"],["B","What is that?","¿Qué es eso?"],["A","One spoon: happy day!","¡Una cucharada: día feliz!"],["B","Yes! One spoon!","¡Sí! ¡Una cucharada!"],["A","Total: five coins.","Total: cinco monedas."],["B","Here you go!","¡Aquí tienes!"],["A","Shake before magic!","¡Agita antes de la magia!"],["B","Shake! Noted!","¡Agitar! ¡Anotado!"],["A","Never mix red and blue!","¡Nunca mezcles roja y azul!"],["B","Why? What happens?","¿Por qué? ¿Qué pasa?"],["A","Dancing sleep! Disaster!","¡Baile dormido! ¡Desastre!"],["B","Disaster noted!","¡Desastre anotado!"],["A","Free sample: courage tea?","¿Muestra gratis: té valor?"],["B","Courage? Yes!","¿Valor? ¡Sí!"],["A","Drink! Feel brave?","¡Bebe! ¿Valiente?"],["B","Brave like a lion!","¡Valiente como león!"],["A","Come back for refills!","¡Vuelve por más!"],["B","Tomorrow! Bye, Zara!","¡Mañana! ¡Adiós, Zara!"],["A","Love potion? Just kidding!","¿Poción de amor? ¡Broma!"],["B","Haha! No thanks!","¡Jaja! ¡No, gracias!"],["A","Wise! Love can't bottle!","¡Sabio! ¡El amor no se embotella!"],["B","True words, Zara!","¡Cierto, Zara!"],["A","Memory mist? For exams?","¿Niebla memoria? ¿Exámenes?"],["B","Tempting… but no!","Tentador… ¡pero no!"],["A","Honest customer! Rare!","¡Cliente honesto! ¡Raro!"],["B","Studying beats potions!","¡Estudiar gana a pociones!"],["A","Free sticker: frog star!","¡Pegatina gratis: rana estrella!"],["B","Cute! On my book!","¡Tierna! ¡A mi libro!"],["A","Books love stickers!","¡Los libros aman pegatinas!"],["B","My book agrees!","¡Mi libro está de acuerdo!"],["A","Storm coming! Hurry home!","¡Tormenta! ¡Corre a casa!"],["B","With my potions safe!","¡Con mis pociones a salvo!"],["A","Cork them tight!","¡Corchos apretados!"],["B","Tight! Bye-bye!","¡Apretados! ¡Adiós!"],["A","Bubbles bless you!","¡Burbujas te bendigan!"],["B","And you, Zara!","¡Y tú, Zara!"],["A","Sweet dreams, customer!","¡Dulces sueños, cliente!"],["B","Three drops! Remembered!","¡Tres gotas! ¡Recordado!"],["A","Perfect memory! Bye!","¡Memoria perfecta! ¡Adiós!"],["B","Bye! See stars!","¡Adiós! ¡Mira estrellas!"],["A","Stars see you too!","¡Las estrellas te ven!"],["B","Waving at stars now!","¡Saludando estrellas!"],["A","One last wink of magic!","¡Último guiño de magia!"],["B","Winking back! Bye!","¡Guiño devuelto! ¡Adiós!"]]},{"id":"fairy","name":"Godmother Prim","icon":"✨","level":"A2","place":"Cottage of lost wands","desc":"Madrina oxidada: su varita falla y tu deseo sale torcido.","voice":{"gender":"f","pitch":1.1,"rate":0.9},"story":{"en":"A cottage of lost wands. Your rusty fairy godmother grants one wish — slightly crooked.","es":"Cabaña de varitas perdidas. Tu madrina oxidada concede un deseo… algo torcido."},"vocab":{"wish":"deseo","wand":"varita","spell":"hechizo","frog":"rana","pumpkin":"calabaza","midnight":"medianoche","mistake":"error","fix":"arreglo","shine":"brillo","believe":"creer"},"turns":[["A","Poof! I am late!","¡Puf! ¡Llego tarde!"],["B","Are you my godmother?","¿Eres mi madrina?"],["A","Rusty but real!","¡Oxidada pero real!"],["B","Your wand smokes!","¡Tu varita humea!"],["A","Old wand, big heart!","¡Varita vieja, gran corazón!"],["B","One wish, right?","¿Un deseo, cierto?"],["A","One! Choose wisely!","¡Uno! ¡Elige sabio!"],["B","I wish to fly!","¡Deseo volar!"],["A","Bibbidi… bobbidi… boo!","¡Bibbidi… bobbidi… bu!"],["B","I feel ticklish!","¡Siento cosquillas!"],["A","Look! You float!","¡Mira! ¡Flotas!"],["B","Only one meter!","¡Solo un metro!"],["A","Rusty magic, sorry!","¡Magia oxidada, perdón!"],["B","Higher, please?","¿Más alto, por favor?"],["A","Second try! Hold tight!","¡Segundo intento! ¡Agárrate!"],["B","Wings?! I have wings?!","¿¡Alas?! ¡¿Tengo alas?!"],["A","Chicken wings! Oops!","¡Alas de pollo! ¡Ups!"],["B","Cluck?! I say cluck?!","¿¡Pío?! ¡¿Digo pío?!"],["A","Wrong spellbook page!","¡Página equivocada!"],["B","Fix it, please!","¡Arréglalo, por favor!"],["A","Reverse spell! Now!","¡Hechizo reverso! ¡Ya!"],["B","Wings gone! Phew!","¡Alas fuera! ¡Uf!"],["A","New wish? Simpler?","¿Nuevo deseo? ¿Simple?"],["B","Cake! Big cake!","¡Pastel! ¡Gran pastel!"],["A","Easy! Sweet magic!","¡Fácil! ¡Magia dulce!"],["B","Chocolate! Huge!","¡Chocolate! ¡Enorme!"],["A","Eat before midnight!","¡Come antes de medianoche!"],["B","Why midnight?","¿Por qué medianoche?"],["A","It turns to frog!","¡Se vuelve rana!"],["B","Frog cake?! No!","¿¡Pastel rana?! ¡No!"],["A","Kidding! Old joke!","¡Broma! ¡Chiste viejo!"],["B","Godmothers joke too!","¡Las madrinas bromean!"],["A","Believe, and wands shine!","¡Cree, y las varitas brillan!"],["B","I believe, Prim!","¡Creo, Prim!"],["A","Wand polish time!","¡Hora de pulir varita!"],["B","Shiny! Less smoke!","¡Brillante! ¡Menos humo!"],["A","Practice spell: flowers!","¡Practica: flores!"],["B","Roses! Daisies!","¡Rosas! ¡Margaritas!"],["A","One tulip sneezed!","¡Un tulipán estornudó!"],["B","Bless you, tulip!","¡Salud, tulipán!"],["A","You laugh kindly!","¡Ríes amable!"],["B","Kind laughs only!","¡Risas amables!"],["A","Certified: lovely human!","¡Certificado: humano adorable!"],["B","Framed! On wall!","¡Enmarcado! ¡A la pared!"],["A","Visit on starry nights!","¡Visita en noches estrelladas!"],["B","Starry deal!","¡Trato estrellado!"],["A","Bring cookies next time!","¡Trae galletas la próxima!"],["B","Chocolate chip! Promise!","¡Chispas chocolate! ¡Prometo!"],["A","Wands love cookies!","¡Varitas aman galletas!"],["B","Everyone loves cookies!","¡Todos aman galletas!"],["A","Poof! Home you go!","¡Puf! ¡A casa!"],["B","Floating home! Whee!","¡Flotando a casa!"],["A","Land on pillows!","¡Aterriza en almohadas!"],["B","Soft landing! Bye!","¡Suave aterrizaje! ¡Adiós!"],["A","Bye, believer!","¡Adiós, creyente!"],["B","Bye, Prim! Shine on!","¡Adiós, Prim! ¡Brilla!"],["A","Stars applaud believers!","¡Estrellas aplauden creyentes!"],["B","Applauding stars back!","¡Aplaudo estrellas!"],["A","Encore of sparkles!","¡Otra de brillos!"],["B","Sparkliest goodbye!","¡Adiós más brillante!"]]},{"id":"ghostpirate","name":"Captain Ghostbeard","icon":"🏴‍☠️","level":"A2","place":"Wreck cove · fog","desc":"Pirata fantasma: ayúdalo a hallar su tesoro o te asusta.","voice":{"gender":"m","pitch":0.6,"rate":0.9},"story":{"en":"Fog in Wreck Cove. A ghost pirate needs your living hands to find his treasure.","es":"Niebla en Cala Pecio. Un pirata fantasma necesita tus manos vivas para hallar su tesoro."},"vocab":{"ghost":"fantasma","treasure":"tesoro","map":"mapa","ship":"barco","island":"isla","gold":"oro","scary":"aterrador/a","brave":"valiente","night":"noche","secret":"secreto"},"turns":[["A","Boo! Who sails here?","¡Bu! ¿Quién navega aquí?"],["B","Just me! Don't scare!","¡Solo yo! ¡No asustes!"],["A","Too late! Already scared?","¡Tarde! ¿Asustado ya?"],["B","A little!","¡Un poco!"],["A","Good! Respect the beard!","¡Bien! ¡Respeta la barba!"],["B","Ghost beard! Cool!","¡Barba fantasma! ¡Genial!"],["A","I lost my treasure.","Perdí mi tesoro."],["B","Where? When?","¿Dónde? ¿Cuándo?"],["A","Hundred years ago. Oops.","Hace cien años. Ups."],["B","Oops indeed!","¡Ups de verdad!"],["A","Map here. Read it!","Mapa aquí. ¡Léelo!"],["B","X marks the palm!","¡X marca la palmera!"],["A","Ten steps north!","¡Diez pasos al norte!"],["B","One, two… ten!","¡Uno, dos… diez!"],["A","Dig with living hands!","¡Cava con manos vivas!"],["B","Digging! Sand! Shells!","¡Cavando! ¡Arena! ¡Conchas!"],["A","Deeper! Ghosts can't dig!","¡Más hondo! ¡Fantasmas no cavan!"],["B","Clink! Something hard!","¡Clin! ¡Algo duro!"],["A","Chest! Open it!","¡Cofre! ¡Ábrelo!"],["B","Gold! Jewels! Wow!","¡Oro! ¡Joyas! ¡Guau!"],["A","My treasure! I cry ghost tears!","¡Mi tesoro! ¡Lloro lágrimas fantasma!"],["B","Happy tears, Captain!","¡Lágrimas felices, Capitán!"],["A","Take one coin, friend.","Toma una moneda, amigo."],["B","Gold coin! Thanks!","¡Moneda de oro! ¡Gracias!"],["A","Spend it on adventures!","¡Gástala en aventuras!"],["B","Every penny! Promise!","¡Cada centavo! ¡Prometo!"],["A","Now I can rest!","¡Ahora puedo descansar!"],["B","Sleep well, Captain!","¡Duerme bien, Capitán!"],["A","Fading… thank… you…","Desvanezco… gracias…"],["B","Bye, Ghostbeard!","¡Adiós, Barbarroja!"],["A","Storm took my ship!","¡Tormenta tomó mi barco!"],["B","Sad! Where now?","¡Triste! ¿Dónde ahora?"],["A","Ghost ships sail clouds!","¡Barcos fantasma navegan nubes!"],["B","Cloud sailing! Cool!","¡Navegar nubes! ¡Genial!"],["A","Join my crew? Say aye!","¿Mi tripulación? ¡Di sí!"],["B","Aye! Honorary ghost!","¡Sí! ¡Fantasma honorario!"],["A","Hat of fog for you!","¡Sombrero de niebla para ti!"],["B","Foggy stylish!","¡Niebla con estilo!"],["A","Parrot ghost says hello!","¡Loro fantasma saluda!"],["B","Squawk! Hello back!","¡Graznido! ¡Hola!"],["A","He likes you!","¡Le gustas!"],["B","Smart parrot!","¡Loro listo!"],["A","Sing sea songs nightly!","¡Canta canciones marinas!"],["B","Yo ho ho nightly!","¡Yo jo jo nocturno!"],["A","Loud! Ghosts love loud!","¡Fuerte! ¡Fantasmas aman fuerte!"],["B","Loudest singer here!","¡Cantante más fuerte!"],["A","Treasure map copy? Yours!","¿Copia del mapa? ¡Tuya!"],["B","Framed treasure map!","¡Mapa enmarcado!"],["A","Next adventure: sky whales!","¡Próxima aventura: ballenas cielo!"],["B","Count me in!","¡Cuenta conmigo!"],["A","Full moon we sail!","¡Luna llena navegamos!"],["B","Moonlight crew! Bye!","¡Tripulación lunar! ¡Adiós!"],["A","Boo-farewell, friend!","¡Bu-adios, amigo!"],["B","Boo-bye, Captain!","¡Bu-adiós, Capitán!"],["A","Anchor of mist, away!","¡Ancla de niebla, leva!"],["B","Smooth haunting!","¡Buen acecho!"],["A","Compass of moons guides!","¡Brújula de lunas guía!"],["B","Following moons!","¡Sigo lunas!"],["A","Yo-ho forever!","¡Yo-jo por siempre!"],["B","Forever yo-ho!","¡Por siempre yo-jo!"]]},{"id":"elfbaker","name":"Elrond the Baker","icon":"🧝","level":"B1","place":"Elven bakery · sunrise","desc":"Panadero elfo: su pan canta y solo obedece a amables.","voice":{"gender":"m","pitch":1,"rate":0.95},"story":{"en":"An elven bakery at sunrise. The bread sings — but only for kind customers.","es":"Panadería élfica al amanecer. El pan canta, pero solo para clientes amables."},"vocab":{"bread":"pan","flour":"harina","oven":"horno","song":"canción","kind":"amable","recipe":"receta","morning":"mañana","smell":"olor","taste":"sabor","elf":"elfo"},"turns":[["A","Morning, traveler! Listen!","¡Buenos días, viajero! ¡Escucha!"],["B","Bread is singing?!","¿¡El pan canta!?"],["A","Only for kind hearts.","Solo para corazones amables."],["B","I hear it! Sweet!","¡Lo oigo! ¡Dulce!"],["A","Rude ears hear crumbs.","Oídos rudos oyen migajas."],["B","I am kind! Mostly!","¡Soy amable! ¡Casi!"],["A","Mostly is enough today.","Casi basta hoy."],["B","What bread sings best?","¿Qué pan canta mejor?"],["A","Honey oat, morning choir.","Miel avena, coro matutino."],["B","One loaf, please!","¡Un pan, por favor!"],["A","Warm from the oven!","¡Tibio del horno!"],["B","Smells like sunrise!","¡Huele a amanecer!"],["A","Elven flour, moon-milled.","Harina élfica, molino lunar."],["B","Moon-milled?! Magic!","¿¡Molino lunar?! ¡Magia!"],["A","Knead with patience.","Amasa con paciencia."],["B","How long?","¿Cuánto?"],["A","Hundred songs long.","Cien canciones de largo."],["B","Sing while kneading?","¿Cantar amasando?"],["A","Exactly! Join the choir!","¡Exacto! ¡Únete al coro!"],["B","La la la… bread!","¡La la la… pan!"],["A","Beautiful! The dough rises!","¡Hermoso! ¡La masa sube!"],["B","It dances!","¡Baila!"],["A","Taste the crust!","¡Prueba la corteza!"],["B","Crispy song!","¡Canción crujiente!"],["A","Recipe? Secret ingredient?","¿Receta? ¿Ingrediente secreto?"],["B","Tell me! Please!","¡Dime! ¡Por favor!"],["A","Kindness. Always kindness.","Amabilidad. Siempre amabilidad."],["B","Best ingredient ever!","¡Mejor ingrediente!"],["A","Come sing tomorrow!","¡Ven a cantar mañana!"],["B","Same time! Bye, Elrond!","¡Misma hora! ¡Adiós, Elrond!"],["A","Second loaf? Rye rhythm?","¿Segundo pan? ¿Ritmo centeno?"],["B","Yes! Rye sings low!","¡Sí! ¡Centeno canta grave!"],["A","Bass bread! My favorite!","¡Pan bajo! ¡Mi favorito!"],["B","Warm slice, please!","¡Rebanada tibia!"],["A","Butter sings harmony!","¡Mantequilla canta armonía!"],["B","Duets delicious!","¡Dúos deliciosos!"],["A","Crumbs for the birds?","¿Migas para pájaros?"],["B","Birds sing backup!","¡Pájaros hacen coros!"],["A","Full choir mornings!","¡Coro completo mañanas!"],["B","Bakery concert daily!","¡Concierto panadero diario!"],["A","Rainy days: soup bread?","¿Días lluvia: pan sopa?"],["B","Dunking symphony!","¡Sinfonía de mojar!"],["A","You speak fluent bakery!","¡Hablas panadero fluido!"],["B","Fluent and crumby!","¡Fluido y migoso!"],["A","Apron gift: flour star!","¡Regalo delantal: estrella harina!"],["B","Baker uniform! Thanks!","¡Uniforme panadero! ¡Gracias!"],["A","Flour on nose suits you!","¡Harina en nariz te queda!"],["B","Fashion statement!","¡Declaración moda!"],["A","Closing song: together!","¡Canción cierre: juntos!"],["B","Laaa… bread forever!","¡Laaa… pan por siempre!"],["A","Encore tomorrow!","¡Otra mañana!"],["B","Front row! Bye!","¡Primera fila! ¡Adiós!"],["A","Sweet dreams, singer!","¡Dulces sueños, cantante!"],["B","Doughy dreams!","¡Sueños de masa!"],["A","Ovens cooling, hearts warm!","¡Hornos fríos, corazones tibios!"],["B","Warmest goodbye!","¡Adiós más tibio!"],["A","Rise like dough!","¡Crece como masa!"],["B","Rising daily!","¡Creciendo diario!"],["A","Flour power forever!","¡Poder harina por siempre!"],["B","Forever floury!","¡Por siempre harinoso!"]]},{"id":"wizardexam","name":"Professor Nimbus","icon":"🔮","level":"B1","place":"Tower academy · exam hall","desc":"Examen final: convierte ranas, vuela escoba y no llores.","voice":{"gender":"m","pitch":0.8,"rate":0.9},"story":{"en":"Final exam at the tower academy. Three tests, one trembling wand, zero second chances.","es":"Examen final en la academia de la torre. Tres pruebas, una varita temblorosa, cero segundas chances."},"vocab":{"exam":"examen","wand":"varita","spell":"hechizo","frog":"rana","fly":"volar","broom":"escoba","pass":"aprobar","fail":"reprobar","nervous":"nervioso/a","brave":"valiente"},"turns":[["A","Wands up! Exam begins!","¡Varitas arriba! ¡Empieza el examen!"],["B","Nervous! Very nervous!","¡Nerviosa! ¡Muy nerviosa!"],["A","Breathe! Magic loves calm!","¡Respira! ¡La magia ama la calma!"],["B","Breathing! Calm-ish!","¡Respirando! ¡Casi calma!"],["A","Test one: frog to prince!","¡Prueba uno: rana a príncipe!"],["B","Poor frog! Sorry!","¡Pobre rana! ¡Perdón!"],["A","Wave and rhyme!","¡Agita y rima!"],["B","Ribbit… become… fit!","¡Rana… vuélvete… galán!"],["A","A prince! With warts!","¡Un príncipe! ¡Con verrugas!"],["B","Half pass?","¿Medio punto?"],["A","Half! Next: broom flight!","¡Medio! ¡Siguiente: vuelo!"],["B","Up, broom! Gently!","¡Arriba, escoba! ¡Suave!"],["A","Loop around the tower!","¡Vuelta a la torre!"],["B","Wheee! Windy!","¡Yujuu! ¡Ventoso!"],["A","Land on the star!","¡Aterriza en la estrella!"],["B","Bullseye landing!","¡Aterrizaje perfecto!"],["A","Full marks! Test three!","¡Nota completa! ¡Prueba tres!"],["B","What is it?","¿Qué es?"],["A","Make me laugh!","¡Hazme reír!"],["B","A joke? Magic joke?","¿Un chiste? ¿Chiste mágico?"],["A","Any laugh counts!","¡Toda risa cuenta!"],["B","Why did the wizard blush?","¿Por qué se sonrojó el mago?"],["A","Why?","¿Por qué?"],["B","He saw the wand's… diary!","¡Vio el diario… de la varita!"],["A","Ha! Snort! Pass!","¡Ja! ¡Aprobada!"],["B","Really?! I pass?!","¿¿En serio?! ¿¿Apruebo??"],["A","With giggles and glory!","¡Con risas y gloria!"],["B","Best exam ever!","¡Mejor examen!"],["A","Diploma of sparkles!","¡Diploma de brillos!"],["B","Shiny! Thank you!","¡Brillante! ¡Gracias!"],["A","Oath: magic for kindness!","¡Juramento: magia para bondad!"],["B","I swear it!","¡Lo juro!"],["A","Hat toss! All together!","¡Sombreros al aire! ¡Todos!"],["B","Flying hats! Yay!","¡Sombreros vuelan! ¡Yay!"],["A","Welcome, young wizard!","¡Bienvenida, joven maga!"],["B","Wizard Pippa, at last!","¡Maga Pippa, al fin!"],["A","Dorm feast tonight!","¡Fiesta dormitorio hoy!"],["B","Cake shaped like wands?","¿Pastel forma varitas?"],["A","And frog-leg cookies!","¡Y galletas pata-rana!"],["B","Cookies, not frogs, right?","¿Galletas, no ranas, cierto?"],["A","Right! Mostly!","¡Cierto! ¡Casi!"],["B","Mostly?! Hmm!","¿¡Casi?! ¡Hmm!"],["A","Trust the kitchen elves!","¡Confía en elfos cocina!"],["B","Elves cook best!","¡Elfos cocinan mejor!"],["A","Study tip: sleep on spells!","¡Tip: duerme sobre hechizos!"],["B","Pillow full of magic?","¿¿Almohada llena de magia??"],["A","Absorbs overnight!","¡Absorbe de noche!"],["B","Trying tonight!","¡Intento esta noche!"],["A","Report dreams tomorrow!","¡Reporta sueños mañana!"],["B","Flying brooms, surely!","¡Escobas voladoras, seguro!"],["A","Classic! Rest now!","¡Clásico! ¡Descansa ya!"],["B","Resting, graduate mage!","¡Descansando, maga graduada!"],["A","Proud professor moment!","¡Momento profe orgulloso!"],["B","Thanks, Professor Nimbus!","¡Gracias, Profesor Nimbus!"],["A","Shine on, Pippa!","¡Brilla, Pippa!"],["B","Sparkling always!","¡Brillando siempre!"],["A","Next: master-level potions?","¿Próximo: pociones master?"],["B","Bring it on!","¡Tráelo ya!"],["A","That is the spirit!","¡Ese es el espíritu!"],["B","Spirit bottled! Bye!","¡Espíritu embotellado! ¡Adiós!"]]},{"id":"seawitch","name":"Morwenna Tidecaller","icon":"🌊","level":"B2","place":"Grotto of echoes","desc":"Negocia con la bruja del mar: tu voz por una tormenta.","voice":{"gender":"f","pitch":0.7,"rate":0.85},"story":{"en":"A grotto that echoes your heartbeat. The sea witch offers a storm — for your voice.","es":"Una gruta que repite tu corazón. La bruja del mar ofrece una tormenta… por tu voz."},"vocab":{"sea":"mar","wave":"ola","storm":"tormenta","voice":"voz","deal":"trato","price":"precio","shell":"concha","tide":"marea","brave":"valiente","echo":"eco"},"turns":[["A","Swim closer, little bargain.","Nada cerca, pequeño trato."],["B","Your grotto echoes!","¡Tu gruta hace eco!"],["A","It repeats true hearts.","Repite corazones verdaderos."],["B","Mine beats fast!","¡El mío late rápido!"],["A","You want a storm?","¿Quieres una tormenta?"],["B","To save my fleet!","¡Para salvar mi flota!"],["A","Storms cost voices.","Las tormentas cuestan voces."],["B","My voice?! Forever?!","¿¿Mi voz?? ¿¿Por siempre??"],["A","One song. One only.","Una canción. Solo una."],["B","My lullaby for mother?","¿Mi nana para mamá?"],["A","The sweetest currency.","La moneda más dulce."],["B","Too dear! Other price?","¡Muy cara! ¿Otro precio?"],["A","Clever child. Three riddles?","Niña lista. ¿Tres acertijos?"],["B","Riddles! I accept!","¡Acertijos! ¡Acepto!"],["A","What sings without mouth?","¿Qué canta sin boca?"],["B","The wind! Easy!","¡El viento! ¡Fácil!"],["A","What cries without eyes?","¿Qué llora sin ojos?"],["B","The sea! Like you!","¡El mar! ¡Como tú!"],["A","Hmm. Last: what frees?","Hmm. Último: ¿qué libera?"],["B","Kindness! Always!","¡La bondad! ¡Siempre!"],["A","The grotto applauds!","¡La gruta aplaude!"],["B","Echoes clap too!","¡Los ecos aplauden!"],["A","Storm granted, voice kept.","Tormenta dada, voz guardada."],["B","Fair witch! Thank you!","¡Bruja justa! ¡Gracias!"],["A","One condition: sing!","Una condición: ¡canta!"],["B","Sing now? Here?","¿Cantar ahora? ¿Aquí?"],["A","Lullaby for the tides!","¡Nana para mareas!"],["B","La la… sleep, sea!","¡La la… duerme, mar!"],["A","Waves soften already!","¡Olas se suavizan ya!"],["B","My fleet sails home!","¡Mi flota vuelve a casa!"],["A","Take this shell phone!","¡Toma este caracol fono!"],["B","Call the sea anytime?","¿Llamar al mar siempre?"],["A","Whisper, and I answer.","Susurra, y respondo."],["B","Whispering thanks, Morwenna!","¡Susurro gracias, Morwenna!"],["A","Pearl dues? None today!","¿Deudas perla? ¡Hoy ninguna!"],["B","Free storm?! Generous!","¿¡Tormenta gratis!? ¡Generosa!"],["A","Riddles paid double!","¡Acertijos pagaron doble!"],["B","Best currency ever!","¡Mejor moneda jamás!"],["A","Wisdom over wallets!","¡Sabiduría sobre billeteras!"],["B","Tattoo it on waves!","¡Tatúalo en olas!"],["A","Already written in foam!","¡Ya escrito en espuma!"],["B","Reading foam now!","¡Leyendo espuma ya!"],["A","Careful: tides tickle!","¡Cuidado: mareas cosquillean!"],["B","Ticklish toes! Hee!","¡Dedos cosquillosos! ¡Ji!"],["A","Even witches giggle!","¡Hasta las brujas ríen!"],["B","Witch giggles! Cute!","¡Risita de bruja! ¡Tierna!"],["A","Do not tell the kraken!","¡No digas al kraken!"],["B","Lips sealed with salt!","¡Labios sellados con sal!"],["A","Salty promises hold!","¡Promesas saladas valen!"],["B","Holding tight!","¡Agarrando fuerte!"],["A","Swim home before dusk!","¡Nada a casa antes del anochecer!"],["B","Racing the sunset!","¡Carrera al atardecer!"],["A","Fleet waits beyond reef!","¡La flota espera tras el arrecife!"],["B","Sails in sight! Yay!","¡Velas a la vista! ¡Yay!"],["A","Fair winds, riddle-child!","¡Vientos justos, niña-acertijo!"],["B","Fair tides, Morwenna!","¡Mareas justas, Morwenna!"],["A","Echoes remember you!","¡Los ecos te recuerdan!"],["B","Remembering echoes too!","¡Recuerdo ecos también!"],["A","Dive deep, dream deeper!","¡Bucea hondo, sueña hondo!"],["B","Deepest thanks! Farewell!","¡Gracias profundas! ¡Adiós!"]]},{"id":"giant","name":"Goliath Greenhands","icon":"🌱","level":"B2","place":"Cloud-high garden","desc":"Jardinero gigante: riega arcoíris y poda nubes.","voice":{"gender":"m","pitch":0.6,"rate":0.85},"story":{"en":"A garden above the clouds. The giant gardener waters rainbows and prunes clouds.","es":"Un jardín sobre las nubes. El jardinero gigante riega arcoíris y poda nubes."},"vocab":{"giant":"gigante","garden":"jardín","flower":"flor","seed":"semilla","water":"agua","sun":"sol","grow":"crecer","tall":"alto/a","small":"pequeño/a","care":"cuidado"},"turns":[["A","Mind the daisies! Huge feet!","¡Cuidado margaritas! ¡Pies enormes!"],["B","Sorry! Tiny human here!","¡Perdón! ¡Humana pequeña!"],["A","Tiny hands, perfect work!","¡Manitas, trabajo perfecto!"],["B","Hire me, giant?","¿Me contratas, gigante?"],["A","First: water the rainbow!","¡Primero: riega el arcoíris!"],["B","With what can?","¿Con qué regadera?"],["A","Cloud bucket! Squeeze gently!","¡Balde nube! ¡Exprime suave!"],["B","Drizzle… colors brighten!","¡Llovizna… colores brillan!"],["A","Beautiful! Next: prune clouds!","¡Hermoso! ¡Poda nubes!"],["B","Fluffy ones?","¿Las esponjosas?"],["A","Shaggy edges only!","¡Solo bordes greñudos!"],["B","Snip snip! Neat!","¡Tijera! ¡Prolijo!"],["A","Plant moonseeds at dusk!","¡Planta semillunas al atardecer!"],["B","How deep?","¿Qué tan hondo?"],["A","One giggle deep!","¡Una risita de hondo!"],["B","Giggling while planting!","¡Riendo mientras planto!"],["A","Laughter feeds roots!","¡La risa alimenta raíces!"],["B","Sprouts already?!","¿¿Brotes ya??"],["A","Fast garden, faster heart!","¡Jardín veloz, corazón veloz!"],["B","Sunflower taller than me!","¡Girasol más alto que yo!"],["A","Climb it! See the world!","¡Súbelo! ¡Mira el mundo!"],["B","Tiny houses! Tiny seas!","¡Casitas! ¡Marecitos!"],["A","Careful! Hold petals!","¡Cuidado! ¡Sujeta pétalos!"],["B","Sliding down! Whee!","¡Deslizando! ¡Yujuu!"],["A","Ha! Small and brave!","¡Ja! ¡Pequeña y valiente!"],["B","Pocket sunflower? Please?","¿Girasol bolsillo? ¿Por favor?"],["A","For the best helper!","¡Para la mejor ayudante!"],["B","Best job ever! Bye!","¡Mejor trabajo! ¡Adiós!"],["A","Grow tall, little seed!","¡Crece alto, semillita!"],["B","Water me with stories!","¡Riégame con cuentos!"],["A","Lunch: cloud berries?","¿Almuerzo: moras nube?"],["B","Fluffy lunch! Yes!","¡Almuerzo esponjoso! ¡Sí!"],["A","Giant portions, tiny bites!","¡Porciones gigantes, bocados pequeños!"],["B","Nibbling like a mouse!","¡Mordisqueando como ratón!"],["A","Mouse-sized appetite noted!","¡Apetito ratón anotado!"],["B","Second lunch maybe?","¿Segundo almuerzo quizás?"],["A","Hobbit habits! Approved!","¡Costumbres hobbit! ¡Aprobado!"],["B","Elevenses are sacred!","¡Las once son sagradas!"],["A","Sacred snacks indeed!","¡Snacks sagrados, sí!"],["B","Jam on everything!","¡Mermelada en todo!"],["A","Rainbow jam, naturally!","¡Mermelada arcoíris, obvio!"],["B","Tastes like colors!","¡Sabe a colores!"],["A","Purple tastes best!","¡Morado sabe mejor!"],["B","Team purple forever!","¡Equipo morado por siempre!"],["A","Nap in tulip hammock?","¿Siesta en hamaca tulipán?"],["B","Petal blanket, please!","¡Manta de pétalos, por favor!"],["A","Snore softly, small one!","¡Ronca suave, pequeña!"],["B","Zzz… tiny snores!","¡Zzz… ronquiditos!"],["A","Bees hum lullabies!","¡Abejas zumban nanas!"],["B","Buzzing dreams!","¡Sueños zumbantes!"],["A","Wake: sunset watering!","¡Despierta: riego atardecer!"],["B","Golden hour shift!","¡Turno hora dorada!"],["A","Sky blushes pink!","¡Cielo se sonroja rosa!"],["B","Blushing workdays! Best!","¡Días sonrojados! ¡Lo mejor!"],["A","Stars punch in soon!","¡Estrellas entran pronto!"],["B","Night shift: fireflies!","¡Turno noche: luciérnagas!"],["A","Lantern brigade! Go!","¡Brigada linternas! ¡Ya!"],["B","Glowing strong! Bye!","¡Brillando fuerte! ¡Adiós!"],["A","Grow gently, helper!","¡Crece suave, ayudante!"],["B","Sprouting goodbye!","¡Brote-adiós!"]]},{"id":"dentist","name":"Dr. Fang","icon":"🧛","level":"C1","place":"Midnight dental clinic","desc":"Dentista de vampiros con fobia a la sangre. Ironía incluida.","voice":{"gender":"m","pitch":0.7,"rate":0.9},"story":{"en":"A midnight dental clinic. A vampire dentist with a blood phobia treats your immortal toothache.","es":"Clínica dental de medianoche. Un dentista vampiro con fobia a la sangre trata tu dolor inmortal."},"vocab":{"tooth":"diente","pain":"dolor","blood":"sangre","fear":"miedo","brave":"valiente","night":"noche","eternal":"eterno/a","smile":"sonrisa","mirror":"espejo","courage":"valor"},"turns":[["A","Do come in. Mind the coffin.","Pasa. Cuidado con el ataúd."],["B","Quite the waiting room!","¡Menuda sala de espera!"],["A","Eternal patients, eternal patience.","Pacientes eternos, paciencia eterna."],["B","Clever sign! Love it!","¡Letrero ingenioso! ¡Me encanta!"],["A","Which fang aches, mortal?","¿Qué colmillo duele, mortal?"],["B","Left one. Throbbing!","El izquierdo. ¡Late!"],["A","Ah, classic midnight molar.","Ah, clásico molar nocturno."],["B","Midnight molar? Really?","¿Molar nocturno? ¿En serio?"],["A","Teeth keep vampire hours.","Los dientes viven de noche."],["B","Mine certainly do!","¡Los míos de fijo!"],["A","Open wide. Wider. There.","Abre grande. Más. Ahí."],["B","Is it dreadful?","¿Es terrible?"],["A","Merely dramatic. Breathe.","Meramente dramático. Respira."],["B","Breathing. Sort of!","¡Respirando. Casi!"],["A","Curious: I faint at blood.","Curioso: me desmayo con sangre."],["B","A vampire dentist?! Irony!","¿¡Dentista vampiro!? ¡Ironía!"],["A","Hence the tomato-juice breaks.","Por eso pausas de jugo tomate."],["B","Tomato juice! Smart!","¡Jugo tomate! ¡Listo!"],["A","Courage, doctor! Suction ready!","¡Valor, doctor! ¡Succión lista!"],["B","Coaching my own dentist!","¡Animo a mi dentista!"],["A","You steady me, mortal.","Me estabilizas, mortal."],["B","Teamwork makes fangs work!","¡Equipo hace colmillos!"],["A","Rinse with moonwater.","Enjuaga con agua lunar."],["B","Minty moonwater! Fresh!","¡Agua lunar menta! ¡Fresco!"],["A","Fangs file themselves nightly.","Colmillos se liman de noche."],["B","Good to know!","¡Bueno saber!"],["A","Avoid garlic-floss. Obviously.","Evita hilo-ajo. Obvio."],["B","Obviously! Noted!","¡Obvio! ¡Anotado!"],["A","Your smile outlives centuries.","Tu sonrisa sobrevive siglos."],["B","Best compliment ever!","¡Mejor cumplido!"],["A","Invoice: one brave story.","Factura: una historia valiente."],["B","Paid in full! Bye, Doc!","¡Pagado total! ¡Adiós, Doc!"],["A","Fang-tastic visit! Return!","¡Visita colmillástica! ¡Vuelve!"],["B","In a century or two!","¡En un siglo o dos!"],["A","Floss daily, sparkle nightly!","¡Hilo diario, brillo nocturno!"],["B","Rhyming dentist! Fun!","¡Dentista rimador! ¡Diversión!"],["A","Rhymes numb the nerves!","¡Rimas adormecen nervios!"],["B","Nerves officially numb!","¡Nervios oficialmente dormidos!"],["A","X-ray: moonbeam scan!","¡Rayos X: escáner lunar!"],["B","Glowing molars on screen!","¡Molares brillando en pantalla!"],["A","Every filling tells tales!","¡Cada empaste cuenta cuentos!"],["B","Two centuries of tales!","¡Dos siglos de cuentos!"],["A","This one: waltz in Vienna!","¡Este: vals en Viena!"],["B","Dancing filling! Ha!","¡Empaste bailarín! ¡Ja!"],["A","That one: storm at sea!","¡Ese: tormenta en mar!"],["B","Salty filling! Arrgh!","¡Empaste salado! ¡Arrgh!"],["A","Memoirs of a molar!","¡Memorias de un molar!"],["B","Bestseller material!","¡Material bestseller!"],["A","Brush in circles, dear bat!","¡Cepilla en círculos, murciélago!"],["B","Circles, not sawing!","¡Círculos, no serrar!"],["A","Sawing scares enamel!","¡Serrar asusta esmalte!"],["B","Enamel sends thanks!","¡Esmalte agradece!"],["A","Next patient: grumpy gargoyle!","¡Próximo: gárgola gruñona!"],["B","Good luck, Doctor!","¡Suerte, Doctor!"],["A","Stone teeth, stone patience!","¡Dientes piedra, paciencia piedra!"],["B","Rock-solid dentist!","¡Dentista roca sólida!"],["A","Fly safe, moonchild!","¡Vuela segura, hija lunar!"],["B","Cape fluttering! Farewell!","¡Capa flameando! ¡Adiós!"],["A","Remember: smile immortal!","¡Recuerda: sonrisa inmortal!"],["B","Immortally smiling! Bye!","¡Sonriendo inmortal! ¡Adiós!"]]},{"id":"alien","name":"Zyx from Kepler","icon":"👽","level":"C1","place":"School gym · exchange day","desc":"Alumno de intercambio de Kepler-442b: tres ojos, cero modales, gran corazón.","voice":{"gender":"f","pitch":1.3,"rate":1},"story":{"en":"Exchange day at school. Your new classmate has three eyes, zero manners, and a huge heart.","es":"Día de intercambio en la escuela. Tu nuevo compañero tiene tres ojos, cero modales y gran corazón."},"vocab":{"planet":"planeta","earth":"tierra","school":"escuela","friend":"amigo/a","different":"diferente","curious":"curioso/a","universe":"universo","star":"estrella","learn":"aprender","home":"hogar"},"turns":[["A","Greetings, Earth-classmate!","¡Saludos, compañero-Tierra!"],["B","Hi! I am Alex!","¡Hola! ¡Soy Alex!"],["A","I am Zyx. Third eye blinking.","Soy Zyx. Tercer ojo parpadea."],["B","Blinking means happy?","¿Parpadear es feliz?"],["A","Happy! Curious! Slightly hungry!","¡Feliz! ¡Curioso! ¡Hambriento leve!"],["B","Cafeteria is that way!","¡Cafetería por allá!"],["A","Earth food: strange squares!","¡Comida Tierra: cuadrados raros!"],["B","Pizza! Try pizza!","¡Pizza! ¡Prueba pizza!"],["A","Triangular fuel! Acceptable!","¡Combustible triangular! ¡Aceptable!"],["B","High praise from Zyx!","¡Gran elogio de Zyx!"],["A","Explain: homework. Why?","Explica: tarea. ¿Por qué?"],["B","Practice makes brains grow!","¡Práctica hace cerebros!"],["A","Kepler learns through naps!","¡Kepler aprende durmiendo siestas!"],["B","Naps?! Lucky planet!","¿¡Siestas?! ¡Planeta suertudo!"],["A","Trade systems? Sleepy math?","¿Intercambio? ¿Mate dormida?"],["B","Deal! Best trade ever!","¡Trato! ¡Mejor cambio!"],["A","Explain: football. Odd ritual!","Explica: fútbol. ¡Rito raro!"],["B","Kick ball, scream goal!","¡Patea, grita gol!"],["A","Screaming approved! Goooal!","¡Grito aprobado! ¡Goool!"],["B","Natural Earthling already!","¡Terrícola natural ya!"],["A","Your sky: single moon?","¿Tu cielo: una luna?"],["B","One moon. Yours?","Una luna. ¿Las tuyas?"],["A","Three moons. Triple tides!","Tres lunas. ¡Triple marea!"],["B","Surfing must be wild!","¡Surf debe ser salvaje!"],["A","Take me surfing someday!","¡Llévame a surfear!"],["B","Deal! Board for three eyes!","¡Trato! ¡Tabla para tres ojos!"],["A","Friendship: universal homework!","¡Amistad: tarea universal!"],["B","Completed daily! Promise!","¡Diaria cumplida! ¡Prometo!"],["A","Zyx will miss Earth!","¡Zyx extrañará Tierra!"],["B","Earth will miss Zyx!","¡Tierra extrañará a Zyx!"],["A","Signal me with flashlights!","¡Señálame con linternas!"],["B","Three flashes nightly!","¡Tres destellos nocturnos!"],["A","Across stars, classmates forever!","¡Entre estrellas, compañeros siempre!"],["B","Forever, Zyx! Safe travels!","¡Por siempre, Zyx! ¡Buen viaje!"],["A","Recess: explain tag!","¡Recreo: explica mancha!"],["B","Run! You are it!","¡Corre! ¡Tú la llevas!"],["A","It?! Honorable role!","¿¡La lleva?! ¡Rol honorable!"],["B","Fastest it ever!","¡La más rápida jamás!"],["A","Three eyes spot all!","¡Tres ojos ven todo!"],["B","No hiding from Zyx!","¡Nadie se esconde de Zyx!"],["A","Victory dance: tentacles?","¿Baile victoria: tentáculos?"],["B","No tentacles? Arms fine!","¿Sin tentáculos? ¡Brazos bien!"],["A","Arms wiggle acceptably!","¡Brazos se menean aceptable!"],["B","Wiggle champion!","¡Campeona del meneo!"],["A","Lunch: mystery meat?","¿Almuerzo: carne misterio?"],["B","Chicken nuggets! Safe!","¡Nuggets de pollo! ¡Seguro!"],["A","Nuggets: universal peace food!","¡Nuggets: comida paz universal!"],["B","Peace through nuggets!","¡Paz vía nuggets!"],["A","Dessert: ice cream clouds!","¡Postre: nubes heladas!"],["B","Brain freeze warning!","¡Alerta de cerebro helado!"],["A","Kepler heads immune!","¡Cabezas Kepler inmunes!"],["B","Show-off alien!","¡Alien presumido!"],["A","Proudly show-offing!","¡Presumiendo orgulloso!"],["B","Class photo time!","¡Hora de foto grupal!"],["A","Which eye looks?","¿Qué ojo mira?"],["B","All three! Cheese!","¡Los tres! ¡Sonríe!"],["A","Cheesiest grin recorded!","¡Sonrisa cursi grabada!"],["B","Framed in gym!","¡Enmarcada en el gym!"],["A","Gym of legends!","¡Gimnasio de leyendas!"],["B","Legend Zyx! Bye!","¡Leyenda Zyx! ¡Adiós!"]]}];
const LEVEL_INFO={"A1":{t:"Primeros pasos",d:"Saludos y presente simple",c:"#4fe3a5"},"A2":{t:"Vida cotidiana",d:"Pasado y rutinas",c:"#6cc8ff"},"B1":{t:"Independencia",d:"Condicionales y opiniones",c:"#ffcf5c"},"B2":{t:"Fluidez",d:"Phrasal verbs y matices",c:"#ff7d7d"},"C1":{t:"Dominio",d:"Estructuras avanzadas",c:"#c4a5ff"},"Conversación":{t:"Charla real",d:"Frases nativas del día a día",c:"#ff8fb2"}};
const TICKER=[["Break a leg!","¡Mucho éxito!"],["It's raining cats and dogs","Llueve a cántaros"],["Piece of cake","Pan comido"],["Once in a blue moon","Muy de vez en cuando"],["Under the weather","Indispuesto / malito"],["Cost an arm and a leg","Costar un ojo de la cara"],["Better late than never","Mejor tarde que nunca"],["Practice makes perfect","La práctica hace al maestro"],["So far so good","Hasta ahora, todo bien"],["No pain, no gain","Sin esfuerzo no hay recompensa"],["Time flies!","¡El tiempo vuela!"],["Hit the road","Ponerse en camino"]];

/* ═══════════════════════════════ ESTADO / MEMORIA ═══════════════════════════════ */
const DB_KEY="lingolab_v1";
/* Versión de la app. Si tocas el código, súbela: el marcador del panel y el
   aviso de caché usan este número para decirte si lo tienes fresco. */
const V="v10";
/* micMode: "auto" (celular=pulsar, PC=corrido) | "pulsar" (un toque=una frase) | "corrido" (libre)
   noise:    "off" | "normal" | "strict"  (filtro antiruido)
   alwaysES: mostrar el español sin depender del botón 👁 */
const SET_DEF={rate:0.95,voice:null,micMode:"auto",noise:"normal",alwaysES:true};
function defaultState(){return{xp:0,streak:0,lastEarn:null,todayXP:0,todayDate:todayStr(),goal:60,log:{},words:{},lessonsDone:{},reading:{},dialogs:{},hist:{pron:[],dic:[],wr:[],quiz:[]},ach:[],set:Object.assign({},SET_DEF),firstRun:true};}
let state;
try{state=Object.assign(defaultState(),JSON.parse(localStorage.getItem(DB_KEY)||"{}"));}catch(e){state=defaultState();}
state.hist=Object.assign({pron:[],dic:[],wr:[],quiz:[]},state.hist||{});state.set=Object.assign({},SET_DEF,state.set||{});
function save(){try{localStorage.setItem(DB_KEY,JSON.stringify(state));}catch(e){}}
if(state.todayDate!==todayStr()){state.todayXP=0;state.todayDate=todayStr();}
if(state.lastEarn&&state.lastEarn!==todayStr()&&state.lastEarn!==yestStr())state.streak=0;

/* ─── Preferencias de micrófono y traducción ─── */
const isTouch=()=>{try{return matchMedia("(pointer:coarse)").matches||navigator.maxTouchPoints>0;}catch(e){return false;}};
/* Modo efectivo del micrófono. "auto" se resuelve una vez y se recuerda. */
function micMode(){
  const m=state.set.micMode;
  if(m==="pulsar"||m==="corrido")return m;
  return isTouch()?"pulsar":"corrido";
}
function setMicMode(m){
  state.set.micMode=(m==="pulsar"||m==="corrido")?m:"auto";
  save();paintMicModes();
  toast(state.set.micMode==="auto"?"Micrófono: automático (celular = un toque)":"Micrófono: "+(state.set.micMode==="pulsar"?"un toque por frase":"corrido"),"🎤");
}
/* Filtro antiruido: 0 = off, 1 = normal, 2 = estricto */
const noiseLevel=()=>state.set.noise==="strict"?2:state.set.noise==="normal"?1:0;
/* ¿El español se muestra siempre? Entonces los botones 👁 quedan informativos. */
const esAlways=()=>state.set.alwaysES!==false;
const esOn=flag=>esAlways()||!!flag;
/* Pinta el estado de los botones de modo (mic) y de traducción (👁) en las barras. */
function paintMicModes(){
  const esPulsar=micMode()==="pulsar";
  ["btnRdMode","btnDgMode"].forEach(id=>{
    const b=$(id);if(!b)return;
    b.textContent=esPulsar?"👆 Pulsar":"🎧 Corrido";
    b.classList.toggle("active",esPulsar);
    b.setAttribute("aria-pressed",esPulsar?"true":"false");
    b.title=esPulsar
      ?"Un toque, hablas una frase y el micrófono se cierra (mejor en celular)"
      :"Micrófono abierto de corrido: lees el capítulo entero sin parar";
  });
  const flags={btnRdEs:()=>rdShowEs,btnDgEs:()=>dgShowEs};
  Object.keys(flags).forEach(id=>{
    const b=$(id);if(!b)return;
    if(esAlways()){
      b.textContent="👁 ES siempre";b.classList.add("always");b.disabled=true;
      b.title="El español se muestra siempre (cámbialo en Tu progreso → Ajustes)";
    }else{
      b.disabled=false;b.classList.remove("always");
      b.textContent=flags[id]()?"🙈 ES":"👁 ES";
      b.title="Mostrar u ocultar la traducción";
    }
  });
  pintarRuido();
}

function knownCount(){return Object.values(state.words).filter(w=>w.st==="known").length;}
function refreshHeader(){
  $("streakVal").textContent=state.streak;
  const lvl=Math.floor(state.xp/150)+1;$("lvlNum").textContent=lvl;
  $("xpLabel").textContent=state.xp+" XP";
  $("xpFill").style.width=((state.xp%150)/150*100)+"%";
}
function addXP(n,reason){
  if(!n||n<=0)return;n=Math.round(n);
  state.xp+=n;const d=todayStr();
  state.todayXP=(state.todayDate===d?state.todayXP:0)+n;state.todayDate=d;
  state.log[d]=(state.log[d]||0)+n;
  if(state.lastEarn!==d){state.streak=(state.lastEarn===yestStr())?state.streak+1:1;state.lastEarn=d;}
  refreshHeader();floatXP(n);save();checkAch();
  if(state.todayXP>=state.goal&&state.todayXP-n<state.goal)toast("¡Meta diaria cumplida! 🙌","🏅");
}
const ACHS=[
 {id:"first",icon:"🌱",name:"Primer paso",desc:"Gana tu primera XP",cond:()=>state.xp>0},
 {id:"w10",icon:"📚",name:"Curioso",desc:"10 palabras dominadas",cond:()=>knownCount()>=10},
 {id:"w50",icon:"🧠",name:"Coleccionista",desc:"50 palabras dominadas",cond:()=>knownCount()>=50},
 {id:"w100",icon:"🏆",name:"Lexicógrafo",desc:"100 palabras dominadas",cond:()=>knownCount()>=100},
 {id:"s3",icon:"🔥",name:"Constancia",desc:"Racha de 3 días",cond:()=>state.streak>=3},
 {id:"s7",icon:"☄️",name:"Imparable",desc:"Racha de 7 días",cond:()=>state.streak>=7},
 {id:"l3",icon:"🎓",name:"Estudiante",desc:"Completa 3 lecciones",cond:()=>Object.keys(state.lessonsDone).length>=3},
 {id:"p95",icon:"🎙️",name:"Lengua nativa",desc:"95%+ en pronunciación",cond:()=>state.hist.pron.some(h=>h.s>=95)},
 {id:"d100",icon:"👂",name:"Oído de oro",desc:"100% en un dictado",cond:()=>state.hist.dic.some(h=>h.s>=100)},
 {id:"q10",icon:"🎯",name:"Francotirador",desc:"Quiz perfecto 10/10",cond:()=>state.hist.quiz.some(h=>h.c===10)},
 {id:"r1",icon:"📖",name:"Lector oscuro",desc:"Completa tu primer cuento",cond:()=>Object.values(state.reading||{}).some(r=>r.finished)},
 {id:"r10",icon:"⛓️",name:"Esclavo de la sombra",desc:"Completa los 10 cuentos",cond:()=>Object.values(state.reading||{}).filter(r=>r.finished).length>=10},
 {id:"d1",icon:"🎭",name:"Primera escena",desc:"Completa tu primer diálogo",cond:()=>Object.values(state.dialogs||{}).some(r=>r.finished)},
 {id:"d10",icon:"🎬",name:"Actor de sombras",desc:"Completa los 10 diálogos",cond:()=>Object.values(state.dialogs||{}).filter(r=>r.finished).length>=10}
];
function checkAch(){ACHS.forEach(a=>{if(!state.ach.includes(a.id)&&a.cond()){state.ach.push(a.id);toast("Logro desbloqueado: "+a.name,a.icon);}});save();}

/* ═══════════════════════════════ MOTOR DE VOZ (TTS + voces neurales) ═══════════════════════════════
   Ranking: Microsoft Natural/Neural (Edge, las más bonitas) > Google US English >
   resto en-US > resto en. speak() acepta {pitch, rate, gender, prefer} sin romper llamadas viejas. */
let VOICES=[];
function rankVoice(v){
  const n=(v.name||"")+" "+(v.voiceURI||"");const lang=v.lang||"";
  let s=0;
  if(/natural|neural/i.test(n))s+=100;
  if(/microsoft/i.test(n)&&/online/i.test(n))s+=40;
  if(/google/i.test(n)&&/en[-_]US/i.test(lang))s+=60;
  if(/^(Jenny|Aria|Guy|Ana|Christopher|Eric|Michelle|Roger|Steffan|Emma|Brian| libby)/i.test(v.name||""))s+=25;
  if(/en[-_]US/i.test(lang))s+=20;else if(/^en/i.test(lang))s+=8;else s-=50;
  if(/ (compact|mobile)/i.test(n))s-=15;
  return s;
}
function pickVoice(opt){
  opt=opt||{};
  if(!opt.forceAuto&&state.set.voice){const v=VOICES.find(v=>v.voiceURI===state.set.voice);if(v)return v;}
  if(!VOICES.length)return null;
  let pool=VOICES.filter(v=>/^en/i.test(v.lang||""));
  if(!pool.length)pool=VOICES.slice();
  if(opt.gender){
    const g=pool.filter(v=>new RegExp(opt.gender==="f"?"Jenny|Aria|Michelle|Emma|Ana|Jane|Samantha|Zira|female":"Guy|Christopher|Eric|Roger|Brian|David|male","i").test((v.name||"")+" "+(v.voiceURI||"")));
    if(g.length)pool=g;
  }
  if(opt.prefer){
    const p=pool.filter(v=>new RegExp(opt.prefer,"i").test((v.name||"")+" "+(v.voiceURI||"")));
    if(p.length)pool=p;
  }
  return pool.slice().sort((a,b)=>rankVoice(b)-rankVoice(a))[0]||null;
}
function edgeNeuralCount(){return VOICES.filter(v=>/natural|neural/i.test((v.name||"")+" "+(v.voiceURI||""))&&/^en/i.test(v.lang||"")).length;}
let neuralTipShown=false;
function maybeNeuralTip(){
  if(neuralTipShown)return;neuralTipShown=true;
  try{
    const isEdge=/Edg\//.test(navigator.userAgent||"");
    if(!isEdge&&VOICES.length&&edgeNeuralCount()===0)
      setTimeout(()=>toast("Tip: abre en Edge para voces más bonitas","🎙️"),4000);
  }catch(e){}
}
function loadVoices(){
  if(!("speechSynthesis" in window))return;
  try{VOICES=speechSynthesis.getVoices()||[];}catch(e){VOICES=[];}
  const sel=$("voiceSel");if(!sel)return;
  if(!VOICES.length)return; /* Chrome carga voces async: no vaciar el select hasta tener datos */
  const cur=sel.value||state.set.voice;
  const ens=VOICES.filter(v=>/^en/i.test(v.lang));
  const list=ens.length?ens:VOICES;
  sel.innerHTML=list.map(v=>'<option value="'+escA(v.voiceURI)+'">'+escH(v.name+" ("+v.lang+")")+"</option>").join("")||"<option value=''>Sin voces disponibles</option>";
  if(cur&&[...sel.options].some(o=>o.value===cur))sel.value=cur;
  else if(state.set.voice&&[...sel.options].some(o=>o.value===state.set.voice))sel.value=state.set.voice;
}
/* `onvoiceschanged` como addEventListener, NO como asignación: pet.js también
   quiere escucharlo, y con `=` el segundo pisa al primero y loadVoices deja de
   ejecutarse (el selector de voz de Ajustes se quedaba vacío). */
if("speechSynthesis" in window){
  try{speechSynthesis.addEventListener("voiceschanged",loadVoices);}catch(e){speechSynthesis.onvoiceschanged=loadVoices;}
  loadVoices();
}
/* En Android speechSynthesis se corta a los ~15 s: un capítulo entero sonaba a
   la mitad. Troceamos por frases y las encadenamos. */
function trocear(texto,max){
  const out=[];let cur="";
  String(texto).split(/(?<=[.!?…])\s+/).forEach(s=>{
    if(!cur){cur=s;return;}
    if((cur+" "+s).length<=max){cur+=" "+s;}
    else{out.push(cur);cur=s;}
  });
  if(cur)out.push(cur);
  return out.length?out:[texto];
}
let speakToken=0;
let ttsOn=false;
/* Un único motor de voz para TODA la app (incluida Crispy).
   speakToken invalida cualquier audio anterior, y callarTTS() corta el actual. */
function callarTTS(){
  speakToken++;
  ttsOn=false;
  try{if("speechSynthesis" in window)speechSynthesis.cancel();}catch(e){}
}
function speak(text,rateMul,voiceOpt,done){
  if(!("speechSynthesis" in window)){toast("Este navegador no soporta síntesis de voz","⚠️");return;}
  if(!text)return;
  const token=++speakToken;
  ttsOn=true;
  const finish=()=>{if(token!==speakToken)return;ttsOn=false;if(voiceOpt&&voiceOpt.then)voiceOpt.then();if(done)done();};
  /* FIX "se come el principio": en Chrome, cancel() seguido de speak() en el MISMO
     tick descarta los primeros ~100-200 ms del audio nuevo. Por eso la primera
     vez que pulsabas se oía cortado y a la segunda no. Ahora: si ya suena algo,
     lo paramos y esperamos un tick antes de empezar el nuevo. */
  const arrancar=()=>{
    if(token!==speakToken)return;          /* alguien empezó otro audio mientras */
    try{
      const partes=trocear(text,220);
      const u=new SpeechSynthesisUtterance(partes[0]);
      const v=pickVoice(voiceOpt);if(v)u.voice=v;
      const r=(Number(state.set.rate)||0.95)*(rateMul||1)*((voiceOpt&&voiceOpt.rate)||1);
      u.rate=Math.min(2,Math.max(0.5,r));
      u.pitch=Math.min(2,Math.max(0,(voiceOpt&&voiceOpt.pitch)||1));
      u.lang=v?v.lang:"en-US";
      const seguir=()=>{
        if(token!==speakToken)return;
        if(partes.length<=1){finish();return;}
        const n=new SpeechSynthesisUtterance(partes[1]);
        if(v)n.voice=v;
        n.rate=u.rate;n.pitch=u.pitch;n.lang=u.lang;
        n.onend=seguir;
        n.onerror=()=>{if(token===speakToken)finish();};
        try{speechSynthesis.speak(n);}catch(e){}
      };
      u.onend=seguir;u.onerror=seguir;
      speechSynthesis.speak(u);
    }catch(e){toast("No se pudo reproducir el audio","⚠️");}
  };
  try{
    const sonando=typeof speechSynthesis!=="undefined"&&(speechSynthesis.speaking||speechSynthesis.pending);
    if(sonando){speechSynthesis.cancel();setTimeout(arrancar,60);}
    else arrancar();
  }catch(e){arrancar();}
  maybeNeuralTip();
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-say]");if(b){e.preventDefault();speak(b.dataset.say);}});

/* ═══════════════════════════════ CORRECTOR POTENTE ═══════════════════════════════ */
function normalizeText(s){return String(s).toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9'\s]/g," ").replace(/\s+/g," ").trim();}
const CONTRA={"i'm":"i am","you're":"you are","he's":"he is","she's":"she is","it's":"it is","we're":"we are","they're":"they are","isn't":"is not","aren't":"are not","wasn't":"was not","weren't":"were not","don't":"do not","doesn't":"does not","didn't":"did not","can't":"can not","won't":"will not","wouldn't":"would not","shouldn't":"should not","couldn't":"could not","i've":"i have","you've":"you have","we've":"we have","they've":"they have","i'll":"i will","you'll":"you will","he'll":"he will","she'll":"she will","we'll":"we will","they'll":"they will","i'd":"i would","you'd":"you would","we'd":"we would","that's":"that is","there's":"there is","what's":"what is","here's":"here is","let's":"let us"};
function expandWords(arr){return arr.flatMap(w=>(CONTRA[w]||w).split(" "));}
function wd(a,b){
  const m=a.length,n=b.length;if(Math.abs(m-n)>3)return 99;
  const dp=Array.from({length:m+1},(_,i)=>new Array(n+1).fill(0));
  for(let i=0;i<=m;i++)dp[i][0]=i;for(let j=0;j<=n;j++)dp[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  return dp[m][n];
}
function near(a,b){if(a===b)return true;const d=wd(a,b);return d===1||(d===2&&Math.max(a.length,b.length)>=6&&(a.slice(0,2)===b.slice(0,2)||a.slice(-2)===b.slice(-2)));}
function align(target,said){
  const m=target.length,n=said.length,dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));
  for(let i=0;i<=m;i++)dp[i][0]=i;for(let j=0;j<=n;j++)dp[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(target[i-1]===said[j-1]?0:1.4));
  const pairs=[];let i=m,j=n;
  while(i>0||j>0){
    if(i>0&&j>0&&dp[i][j]===dp[i-1][j-1]+(target[i-1]===said[j-1]?0:1.4)){pairs.unshift({t:target[i-1],s:said[j-1]});i--;j--;}
    else if(i>0&&dp[i][j]===dp[i-1][j]+1){pairs.unshift({t:target[i-1],s:null});i--;}
    else if(j>0){pairs.unshift({t:null,s:said[j-1]});j--;}
    else break;
  }
  return pairs;
}
function grade(refRaw,userRaw){
  const tRef=expandWords(normalizeText(refRaw).split(" ").filter(Boolean));
  const tSay=expandWords(normalizeText(userRaw).split(" ").filter(Boolean));
  const pairs=align(tRef,tSay);
  let ok=0,nr=0;
  const chips=pairs.map(p=>{
    if(p.t===null)return{w:p.s,cls:"extra"};
    if(p.s===p.t){ok++;return{w:p.t,cls:"ok"};}
    if(p.s!==null&&near(p.t,p.s)){nr++;return{w:p.t,cls:"near",said:p.s};}
    if(p.s===null)return{w:p.t,cls:"miss"};
    return{w:p.t,cls:"bad",said:p.s};
  });
  const score=tRef.length?Math.min(100,Math.round(100*(ok+0.6*nr)/tRef.length)):0;
  return{score,chips,ok,nr};
}
function renderChips(chips,box){
  box.innerHTML=chips.filter(c=>c.cls!=="extra").map(c=>{
    let lbl=escH(c.w);if(c.said&&c.cls!=="ok")lbl+='<span style="opacity:.65;font-size:11px"> ⟵ '+escH(c.said)+"</span>";
    return '<span class="chipw '+c.cls+'" data-say="'+escA(c.w)+'" title="Clic para escuchar">'+lbl+"</span>";
  }).join("");
}
function scoreColor(s){return s>=80?"#4fe3a5":s>=50?"#ffcf5c":"#ff7d7d";}

/* ═══════════════════════════════ FILTRO ANTIRUIDO ═══════════════════════════════
   En el celular, con el micrófono abierto de corrido, un ruido ambiente mínimo
   (un ventilador, la tele de fondo) llegaba a Chrome como transcripción válida:
   la frase se calificaba en rojo y la app avanzaba sola. Aquí se separa VOZ de
   RUIDO en dos capas.

   Capa A · transcripción. Descarta lo que no puede ser una frase English hablada:
   vacío, sin letras, solo muletillas, marcadores tipo [inaudible], o una palabra
   repetida. Barato y siempre activo.

   Capa B · Web Audio. Analiza el señal del micrófono en paralelo al reconocedor
   para distinguir una persona de un ruido: la voz concentra energía en 300-3400 Hz
   y es modulada (picos y valles); un ventilador o el tráfico reparten la energía y
   suben los agudos. Se guarda un búfer circular porque el reconocedor entrega el
   resultado DESPUÉS de que terminó la frase.

   Falla segura: si el navegador no da muestras (en algunos Android el reconocedor
   toma el micro en exclusivo) la Capa B se desactiva sola y solo queda la A.
   Nunca se puede quedar la app sin calificar. */
const Antirruido=(function(){
  const MURO={off:0,normal:0.34,strict:0.52};
  let ctx=null,analyser=null,stream=null,timeBuf=null,freqBuf=null,raf=0;
  let listo=false,probado=false,avisoMudo=false;
  let picos=[],descartados=0,vacio=0;
  const LIMIT=1.6; /* seg de historial suficiente para cubrir el retardo del SR */

  function nivelUmbral(){return MURO[state.set.noise]||0;}

  function medir(){
    if(!listo||!analyser)return 0;
    analyser.getFloatTimeDomainData(timeBuf);
    let energia=0;for(let i=0;i<timeBuf.length;i++)energia+=timeBuf[i]*timeBuf[i];
    const rms=Math.sqrt(energia/timeBuf.length);
    analyser.getByteFrequencyData(freqBuf);
    /* bins: 0-3500 Hz = banda de voz, 3500-8000 = agudos. Con fftSize 2048 en
       48 kHz cada bin ≈ 23 Hz; usamos proporciones para no depender del sampleRate. */
    const n=freqBuf.length;
    const iVoz=Math.floor(n*0.073), iAgudo=Math.floor(n*0.34);
    let voz=0,agudo=0;
    for(let i=0;i<iVoz;i++)voz+=freqBuf[i];
    for(let i=iAgudo;i<n;i++)agudo+=freqBuf[i];
    const total=voz+agudo+1;
    const rmsN=Math.min(1,rms/0.09);
    const ratio=voz/total;
    /* 0 = siseo plano, 1 = voz concentrada en graves medios */
    const concentracion=Math.max(0,Math.min(1,(ratio-0.35)/0.45));
    const score=rmsN*concentracion;
    const t=performance.now();
    picos.push({t,score});
    while(picos.length&&t-picos[0].t>LIMIT*1000)picos.shift();
    return score;
  }
  /* Falla segura: si el analizador nunca recibe señal (en algunos Android el
     reconocedor toma el micro en exclusivo) la Capa B no sirve aquí y se apaga
     sola, para no quedarse descartando la voz de la niña. */
  function chequeoMudo(score){
    if(avisoMudo)return;
    if(score>0.0008){vacio=0;return;}
    if(++vacio<14)return;
    avisoMudo=true;apagar();
    toast("El detector de ruido no funciona aquí: queda solo el filtro básico","ℹ️");
  }
  function bucle(){
    chequeoMudo(medir());
    if(listo)raf=requestAnimationFrame(bucle);
  }
  /* Cierra el stream y permite volver a abrirlo en el próximo uso.
     No liberamos `probado` al fallar getUserMedia, para no pedir el permiso
     una y otra vez si el navegador lo está rechazando. */
  function apagar(){
    if(raf)cancelAnimationFrame(raf);raf=0;
    if(stream){try{stream.getTracks().forEach(t=>t.stop());}catch(e){}stream=null;}
    ctx=null;analyser=null;listo=false;picos=[];probado=false;
  }
  /* Devuelve true si lo último que se oyó parece voz. level>0 siempre es true. */
  function esVoz(){
    const u=nivelUmbral();
    if(u<=0||!listo||!picos.length)return true; /* sin filtro: no bloquea nada */
    let max=0;const t=performance.now();
    for(let i=picos.length-1;i>=0;i--){if(t-picos[i].t>LIMIT*1000)break;if(picos[i].score>max)max=picos[i].score;}
    return max>=u;
  }
  /* Se llama DENTRO del clic del usuario: pide el micro una sola vez y lo
     recuerda igual que el reconocedor. Si falla, no insisto. */
  function iniciar(){
    if(probado)return;probado=true;
    if(nivelUmbral()<=0)return;
    if(!navigator.mediaDevices||!window.AudioContext)return;
    navigator.mediaDevices.getUserMedia({audio:true}).then(s=>{
      stream=s;
      ctx=new AudioContext();
      const src=ctx.createMediaStreamSource(s);
      analyser=ctx.createAnalyser();
      analyser.fftSize=2048;analyser.smoothingTimeConstant=0.6;
      src.connect(analyser);
      timeBuf=new Float32Array(analyser.fftSize);
      freqBuf=new Uint8Array(analyser.frequencyBinCount);
      listo=true;raf=requestAnimationFrame(bucle);
    }).catch(()=>{apagar();});
  }
  function reiniciar(){vacio=0;}
  return{iniciar,apagar,esVoz,reiniciar,get descartados(){return descartados;},set descartados(v){descartados=v;},get activo(){return listo;}};
})();
/* ¿Lo que se ha oído es una persona hablando inglés, o ruido?
   ref = frase objetivo (opcional). Si el filtro está apagado, siempre true. */
const MULETILLA=/^(u|um|uh|ah|ahum|eh|er|hm|hmm|mhm|huh|sh|shh|mm|yo|yeah|hey|oh|hmph)+$/;
function esVozReal(texto,ref){
  const nivel=noiseLevel();
  if(nivel<=0)return true;
  const t=String(texto||"")
    .replace(/\[[^\]]*\]/g," ")
    .replace(/[.,!?;:"“”¡¿()]/g," ")
    .toLowerCase().replace(/\s+/g," ").trim();
  if(!t)return false;                                              // nada
  if(/\b(inaudible|musica|sonido|aplausos|tormenta|chiurrido|ruido|palpitacion)\b/.test(t))return false; // marcador del navegador
  if(t.replace(/\s/g,"").length<3)return false;                   // "uh", "a", "..."
  const w=t.split(" ").filter(Boolean);
  if(w.every(x=>MULETILLA.test(x)))return false;                  // solo muletillas
  if(new Set(w).size===1&&w.length>=3)return false;              // "the the the"
  /* Una o dos palabras sueltas solo pasan si coinciden con el objetivo:
     si no, lo que entró fue un sonido, no una frase. */
  if(w.length<=2&&ref){
    const r=expandWords(normalizeText(ref).split(" ").filter(Boolean));
    if(r.length&&!w.some(x=>r.includes(x)))return false;
  }
  return Antirruido.esVoz();
}
function marcarRuido(){Antirruido.descartados++;const e=$("noiseCount");if(e)e.textContent="🔇 "+Antirruido.descartados+" ruidos descartados";}
function pintarRuido(){const e=$("noiseCount");if(e&&!Antirruido.descartados)e.textContent=noiseLevel()?"🛡 filtro antiruido activo":"filtro desactivado";}

/* ═══════════════════════════════ RECONOCIMIENTO DE VOZ (sin doble prompt) ═══════════════════════════════
   FIX: antes se pedía getUserMedia + SpeechRecognition (doble prompt) y se hacía
   await antes de rec.start(), rompiendo el gesto de usuario. Ahora SOLO se usa
   SpeechRecognition con start() síncrono dentro del clic. Chrome/Edge recuerda el
   permiso únicamente en https:// o http://localhost — en file:// siempre re-pregunta. */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition||null;
let rec=null,recActive=false,recTargetI=0,recResuelto=false,prIntento=0,prMostrado=-1;
/* Frase objetivo congelada al pulsar el micro, para que "Saltar" durante la
   escucha no califique tu voz contra otra frase. */
function refFrase(){return (prQ[recTargetI]&&prQ[recTargetI][0])||(prQ[prI]&&prQ[prI][0])||"";}
function isUntrustedOrigin(){
  const p=location.protocol,h=location.hostname;
  return !(p==="https:"||h==="localhost"||h==="127.0.0.1"||p==="chrome-extension:");
}
function paintMicState(){
  const el=$("prMicState");if(!el)return;
  if(!SR){el.textContent="⚠️ este navegador no soporta reconocimiento (usa Chrome o Edge)";el.style.color="var(--coral)";return;}
  if(isUntrustedOrigin()){
    el.textContent="⚠️ abierto como archivo local: Chrome pedirá permiso CADA vez. Usa Live Server (localhost) o HTTPS para que lo recuerde";
    el.style.color="var(--amber)";return;
  }
  if(navigator.permissions&&navigator.permissions.query){
    navigator.permissions.query({name:"microphone"}).then(r=>{
      if(r.state==="granted"){el.textContent="🎤 micrófono permitido — Chrome ya no debe preguntar";el.style.color="var(--mint)";}
      else if(r.state==="denied"){el.textContent="🚫 micrófono bloqueado — permite en el candado 🔒 de la barra";el.style.color="var(--coral)";}
      else{el.textContent="🔒 la primera vez Chrome pedirá permiso (normal), luego lo recuerda";el.style.color="var(--dim)";}
      r.onchange=paintMicState;
    }).catch(()=>{el.textContent="🔒 la primera vez se pedirá permiso, luego se recuerda (en localhost/HTTPS)";el.style.color="var(--dim)";});
  }else{el.textContent="🔒 la primera vez se pedirá permiso, luego se recuerda (en localhost/HTTPS)";el.style.color="var(--dim)";}
}
/* Instancia ÚNICA reutilizable: crear una nueva en cada clic es lo que provoca el prompt repetido */
function getRec(){
  if(rec)return rec;
  rec=new SR();rec.lang="en-US";rec.interimResults=false;rec.maxAlternatives=5;rec.continuous=false;
  rec.onresult=e=>{
    /* Chrome dispara onresult MÁS DE UNA VEZ para la misma frase. Antes se
       llamaba a showPrResult() en cada disparo: confeti, celebración, rebote
       de la tarjeta y XP repetidos, y renglones duplicados en el historial.
       Ahora: solo resultados finales, desde resultIndex, y como máximo una
       calificación por intento. */
    if(!recActive)return;
    if(recResuelto)return;
    let mejor=null;
    for(let k=e.resultIndex;k<e.results.length;k++){
      const res=e.results[k];
      if(!res.isFinal)continue;
      for(let j=0;j<res.length;j++){
        const t=res[j].transcript;
        const g=grade(refFrase(),t);
        if(!mejor||g.score>mejor.score)mejor={score:g.score,text:t,grade:g};
      }
      break; /* solo el primer final del lote */
    }
    if(!mejor||!mejor.grade)return;
    if(!esVozReal(mejor.text,refFrase())){marcarRuido();recResuelto=true;stopListening();return;}
    recResuelto=true;
    showPrResult(mejor.grade,mejor.text);
  };
  rec.onerror=e=>{
    if(e.error==="not-allowed"||e.error==="service-not-allowed"){
      paintMicState();
      toast("Permiso denegado. Revisa el candado 🔒 del navegador y usa localhost/HTTPS","⚠️");
    }else if(e.error==="audio-capture"){
      toast("No se encontró micrófono. Conecta uno y reintenta","⚠️");
    }else if(e.error!=="aborted"&&e.error!=="no-speech"){
      toast("No se detectó audio. Intenta de nuevo","⚠️");
    }
  };
  rec.onend=()=>{recActive=false;const b=$("btnPrRec");if(b)b.classList.remove("recording");const eq=$("eqBars");if(eq)eq.classList.remove("on");const l=$("prRecLbl");if(l)l.textContent="TOCA PARA HABLAR";};
  return rec;
}
/* Arranque SÍNCRONO dentro del gesto del clic: sin awaits previos. */
function startListening(){
  if(!SR){toast("Reconocimiento no disponible — usa el modo texto","⚠️");return;}
  if(recActive){try{getRec().stop();}catch(e){}return;}
  if(isUntrustedOrigin()){
    toast("Estás en file:// — Chrome preguntará cada vez. Usa Live Server para que recuerde el permiso","⚠️");
  }
  let r;
  try{r=getRec();}catch(e){toast("No se pudo iniciar el micrófono","⚠️");return;}
  recTargetI=prI; /* congela la frase objetivo para evitar calificar contra otra si presionas Saltar */
  recResuelto=false; /* un intento = una calificación */
  prIntento++;        /* nuevo intento: permite un (y solo un) resultado nuevo */
  recActive=true;$("btnPrRec").classList.add("recording");$("eqBars").classList.add("on");$("prRecLbl").textContent="ESCUCHANDO… HABLA AHORA";
  try{r.start();}
  catch(e){recActive=false;$("btnPrRec").classList.remove("recording");$("eqBars").classList.remove("on");$("prRecLbl").textContent="TOCA PARA HABLAR";}
}
function stopListening(){
  recActive=false;recResuelto=false;
  try{if(rec)rec.abort();}catch(e){}
  const b=$("btnPrRec");if(b)b.classList.remove("recording");
  const eq=$("eqBars");if(eq)eq.classList.remove("on");
  const l=$("prRecLbl");if(l)l.textContent="TOCA PARA HABLAR";
}

/* ═══════════════════════════════ NAVEGACIÓN ═══════════════════════════════ */
const RENDER={panel:renderPanel,vocab:renderVocab,lecciones:renderLessons,lectura:renderLib,dialogs:renderDgLib,pron:renderPron,dictado:renderDic,escritura:renderWr,quiz:renderQuizHome,progreso:renderProg};
let curView="panel";
function go(v){
  curView=v;
  /* Al salir de la sección el micrófono se cierra. Antes seguía abierto:
     cambiabas a Vocabulario y la escena seguía calificando sola de fondo. */
  if(v!=="lectura")rdPause();
  if(v!=="dialogs")dgPause();
  if(v!=="pron")stopListening();
  /* Y el audio también: si no, la voz de la lección o de la mascota seguía
     sonando en la sección siguiente (el "audio fantasma" al salir). */
  callarTTS();
  /* Crispy se calla al salir del Panel, como pediste. */
  try{if(v!=="panel"&&window.Crispy)window.Crispy.callar();}catch(e){}
  document.querySelectorAll(".view").forEach(s=>s.hidden=true);
  $("view-"+v).hidden=false;
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===v));
  RENDER[v]();window.scrollTo({top:0,behavior:"smooth"});
}
/* Al bloquear el móvil o cambiar de pestaña, el micro se cierra: si no, el
   reconocedor sigue consumiendo y calificando lo que se oiga de fondo. */
document.addEventListener("visibilitychange",()=>{if(document.hidden){rdPause();dgPause();stopListening();}});
window.addEventListener("pagehide",()=>{rdPause();dgPause();stopListening();Antirruido.apagar();});
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));
document.addEventListener("click",e=>{const g=e.target.closest("[data-goto]");if(g)go(g.dataset.goto);});

/* ═══════════════════════════════ PANEL ═══════════════════════════════ */
function renderPanel(){
  const f=new Date().toLocaleDateString("es",{weekday:"long",day:"numeric",month:"long"});
  $("dateLine").textContent=f.charAt(0).toUpperCase()+f.slice(1);
  const idx=Math.floor(Date.now()/86400000)%WORDS.length;const w=WORDS[idx];
  $("wotdGhost").textContent=w.en[0].toUpperCase();
  $("wotdWord").textContent=w.en;$("wotdIpa").textContent="/"+w.ipa+"/";
  $("wotdEs").textContent=w.es;$("wotdEx").textContent="“"+w.ex+"”";$("wotdExEs").textContent=w.exEs;
  $("wotdSpeak").onclick=()=>speak(w.en+". "+w.ex);
  $("wotdLearn").onclick=()=>markKnown(w.en);
  $("pStreak").textContent=state.streak;$("pXp").textContent=state.xp;$("pWords").textContent=knownCount();
  const scores=[...state.hist.pron,...state.hist.dic,...state.hist.wr].map(h=>h.s);
  $("pAcc").textContent=scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)+"%":"—";
  const pct=Math.min(100,Math.round(state.todayXP/state.goal*100));
  $("goalRingC").style.strokeDashoffset=314-(314*pct/100);
  $("goalPct").textContent=pct+"%";$("goalXpTxt").textContent=state.todayXP+" / "+state.goal;
  const box=$("weekChart");box.innerHTML="";let tot=0;
  for(let n=6;n>=0;n--){
    const k=dayKey(n),v=state.log[k]||0;tot+=v;
    const d=document.createElement("div");d.style.cssText="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px";
    const h=Math.max(6,Math.min(100,v?4+Math.min(96,v*1.2):4));
    d.innerHTML='<span class="mono" style="font-size:11px;color:'+(v?"var(--amber)":"var(--dim)")+'">'+(v||"·")+'</span><div style="width:100%;max-width:44px;height:'+h+'px;border-radius:7px 7px 3px 3px;background:'+(v?"linear-gradient(180deg,var(--amber),var(--amber2))":"#152535")+';transition:height .6s"></div><span class="mono dim" style="font-size:10px">'+new Date(k+"T12:00").toLocaleDateString("es",{weekday:"short"})+"</span>";
    box.appendChild(d);
  }
  $("weekTotal").textContent="Total: "+tot+" XP";
}

/* ═══════════════════════════════ VOCABULARIO ═══════════════════════════════ */
let vCat="Todas",vStat="all",vQ="";
function wordStatus(en){const w=state.words[en];return w?w.st:"new";}
/* Una sola fuente de verdad para la vista y para las tarjetas: si no, el botón
   "Tarjetas" armaba el mazo con las 122 palabras e ignoraba los filtros. */
function vocabFiltrada(){
  const q=vQ.toLowerCase().trim();
  return WORDS.filter(w=>(vCat==="Todas"||w.cat===vCat)&&
    (vStat==="all"||wordStatus(w.en)===vStat)&&
    (!q||w.en.toLowerCase().includes(q)||w.es.toLowerCase().includes(q)));
}
function markKnown(en,silent){
  const rec=state.words[en]||{};const wasKnown=rec.st==="known";
  state.words[en]={...rec,st:"known"};save();
  if(!wasKnown){addXP(5,"palabra dominada");if(!silent)toast("«"+en+"» dominada · +5 XP","📗");}
  if(curView==="vocab")renderVocabGrid();
  if(curView==="panel")renderPanel();
}
function renderVocab(){
  const cats=["Todas",...Object.keys(VOCAB)];
  $("catChips").innerHTML=cats.map(c=>'<button class="chip'+(c===vCat?" active":"")+'" data-cat="'+escA(c)+'">'+escH(c)+"</button>").join("");
  document.querySelectorAll("#catChips .chip").forEach(b=>b.onclick=()=>{vCat=b.dataset.cat;renderVocab();});
  document.querySelectorAll("#statChips .chip").forEach(b=>b.onclick=()=>{vStat=b.dataset.vf;document.querySelectorAll("#statChips .chip").forEach(x=>x.classList.toggle("active",x===b));renderVocabGrid();});
  renderVocabGrid();
}
function renderVocabGrid(){
  const list=vocabFiltrada();
  $("vocabCount").textContent=list.length+" palabras en vista · "+WORDS.length+" en la biblioteca total";
  $("vocabGrid").innerHTML=list.map(w=>{
    const st=wordStatus(w.en);
    const stLbl={new:"nueva",learning:"aprendiendo",known:"dominada"}[st];
    const CAT_COLORS=["#4fe3a5","#6cc8ff","#ffcf5c","#ff7d7d","#c4a5ff","#ff8fb2","#7ee787","#79c0ff","#ffa657","#d2a8ff","#a5f3fc","#fda4af"];
    const catC=CAT_COLORS[w.ci%CAT_COLORS.length];
    const stDot=st==="known"?"var(--mint)":st==="learning"?"var(--amber)":"var(--dim)";
    return '<div class="card lift wcard"><div class="w-top"><div><div class="w-en">'+escH(w.en)+' <span title="'+stLbl+'" style="display:inline-block;width:9px;height:9px;border-radius:50%;background:'+stDot+';vertical-align:middle"></span></div><div class="w-ipa">/'+escH(w.ipa)+'/</div><div class="w-es">'+escH(w.es)+'</div></div><button class="btn sky say" data-say="'+escA(w.en)+'. '+escA(w.ex)+'" title="Escuchar" aria-label="Escuchar '+escA(w.en)+'">🔊</button></div><div class="w-ex">“'+escH(w.ex)+'”<br><span class="dim">'+escH(w.exEs)+"</span></div><div class='w-foot'><span class='tag' style='background:"+catC+"22;color:"+catC+"'>"+escH(w.cat)+' · '+stLbl+"</span><button class='chip' data-know='"+escA(w.en)+"'>"+(st==="known"?"✓ dominada":"marcar dominada")+"</button></div></div>";
  }).join("")||'<div class="card" style="grid-column:1/-1;text-align:center;color:var(--dim)">Sin resultados para esa búsqueda 🔍</div>';
  document.querySelectorAll("[data-know]").forEach(b=>b.onclick=()=>markKnown(b.dataset.know));
}
$("vocabSearch").addEventListener("input",e=>{vQ=e.target.value;renderVocabGrid();});

/* ── Flashcards ──
   El mazo sale de la MISMA lista que estás viendo: si filtras por categoría o
   por estado, las tarjetas respetan ese filtro. Antes usaba WORDS enteros y
   salían las 122 palabras aunque tuvieras un filtro puesto. */
let fcQ=[],fcI=0,fcTotal=0;
$("btnFlash").onclick=()=>{
  const vista=vocabFiltrada();
  const sinDominar=vista.filter(w=>wordStatus(w.en)!=="known");
  /* Prioriza lo no dominado, pero si ya lo dominaste todo, repasa lo filtrado. */
  const pool=sinDominar.length>=4?sinDominar:vista;
  if(!pool.length){toast("No hay palabras con ese filtro","🔍");return;}
  fcQ=shuffle(pool).slice(0,Math.min(15,pool.length));fcI=0;fcTotal=fcQ.length;
  if(!fcQ.length)return;
  const ambito=vCat==="Todas"?(vQ?"búsqueda "+vQ:""):vCat;
  $("flashModal").hidden=false;showFc();
  toast("Tarjetas de "+ambito+": "+fcTotal+" palabras","🃏");
};
function showFc(){
  const w=fcQ[fcI];
  if(!w){closeFlash();return;}
  $("flashCard").classList.remove("flip");
  $("flashEn").textContent=w.en;$("flashIpa").textContent="/"+w.ipa+"/";
  $("flashEs").textContent=w.es;$("flashEx").textContent="“"+w.ex+"”";$("flashExEs").textContent=w.exEs;
  $("flashProgress").textContent="TARJETA "+(fcI+1)+" / "+fcTotal;
}
$("flashCard").onclick=()=>$("flashCard").classList.toggle("flip");
$("btnPrFlashSpeak").onclick=()=>{if(fcQ[fcI])speak(fcQ[fcI].en+". "+fcQ[fcI].ex);};
function closeFlash(){$("flashModal").hidden=true;fcQ=[];fcI=0;if(curView==="vocab")renderVocabGrid();}
function fcAdvance(mark){
  const w=fcQ[fcI];
  if(!w){closeFlash();return;}
  if(mark==="again"){if(fcQ.length<30){fcQ.push(w);fcTotal=fcQ.length;}else{toast("Límite de reintentos: sigue con las demás","⚠️");}}
  else if(mark==="almost"){state.words[w.en]={...(state.words[w.en]||{}),st:"learning"};save();}
  else markKnown(w.en,true);
  fcI++;
  if(fcI>=fcQ.length){closeFlash();addXP(10,"sesión de tarjetas");toast("Sesión de tarjetas completada · +10 XP","🃏");return;}
  showFc();
}
$("btnAgain").onclick=()=>fcAdvance("again");
$("btnAlmost").onclick=()=>fcAdvance("almost");
$("btnKnow").onclick=()=>fcAdvance("know");
$("btnCloseFlash").onclick=closeFlash;
$("flashModal").addEventListener("click",e=>{if(e.target===$("flashModal"))closeFlash();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("flashModal").hidden)closeFlash();});

/* ═══════════════════════════════ LECCIONES ═══════════════════════════════ */
let lpLvl=null,lpI=0,lpShowEs=false;
function renderLessons(){
  $("levelsGrid").innerHTML=LEVELS.map(l=>{
    const info=LEVEL_INFO[l],done=state.lessonsDone[l];
    return '<div class="card lift lv-card" data-lvl="'+escA(l)+'"><div class="row" style="align-items:flex-start;gap:14px"><div class="lv-dot" style="background:'+info.c+'">'+escH(l)+'</div><div style="flex:1"><div style="font-family:var(--disp);font-weight:800;font-size:19px">'+escH(info.t)+'</div><div class="mut" style="font-size:13.5px">'+escH(info.d)+'</div><div class="mono dim mg-t" style="font-size:11px">'+SENTENCES[l].length+' FRASES · '+(done?"<span style='color:var(--mint)'>✓ COMPLETADA</span>":"PENDIENTE")+'</div></div></div></div>';
  }).join("");
  document.querySelectorAll(".lv-card").forEach(c=>c.onclick=()=>startLesson(c.dataset.lvl));
  $("lessonPlayer").hidden=true;$("lpDone").hidden=true;$("levelsGrid").style.display="";
}
/* ═══════════════════════════════ LECCIONES (lección guiada de 4 pasos) ═══════════════════════════════
   Antes esta sección solo reproducía 12 frases por nivel con "Escuchar / Traducción /
   La domino": no comprobaba nada, no daba nota y repetía el mismo contenido que
   Dictado y Escritura. Ahora cada frase recorre 4 pasos reales:

     1 ESCUCHA   la oyes (con repetir y lento)
     2 ENTIENDE  ves el español y respondes a una pregunta de comprensión
     3 REPITE    te califica con el micrófono (opcional, se puede saltar)
     4 DOMINAS   decides si la sabes, y entra en el repaso automático

   El progreso se guarda por nivel, no como un booleano. */
let lpN=0,lpQuiz=null,lpNota=null,lpMarcas={},lpRec=null;
const PASOS=["Escucha","Entiende","Repite","Dominas"];
function lpEstado(l){
  const total=SENTENCES[l].length;
  let e=state.lessonsDone[l];
  if(e===true)e={done:total,total:total,weak:[]};               /* formato viejo */
  if(!e||typeof e!=="object")e={done:0,total,weak:[]};
  if(typeof e.done!=="number")e.done=0;
  if(!Array.isArray(e.weak))e.weak=[];
  e.total=total;
  return e;
}
function renderLessons(){
  $("levelsGrid").innerHTML=LEVELS.map(l=>{
    const info=LEVEL_INFO[l],e=lpEstado(l);
    const pct=Math.round(e.done/e.total*100);
    const completo=pct>=100;
    return '<div class="card lift lv-card" data-lvl="'+escA(l)+'"><div class="row" style="align-items:flex-start;gap:14px"><div class="lv-dot" style="background:'+info.c+'">'+escH(l)+'</div><div style="flex:1"><div style="font-family:var(--disp);font-weight:800;font-size:19px">'+escH(info.t)+'</div><div class="mut" style="font-size:13.5px">'+escH(info.d)+'</div>'
      +'<div class="bar-track mg-t" style="max-width:220px"><i style="width:'+pct+'%;background:'+info.c+'"></i></div>'
      +'<div class="mono dim mg-t" style="font-size:11px">'+e.done+'/'+e.total+' frases · '+(completo?"<span style='color:var(--mint)'>✓ COMPLETADA</span>":pct>0?"<span style='color:var(--amber)'>▶ CONTINUAR</span>":"EMPEZAR")+(e.weak.length?" · <span style='color:var(--coral)'>"+e.weak.length+" a repasar</span>":"")+'</div></div></div></div>';
  }).join("");
  document.querySelectorAll(".lv-card").forEach(c=>c.onclick=()=>startLesson(c.dataset.lvl));
  $("lessonPlayer").hidden=true;$("lpDone").hidden=true;$("levelsGrid").style.display="";
}
function startLesson(l){
  lpLvl=l;lpI=0;lpMarcas={};
  const e=lpEstado(l);
  /* si hay frases marcadas para repasar, empezamos por la primera */
  if(e.weak.length){lpI=Math.max(0,Math.min(e.weak[0],SENTENCES[l].length-1));toast("Empezamos por una frase a repasar","🔁");}
  $("levelsGrid").style.display="none";$("lpDone").hidden=true;$("lessonPlayer").hidden=false;
  lpPaso(lpMarcas[lpI]?4:1);
}
/* ── El motor de los 4 pasos ── */
function lpPaso(n){
  lpN=n;
  const s=SENTENCES[lpLvl][lpI];
  if(!s){lpFin();return;}
  const total=SENTENCES[lpLvl].length;
  $("lpTitle").textContent=lpLvl+" · "+LEVEL_INFO[lpLvl].t.toUpperCase()+" · FRASE "+(lpI+1)+"/"+total;
  /* Barra de pasos */
  $("lpSteps").innerHTML=PASOS.map((p,i)=>
    '<span class="lp-step'+(i+1===lpN?" on":i+1<lpN?" ok":"")+'"><b>'+(i+1)+'</b>'+p+'</span>'
  ).join('<i class="lp-sep"></i>');
  $("lpEn").textContent="“"+s[0]+"”";
  $("lpEs").hidden=true;$("lpEs").textContent=s[1];
  $("lpBar").style.width=(lpI/total*100)+"%";
  $("lpMeta").textContent=Math.round(lpI/total*100)+"% de la lección";
  $("lpStage").hidden=false;
  $("lp1").hidden=lpN!==1;$("lp2").hidden=lpN!==2;$("lp3").hidden=lpN!==3;$("lp4").hidden=lpN!==4;
  $("lpEsBtn").hidden=lpN!==2;
  if(lpN===1)speak(s[0]);
  if(lpN===2)lpMontarQuiz(s);
  if(lpN===3)lpPrepararMicro(s);
  if(lpN===4)lpPintarDominas();
}
function lpAvanzar(){
  try{LingoMagic.Sounds.click();}catch(e){}
  lpI++;
  if(lpI>=SENTENCES[lpLvl].length){lpFin();return;}
  lpPaso(1);
}
/* Paso 2: pregunta de comprensión. La respuesta buena es la traducción; las
   distractoras se toman de otras frases del mismo nivel para que no se aprenda
   la posición, sino el significado. */
function lpMontarQuiz(s){
  const nivel=SENTENCES[lpLvl];
  const otras=shuffle(nivel.filter(x=>x[1]!==s[1])).map(x=>x[1]);
  lpQuiz={ok:s[1],malas:otras.slice(0,2),elegida:false};
  lpNota=null;
  const box=$("lpQuizBox");box.innerHTML="";
  const ops=shuffle([s[1]].concat(otras.slice(0,2)));
  const botones=[];
  ops.forEach(o=>{
    const b=document.createElement("button");
    b.className="q-opt";b.dataset.es=o;b.textContent=o;
    b.style.textAlign="left";
    b.onclick=()=>lpResponder(o===lpQuiz.ok,b);
    box.appendChild(b);botones.push(b);
  });
  const noSe=document.createElement("button");
  noSe.className="btn ghost sm";noSe.style.width="100%";noSe.style.marginTop="8px";
  noSe.textContent="🤷 No lo sé";
  noSe.onclick=()=>lpResponder(null,null);
  box.appendChild(noSe);
  lpQuiz.botones=botones;
  $("lpQuizFb").hidden=true;
  $("lp2Next").hidden=true;
}
function lpResponder(acierto,elegido){
  if(!lpQuiz||lpQuiz.elegida)return;
  lpQuiz.elegida=true;
  lpQuiz.botones.forEach(b=>{
    b.disabled=true;
    if(elegido===b)b.classList.add(acierto?"good":"wrong");
    else if(!acierto&&b.dataset.es===lpQuiz.ok)b.classList.add("good");
  });
  lpNota=acierto?100:0;
  lpQuizBox(!!acierto);
}function lpQuizBox(acierto){
  const fb=$("lpQuizFb");
  fb.hidden=false;
  fb.textContent=acierto?"✅ ¡Exacto! Esa es la traducción.":"ℹ️ Esta era la buena. Léela en voz alta y guárdatela.";
  $("lpQuizBox").querySelectorAll("button").forEach(b=>b.disabled=true);
  $("lp2Next").hidden=false;
  try{acierto?LingoMagic.Sounds.great():LingoMagic.Sounds.click();}catch(e){}
  if(esAlways()||lpShowEs)$("lpEs").hidden=false;
}
/* Paso 3: repetir con el micro, usando el corrector que ya existe. */
function lpPrepararMicro(s){
  lpNota=null;
  const tiene=!!SR;
  $("lp3MicBtn").hidden=!tiene;
  $("lp3MicLbl").hidden=!tiene;
  $("lp3Skip").hidden=false;
  $("lp3Box").hidden=true;
  $("lp3Hint").textContent=tiene?"Toca el micro y lee la frase en inglés: te la corrijo.":"Tu navegador no reconoce la voz, pero puedes leerla en voz alta igualmente.";
  $("lp3Back").hidden=false;
}
function lpMic(){
  if(!SR){toast("Este navegador no reconoce la voz. Léela en voz alta y sigue.","ℹ️");lpPaso(4);return;}
  if(lpNota!=null)return;
  const s=SENTENCES[lpLvl][lpI];
  const btn=$("lp3MicBtn");
  if(btn.classList.contains("recording")){try{lpRec.stop();}catch(e){}return;}
  if(!lpRec)lpRec=new SR();
  lpRec.lang="en-US";lpRec.continuous=false;lpRec.interimResults=false;lpRec.maxAlternatives=5;
  lpRec.onresult=e=>{
    let best={score:-1,g:null,text:""};
    for(let k=e.resultIndex;k<e.results.length;k++){
      const r=e.results[k];if(!r.isFinal)continue;
      for(let j=0;j<r.length;j++){const t=r[j].transcript;const g=grade(s[0],t);if(g.score>best.score)best={score:g.score,g,text:t};}
      break;
    }
    if(!best.g)return;
    if(!esVozReal(best.text,s[0])){toast("Eso no sonó a voz. Inténtalo otra vez","🔇");pintaLpMic(false);return;}
    lpNota=best.g.score;
    const box=$("lp3Box");box.hidden=false;
    $("lp3Score").textContent=best.g.score+"%";
    $("lp3Score").style.color=scoreColor(best.g.score);
    renderChips(best.g.chips,$("lp3Diff"));
    $("lp3Heard").textContent="🎧 "+best.text;
    try{best.g.score>=70?LingoMagic.Sounds.great():LingoMagic.Sounds.good();}catch(e){}
    if(best.g.score>=95)confetti();
    $("lp3Next").hidden=false;$("lp3Again").hidden=false;
    pintaLpMic(false);
  };
  lpRec.onend=()=>pintaLpMic(false);
  lpRec.onerror=()=>{pintaLpMic(false);toast("No se pudo escuchar. Inténtalo otra vez","⚠️");};
  try{lpRec.start();pintaLpMic(true);}catch(e){pintaLpMic(false);}
}
function pintaLpMic(on){
  const b=$("lp3MicBtn");if(!b)return;
  b.classList.toggle("recording",on);
  $("lp3MicLbl").textContent=on?"ESCUCHANDO… HABLA AHORA":"🎤 Repetir la frase";
}
/* Paso 4: decide si la dominas. */
function lpPintarDominas(){
  const s=SENTENCES[lpLvl][lpI];
  $("lp4Frase").textContent="“"+s[0]+"”";
  $("lp4Es").textContent=s[1];
  if(lpNota!=null){
    $("lp4Nota").hidden=false;
    $("lp4Nota").textContent=lpNota+"% al repetir";
    $("lp4Nota").style.color=scoreColor(lpNota);
  }else $("lp4Nota").hidden=true;
}
function lpMarcar(marca){
  const e=lpEstado(lpLvl);
  const clave=SENTENCES[lpLvl][lpI][0];
  lpMarcas[clave]=marca;
  if(marca==="si"){
    e.done=Math.min(e.total,Math.max(e.done,lpI+1));
    e.weak=e.weak.filter(i=>i!==lpI);
  }else e.weak=e.weak.includes(lpI)?e.weak:[...e.weak,lpI].sort((a,b)=>a-b);
  state.lessonsDone[lpLvl]=e;
  save();
  try{marca==="si"?LingoMagic.Sounds.great():LingoMagic.Sounds.click();}catch(e){}
  lpAvanzar();
}
function lpFin(){
  const e=lpEstado(lpLvl);
  const esNueva=!state.lessonsXp||!state.lessonsXp[lpLvl];
  $("lessonPlayer").hidden=true;
  if(e.done>=e.total){
    if(!state.lessonsXp)state.lessonsXp={};
    if(!state.lessonsXp[lpLvl]){
      state.lessonsXp[lpLvl]=1;
      addXP(20,"lección completa");confetti();
      try{LingoMagic.celebrate(3);}catch(e){}
    }
  }else if(esNueva){state.lessonsXp=state.lessonsXp||{};state.lessonsXp[lpLvl]=1;save();}
  $("lpDone").hidden=false;
  $("lpDoneTitle").textContent=e.done>=e.total?"¡Lección completa!":"Lección avanzar";
  $("lpDoneMsg").textContent=e.done>=e.total
    ? "+20 XP · las "+e.total+" frases de "+lpLvl+" están en tu repaso automático."
    : e.done+" de "+e.total+" frases vistas"+(e.weak.length?" · "+e.weak.length+" marcadas para repasar.":".");
  checkAch();
}
$("lpPlay").onclick=()=>speak(SENTENCES[lpLvl][lpI][0]);
$("lpSlow").onclick=()=>speak(SENTENCES[lpLvl][lpI][0],0.6);
$("lpAgain").onclick=()=>{lpPaso(1);};
$("lpEsBtn").onclick=()=>{
  if(esAlways()){toast("El español está siempre visible. Cámbialo en Tu progreso → Ajustes","👁");return;}
  lpShowEs=!lpShowEs;$("lpEs").hidden=!lpShowEs;
  $("lpEsBtn").textContent=lpShowEs?"🙈 Ocultar":"👁 Traducción";
};
$("lp2Next").onclick=()=>lpPaso(3);
$("lp3MicBtn").onclick=()=>lpMic();
$("lp3Next").onclick=()=>lpPaso(4);
$("lp3Again").onclick=()=>lpMic();
$("lp3Skip").onclick=()=>lpPaso(4);
$("lp3Back").onclick=()=>lpPaso(1);
$("lp4Si").onclick=()=>lpMarcar("si");
$("lp4Casi").onclick=()=>lpMarcar("casi");
$("lp4No").onclick=()=>lpMarcar("no");
$("lpNext").onclick=()=>{ if(lpN<4){lpPaso(lpN+1);return;} lpAvanzar(); };
$("lpExit").onclick=()=>{try{if(lpRec)lpRec.abort();}catch(e){}renderLessons();};
$("lpDoneBtn").onclick=()=>{try{if(lpRec)lpRec.abort();}catch(e){}renderLessons();};
$("lpAgain2").onclick=()=>{lpI=0;lpMarcas={};$("lpDone").hidden=true;lpPaso(1);};

/* ═══════════════════════════════ LECTURA NOVELA FLUIDA (1 mic, scroll continuo) ═══════════════════════════════
   Un cuento = un capítulo largo. Se segmenta por [, . ; : ! ?]. Cada frase se califica
   con grade() pero NUNCA bloquea: pinta nota y avanza. Clic en frase = saltar/repetir. */
let rdId=null,rdPhrases=[],rdEs=[],rdScores=[],rdReps={},rdIdx=0,rdShowEs=false,rdActive=false,rdRec=null,rdRestartT=null,rdLastPaint=0;
function rdGet(id){
  if(!state.reading)state.reading={};
  let r=state.reading[id];
  if(!r||Array.isArray(r.done)){ /* migra formato viejo {page,done[]} al nuevo */
    const old=r||{};
    r={pos:0,scores:[],reps:{},finished:!!old.finished};
    if(old.done&&old.done.length){const s=STORIES.find(x=>x.id===id);if(s){let doneCount=old.done.filter(Boolean).length;r.pos=Math.min(doneCount*4,999);}}
  }
  if(!Array.isArray(r.scores))r.scores=[];if(!r.reps)r.reps={};if(typeof r.pos!=="number")r.pos=0;
  state.reading[id]=r;return r;
}
/* Corta una frase por , . ; : ! ? — el separador se queda con la frase anterior.
   Devuelve los trozos evaluables (>=2 palabras). */
function rdCut(sentence){
  const parts=String(sentence||"").split(/([,.;:!?—]+["”']?\s*)/);
  const out=[];let cur="";
  parts.forEach(pt=>{cur+=pt;if(/[,.;:!?—]+["”']?\s*$/.test(pt)){const t=cur.trim();if(t.length>1&&t.split(" ").length>=2)out.push(t);cur="";}});
  if(cur.trim().length>1&&cur.trim().split(" ").length>=2)out.push(cur.trim());
  return out;
}
/* Alineación POR CONSTRUCCIÓN: cada frase EN se corta contra SU propia frase ES.
   Antes se aplanaba el cuento entero y se emparejaba por índice entre dos cortes
   distintos (uno para EN, otro para ES): en cuanto una coma no coincidía entre
   idiomas ("Dr Jekyll" vs "El Dr. Jekyll") TODAS las traducciones siguientes
   se desplazaban una frase — 17 de 30 cuentos mostraban el español de otra.
   Ahora el ES viaja con su EN: el primer trozo de la frase lo muestra, los
   siguientes heredan "" porque son coletillas del mismo enunciado. */
function rdNovel(id){
  const s=STORIES.find(x=>x.id===id);if(!s)return{en:[],es:[]};
  const en=[],es=[];
  s.pages.forEach(p=>{
    const n=Math.max((p.en||[]).length,(p.es||[]).length);
    for(let i=0;i<n;i++){
      const trozos=rdCut((p.en||[])[i]);
      let puesto=false;
      trozos.forEach(t=>{en.push(t);es.push(puesto?"":((p.es||[])[i]||""));if(!puesto)puesto=true;});
    }
  });
  return{en:en,es:es};
}
function rdDoneCount(id){const r=rdGet(id);return r.scores.filter(x=>x!=null).length;}
function renderLib(){
  rdPause();
  paintMicModes();
  $("rdReader").hidden=true;$("rdDone").hidden=true;
  const lib=$("rdLib");
  lib.innerHTML='<div class="story-grid">'+STORIES.map(s=>{
    const n=rdNovel(s.id).en.length||1;const nd=rdDoneCount(s.id);const r=rdGet(s.id);
    const pct=Math.round(nd/n*100);
    const lvlC=(LEVEL_INFO[s.level]&&LEVEL_INFO[s.level].c)||"#6cc8ff";
    return '<div class="card lift story-card" data-story="'+escA(s.id)+'">'
      +'<div class="cover"><span class="em">'+s.icon+'</span><span class="tag" style="background:'+lvlC+'22;color:'+lvlC+'">'+escH(s.level)+'</span></div>'
      +'<h3>'+escH(s.title)+'</h3><div class="orig">'+escH(s.orig)+'</div>'
      +'<p class="mut" style="font-size:13px;margin:8px 0">'+escH(s.desc)+'</p>'
      +'<div class="row" style="justify-content:space-between;margin-bottom:5px"><span class="mono dim" style="font-size:11px">'+nd+'/'+n+' frases · '+pct+'%</span><span class="mono" style="font-size:11px;color:'+(r.finished?"var(--mint)":"var(--amber)")+'">'+(r.finished?"✓ COMPLETO":nd>0?"▶ CONTINUAR":"EMPEZAR")+'</span></div>'
      +'<div class="bar-track"><i style="width:'+pct+'%;background:'+lvlC+'"></i></div></div>';
  }).join("")+"</div>";
  lib.querySelectorAll("[data-story]").forEach(c=>c.onclick=()=>openStory(c.dataset.story));
}
function openStory(id){
  rdPause();
  rdId=id;const nov=rdNovel(id);rdPhrases=nov.en;rdEs=nov.es;
  const r=rdGet(id);
  while(r.scores.length<rdPhrases.length)r.scores.push(null);
  rdScores=r.scores;rdReps=r.reps||{};rdIdx=Math.min(r.pos||0,Math.max(0,rdPhrases.length-1));
  paintMicModes();
  $("rdLib").innerHTML="";$("rdReader").hidden=false;$("rdDone").hidden=true;
  renderNovel(false);
  toast(micMode()==="pulsar"?"Toca el micro y lee una frase: se cierra solo":"Presiona ▶ una vez y lee de corrido","📖");
}
function rdStory(){return STORIES.find(s=>s.id===rdId);}
/* Render novela: párrafos de libro, frases clicables, palabras para mini-tip */
function renderNovel(){
  const s=rdStory();if(!s)return;
  const verEs=esOn(rdShowEs);
  $("rdTitle").textContent=s.icon+" "+s.title;
  $("rdOrig").textContent=s.orig+" · NIVEL "+s.level+" · 1 CAPÍTULO · "+rdPhrases.length+" FRASES";
  if(!esAlways())$("btnRdEs").textContent=rdShowEs?"🙈 ES":"👁 ES";
  const box=$("rdSents");box.innerHTML="";
  let p=document.createElement("p");p.className="bk drop";let inP=0;
  rdPhrases.forEach((sen,i)=>{
    if(inP>=4){box.appendChild(p);p=document.createElement("p");p.className="bk";inP=0;}
    const sc=rdScores[i];
    const words=sen.split(" ").map(tok=>{
      const clean=tok.toLowerCase().replace(/[^a-z'-]/g,"");
      return '<span class="rw" data-w="'+escA(clean||tok.toLowerCase())+'">'+escH(tok)+"</span>";
    }).join(" ");
    const ph=document.createElement("span");ph.className="ph";ph.dataset.i=i;
    let pill="";
    if(sc!=null){const cls=sc>=70?"good":sc>=40?"mid":"bad";pill='<span class="pill '+cls+'">'+sc+'%</span>';}
    ph.innerHTML=words+'<span class="rep" data-rep="'+i+'" title="Escuchar esta frase">🔊</span>'+pill
      +(verEs&&rdEs[i]?'<span class="ph-es">'+escH(rdEs[i])+"</span>":"");
    p.appendChild(ph);p.appendChild(document.createTextNode(" "));inP++;
  });
  box.appendChild(p);
  paintFluid(false);
}
function pillCls(sc){return sc>=70?"good":sc>=40?"mid":"bad";}
function paintFluid(scroll){
  const n=rdPhrases.length;if(!n)return;
  document.querySelectorAll("#rdSents .ph").forEach(el=>{
    const i=+el.dataset.i,sc=rdScores[i];
    el.classList.toggle("cur",i===rdIdx&&sc==null);
    el.classList.toggle("ok",sc!=null&&sc>=70);
    el.classList.toggle("low",sc!=null&&sc<70);
  });
  const done=rdScores.filter(x=>x!=null).length;
  const vals=rdScores.filter(x=>x!=null);
  const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
  $("rdMeta").textContent="FRASE "+Math.min(rdIdx+1,n)+"/"+n+" · MEDIA "+avg+"%"+(rdActive?" · ● ESCUCHANDO":"");
  $("rdBar").style.width=(done/n*100)+"%";
  $("rdLast").innerHTML=rdScores.map((sc,i)=>sc==null?"":'<span class="ln" style="color:'+(sc>=70?"var(--mint)":sc>=40?"var(--amber)":"var(--coral)")+'">f'+(i+1)+" · "+sc+"%</span>").filter(Boolean).slice(-6).join("");
  if(scroll){
    const now=Date.now();if(now-rdLastPaint<400)return;rdLastPaint=now;
    const cur=document.querySelector('#rdSents .ph[data-i="'+rdIdx+'"]');
    if(cur)cur.scrollIntoView({behavior:"smooth",block:"center"});
  }
}
function rdSpeakChapter(slow){
  if(!rdPhrases.length)return;
  speak(rdPhrases.join(" "),slow?0.55:1,null,()=>{pintarParada(false);});
  pintarParada(true);
}
/* Antes no había forma de cortar la lectura del capítulo: solo se paraba
   pulsando otro botón que también hablaba. */
function pintarParada(on){
  const p=$("btnRdStop");if(p)p.hidden=!on;
  const b=$("btnRdPlay");if(b)b.disabled=!!on;
}
$("btnRdStop").onclick=()=>{callarTTS();pintarParada(false);toast("Lectura detenida","⏸");};
$("btnRdPlay").onclick=()=>rdSpeakChapter(false);
$("btnRdSlow").onclick=()=>rdSpeakChapter(true);
$("btnRdEs").onclick=()=>{
  if(esAlways()){toast("El español está siempre visible. Cámbialo en Tu progreso → Ajustes","👁");return;}
  rdShowEs=!rdShowEs;renderNovel();
};
$("btnRdMode").onclick=()=>{
  const wasOn=rdActive;if(wasOn)rdPause();
  setMicMode(micMode()==="pulsar"?"corrido":"pulsar");
  if(wasOn)rdStart();
};
$("btnRdLib").onclick=()=>renderLib();
$("rdExit").onclick=()=>renderLib();
$("rdDoneBtn").onclick=()=>renderLib();
function rdFinishStory(){
  rdPause();
  const r=rdGet(rdId);
  r.pos=rdPhrases.length; /* fix: el puntero se quedaba en la penúltima frase */
  if(!r.finished){r.finished=true;save();addXP(25,"novela completa");confetti();}
  $("rdReader").hidden=true;$("rdDone").hidden=false;
  $("rdDoneMsg").textContent="+25 XP · "+rdStory().title+" completada. ¡Leíste la novela entera!";
  checkAch();
}
/* Mini-tooltip palabra: discreto, no pausa el mic, se auto-oculta */
let rdTipT=null;
function rdLookup(w){
  w=(w||"").toLowerCase().replace(/[^a-z'-]/g,"");if(!w)return"—";
  const s=rdStory();
  if(s){for(const p of s.pages){if(p.vocab&&p.vocab[w])return p.vocab[w];}}
  const hit=WORDS.find(x=>x.en.toLowerCase()===w);if(hit)return hit.es;
  return "—";
}
document.addEventListener("click",e=>{
  if(!$("view-lectura")||$("view-lectura").hidden)return;
  const tip=$("wordTip");
  const rep=e.target.closest("[data-rep]");
  if(rep){e.preventDefault();e.stopPropagation();rdSeek(+rep.dataset.rep,true);return;}
  const w=e.target.closest("#rdSents .rw");
  if(w){
    e.preventDefault();e.stopPropagation();
    const raw=w.dataset.w||w.textContent;
    $("wtEn").textContent=raw;$("wtEs").textContent=rdLookup(raw);
    $("wtSay").onclick=ev=>{ev.stopPropagation();speak(raw);};
    tip.hidden=false;
    tip.style.left=Math.min(innerWidth-200,Math.max(8,e.clientX-40))+"px";
    tip.style.top=Math.min(innerHeight-120,Math.max(8,e.clientY+14))+"px";
    clearTimeout(rdTipT);rdTipT=setTimeout(()=>{tip.hidden=true;},2500);
    return;
  }
  const ph=e.target.closest("#rdSents .ph");
  if(ph){mostrarAccionesFrase(+ph.dataset.i);return;}
  if(!tip.hidden&&!e.target.closest("#wordTip"))tip.hidden=true;
});
/* ── Barra de acciones de una frase ────────────────────────────────────────
   Antes, tocar una frase solo movía el puntero: no leías la frase ni podías
   empezar a leer desde ahí. Ahora al tocarla aparece una barrita con las tres
   cosas que sí quieres hacer: leerla, escucharla, o empezar desde ella. */
let rdAccionI=-1,rdAccionT=null;
function mostrarAccionesFrase(i){
  if(!rdPhrases.length)return;
  rdAccionI=i;
  const bar=$("rdActions");if(!bar)return;
  const frase=rdPhrases[i]||"";
  $("rdAccFrase").textContent=frase;
  $("rdAccEs").textContent=rdEs[i]||"";
  $("rdAccEs").hidden=!rdEs[i];
  bar.hidden=false;
  bar.style.left="8px";bar.style.right="8px";
  const r=rdIdx;
  paintFluid(false);
  /* si la frase ya está calificada, la mostramos con su nota */
  $("rdAccNota").textContent=rdScores[i]!=null?rdScores[i]+"%":"";
  void r;
  clearTimeout(rdAccionT);
  rdAccionT=setTimeout(()=>{if(rdAccionI===i)ocultarAcciones();},12000);
}
function ocultarAcciones(){
  const bar=$("rdActions");if(bar)bar.hidden=true;
  rdAccionI=-1;clearTimeout(rdAccionT);
}
/* Estos botones viven dentro de la barra de acciones: si el clic sube hasta el
   document, se cerraría. Detenemos la propagación, pero sin exigir que exista
   evento (el atajo de Enter llama a .click() sin argumentos). */
const noSubir=e=>{try{if(e&&e.stopPropagation)e.stopPropagation();}catch(err){}};
$("rdAccClose").onclick=e=>{noSubir(e);ocultarAcciones();};
/* "Saltar a la siguiente": también lo usa Enter (ver shortcuts.js). Si el micro
   está grabando, corta; si no, simplemente mueve el puntero. */
$("btnRdNext").onclick=e=>{noSubir(e);rdSaltar(1);};
$("dgBtnNext").onclick=()=>dgSaltar(1);
function rdSaltar(d){
  if(!rdPhrases.length)return;
  if(rdActive)rdPause();
  ocultarAcciones();
  const destino=rdIdx+d;
  if(destino>=rdPhrases.length){toast("Es la última frase","📖");return;}
  rdSeek(Math.max(0,destino),false);
}
function dgSaltar(d){
  if(!dgTurns.length)return;
  if(dgActive)dgPause();
  const destino=dgIdx+d;
  if(destino>=dgTurns.length){dgFinish();return;}
  dgSeek(Math.max(0,destino),false);
}
$("rdAccSay").onclick=e=>{noSubir(e);const i=rdAccionI;ocultarAcciones();if(i>=0)rdSeek(i,true);};
$("rdAccRead").onclick=e=>{
  noSubir(e);
  const i=rdAccionI;ocultarAcciones();
  if(i<0)return;
  rdSeek(i,false);
  /* En modo un toque no encendemos el micro solos: dejamos el puntero puesto
     y el botón grande esperando tu toque. En modo corrido, arrancamos. */
  if(micMode()==="corrido")rdStart();
  else toast("Listo: ahora toca el micro y lee desde esta frase","🎤");
};
$("wtClose").onclick=()=>{clearTimeout(rdTipT);tip.hidden=true;};
/* Saltar a frase: clic = solo mueve el puntero; 🔊 = mueve + la escuchas modelo */
function rdSeek(i,sayIt){
  if(!rdPhrases.length)return;
  rdIdx=Math.max(0,Math.min(i,rdPhrases.length-1));
  const r=rdGet(rdId);r.pos=rdIdx;save();paintFluid(true);
  if(sayIt){
    const was=rdActive;if(was)rdPause();
    r.reps[rdIdx]=(r.reps[rdIdx]||0)+1;save();
    speak(rdPhrases[rdIdx]);
    if(was){const t=setInterval(()=>{try{if(!speechSynthesis.speaking){clearInterval(t);rdStart();}}catch(e){clearInterval(t);}},600);}
  }
}
/* Mic: una sola instancia, dos comportamientos.
   corrido → continuous=true y se reenciende solo (una lectura, todo el capítulo)
   pulsar  → continuous=false: un toque = una frase, se detiene al terminar */
let rdErrs=0,rdPulsarFalso=false;
function rdGetRec(){
  if(rdRec)return rdRec;
  rdRec=new SR();rdRec.lang="en-US";rdRec.interimResults=true;rdRec.maxAlternatives=3;
  rdRec.onresult=e=>{
    if(!rdActive||!rdPhrases.length||rdIdx>=rdPhrases.length)return;
    for(let k=e.resultIndex;k<e.results.length;k++){
      const res=e.results[k];
      if(!res.isFinal)continue;
      let best={score:-1,text:"",g:null};
      for(let j=0;j<res.length;j++){const t=res[j].transcript;const g=grade(rdPhrases[rdIdx],t);if(g.score>best.score)best={score:g.score,text:t,g:g};}
      if(best.g)rdOnFluidFinal(best.g,best.text);
      break;
    }
  };
  rdRec.onerror=e=>{
    if(e.error==="not-allowed"||e.error==="service-not-allowed"){rdPause();paintMicState();toast("Permiso denegado. Revisa el candado 🔒 del navegador","⚠️");}
    else if(e.error==="audio-capture"){rdPause();toast("No se encontró micrófono. Conecta uno y reintenta","⚠️");}
    else if(e.error==="network"){rdErrs++;if(rdErrs>=3){rdPause();toast("El servicio de voz de Chrome falló. Revisa la conexión o usa otro navegador","⚠️");}}
  };
  /* Chrome corta la escucha larga: reenciende, pero con tope y espera creciente
     para no entrar en bucle infinito (drenaba la batería del celular). */
  rdRec.onend=()=>{
    if(!rdActive||rdPulsarFalso||rdErrs>=3)return;
    if(rdScores[rdIdx]!=null&&rdIdx>=rdPhrases.length-1){rdPause();return;}
    const espera=Math.min(2000,250+rdErrs*700);
    clearTimeout(rdRestartT);
    rdRestartT=setTimeout(()=>{if(rdActive&&!rdPulsarFalso){try{rdGetRec().start();}catch(err){rdPause();}}},espera);
  };
  return rdRec;
}
function rdPinta(on){
  const b=$("btnRdRec"),eq=$("rdEq"),l=$("rdRecLbl");
  if(b)b.classList.toggle("recording",!!on);
  if(eq)eq.classList.toggle("on",!!on);
  if(l)l.innerHTML=on
    ?'<span class="live-dot"></span>'+(rdPulsarFalso?"HABLA LA FRASE":"ESCUCHANDO — LEE DE CORRIDO")
    :(micMode()==="pulsar"?"👆 UN TOQUE Y LEE UNA FRASE":"▶ PRESIONA UNA VEZ Y LEE DE CORRIDO");
}
function rdStart(){
  if(!SR){toast("Sin reconocimiento: usa Chrome o Edge","⚠️");return;}
  if(!rdId||!rdPhrases.length){toast("Abre un cuento primero","📖");return;}
  if(rdIdx>=rdPhrases.length-1&&rdScores[rdScores.length-1]!=null){toast("Novela terminada","📖");return;}
  callarTTS(); /* que la voz modelo no se mezcle con tu lectura */
  rdErrs=0;rdActive=true;
  rdPulsarFalso=micMode()==="pulsar";
  const r=rdGetRec();
  r.continuous=!rdPulsarFalso; /* en modo pulsar: una frase y se apaga */
  Antirruido.iniciar();Antirruido.reiniciar();
  rdPinta(true);
  paintFluid(true);
  try{r.start();}catch(e){rdPause();}
}
function rdPause(){
  rdActive=false;rdPulsarFalso=false;clearTimeout(rdRestartT);
  try{if(rdRec)rdRec.abort();}catch(e){}
  /* El detector de ruido abría un segundo stream de micrófono. Si no lo
     apagamos aquí, se quedaba encendido (indicador del micro en rojo) aunque
     ya no estuvieras leyendo, y gastaba batería. */
  Antirruido.apagar();
  ocultarAcciones();
  rdPinta(false);
  if(rdId&&rdPhrases.length)paintFluid(false);
}
$("btnRdRec").onclick=()=>{rdActive?rdPause():rdStart();};
/* Cada frase se califica sola (30% = rojo) pero SIEMPRE se avanza */
function rdOnFluidFinal(g,heard){
  if(rdIdx>=rdPhrases.length)return;
  /* Filtro antiruido: si lo que se oyó no parece una persona, se descarta sin
     calificar y SIN avanzar. Antes el ruido marcaba rojo y saltaba de frase. */
  if(!esVozReal(heard,rdPhrases[rdIdx])){marcarRuido();paintFluid(false);return;}
  rdErrs=0;
  const modoPulsar=rdPulsarFalso;
  const i=rdIdx;rdScores[i]=g.score;
  const r=rdGet(rdId);r.scores=rdScores;save();
  const col=scoreColor(g.score);
  const el=document.querySelector('#rdSents .ph[data-i="'+i+'"]');
  if(el){const old=el.querySelector(".pill");if(old)old.remove();
    const pill=document.createElement("span");pill.className="pill "+pillCls(g.score);pill.textContent=g.score+"%";
    const es=el.querySelector(".ph-es");if(es)el.insertBefore(pill,es);else el.appendChild(pill);}
  $("rdResult").hidden=false;
  $("rdScore").textContent=g.score+"%";$("rdScore").style.color=col;
  renderChips(g.chips,$("rdDiff"));
  $("rdHeard").textContent="“"+(heard||"(nada)")+"”";
  const xp=g.score>=70?2:0;
  if(xp)addXP(xp,"lectura novela");
  $("rdXp").textContent=xp?("+"+xp+" XP · frase "+(i+1)+" marcada, sigo…"):("frase "+(i+1)+" · "+g.score+"% en rojo, sigo sin parar");
  if(g.score>=95)confetti();
  checkAch();
  /* En modo pulsar el micrófono se cierra solo tras calificar una frase. */
  if(modoPulsar)rdPause();
  if(i>=rdPhrases.length-1){if(!modoPulsar)rdPause();paintFluid(false);rdFinishStory();return;}
  rdIdx=i+1;r.pos=rdIdx;save();paintFluid(true);
}

/* ═══════════════════════════════ DIÁLOGOS (teatro por turnos, 1 mic) ═══════════════════════════════
   A = personaje (la app lo actúa con su voz), B = YOU (lo lees tú).
   ▶ una vez: la app habla los A, el mic te escucha los B, todo avanza sin parar. */
let dgId=null,dgTurns=[],dgScores=[],dgIdx=0,dgShowEs=false,dgActive=false,dgRec=null,dgRestartT=null,dgLastPaint=0,dgActToken=0;
function dgGet(id){
  if(!state.dialogs)state.dialogs={};
  let r=state.dialogs[id];
  if(!r||!Array.isArray(r.scores))r={pos:0,scores:[],finished:!!(r&&r.finished)};
  state.dialogs[id]=r;return r;
}
function dgDef(){return DIALOGS.find(d=>d.id===dgId);}
function dgCharVoice(){const d=dgDef();return d&&d.voice?{gender:d.voice.gender,pitch:d.voice.pitch,rate:d.voice.rate}:null;}
function renderDgLib(){
  dgPause();
  paintMicModes();
  $("dgReader").hidden=true;$("dgDone").hidden=true;
  $("dgLib").innerHTML='<div class="story-grid">'+DIALOGS.map(s=>{
    const r=dgGet(s.id);const bTotal=s.turns.filter(t=>t[0]==="B").length;
    const bDone=s.turns.filter((t,i)=>t[0]==="B"&&r.scores[i]!=null).length;
    const pct=Math.round((r.pos||0)/s.turns.length*100);
    const lvlC=(LEVEL_INFO[s.level]&&LEVEL_INFO[s.level].c)||"#6cc8ff";
    return '<div class="card lift story-card" data-dg="'+escA(s.id)+'">'
      +'<div class="cover"><span class="em">'+s.icon+'</span><span class="tag" style="background:'+lvlC+'22;color:'+lvlC+'">'+escH(s.level)+'</span></div>'
      +'<h3>'+escH(s.name)+'</h3><div class="orig">'+escH(s.place)+'</div>'
      +'<p class="mut" style="font-size:13px;margin:8px 0">'+escH(s.desc)+'</p>'
      +'<div class="row" style="justify-content:space-between;margin-bottom:5px"><span class="mono dim" style="font-size:11px">tus turnos '+bDone+'/'+bTotal+' · '+pct+'%</span><span class="mono" style="font-size:11px;color:'+(r.finished?"var(--mint)":"var(--amber)")+'">'+(r.finished?"✓ COMPLETO":(r.pos||0)>0?"▶ CONTINUAR":"EMPEZAR")+'</span></div>'
      +'<div class="bar-track"><i style="width:'+pct+'%;background:'+lvlC+'"></i></div></div>';
  }).join("")+"</div>";
  document.querySelectorAll("[data-dg]").forEach(c=>c.onclick=()=>openDialog(c.dataset.dg));
}
function openDialog(id){
  dgPause();
  dgId=id;const d=dgDef();dgTurns=d.turns;
  const r=dgGet(id);
  while(r.scores.length<dgTurns.length)r.scores.push(null);
  dgScores=r.scores;dgIdx=Math.min(r.pos||0,Math.max(0,dgTurns.length-1));
  paintMicModes();
  $("dgLib").innerHTML="";$("dgReader").hidden=false;$("dgDone").hidden=true;
  renderChat();
  toast(micMode()==="pulsar"?"Presiona ▶: "+d.name+" habla y tú lees tu turno con un toque":"Presiona ▶: "+d.name+" habla y tú respondes","🎭");
}
function renderChat(){
  const d=dgDef();if(!d)return;
  const verEs=esOn(dgShowEs);
  $("dgTitle").textContent=d.icon+" "+d.name+" · y TÚ";
  $("dgPlace").textContent=d.place+" · NIVEL "+d.level+" · "+d.turns.length+" TURNOS";
  $("dgStory").innerHTML="<b>La historia:</b> "+escH(d.story.en)+(verEs?'<br><span style="color:var(--amber)">'+escH(d.story.es)+"</span>":"");
  if(!esAlways())$("btnDgEs").textContent=dgShowEs?"🙈 ES":"👁 ES";
  const box=$("dgChat");box.innerHTML="";
  dgTurns.forEach((t,i)=>{
    const who=t[0],isA=who==="A",sc=dgScores[i];
    const words=t[1].split(" ").map(tok=>{
      const clean=tok.toLowerCase().replace(/[^a-z'-]/g,"");
      return '<span class="rw" data-w="'+escA(clean||tok.toLowerCase())+'">'+escH(tok)+"</span>";
    }).join(" ");
    const m=document.createElement("div");m.className="msg "+(isA?"a":"b");m.dataset.i=i;
    let pill="";
    if(!isA&&sc!=null)pill='<span class="pill '+pillCls(sc)+'">'+sc+'%</span>';
    m.innerHTML='<div class="who"><span class="av">'+(isA?d.icon:"🙂")+"</span>"+escH(isA?d.name:"YOU · tu turno")+"</div>"
      +'<div class="dg-words">'+words+"</div>"
      +(verEs?'<div class="dg-es">'+escH(t[2]||"")+"</div>":"")
      +'<div class="acts"><button data-sayturn="'+i+'" title="Escuchar">🔊</button><button data-repdg="'+i+'" title="Ir y repetir">↻</button></div>'+pill;
    box.appendChild(m);
  });
  paintDg(false);
}
function paintDg(scroll){
  const n=dgTurns.length;if(!n)return;
  document.querySelectorAll("#dgChat .msg").forEach(el=>{
    const i=+el.dataset.i,sc=dgScores[i];
    el.classList.toggle("cur",i===dgIdx);
    el.classList.toggle("done",i<dgIdx||sc!=null);
  });
  const bIdx=dgTurns.map((t,i)=>t[0]==="B"?i:-1).filter(i=>i>=0);
  const bDone=bIdx.filter(i=>dgScores[i]!=null).length;
  const vals=bIdx.map(i=>dgScores[i]).filter(x=>x!=null);
  const avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;
  const d=dgDef();
  $("dgMeta").textContent="TURNO "+Math.min(dgIdx+1,n)+"/"+n+" · TUS TURNOS "+bDone+"/"+bIdx.length+" · MEDIA "+avg+"%"+(dgActive?" · ● EN ESCENA":"");
  $("dgBar").style.width=(dgIdx/n*100)+"%";
  $("dgLast").innerHTML=bIdx.map(i=>dgScores[i]==null?"":'<span class="ln" style="color:'+(dgScores[i]>=70?"var(--mint)":dgScores[i]>=40?"var(--amber)":"var(--coral)")+'">t'+(i+1)+" · "+dgScores[i]+"%</span>").filter(Boolean).slice(-6).join("");
  if(scroll){
    const now=Date.now();if(now-dgLastPaint<400)return;dgLastPaint=now;
    const cur=document.querySelector('#dgChat .msg[data-i="'+dgIdx+'"]');
    if(cur)cur.scrollIntoView({behavior:"smooth",block:"center"});
  }
}
/* ── Coreografía: actúa A con su voz, te escucha los B ── */
function dgLoop(){
  if(!dgActive||!dgTurns.length)return;
  if(dgIdx>=dgTurns.length){dgFinish();return;}
  const t=dgTurns[dgIdx];
  if(t[0]==="A")dgActA(dgIdx);
  else if(dgPulsarFalso){
    /* Modo un toque: el personaje ya habló, la niña toca el micro para su turno.
       Antes de tocar, el micrófono está cerrado: es imposible que el ruido
       ambiente se cuele como un turno. */
    paintDg(true);dgPinta();
  }else{dgMicStart();paintDg(true);}
}
function dgActA(i){
  const tok=++dgActToken;
  const t=dgTurns[i];if(!t)return;
  dgMicPause();
  paintDg(true);dgPinta();
  const v=dgCharVoice()||{};
  const ms=Math.max(2500,t[1].split(" ").length*480/((v.rate||1)));
  const safety=setTimeout(()=>{if(tok===dgActToken&&dgActive)dgAfterA(i);},ms+2500);
  speak(t[1],1,{gender:v.gender,pitch:v.pitch,rate:v.rate,then:()=>{clearTimeout(safety);if(tok===dgActToken&&dgActive)dgAfterA(i);}});
}
function dgAfterA(i){
  if(i!==dgIdx)return;
  dgIdx++;const r=dgGet(dgId);r.pos=dgIdx;save();
  paintDg(true);dgLoop();
}
/* ── Mic: instancia propia de diálogos, solo en turnos B ──
   BUG QUE SE ARREGLA AQUÍ: el onend comprobaba solo `dgActive`, así que cuando
   el personaje hablaba (dgMicPause → stop) el recognizer volvía a encenderse
   250 ms después y se calificaba la voz SINTETIZADA de la app como turno de la
   niña. Ahora mira también `dgMicOn`. */
let dgErrs=0,dgPulsarFalso=false;
function dgGetRec(){
  if(dgRec)return dgRec;
  dgRec=new SR();dgRec.lang="en-US";dgRec.interimResults=true;dgRec.maxAlternatives=3;
  dgRec.onresult=e=>{
    if(!dgActive||!dgTurns.length||dgIdx>=dgTurns.length)return;
    if(dgTurns[dgIdx][0]!=="B")return;
    for(let k=e.resultIndex;k<e.results.length;k++){
      const res=e.results[k];if(!res.isFinal)continue;
      let best={score:-1,text:"",g:null};
      for(let j=0;j<res.length;j++){const t=res[j].transcript;const g=grade(dgTurns[dgIdx][1],t);if(g.score>best.score)best={score:g.score,text:t,g:g};}
      if(best.g)dgOnFinal(best.g,best.text);
      break;
    }
  };
  dgRec.onerror=e=>{
    if(e.error==="not-allowed"||e.error==="service-not-allowed"){dgPause();toast("Permiso denegado. Revisa el candado 🔒 del navegador","⚠️");}
    else if(e.error==="audio-capture"){dgPause();toast("No se encontró micrófono. Conecta uno y reintenta","⚠️");}
    else if(e.error==="network"){dgErrs++;if(dgErrs>=3){dgPause();toast("El servicio de voz de Chrome falló. Revisa la conexión","⚠️");}}
  };
  dgRec.onend=()=>{
    if(!dgActive||!dgMicOn||dgPulsarFalso||dgErrs>=3)return; /* ← el fix */
    const espera=Math.min(2000,250+dgErrs*700);
    clearTimeout(dgRestartT);
    dgRestartT=setTimeout(()=>{if(dgActive&&dgMicOn&&!dgPulsarFalso){try{dgGetRec().start();}catch(err){dgMicPause();}}},espera);
  };  return dgRec;
}
let dgMicOn=false;
function dgPinta(){
  const b=$("btnDgRec"),eq=$("dgEq"),l=$("dgRecLbl");
  if(b)b.classList.toggle("recording",dgMicOn);
  if(eq)eq.classList.toggle("on",dgMicOn);
  if(!l)return;
  if(dgMicOn)l.innerHTML='<span class="live-dot"></span>'+(dgPulsarFalso?"HABLA TU TURNO":"EN ESCENA — HABLA TUS TURNOS");
  else if(dgActive&&dgTurns[dgIdx]&&dgTurns[dgIdx][0]==="B"&&micMode()==="pulsar")
    l.innerHTML='<span class="live-dot"></span>TU TURNO — TOCA EL MIC Y LÉELO';
  else l.textContent=micMode()==="pulsar"?"👆 UN TOQUE POR TURNO":"▶ UNA VEZ Y ACTÚA DE CORRIDO";
}
function dgMicStart(){
  if(!SR||dgMicOn)return;
  dgMicOn=true;
  const r=dgGetRec();
  r.continuous=!dgPulsarFalso;
  Antirruido.iniciar();Antirruido.reiniciar();
  dgPinta();
  try{r.start();}catch(e){dgMicOn=false;dgPinta();}
}
function dgMicPause(){
  /* NO se toca dgPulsarFalso aquí: es el modo de la ESCENA, no el del micro.
     Si se borrara, dgLoop() vería "corrido" después de cada turno tuyo y te
     volvería a abrir el micro solo, que es justo lo que el modo un toque
     evita. Solo dgPause() lo reinicia. */
  dgMicOn=false;clearTimeout(dgRestartT);
  try{if(dgRec)dgRec.abort();}catch(e){}
  Antirruido.apagar();
  dgPinta();
}
function dgStart(){
  if(!SR){toast("Sin reconocimiento: usa Chrome o Edge","⚠️");return;}
  if(!dgId||!dgTurns.length){toast("Abre un personaje primero","🎭");return;}
  if(dgIdx>=dgTurns.length){toast("Diálogo terminado","🎭");return;}
  try{if("speechSynthesis" in window)speechSynthesis.cancel();}catch(e){}
  dgErrs=0;dgActive=true;dgPulsarFalso=micMode()==="pulsar";
  dgLoop();
}
function dgPause(){
  dgActive=false;dgActToken++;dgMicPause();
  try{if("speechSynthesis" in window)speechSynthesis.cancel();}catch(e){}
  if(dgId&&dgTurns.length)paintDg(false);
}
/* En modo pulsar: un toque = tu turno. En modo corrido: un toque = escena entera. */
$("btnDgRec").onclick=()=>{
  if(dgMicOn){dgPause();return;}
  if(dgActive&&dgTurns.length&&dgTurns[dgIdx]&&dgTurns[dgIdx][0]==="B"){dgMicStart();return;}
  if(dgActive){dgPause();return;}
  dgStart();
};
$("btnDgLib").onclick=()=>renderDgLib();
$("dgExit").onclick=()=>renderDgLib();
$("dgDoneBtn").onclick=()=>renderDgLib();
$("btnDgEs").onclick=()=>{
  if(esAlways()){toast("El español está siempre visible. Cámbialo en Tu progreso → Ajustes","👁");return;}
  dgShowEs=!dgShowEs;renderChat();
};
$("btnDgMode").onclick=()=>{
  const wasOn=dgActive;if(wasOn)dgPause();
  setMicMode(micMode()==="pulsar"?"corrido":"pulsar");
  if(wasOn)dgStart();
};
$("btnDgRole").onclick=()=>{ /* escucha el turno actual sin mover el puntero */
  if(!dgTurns.length)return;const t=dgTurns[dgIdx];
  const was=dgActive;if(was)dgPause();
  speak(t[1],1,t[0]==="A"?(dgCharVoice()||{}):{});
  if(was){const tmr=setInterval(()=>{try{if(!speechSynthesis.speaking){clearInterval(tmr);dgStart();}}catch(e){clearInterval(tmr);}},600);}
};
/* Tu turno calificado (30% = rojo) pero la obra SIEMPRE continúa */
function dgOnFinal(g,heard){
  if(dgIdx>=dgTurns.length||dgTurns[dgIdx][0]!=="B")return;
  /* Antirruido: un ruido de fondo no es un turno tuyo, así que no se califica
     ni avanza la escena. */
  if(!esVozReal(heard,dgTurns[dgIdx][1])){marcarRuido();dgPinta();paintDg(false);return;}
  dgErrs=0;
  const modoPulsar=dgPulsarFalso;
  const i=dgIdx;dgScores[i]=g.score;
  const r=dgGet(dgId);r.scores=dgScores;save();
  const col=scoreColor(g.score);
  const el=document.querySelector('#dgChat .msg[data-i="'+i+'"]');
  if(el){const old=el.querySelector(".pill");if(old)old.remove();
    const pill=document.createElement("span");pill.className="pill "+pillCls(g.score);pill.textContent=g.score+"%";el.appendChild(pill);}
  $("dgResult").hidden=false;
  $("dgScore").textContent=g.score+"%";$("dgScore").style.color=col;
  renderChips(g.chips,$("dgDiff"));
  $("dgHeard").textContent="“"+(heard||"(nada)")+"”";
  const xp=g.score>=70?2:0;
  if(xp)addXP(xp,"diálogo");
  $("dgXp").textContent=xp?("+"+xp+" XP · turno "+(i+1)+" listo, sigue la escena…"):("turno "+(i+1)+" · "+g.score+"% en rojo, la obra sigue");
  if(g.score>=95)confetti();
  checkAch();
  if(modoPulsar)dgMicPause();
  dgIdx++;r.pos=dgIdx;save();paintDg(true);dgLoop();
}
function dgSeek(i,sayIt){
  if(!dgTurns.length)return;
  dgIdx=Math.max(0,Math.min(i,dgTurns.length-1));
  const r=dgGet(dgId);r.pos=dgIdx;save();paintDg(true);
  if(sayIt){
    const was=dgActive;if(was)dgPause();
    const t=dgTurns[dgIdx];
    speak(t[1],1,t[0]==="A"?(dgCharVoice()||{}):{});
    if(was){const tmr=setInterval(()=>{try{if(!speechSynthesis.speaking){clearInterval(tmr);dgStart();}}catch(e){clearInterval(tmr);}},600);}
    return;
  }
  /* fix: al saltar a otro turno en mitad de la escena la obra se quedaba
     congelada (el bucle nunca se relanzaba). Ahora sigue donde toque. */
  if(dgActive)dgLoop();
  else dgPinta();
}
function dgFinish(){
  dgPause();
  const r=dgGet(dgId);
  if(!r.finished){r.finished=true;save();addXP(25,"diálogo completo");confetti();}
  $("dgReader").hidden=true;$("dgDone").hidden=false;
  $("dgDoneMsg").textContent="+25 XP · Escena con "+dgDef().name+" completada.";
  checkAch();
}
/* Mini-tip en el chat (discreto, no pausa la escena) */
function dgLookup(w){
  w=(w||"").toLowerCase().replace(/[^a-z'-]/g,"");if(!w)return"—";
  const d=dgDef();
  if(d&&d.vocab&&d.vocab[w])return d.vocab[w];
  const hit=WORDS.find(x=>x.en.toLowerCase()===w);if(hit)return hit.es;
  return "—";
}
document.addEventListener("click",e=>{
  if(!$("view-dialogs")||$("view-dialogs").hidden)return;
  const tip=$("wordTip");
  const st=e.target.closest("[data-sayturn]");
  if(st){e.preventDefault();e.stopPropagation();dgSeek(+st.dataset.sayturn,true);return;}
  const rp=e.target.closest("#dgChat [data-repdg]");
  if(rp){e.preventDefault();e.stopPropagation();dgSeek(+rp.dataset.repdg,true);return;}
  const w=e.target.closest("#dgChat .rw");
  if(w){
    e.preventDefault();e.stopPropagation();
    const raw=w.dataset.w||w.textContent;
    $("wtEn").textContent=raw;$("wtEs").textContent=dgLookup(raw);
    $("wtSay").onclick=ev=>{ev.stopPropagation();speak(raw);};
    tip.hidden=false;
    tip.style.left=Math.min(innerWidth-200,Math.max(8,e.clientX-40))+"px";
    tip.style.top=Math.min(innerHeight-120,Math.max(8,e.clientY+14))+"px";
    clearTimeout(rdTipT);rdTipT=setTimeout(()=>{tip.hidden=true;},2500);
    return;
  }
  const m=e.target.closest("#dgChat .msg");
  if(m){dgSeek(+m.dataset.i,false);return;}
  if(!tip.hidden&&!e.target.closest("#wordTip"))tip.hidden=true;
});
/* ═══════════════════════════════ PRONUNCIACIÓN ═══════════════════════════════ */
let prQ=[],prI=0,prLvl="A1";
function levelChips(box,cur,onPick){
  box.innerHTML=LEVELS.map(l=>'<button class="chip'+(l===cur?" active":"")+'" data-l="'+escA(l)+'">'+escA(l)+"</button>").join("");
  box.querySelectorAll(".chip").forEach(b=>b.onclick=()=>onPick(b.dataset.l));
}
function renderPron(){
  levelChips($("pronLevels"),prLvl,l=>{prLvl=l;newPronSession();renderPron();});
  /* Solo mostrar el modo texto si NO hay reconocimiento; antes siempre visible */
  $("prNoMic").hidden=!!SR;
  if(!SR)$("prNoMic").querySelector("p").innerHTML='⚠️ Tu navegador no soporta reconocimiento de voz (usa Chrome o Edge). Practica en <b style="color:var(--amber)">modo texto</b>:';
  if(!prQ.length)newPronSession();
  showPrCard();renderPrHist();paintMicState();
}
function newPronSession(){prQ=shuffle(SENTENCES[prLvl]);prI=0;}
$("btnPrNew").onclick=()=>{newPronSession();showPrCard();$("prResult").hidden=true;toast("Nueva sesión de "+prLvl,"🔀");};
function showPrCard(){
  if(prI>=prQ.length){prQ=shuffle(SENTENCES[prLvl]);prI=0;}
  const s=prQ[prI];
  $("prMeta").textContent="FRASE "+(prI+1)+"/"+prQ.length+" · NIVEL "+prLvl.toUpperCase();
  $("prEn").textContent="“"+s[0]+"”";$("prEs").textContent=s[1];
  $("prResult").hidden=true;
}
$("btnPrPlay").onclick=()=>speak(prQ[prI][0]);
$("btnPrPlaySlow").onclick=()=>speak(prQ[prI][0],0.6);
$("btnPrSkip").onclick=()=>{prI++;showPrCard();};
$("btnPrNext").onclick=()=>{prI++;showPrCard();};

$("btnMicOnce").onclick=()=>{
  /* Botón informativo: el permiso real lo gestiona Chrome en el primer start().
     Si ya está en localhost/HTTPS, ese primer start lo recuerda para siempre. */
  if(!SR){toast("Reconocimiento no disponible — usa el modo texto","⚠️");$("prNoMic").hidden=false;return;}
  paintMicState();
  toast("Presiona el micrófono grande y habla: ahí Chrome te pedirá permiso solo 1 vez","🎤");
};
$("btnPrRec").onclick=()=>startListening();
function showPrResult(g,heard){
  /* Candado de seguridad. Un intento = un resultado. Antes, cualquier disparo
     extra de onresult (Chrome puede enviar varios) repintaba la tarjeta, hacía
     el confeti, la celebración y volvía a sumar XP: de ahí el parpadeo y la
     sensación de "varias respuestas". Con esto, aunque onresult se repita, la
     pantalla solo se actualiza una vez. */
  if(prMostrado===prIntento)return;
  prMostrado=prIntento;
  $("prResult").hidden=false;
  const col=scoreColor(g.score);
  $("prRingC").style.stroke=col;
  $("prScoreNum").style.color=col;
  requestAnimationFrame(()=>{$("prRingC").style.strokeDashoffset=345.6-(345.6*g.score/100);});
  let cur=0;const step=()=>{cur+=Math.ceil(g.score/18);if(cur>=g.score){$("prScoreNum").textContent=g.score;}else{$("prScoreNum").textContent=cur;requestAnimationFrame(step);}};step();
  renderChips(g.chips,$("prDiff"));
  $("prHeard").textContent="“"+(heard||"(nada)")+"”";
  const xp=Math.max(2,Math.round(g.score/8));
  $("prXp").textContent="+"+xp+" XP · "+g.ok+" correctas, "+g.nr+" casi";
  const histRef=refFrase().slice(0,44);
  /* No apilamos la misma frase dos seguidas: si repites un intento, sale el
     más reciente y el anterior se descarta (antes se veían renglones iguales). */
  if(!state.hist.pron.length||state.hist.pron[0].t!==histRef)
    state.hist.pron.unshift({d:todayStr(),s:g.score,t:histRef});
  else state.hist.pron[0]={d:todayStr(),s:g.score,t:histRef};
  state.hist.pron=state.hist.pron.slice(0,8);save();
  addXP(xp,"pronunciación");
  checkAch();
  try{
    const pr=$("prResult");pr.classList.remove("pop-in");void pr.offsetWidth;pr.classList.add("pop-in");
    const sn=$("prScoreNum");sn.classList.remove("combo-pop");void sn.offsetWidth;sn.classList.add("combo-pop");
    if(g.score>=90)LingoMagic.celebrate(3);
    else if(g.score>=70){LingoMagic.Sounds.great();LingoMagic.sparkle(8);}
    else if(g.score>=50)LingoMagic.Sounds.good();
    else LingoMagic.Sounds.bad();
  }catch(e){}
  if(g.score>=90)confetti();
  renderPrHist();
  $("prResult").scrollIntoView({behavior:"smooth",block:"nearest"});
}
$("btnPrTextGo").onclick=()=>{
  const t=$("prText").value.trim();if(!t)return;
  prIntento++; /* el modo texto también cuenta como intento */
  showPrResult(grade(prQ[prI][0],t),t);$("prText").value="";
};
function renderPrHist(){
  const h=state.hist.pron;
  $("prHistCard").hidden=!h.length;
  $("prHist").innerHTML=h.map(x=>'<div class="row" style="justify-content:space-between;padding:7px 0;border-bottom:1px dashed var(--line)"><span class="mut" style="font-size:13.5px">“'+escH(x.t)+'…”</span><b class="mono" style="color:'+scoreColor(x.s)+'">'+x.s+'%</b></div>').join("");
}

/* ═══════════════════════════════ DICTADO ═══════════════════════════════ */
let dicCur=null,dicLvl="A2",dicPlays=0;
function renderDic(){levelChips($("dicLevels"),dicLvl,l=>{dicLvl=l;newDictation();renderDic();});if(!dicCur||!SENTENCES[dicLvl].some(s=>s[0]===dicCur[0]))newDictation();$("dicResult").hidden=true;}
function newDictation(){
  const pool=SENTENCES[dicLvl];
  let s;do{s=pool[Math.floor(Math.random()*pool.length)];}while(pool.length>1&&dicCur&&s[0]===dicCur[0]);
  dicCur=s;dicPlays=0;$("dicInput").value="";$("dicResult").hidden=true;
  $("dicPlays").textContent="nivel "+dicLvl;
}
function dicPlay(r){speak(dicCur[0],r||1);try{LingoMagic.Sounds.click();}catch(e){}dicPlays++;$("dicPlays").textContent="🔊 ×"+dicPlays;}
$("btnDicPlay").onclick=()=>dicPlay();
$("btnDicSlow").onclick=()=>dicPlay(0.6);
$("btnDicSkip").onclick=newDictation;
$("btnDicCheck").onclick=()=>{
  const typed=$("dicInput").value.trim();
  if(!typed){toast("Primero escribe lo que escuchaste","✍️");return;}
  const g=grade(dicCur[0],typed);
  $("dicResult").hidden=false;
  $("dicScore").textContent=g.score+"%";$("dicScore").style.color=scoreColor(g.score);
  renderChips(g.chips,$("dicDiff"));
  $("dicReveal").textContent=dicCur[0];
  /* La traducción española faltaba por completo en Dictado. */
  $("dicEs").textContent=dicCur[1]||"";
  const xp=Math.max(2,Math.round(g.score/7));
  $("dicXp").textContent="+"+xp+" XP";addXP(xp,"dictado");
  state.hist.dic.unshift({d:todayStr(),s:g.score});state.hist.dic=state.hist.dic.slice(0,8);save();
  try{
    const dr=$("dicResult");dr.classList.remove("pop-in");void dr.offsetWidth;dr.classList.add("pop-in");
    if(g.score>=100)LingoMagic.celebrate(3);
    else if(g.score>=70){LingoMagic.Sounds.great();LingoMagic.sparkle(8);}
    else if(g.score>=50)LingoMagic.Sounds.good();
    else LingoMagic.Sounds.bad();
  }catch(e){}
  if(g.score>=100)confetti();checkAch();
};
$("btnDicNext").onclick=newDictation;
/* Enter en estos campos lo maneja shortcuts.js de forma global (envía y luego
   avanza), así que aquí ya no duplicamos el listener. */

/* ═══════════════════════════════ ESCRITURA ═══════════════════════════════ */
let wrCur=null,wrHinted=false;
function newWr(){
  const lvl=LEVELS[Math.floor(Math.random()*LEVELS.length)];
  const pool=SENTENCES[lvl];
  wrCur=pool[Math.floor(Math.random()*pool.length)];wrHinted=false;
  $("wrEs").textContent="“"+wrCur[1]+"”";$("wrInput").value="";$("wrResult").hidden=true;$("btnWrSayRef").hidden=true;
}
function renderWr(){if(!wrCur)newWr();}
$("btnWrHint").onclick=()=>{
  if(wrHinted){toast("Ya usaste la pista de esta oración","💡");return;}
  wrHinted=true;
  const words=wrCur[0].split(" ");
  $("wrInput").value=words.slice(0,Math.min(3,words.length)).join(" ")+" ";
  $("wrInput").focus();
};
$("btnWrSkip").onclick=newWr;
$("btnWrNext").onclick=newWr;
$("btnWrSayRef").onclick=()=>speak(wrCur[0]);
$("btnWrCheck").onclick=()=>{
  const typed=$("wrInput").value.trim();
  if(!typed){toast("Escribe tu traducción primero","✍️");return;}
  const g=grade(wrCur[0],typed);
  $("wrResult").hidden=false;
  $("wrScore").textContent=g.score+"%";$("wrScore").style.color=scoreColor(g.score);
  renderChips(g.chips,$("wrDiff"));
  $("wrReveal").textContent=wrCur[0];$("btnWrSayRef").hidden=false;
  const xp=Math.max(2,Math.round(g.score/7));
  $("wrXp").textContent="+"+xp+" XP";addXP(xp,"escritura");
  state.hist.wr.unshift({d:todayStr(),s:g.score});state.hist.wr=state.hist.wr.slice(0,8);save();
  try{
    const wr=$("wrResult");wr.classList.remove("pop-in");void wr.offsetWidth;wr.classList.add("pop-in");
    if(g.score>=100)LingoMagic.celebrate(3);
    else if(g.score>=70){LingoMagic.Sounds.great();LingoMagic.sparkle(8);}
    else if(g.score>=50)LingoMagic.Sounds.good();
    else LingoMagic.Sounds.bad();
  }catch(e){}
  if(g.score>=100)confetti();
};
/* Enter en escritura lo maneja shortcuts.js de forma global. */

/* ═══════════════════════════════ QUIZ ═══════════════════════════════ */
let qList=[],qI=0,qOk=0,qTimer=null,qTime=0,qLock=false,qLives=3,qCombo=0,qBestCombo=0,qCat="mix",qT0=0;
function renderQuizHome(){
  $("quizStart").hidden=false;$("quizGame").hidden=true;$("quizEnd").hidden=true;
  const best=state.hist.quiz.length?Math.max(...state.hist.quiz.map(h=>h.c))+" / 10":"—";
  $("quizBest").textContent="Mejor puntaje: "+best;
  let chips=$("quizCatChips");
  if(!chips){
    chips=document.createElement("div");chips.id="quizCatChips";chips.className="chips mg-t";chips.style.justifyContent="center";
    $("quizBest").after(chips);
  }
  const cats=[["mix","🎲 Mixto"],["vocab","📚 Vocabulario"],["culture","🌍 Cultura"]];
  chips.innerHTML=cats.map(c=>'<button class="chip'+(c[0]===qCat?" active":"")+'" data-qc="'+c[0]+'">'+c[1]+"</button>").join("");
  chips.querySelectorAll("[data-qc]").forEach(b=>b.onclick=()=>{qCat=b.dataset.qc;try{LingoMagic.Sounds.click();}catch(e){}renderQuizHome();});
}
$("btnQuizStart").onclick=startQuiz;
$("btnQuizAgain").onclick=startQuiz;
function quizCulturePool(){
  const C=(window.LingoCulture&&window.LingoCulture.list)||[];
  return C.map(c=>({cq:1,en:c.capital.en,es:c.capital.es,cid:c.id,emoji:c.emoji,cn:c.country}));
}
function startQuiz(){
  qI=0;qOk=0;qLives=3;qCombo=0;qBestCombo=0;
  let pool=shuffle(WORDS).slice(0,10).map(w=>({en:w.en,es:w.es}));
  if(qCat==="culture"&&(window.LingoCulture&&window.LingoCulture.list.length)){
    pool=shuffle(quizCulturePool()).slice(0,10);
  }else if(qCat==="mix"&&(window.LingoCulture&&window.LingoCulture.list.length)){
    const cq=shuffle(quizCulturePool()).slice(0,4);
    pool=shuffle(WORDS).slice(0,6).map(w=>({en:w.en,es:w.es})).concat(cq);
    pool=shuffle(pool);
  }
  qList=pool;
  $("quizStart").hidden=true;$("quizEnd").hidden=true;$("quizGame").hidden=false;
  try{LingoMagic.Sounds.click();}catch(e){}
  showQ();
}
function showQ(){
  qLock=false;qT0=Date.now();
  const w=qList[qI];
  const isCQ=!!w.cq;
  const dir=isCQ?"cap":(Math.random()<0.5?"en2es":"es2en");
  $("qIdx").textContent="PREGUNTA "+(qI+1)+" / "+qList.length;
  $("qScore").textContent="✓ "+qOk+" · "+"❤️".repeat(Math.max(0,qLives))+" · 🔥x"+Math.max(1,qCombo);
  if(isCQ){
    $("qDir").textContent="¿CUÁL ES LA CAPITAL?";
    $("qPrompt").textContent=w.emoji+" "+w.cn.es;
    const C=(window.LingoCulture&&window.LingoCulture.list)||[];
    const others=shuffle(C.filter(x=>x.id!==w.cid)).slice(0,3).map(c=>({en:c.capital.en,es:c.capital.es}));
    const opts=shuffle([w,...others]);
    $("qOpts").innerHTML=opts.map(o=>'<button class="q-opt" data-v="'+escA(o.en)+'">'+escH(o.en)+"</button>").join("");
  }else{
    $("qDir").textContent=dir==="en2es"?"¿QUÉ SIGNIFICA EN ESPAÑOL?":"¿CÓMO SE DICE EN INGLÉS?";
    $("qPrompt").textContent=dir==="en2es"?w.en:w.es;
    const others=shuffle(WORDS.filter(x=>x.en!==w.en)).slice(0,3);
    const opts=shuffle([w,...others]);
    $("qOpts").innerHTML=opts.map(o=>'<button class="q-opt" data-v="'+escA(o.en)+'">'+escH(dir==="en2es"?o.es:o.en)+"</button>").join("");
  }
  $("qOpts").querySelectorAll(".q-opt").forEach(b=>b.onclick=()=>answerQ(b,w));
  qTime=15000;$("qTimerBar").style.width="100%";
  clearInterval(qTimer);
  qTimer=setInterval(()=>{
    qTime-=100;$("qTimerBar").style.width=Math.max(0,qTime/150)+"%";
    if(qTime<=0){clearInterval(qTimer);timeOutQ(w);}
  },100);
}
function qLoseLife(){
  qLives--;qCombo=0;
  try{LingoMagic.Sounds.bad();}catch(e){}
  if(qLives<=0){toast("¡Sin vidas! Fin del quiz","💔");setTimeout(endQuiz,1200);return true;}
  return false;
}
function timeOutQ(w){
  if(qLock)return;qLock=true;
  $("qOpts").querySelectorAll(".q-opt").forEach(b=>{if(b.dataset.v===w.en)b.classList.add("good");});
  toast("¡Tiempo! Era «"+w.en+"» · -1 ❤️","⏱");
  if(qLoseLife())return;
  setTimeout(nextQ,1200);
}
function answerQ(btn,w){
  if(qLock)return;qLock=true;clearInterval(qTimer);
  const sel=btn.dataset.v;
  const fast=(Date.now()-qT0)<5000;
  if(sel===w.en){
    qOk++;qCombo++;qBestCombo=Math.max(qBestCombo,qCombo);
    btn.classList.add("good");speak(w.en);
    try{
      if(qCombo>=2){const qs=$("qScore");if(qs){qs.classList.remove("combo-pop");void qs.offsetWidth;qs.classList.add("combo-pop");}}
      if(qCombo>=3){LingoMagic.Sounds.great();LingoMagic.sparkle(10);try{LingoMagic.celebrate(2);}catch(e){}toast("¡COMBO x"+qCombo+"! 🔥","⚡");}
      else LingoMagic.Sounds.good();
    }catch(e){}
    if(fast)toast("¡Rápido! ⚡","💨");
  }
  else{
    btn.classList.add("wrong");
    $("qOpts").querySelectorAll(".q-opt").forEach(b=>{if(b.dataset.v===w.en)b.classList.add("good");});
    if(!w.cq){const rec=state.words[w.en]||{};state.words[w.en]={...rec,w:(rec.w||0)+1};save();}
    if(qLoseLife())return;
  }
  setTimeout(nextQ,950);
}
function nextQ(){
  qI++;
  if(qI>=qList.length)return endQuiz();
  showQ();
}
function endQuiz(){
  clearInterval(qTimer);
  $("quizGame").hidden=true;$("quizEnd").hidden=false;
  $("qEndScore").textContent=qOk+" / 10";
  const msg=qOk===10?"¡PERFECTO! Eres imparable 🚀":qOk>=8?"¡Excelente trabajo!":qOk>=5?"Bien, sigue practicando":"Cada intento te hace más fuerte";
  $("qEndMsg").textContent=msg;
  $("qEndEmoji").textContent=qOk>=8?"🏆":qOk>=5?"🎉":"💪";
  const xp=qOk*2+(qOk===10?5:0)+Math.min(10,qBestCombo);
  $("qEndXp").textContent="+"+xp+" XP"+(qBestCombo>=3?" · mejor combo x"+qBestCombo+" 🔥":"");
  addXP(xp,"quiz");
  state.hist.quiz.unshift({d:todayStr(),c:qOk});state.hist.quiz=state.hist.quiz.slice(0,12);save();
  try{if(qBestCombo>=3)LingoMagic.sparkle(16);LingoMagic.Sounds.win();}catch(e){}
  if(qOk>=8)confetti();checkAch();
}

/* ═══════════════════════════════ PROGRESO ═══════════════════════════════ */
function renderProg(){
  loadVoices();
  $("gXp").textContent=state.xp;$("gLevel").textContent=Math.floor(state.xp/150)+1;
  $("gKnown").textContent=knownCount();
  $("gSess").textContent=Object.keys(state.log).filter(k=>state.log[k]>0).length;
  if(![...$("goalSelect").options].some(o=>o.value===String(state.goal)))state.goal=60;
  $("goalSelect").value=String(state.goal);
  const box=$("chart14");box.innerHTML="";
  for(let n=13;n>=0;n--){
    const k=dayKey(n),v=state.log[k]||0;
    const d=document.createElement("div");d.style.cssText="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px";
    d.title=k+" · "+v+" XP";
    d.innerHTML='<div style="width:100%;height:'+Math.max(4,Math.min(96,4+v*1.2))+'px;border-radius:5px 5px 2px 2px;background:'+(v?"linear-gradient(180deg,var(--sky),var(--mint))":"#152535")+'"></div><span class="mono dim" style="font-size:9px">'+k.slice(8)+"</span>";
    box.appendChild(d);
  }
  const cb=$("catBars");cb.innerHTML="";
  const CAT_COLORS2=["#4fe3a5","#6cc8ff","#ffcf5c","#ff7d7d","#c4a5ff","#ff8fb2","#7ee787","#79c0ff","#ffa657","#d2a8ff","#a5f3fc","#fda4af"];
  Object.keys(VOCAB).forEach((cat,ci)=>{
    const list=VOCAB[cat];const kn=list.filter(w=>wordStatus(w[0])==="known").length;
    const pct=Math.round(kn/list.length*100);const c=CAT_COLORS2[ci%CAT_COLORS2.length];
    cb.innerHTML+='<div><div class="row" style="justify-content:space-between;margin-bottom:5px"><span style="font-weight:700;font-size:13.5px">'+escH(cat)+'</span><span class="mono dim" style="font-size:11px">'+kn+"/"+list.length+" · "+pct+'%</span></div><div class="bar-track"><i style="width:'+pct+"%;background:"+c+'"></i></div></div>';
  });
  $("achGrid").innerHTML=ACHS.map(a=>{
    const un=state.ach.includes(a.id);
    return '<div class="ach card'+(un?"":" locked")+'" style="padding:14px"><div class="ic">'+a.icon+'</div><div><div class="nm">'+escH(a.name)+'</div><div class="ds">'+escH(a.desc)+(un?' · <span style="color:var(--mint)">✓</span>':"")+"</div></div></div>";
  }).join("");
  $("rateRange").value=state.set.rate;$("rateVal").textContent=Number(state.set.rate).toFixed(2);
  $("micSel").value=state.set.micMode;
  $("noiseSel").value=state.set.noise;
  $("esSel").value=esAlways()?"always":"buttons";
  paintMicModes();
}
$("goalSelect").addEventListener("change",e=>{state.goal=Number(e.target.value);save();toast("Meta diaria: "+state.goal+" XP","🎯");});
$("rateRange").addEventListener("input",e=>{state.set.rate=Number(e.target.value);$("rateVal").textContent=state.set.rate.toFixed(2);save();});
$("rateRange").addEventListener("change",()=>speak("This is how I sound now."));
$("voiceSel").addEventListener("change",e=>{state.set.voice=e.target.value;save();speak("Hello! I am your new voice.");});
$("micSel").addEventListener("change",e=>setMicMode(e.target.value));
$("noiseSel").addEventListener("change",e=>{
  state.set.noise=e.target.value;save();pintarRuido();
  toast(e.target.value==="off"?"Filtro antiruido desactivado":e.target.value==="strict"?"Filtro estricto: descarta más ruido":"Filtro antiruido normal","🛡");
});
$("esSel").addEventListener("change",e=>{
  state.set.alwaysES=e.target.value==="always";save();
  if(curView==="lectura")renderNovel();
  if(curView==="dialogs")renderChat();
  if(curView==="lecciones")showLp();
  paintMicModes();
  toast(state.set.alwaysES?"El español se verá siempre":"Ahora el español se muestra con el botón 👁 ES","👁");
});
$("btnExport").onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="lingolab-progreso.json";a.click();
  toast("Progreso exportado correctamente","⬇");
};
$("btnImport").onclick=()=>$("importFile").click();
$("importFile").addEventListener("change",e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{
    const o=JSON.parse(r.result);
    if(!o||typeof o.xp!=="number"||typeof o.log!=="object"||typeof o.words!=="object")throw 0;
    if(!isFinite(o.xp)||o.xp<0||o.xp>1000000)throw 0;
    const clean=defaultState();
    state=Object.assign(clean,o);
    state.hist=Object.assign({pron:[],dic:[],wr:[],quiz:[]},o.hist||{});
    state.set=Object.assign({},SET_DEF,o.set||{});
    save();refreshHeader();renderProg();toast("Progreso importado con éxito","⬆");
  }catch(err){toast("Archivo inválido","⚠️");}};
  r.readAsText(f);e.target.value="";
});
$("btnReset").onclick=()=>{
  if(confirm("¿Borrar TODO el progreso guardado? Esta acción no se puede deshacer.")){localStorage.removeItem(DB_KEY);location.reload();}
};

/* ═══════════════════════════════ INICIALIZACIÓN ═══════════════════════════════ */
(function init(){
  // ticker: dos copias idénticas separadas por un hueco, para que el -50% cuadre
  const items=TICKER.map(p=>"<span><b>"+escH(p[0])+"</b><i>"+escH(p[1])+"</i></span><span class='sep'>◆</span>").join("");
  $("tickerTrack").innerHTML=items+items;
  // letras flotantes
  const letters="AEIOUBCDLMNPRST";let lh="";
  for(let i=0;i<16;i++){
    const ch=letters[Math.floor(Math.random()*letters.length)];
    lh+='<span style="left:'+(Math.random()*96)+'%;font-size:'+(40+Math.random()*90)+'px;animation-duration:'+(16+Math.random()*20)+'s;animation-delay:-'+(Math.random()*20)+'s">'+ch+"</span>";
  }
  $("bgLetters").innerHTML=lh;
  $("flashModal").hidden=true;
  /* Marcador de versión: la app te dice qué versión tienes abierta, para saber
     de un vistazo si los cambios nuevos ya llegaron o estás viendo la caché. */
  $("appVer").textContent="v10";
  $("appVer").title="Versión v10 · si acabas de cambiar el código y no cambia nada, recarga con Ctrl+Shift+R";
  /* Avisa si el service worker está sirviendo una versión cacheada antigua. */
  if(navigator.serviceWorker&&navigator.serviceWorker.controller){
    navigator.serviceWorker.addEventListener("message",e=>{
      if(e.data&&e.data.tipo==="version"){
        const el=$("appVer");
        if(el&&e.data.v!==V){
          el.textContent="v"+e.data.v+" ⚠️";
          el.style.color="var(--amber)";
          el.title="Cargaste la v"+e.data.v+" desde caché pero el código nuevo es v"+V+". Recarga con Ctrl+Shift+R.";
        }
      }
    });
  }
  refreshHeader();save();
  paintMicModes();
  go("panel");
  if(state.firstRun){state.firstRun=false;save();setTimeout(()=>toast("¡Bienvenido a LINGOLAB! Tu progreso se guarda solo en este dispositivo.","👋"),900);}
  /* Aviso solo la primera vez en celular: el modo por defecto ya es "un toque". */
  if(isTouch()&&micMode()==="pulsar"&&state.set.micMode==="auto")
    setTimeout(()=>toast("En el celular el micro es de un toque: tócalo, lee tu frase y se cierra. Puedes cambiarlo en Tu progreso → Ajustes","🎤"),2600);
})();

/* ═══════════════════════════════ TECLADO ABIERTO ═══════════════════════════════
   Al abrir el teclado del móvil la ventana visible se encoge y la barra lateral
   fija "flotaba" sobre él y parecía moverse sola. La escondemos mientras
   escribes y, además, evitamos que el cambio de tamaño desplace la página. */
(function tecladoAbierto(){
  const raiz=document.documentElement;
  let abierto=false,ultimoH=0;
  const aplicada=()=>{
    const h=window.visualViewport?window.visualViewport.height:window.innerHeight;
    /* en escritorio no hay teclado: el alto no cambia de golpe */
    const reducido=h<ultimoH*0.75;
    if(reducido!==abierto){
      abierto=reducido;
      raiz.classList.toggle("kb-abierto",abierto);
    }
    ultimoH=h;
  };
  if(window.visualViewport&&window.visualViewport.addEventListener)
    window.visualViewport.addEventListener("resize",aplicada);
  else window.addEventListener("resize",aplicada);
  window.addEventListener("focusout",()=>setTimeout(aplicada,120));
  ultimoH=window.innerHeight;
  /* Si el navegador ajusta el scroll al enfocar un campo, lo devolvemos:
     es lo que hacía que la página "subiera" sola mientras escribías. */
  document.addEventListener("focusin",e=>{
    const t=e.target&&e.target.tagName;
    if(t!=="INPUT"&&t!=="TEXTAREA")return;
    setTimeout(()=>{
      const h=window.visualViewport?window.visualViewport.height:window.innerHeight;
      if(window.visualViewport&&h<ultimoH*0.75)ultimoH=h;
    },150);
  });
})();
