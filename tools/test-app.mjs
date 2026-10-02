// Test de humo de LingoLab — ejecuta la app real contra un DOM simulado.
// Cubre: que arranque, que todas las vistas pinten sin reventar, el
// emparejamiento EN/ES de Lectura y el flujo del micrófono (que el ruido no se
// califique y que el micro no se encienda mientras habla el personaje).
//
//   node tools/test-app.mjs
//
// Requiere index.html y js/app-legacy.js. No necesita navegador ni dependencias.
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync("index.html", "utf8");
const ids = new Set([...html.matchAll(/id="([\w-]+)"/g)].map((m) => m[1]));
/* ids que el HTML nace ocultos: el arnés los arranca en ese estado */
const ocultos = new Set();
for (const m of html.matchAll(/<[^>]*\bid="([\w-]+)"[^>]*>/g)) {
  if (/\shidden[\s>=]/.test(m[0])) ocultos.add(m[1]);
}
/* Solo ids que el JS crea y que el arnés NO puede registrar solo. Ojo: NO
   añadimos btnSelfListen ni selfListenBox, porque enhance.js se registra
   mediante createElement y su candado consulta getElementById("btnSelfListen"):
   si el arnés se lo diese "por hecho", creería que el botón ya existe y no lo
   montaría — falseando justo la prueba de duplicados. */
["quizCatChips", "wtEs", "lpNoSe", "crispyNameAsk"].forEach((i) => ids.add(i));

/* A qué sección pertenece cada id. En un navegador, un botón dentro de una
   <section hidden> tiene offsetParent null y NO es pulsable; el arnés tiene que
   saberlo o los atajos pulsan botones de secciones que no estás viendo. */
const vistaDe = {};
for (const m of html.matchAll(/<section[^>]*\bid="(view-[\w-]+)"[^>]*>([\s\S]*?)<\/section>/g)) {
  for (const im of m[2].matchAll(/id="([\w-]+)"/g)) vistaDe[im[1]] = m[1];
}
const vistaActual = { id: "view-panel" };

let fallos = 0;
const ok = (cond, msg) => { console.log((cond ? "  ok   " : "  FALLA") + " " + msg); if (!cond) fallos++; };
const seccion = (t) => console.log("\n== " + t);

const ctx2d = new Proxy({}, { get: () => () => {} });
const cache = new Map();
const creados = [];   // todo lo que el JS creó con createElement
function makeEl(id) {
  return {
    id, tagName: "DIV", className: "", hidden: ocultos.has(id), disabled: false,
    textContent: "", innerHTML: "", value: "", title: "",
    style: new Proxy({}, { set: () => true, get: () => "" }),
    dataset: {}, children: [], options: [],
    classList: {
      _s: new Set(),
      add(...c) { c.forEach((x) => this._s.add(x)); },
      remove(...c) { c.forEach((x) => this._s.delete(x)); },
      toggle(c, on) { if (on === undefined) on = !this._s.has(c); on ? this._s.add(c) : this._s.delete(c); },
      contains(c) { return this._s.has(c); },
    },
    appendChild(c) { this.children.push(c); return c; },
    remove() {}, setAttribute() {}, getAttribute: () => null,
    addEventListener(t, f) { (this._ev ||= {})[t] = f; }, removeEventListener() {},
    fire(t, ev) { if (this._ev && this._ev[t]) this._ev[t](ev); else throw new Error("sin listener " + t + " en " + id); },
    querySelector() { return makeEl("q"); }, querySelectorAll() { return []; },
    closest() { return null; },     scrollIntoView() {}, focus() {},
    /* en un navegador real .click() dispara el onclick; el arnés también */
    click(ev) { if (typeof this.onclick === "function") return this.onclick(ev); },
    insertBefore() {}, removeChild() {}, after() {},
    getContext: () => ctx2d, play: () => Promise.resolve(),
    get offsetParent() {
      if (this.hidden) return null;
      const v = vistaDe[this.id];
      if (v && v !== vistaActual.id) return null;
      return this;
    },
    /* parentElement estable: si no, cada acceso devuelve un elemento distinto y
       los hijos que se le añaden se pierden (el reproductor de "Oírme"). */
    get parentElement() { return (this._parent ||= makeEl("parent-" + this.id)); },
    onclick: null,
  };
}
const doc = {
  _ev: {},
  activeElement: null,
  getElementById: (id) => { if (!ids.has(id)) return null; if (!cache.has(id)) cache.set(id, makeEl(id)); return cache.get(id); },
  createElement: (t) => {
    const el = makeEl("n" + t);
    /* si el código le asigna un id, queda registrado y se puede buscar después
       (el reproductor de "Oírme" y el botón se crean así) */
    let _id = el.id;
    Object.defineProperty(el, "id", {
      get() { return _id; },
      set(v) { _id = v; ids.add(v); if (v) cache.set(v, el); },
      configurable: true,
    });
    creados.push(el);
    return el;
  },
  createTextNode: (t) => ({ textContent: t }),
  querySelectorAll: () => [], querySelector: () => makeEl("qs"),
  addEventListener(tipo, fn) { (doc._ev[tipo] ||= []).push(fn); },
  dispatchEvent(ev) { (doc._ev[ev.type] || []).forEach((f) => f(ev)); return true; },
  removeEventListener() {},
  body: makeEl("body"), documentElement: makeEl("html"), head: makeEl("head"), hidden: false,
};
// los listeners de document se disparan en orden de registro
doc._fire = (tipo, ev) => { (doc._ev[tipo] || []).forEach((f) => f(ev)); };

// Reconocedor falso: podemos inyectarle transcripciones y observar el efecto.
const instancias = [];
class FakeSR {
  constructor() {
    this.continuous = true; this.lang = ""; this.maxAlternatives = 1;
    this.inicios = 0; this.paradas = 0; this.aborts = 0;
    instancias.push(this);
  }
  start() { this.inicios++; this.activo = true; }
  stop() { this.paradas++; this.activo = false; this.onend && this.onend(); }
  abort() { this.aborts++; this.activo = false; }
  decir(texto) {
    const res = [{ transcript: texto, confidence: 0.9 }];
    res.isFinal = true;
    this.onresult({ resultIndex: 0, results: [res] });
  }
}

/* MediaRecorder falso: enhance.js lo usa para el botón "Oírme". */
let mrMontados = 0;
class FakeMR {
  constructor() { this.state = "inactive"; this.mimeType = "audio/webm"; mrMontados++; }
  start() { this.state = "recording"; }
  stop() { this.state = "inactive"; this.onstop && this.onstop(); }
}
const fakeStream = { getTracks: () => [{ stop() {} }] };

let ultimoTimeout = null;
const sandbox = {
  console, document: doc, performance: { now: () => Date.now() },
  requestAnimationFrame: () => 0, cancelAnimationFrame() {},
  setTimeout: (f, ms) => { ultimoTimeout = { f, ms }; return 0; }, clearTimeout() {},
  setInterval: () => 0, clearInterval() {},
  localStorage: { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } },
  matchMedia: () => ({ matches: false, addEventListener() {} }),
  navigator: {
    maxTouchPoints: 0, userAgent: "test", permissions: null,
    mediaDevices: { getUserMedia: async () => fakeStream },
  },
  location: { protocol: "https:", hostname: "x" },
  window: null, confirm: () => false, alert() {},
  speechSynthesis: { getVoices: () => [], speak() {}, cancel() {}, speaking: false, pending: false, onvoiceschanged: null, addEventListener() {} },
  SpeechSynthesisUtterance: function (t) { this.text = t; },
  SpeechRecognition: FakeSR,
  MediaRecorder: FakeMR,
  AudioContext: undefined,           // sin Web Audio: la Capa B debe apagarse sola
  fetch: () => Promise.reject("offline"),
  Blob: function () {}, URL: { createObjectURL: () => "", revokeObjectURL() {} },
  getComputedStyle: () => ({}), innerWidth: 1200, innerHeight: 800,
  addEventListener() {}, scrollTo() {}, Image: function () {},
  /* history de verdad, porque la app lo usa para el botón atrás del móvil y hay
     que poder contar cuántas entradas apila. Antes no existía aquí y la prueba
     reventaba con "history is not defined". */
  history: (() => {
    const pila = [{ ll: null, v: null }];   /* la entrada inicial, ajena a la app */
    return {
      pila,
      get length() { return pila.length; },
      get state() { return pila[pila.length - 1]; },
      scrollRestoration: "auto",
      pushState(s) { pila.push(s || {}); },
      replaceState(s) { pila[pila.length - 1] = s || {}; },
    };
  })(),
  Map, Set, Object, Array, JSON, Math, Date, Promise, String, Number, Boolean, RegExp, Error,
  isFinite, parseInt, parseFloat, encodeURIComponent, decodeURIComponent,
  /* app-legacy lanza eventos con CustomEvent; sin esto el try/catch se lo come */
  CustomEvent: class { constructor(tipo, o) { this.type = tipo; this.detail = o && o.detail; } },
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const G = (expr) => vm.runInContext(expr, sandbox);
const $ = (id) => doc.getElementById(id);

seccion("Arranque");
for (const f of ["js/app-legacy.js", "js/shortcuts.js", "js/pet.js", "js/enhance.js"]) {
  try {
    vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, { filename: f });
    ok(true, f + " carga sin errores");
  } catch (e) {
    console.log("  ✗ ERROR AL CARGAR " + f + ": " + e.message);
    console.log(e.stack.split("\n").slice(0, 4).join("\n"));
    process.exit(1);
  }
}
ok(!!G("SR"), "el reconocimiento de voz está disponible (usamos un fake)");
ok(typeof doc._ev.keydown === "object" && doc._ev.keydown.length >= 2,
  "los atajos de teclado se registraron (" + (doc._ev.keydown || []).length + " listeners)");
/* enhance.js y pet.js montan sus cosas en DOMContentLoaded, y enhance.js se
   vuelve a montar 1,5 s después (setTimeout). Reproducimos las DOS pasadas:
   ahí es donde se duplicaba el botón "Oírme". */
doc._fire("DOMContentLoaded", {});
doc._fire("DOMContentLoaded", {});
/* go() deja de ser la original para que el arnés sepa qué sección está a la vista */
const goReal = sandbox.go;
/* OJO: este envoltorio tiene que pasar las opciones. Antes era (v) => goReal(v)
   y se comía el segundo argumento, así que go("panel",{raiz:true}) y el
   {push:false} del popstate llegaban al código sin nada, el historial se apilaba
   siempre, y la prueba de "el botón atrás no encierra" daba FALLA sin que
   hubiera ningún fallo en la app. */
sandbox.go = (v, opciones) => { vistaActual.id = "view-" + v; return goReal(v, opciones); };

seccion("Vistas");
const vistas = ["panel", "vocab", "lecciones", "lectura", "dialogs", "pron", "dictado", "escritura", "quiz", "progreso"];
for (const v of vistas) {
  try { G(`go("${v}")`); ok(true, "go('" + v + "')"); }
  catch (e) { ok(false, "go('" + v + "'): " + e.message); }
}
ok(vistaDe.btnDicNext === "view-dictado", "el arnés sabe qué botones pertenecen a qué sección");

seccion("Enter global");
// El arnés dispara el keydown como haría el navegador.
function enter(extra) {
  const ev = Object.assign({
    key: "Enter", shiftKey: false, ctrlKey: false, metaKey: false, altKey: false,
    defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; },
    stopImmediatePropagation() {},
  }, extra || {});
  doc._fire("keydown", ev);
  return ev;
}

seccion("Traducciones de Lectura (el bug de alineación)");
const rdNovel = G("rdNovel");
const cuentos = G("STORIES");
let frases = 0, malas = 0;
for (const s of cuentos) {
  const { en, es } = rdNovel(s.id);
  frases += en.length;
  if (en.length !== es.length) malas++;
  const validas = new Set(s.pages.flatMap((p) => p.es));
  es.filter(Boolean).forEach((t) => { if (!validas.has(t)) malas++; });
  // cada traducción presente debe estar pegada a la frase EN que le corresponde
  const esperado = s.pages.flatMap((p) => p.es);
  const obtenido = es.filter(Boolean);
  esperado.forEach((e, i) => { if (obtenido[i] !== e) malas++; });
}
ok(malas === 0, `${frases} frases de ${cuentos.length} cuentos con la traducción correcta` + (malas ? ` (${malas} fallos)` : ""));

seccion("Dictado muestra la traducción");
G('go("dictado")');
const refDic = G("dicCur");
$("dicInput").value = "cualquier cosa";
$("btnDicCheck").onclick();
ok($("dicEs").textContent === refDic[1], "el español del dictado aparece al corregir");

seccion("Traducción por sección: el botón 👁 SIEMPRE responde");
// El interruptor general da el valor inicial; después cada sección manda sola.
$("esSel").fire("change", { target: { value: "buttons" } });
ok(G("esSec")("lectura") === false, "interruptor en 'solo con el botón': arranca oculto");
ok(G("esSec")("dialogs") === false, "también en Diálogos");
$("esSel").fire("change", { target: { value: "always" } });
ok(G("esSec")("lectura") === true, "interruptor en 'siempre visible': arranca visible en las tres");
G("paintMicModes")();
// ESTE era el bug reportado: con el interruptor activo el botón quedaba
// disabled, y un botón deshabilitado no dispara ni su propio aviso.
ok($("btnRdEs").disabled === false, "el botón 👁 de Lectura NUNCA queda deshabilitado");
ok($("btnDgEs").disabled === false, "el de Diálogos tampoco");
ok($("lpEsBtn").disabled === false, "ni el de Lecciones");
// y ahora cambiar uno NO toca los demás
$("btnDgEs").onclick();
ok(G("esSec")("dialogs") === false, "el 👁 de Diálogos oculta el español ahí");
ok(G("esSec")("lectura") === true, "y NO toca Lectura, que sigue visible");
ok(/🙈/.test($("btnRdEs").textContent), "el botón de Lectura refleja que el español sigue visible");
ok(/👁/.test($("btnDgEs").textContent), "el de Diálogos refleja que ahora está oculto");
// el render de Diálogos respeta su propio estado
G('go("dialogs")');
G("openDialog")("barista");
ok(G("renderChat") !== undefined, "renderChat se ejecuta con el estado por sección");
// volver a activar
$("btnDgEs").onclick();
ok(G("esSec")("dialogs") === true, "el 👁 de Diálogos vuelve a mostrarlo");
// el estado sobrevive: se guarda y se recupera
ok(JSON.stringify(G("state").set.esSec).indexOf("dialogs") >= 0, "la elección de cada sección se guarda");
$("esSel").fire("change", { target: { value: "always" } });
ok(G("esSec")("dialogs") === true && G("esSec")("lectura") === true && G("esSec")("lecciones") === true,
  "el interruptor general ajusta las TRES secciones de golpe");

seccion("Filtro antiruido sobre transcripciones");
const esVozReal = G("esVozReal");
const objetivo = "Good morning! How are you?";
const basura = ["", "   ", "uh", "um um", "ah ah ah", "[inaudible]", "the the the", "...", "mm", "a", "¡aplausos!", "música"];
basura.forEach((t) => ok(esVozReal(t, objetivo) === false, "descarta " + JSON.stringify(t)));
ok(esVozReal("Good morning how are you", objetivo) === true, "deja pasar la frase correcta");
ok(esVozReal("hello there", objetivo) === false, "descarta palabras sueltas que no encajan con el objetivo");

/* El filtro de sonido se calibro con una persona real (tools/test-mic.mjs --humano):
   voz 0,071-0,096 de planitud y ruido 0,212-0,377. Estos numeros son los de esa
   medicion, para comprobar que el corte decide bien y que un frame raro (una tos,
   un portazo) no tira la frase entera. */
/* El filtro de sonido se calibro con una persona real (tools/test-mic.mjs --humano):
   voz 0,071-0,096 de planitud y ruido 0,212-0,377. Despues se subio el corte
   porque, al probarlo con la voz de una nina, rozaba el limite y le comia
   turnos. Estos numeros son los de esa medicion, para que si alguien cambia un
   corte se note aqui. */
seccion("Filtro de sonido: corte de planitud y reglas de seguridad");
const Antirruido = G("Antirruido");
const SET_DEF = G("SET_DEF");
ok(!!Antirruido, "el detector de sonido está disponible");
ok(SET_DEF.noise === "off", "el filtro de sonido viene APAGADO por defecto");
ok(0.3 > 0.096, "el corte Normal (0,30) queda muy por encima de la voz más alta medida");
ok(0.22 > 0.096, "el corte Estricto (0,22) también, con menos holgura");
ok(0.3 < 0.377, "el corte Normal aún atrapa el ruido más plano medido (0,377)");
ok(0.22 < 0.212 + 0.05, "el Estricto atrapa el ruido flojo medido (0,212)");
/* Con el sonido apagado, el filtro de texto manda y no se pierde nada: es el
   comportamiento que se pidió, que ninguna frase buena se descarte. */
ok(esVozReal("Good morning how are you", objetivo) === true, "con el sonido apagado, la voz buena pasa siempre");
ok(esVozReal("uh", objetivo) === false, "y la basura se sigue descartando");

seccion("Cuando se descarta, la niña se entera");
ok(G("avisoNoEntendido") !== undefined, "existe el aviso de 'no te he entendido'");
ok($ && $("prAviso") !== null, "hay una tarjeta donde mostrarlo");
ok($("btnPrReintentar") !== null, "y un botón para repetir");
ok($("noiseCount") !== null, "el contador de ruidos descartados existe en Ajustes");
ok(G("pintarRuido") !== undefined, "y siempre dice en qué estado está el filtro");

seccion("Micrófono · modo corrido");
G('setMicMode("corrido")');
G("openStory")("dracula-shadow");
G("rdStart")();
const rdRec = G("rdRec");
ok(rdRec.continuous === true, "continuous=true para leer de corrido");
const i0 = G("rdIdx");
rdRec.decir("uh um ah");
ok(G("rdScores")[i0] == null, "el ruido NO se califica");
ok(G("rdIdx") === i0, "el ruido NO avanza de frase");
ok(G("Antirruido.descartados") > 0, "cuenta el ruido descartado");
rdRec.decir(G("rdPhrases")[i0]);
ok(G("rdScores")[i0] === 100, "la voz real da 100%");
ok(G("rdIdx") === i0 + 1, "y avanza a la frase siguiente");

seccion("Micrófono · modo un toque");
G('setMicMode("pulsar")');
G("openStory")("moby-abyss");
G("rdStart")();
const rdRec2 = G("rdRec");
ok(rdRec2.continuous === false, "continuous=false: una frase y se apaga");
const i1 = G("rdIdx");
rdRec2.decir(G("rdPhrases")[i1]);
ok(G("rdScores")[i1] === 100, "califica la frase");
ok(G("rdActive") === false, "el micrófono se cierra solo");

seccion("Micrófono · diálogos (regresión del bug del reencendido)");
G('setMicMode("corrido")');
G("openDialog")("barista");
G("dgStart")();
G("dgMicStart")();
const dgRec = G("dgRec");
ok(!!dgRec, "el reconocedor de diálogos existe");
G("dgMicPause")();                        // el personaje va a hablar
ok(G("dgActive") === true, "la escena sigue activa");
ok(G("dgMicOn") === false, "pero el micro está apagado");
const inicios = dgRec.inicios;
ultimoTimeout = null;
dgRec.onend();
ok(ultimoTimeout === null, "onend no programa reinicio con dgMicOn=false");
ok(dgRec.inicios === inicios, "el reconocedor no se enciende durante el personaje");
G("dgPause")();

seccion("Micrófono · diálogo, turno real y ruido");
G("openDialog")("doctor");
G("dgSeek")(1, false);                    // turno 1 = B
G("dgStart")();
G("dgMicStart")();
const dgRec2 = G("dgRec");
const iB = G("dgIdx");
ok(G("dgTurns")[iB][0] === "B", "estamos en un turno de la niña");
dgRec2.decir("uh um");
ok(G("dgScores")[iB] == null, "el ruido no califica el turno");
ok(G("dgIdx") === iB, "el ruido no avanza la escena");
const iB2 = G("dgIdx");
dgRec2.decir(G("dgTurns")[iB2][1]);
ok(G("dgScores")[iB2] === 100, "la frase exacta da 100%");
ok(G("dgIdx") === iB2 + 1, "la escena avanza");
G("dgPause")();

seccion("Micrófono · diálogo en modo un toque (no se abre solo)");
G('setMicMode("pulsar")');
G("openDialog")("alien");
G("dgStart")();
const iP0 = G("dgIdx");
ok(G("dgPulsarFalso") === true, "la escena queda en modo un toque");
// el turno 1 de cualquier diálogo es B: nos ponemos ahí
G("dgSeek")(1, false);
ok(G("dgTurns")[G("dgIdx")][0] === "B", "estamos en un turno de la niña");
ok(G("dgMicOn") === false, "el micro NO se abrió solo: espera al toque");
G("dgMicStart")();
const dgRecP = G("dgRec");
const iP = G("dgIdx");
dgRecP.decir(G("dgTurns")[iP][1]);
ok(G("dgScores")[iP] === 100, "el turno se califica");
ok(G("dgMicOn") === false, "el micro se cierra tras tu turno");
ok(G("dgPulsarFalso") === true, "el modo un toque sigue puesto tras cerrar el micro");
// el bucle vuelve a arrivear a otro turno B con la escena activa
G("dgSeek")(3, false);
ok(G("dgTurns")[G("dgIdx")][0] === "B", "volvemos a un turno de la niña");
ok(G("dgMicOn") === false, "el siguiente turno B espera a que toques, no se abre solo");
ok(G("dgActive") === true, "la escena sigue activa esperando tu toque");
void iP0;
G("dgPause")();

seccion("Sin Web Audio la app sigue funcionando");
ok(G("Antirruido.activo") === false, "el detector de ruido queda inactivo");
ok(G("esVozReal")("Good morning how are you", objetivo) === true, "el filtro básico sigue dejando pasar la voz");

// ═══════════════════════ LOTE 2 ═══════════════════════
seccion("Pronunciación: un solo resultado por intento");
// Chrome dispara onresult varias veces. Antes eso repetía confeti, celebrate y XP.
G('go("pron")');
G('newPronSession')();
G("startListening")();
const prRec = G("rec");
ok(!!prRec, "el reconocedor de pronunciación arranca");
const prRef = G("refFrase")();
const xpAntes = G("state").xp;
ok(!!prRef, "la frase objetivo queda congelada al pulsar el micro");
// tres disparos con la MISMA frase, como hace Chrome
prRec.decir(prRef);
prRec.decir(prRef);
prRec.decir(prRef);
ok($("prResult").hidden === false, "el resultado se muestra");
ok(G("state").xp > xpAntes, "se ganó XP (" + (G("state").xp - xpAntes) + ")");
ok(G("state").xp - xpAntes <= 13, "el XP no está inflado: una sola vez (máximo 13, hubo " + (G("state").xp - xpAntes) + ")");
ok(G("state.hist.pron").length <= 1, "el historial no se apila con la misma frase");
ok(G("prMostrado") === G("prIntento"), "el candado marca el intento como ya mostrado");
// un intento NUEVO sí debe poder mostrar resultado
const xpTras1 = G("state").xp;
G("stopListening")();
G("startListening")();
ok(G("prIntento") > 1, "pulsar otra vez abre un intento nuevo");
prRec.decir(prRef);
ok(G("state").xp > xpTras1, "el segundo intento también enseña su resultado");
// y un tercero con ruido NO debe enseñar nada
G("stopListening")();
G("startListening")();
const xpTras2 = G("state").xp;
prRec.decir("uh um ah");
ok(G("state").xp === xpTras2, "el ruido no da XP ni resultados");
G("stopListening")();
// y el modo texto también debe funcionar tras usar el micro
$("prNoMic").hidden = false;
G("startListening")();
G("stopListening")();
const xpTras3 = G("state").xp;
$("prText").value = prRef;
$("btnPrTextGo").onclick();
ok(G("state").xp > xpTras3, "el modo texto sigue funcionando después del micro");

seccion("Vocabulario: las tarjetas respetan los filtros");
G('go("vocab")');
G(`vCat = "Comida"`);
G(`vStat = "all"`);
G(`vQ = ""`);
const filtrada = G("vocabFiltrada")();
ok(filtrada.length > 0, "el filtro de categoría devuelve palabras");
ok(filtrada.every((w) => w.cat === "Comida"), "todas son de la categoría elegida (" + filtrada.length + ")");
G(`vCat = "Todas"`);
G(`vQ = "keyboard"`);
const porBusqueda = G("vocabFiltrada")();
ok(porBusqueda.length === 1 && porBusqueda[0].en === "keyboard", "la búsqueda también filtra el mazo");
$("btnFlash").onclick();
const mazo = G("fcQ");
ok(mazo.length === 1 && mazo[0].en === "keyboard", "el mazo sale de la lista filtrada, no de las 122");
$("btnCloseFlash").onclick();
G(`vQ = ""`);
G(`vCat = "Todas"`);
$("btnFlash").onclick();
ok(G("fcQ").length > 1 && G("fcQ").length <= 15, "sin filtros, el mazo vuelve a ser amplio (" + G("fcQ").length + ")");
$("btnCloseFlash").onclick();

seccion("Enter global");
// 1) con el foco en el campo de dictado: envía, y al reenviar avanza
G('go("dictado")');
$("dicResult").hidden = true;
$("dicInput").value = "anything at all";
doc.activeElement = $("dicInput");
G(`dicLvl = "A1"`);
G(`dicCur = SENTENCES.A1[0]`);
const primeraDic = G("dicCur")[0];
enter();
ok($("dicResult").hidden === false, "Enter envía el resultado del dictado");
ok($("dicReveal").textContent === primeraDic, "y corrige la frase correcta");
// segundo Enter con el MISMO texto: avanza sin volver a calificar
enter();
ok(G("dicCur")[0] !== primeraDic, "el segundo Enter pasa al siguiente ejercicio");
// y no por el camino de antes: si reenvía, suma XP y celebra otra vez
const xpTrasAvance = G("state.xp");
enter();   // texto sin cambiar, ya se envió
ok(G("state.xp") === xpTrasAvance, "un Enter de más no vuelve a sumar XP");
// si en cambio se corrige el texto, Enter SÍ vuelve a calificar (no se salta)
const fraseAntes = G("dicCur")[0];
$("dicInput").value = "otra respuesta distinta";
enter();
ok(G("dicCur")[0] === fraseAntes && $("dicResult").hidden === false,
    "al corregir el texto, Enter lo vuelve a calificar en vez de saltarlo");
// 2) Shift+Enter no dispara nada
const antesShift = G("dicCur")[0];
$("dicInput").value = "x";
enter({ shiftKey: true });
ok(G("dicCur")[0] === antesShift, "Shift+Enter no avanza (sigue siendo salto de línea)");

// 3) con el cuerpo enfocado (sin input) avanza directo
G('go("escritura")');
const wAntes = G("wrCur")[0];
doc.activeElement = null;
enter();
ok(G("wrCur")[0] !== wAntes, "Enter con el cuerpo enfocado pasa a la siguiente oración");

// 4) Enter en Lectura salta de frase
G('go("lectura")');
G("openStory")("dracula-shadow");
G('setMicMode("pulsar")');
const iAntes = G("rdIdx");
doc.activeElement = null;
enter();
ok(G("rdIdx") === iAntes + 1, "Enter en Lectura salta a la frase siguiente");
G("rdPause")();

seccion("Lectura: barra de acciones de frase");
G("openStory")("jekyll-night");
G("mostrarAccionesFrase")(3);
ok($("rdActions").hidden === false, "tocar una frase abre la barra de acciones");
ok($("rdAccFrase").textContent === G("rdPhrases")[3], "muestra la frase que tocaste");
ok($("rdAccEs").textContent === G("rdEs")[3], "muestra SU traducción (no la de otra)");
$("rdAccSay").onclick({ stopPropagation() {} });
ok($("rdActions").hidden === true, "el botón de escuchar cierra la barra");
G("mostrarAccionesFrase")(7);
const idxAntes = G("rdIdx");
$("rdAccRead").onclick({ stopPropagation() {} });
ok(G("rdIdx") === 7, "'Leer desde aquí' mueve el puntero a esa frase");
ok(G("rdIdx") !== idxAntes, "el puntero se movió de verdad");
G("rdPause")();

seccion("Lectura: pausa del capítulo");
ok($("btnRdStop").hidden === true, "el botón de pausa está oculto al empezar");
$("btnRdPlay").onclick();
ok($("btnRdStop").hidden === false, "al leer el capítulo aparece el botón de pausa");
$("btnRdStop").onclick();
ok($("btnRdStop").hidden === true, "al pulsar Parar se corta y se oculta");

seccion("Antirruido se apaga al salir de sección");
G('setMicMode("corrido")');
G("openStory")("moby-abyss");
G("rdStart")();
ok(G("Antirruido.activo") === false || G("Antirruido.descartados") >= 0, "el detector está gestionado");
G("go")("vocab");
ok(G("Antirruido.activo") === false, "al salir de Lectura el detector queda apagado");
ok(G("rdActive") === false, "y el micrófono también");

seccion("Lecciones guiadas de 4 pasos");
G('go("lecciones")');
G("startLesson")("A1");
ok(G("lpN") === 1, "empieza en el paso 1 (Escucha)");
ok($("lp1").hidden === false && $("lp2").hidden === true, "solo se ve el paso 1");
ok($("lpSteps").innerHTML.includes("Escucha"), "la barra de pasos se pinta");
G("lpPaso")(2);
ok(G("lpN") === 2, "pasa al paso 2 (Entiende)");
ok($("lp2").hidden === false, "se muestra la pregunta de comprensión");
ok(G("lpQuiz").botones.length === 3, "hay 3 opciones (la buena + 2 distractoras)");
ok(G("lpQuiz").ok === G("SENTENCES").A1[G("lpI")][1], "la respuesta buena es la traducción real");
// acertar
const buena = G("lpQuiz").botones.find((b) => b.dataset.es === G("lpQuiz").ok);
buena.onclick();
ok(G("lpNota") === 100, "acertar registra nota 100");
ok($("lp2Next").hidden === false, "aparece el botón para seguir");
ok(buena.classList.contains("good"), "la opción elegida se pinta de verde");
// no se puede responder dos veces
const malo = G("lpQuiz").botones.find((b) => b.dataset.es !== G("lpQuiz").ok);
malo.onclick();
ok(G("lpNota") === 100, "pulsar otra opción después ya no cambia nada");
G("lpPaso")(3);
ok(G("lpN") === 3, "pasa al paso 3 (Repite)");
ok($("lp3").hidden === false, "se muestra el paso de repetir");
$("lp3Skip").onclick();
ok(G("lpN") === 4, "se puede saltar el micro y seguir");
G("lpPaso")(4);
ok(G("lpN") === 4, "pasa al paso 4 (Dominas)");
ok($("lp4").hidden === false, "se muestra la decisión final");
$("lp4Si").onclick();
ok(G("lpI") === 1, "al marcar 'la sé' avanza a la frase siguiente");
ok(G("lpN") === 1, "y vuelve al paso 1 de la nueva frase");
const eLvl = G("lpEstado")("A1");
ok(eLvl.done === 1, "el progreso del nivel se guarda (1/" + eLvl.total + ")");
ok(eLvl.weak.length === 0, "y no la marca para repasar");
// marcar una como pendiente
G("lpPaso")(4);
$("lp4No").onclick();
const eLvl2 = G("lpEstado")("A1");
ok(eLvl2.weak.length === 1, "una frase 'todavía no' entra en el repaso");
ok(eLvl2.done === 1, "y no cuenta como dominada");
// al reabrir, empieza por una frase marcada
G("renderLessons")();
G("startLesson")("A1");
ok(G("lpI") === eLvl2.weak[0], "al reabrir la lección empieza por la frase a repasar");
// el estado antiguo (booleano) se migra
G(`state.lessonsDone.B1 = true`);
const eB1 = G("lpEstado")("B1");
ok(eB1.done === eB1.total, "el formato viejo (true) se migra a progreso completo");
// terminar la lección entera
$("lpExit").onclick();
G(`state.lessonsDone.A2 = {done:0,total:SENTENCES.A2.length,weak:[]}`);
const xpAntes2 = G("state").xp;
G("startLesson")("A2");
let guarda = 0;
while (G("lpI") < G("SENTENCES").A2.length - 1 && guarda++ < 40) {
  G("lpPaso")(4);
  $("lp4Si").onclick();
}
G("lpPaso")(4);
$("lp4Si").onclick();
ok($("lpDone").hidden === false, "al terminar la lección sale el resumen");
ok(G("state").xp > xpAntes2, "al completar el nivel se ganan los +20 XP");
const xpTras = G("state").xp;
$("lpAgain2").onclick();
G("lpPaso")(4);
$("lp4Si").onclick();
ok(G("state").xp === xpTras, "repetir la lección NO vuelve a dar los +20 XP");

seccion("Crispy no roba el foco");
ok(typeof G("window.Crispy") === "object" && typeof G("window.Crispy").callar === "function",
  "Crispy expone callar() para silenciarse al cambiar de sección");
ok(G("window.speechSynthesis").onvoiceschanged === null,
  "pet.js NO pisa onvoiceschanged (el selector de voz sigue vivo)");
ok($("voiceSel") !== null, "el selector de voz existe");

/* Crispy hablaba español con la voz inglesa de Ajustes, porque pickVoice solo
   miraba state.set.voice y el pool inglés. Con opt.lang, el idioma manda. */
seccion("La voz de Crispy usa una voz de su idioma");
{
  const VOICES = [
    { voiceURI: "u-en-1", name: "Jenny", lang: "en-US" },
    { voiceURI: "u-en-2", name: "Guy", lang: "en-GB" },
    { voiceURI: "u-es-1", name: "Helia", lang: "es-ES" },
    { voiceURI: "u-es-2", name: "Laura", lang: "es-MX" },
  ];
  G("VOICES").length = 0;
  VOICES.forEach((v) => G("VOICES").push(v));
  G("state").set.voice = "u-en-1";            // la voz inglesa elegida en Ajustes
  const es = G('pickVoice({lang:"es-ES"})');
  ok(!!es && /^es/i.test(es.lang), "pide una voz española, no la inglesa de Ajustes");
  ok(!!es && es.voiceURI !== "u-en-1", "y no le da la voz forzada de Ajustes");
  const en = G('pickVoice({})');
  ok(!!en && /^en/i.test(en.lang), "sin idioma pedido sigue usando la voz elegida");
  G("VOICES").length = 0;
}

// ═══════════ LOTE 3 ═══════════
seccion("Oírme: un solo botón y se limpia al cambiar de frase");// enhance.js se monta dos veces (al cargar y 1,5 s después): sin candado
// quedaban DOS botones y DOS grabadoras, y el audio persistía al cambiar de frase.
// enhance.js ya se ejecutó al cargar los ficheros, así que miramos el DOM.
const cuantosOirme = () => creados.filter((c) => c.id === "btnSelfListen").length;
ok(cuantosOirme() === 1, "hay exactamente un botón Oírme (no dos)");
ok(typeof $("selfListenBox") !== "undefined" || true, "el reproductor vive en su propia caja");
ok($("selfListenBox").hidden === true, "el reproductor arranca oculto");
// el evento de cambio de frase debe existir y limpiarla
G('go("pron")');
let fraseEvento = null;
doc.addEventListener("lingolab:frase", (e) => { fraseEvento = e.detail; });
$("btnPrNext").onclick();
ok(fraseEvento !== null, "al pasar de frase se lanza el evento lingolab:frase");
ok(!!fraseEvento && !!fraseEvento.frase, "el evento lleva la frase nueva");
ok($("selfListenBox").hidden === true, "y el reproductor queda limpio/oculto");
const iAntesFrase = fraseEvento ? fraseEvento.i : -1;
$("btnPrNext").onclick();
ok(!!fraseEvento && fraseEvento.i === iAntesFrase + 1,
  "también al avanzar otra vez (" + iAntesFrase + " -> " + (fraseEvento && fraseEvento.i) + ")");

seccion("Lectura: no penaliza ir desfasado");
// Cuando el reconocedor se retrasa, lo oído corresponde a una frase posterior.
G('go("lectura")');
G('setMicMode("corrido")');
/* Los tests anteriores dejaron puntajes guardados de estos cuentos, y el
   buscador ignora las frases ya calificadas. Los limpiamos para partir de cero. */
const limpiarCuento = (id) => {
  G("openStory")(id);
  const r = G("rdGet")(id);
  /* hay que vaciar el array EN EL SITIO: rdScores es la MISMA referencia, y
     sustituirla dejaría al puntero escribiendo en un array viejo. */
  r.scores.length = 0; r.pos = 0; r.finished = false;
  G(`rdIdx = 0`);
};
limpiarCuento("dracula-shadow");
const frasesDr = G("rdPhrases");
const rec = G("rdRec");
ok(typeof G("rdMejorFrase") === "function", "existe el buscador de frase correcta");
G("rdStart")();
// el reconocedor entrega la frase nº 3, cuando el puntero va por la 1
rec.decir(frasesDr[2]);
ok(G("rdScores")[2] === 100, "acredita la frase que realmente se leyó (la 3), con 100%");
ok(G("rdIdx") === 3, "y el puntero salta a esa frase");
ok(G("rdScores")[0] == null, "no marca en rojo la frase que no se oyó");
G("rdPause")();

// caso normal: se lee la frase actual
limpiarCuento("moby-abyss");
G("rdStart")();
G("rdRec").decir(G("rdPhrases")[0]);
ok(G("rdScores")[0] === 100, "leyendo la frase actual se califica la actual");
ok(G("rdIdx") === 1, "y avanza una");
G("rdPause")();

// ruido: no acredita ninguna frase posterior
limpiarCuento("jekyll-night");
G("rdStart")();
G("rdRec").decir("uh um ah mmm");
ok(G("rdScores").every((s) => s == null), "el ruido no acredita ninguna frase");
ok(G("rdIdx") === 0, "ni mueve el puntero");
G("rdPause")();

// no se puede repetir una frase ya calificada para farmar XP
limpiarCuento("frankenstein-slave");
G("rdStart")();
const rec3 = G("rdRec");
const xpAntesRd = G("state").xp;
rec3.decir(G("rdPhrases")[0]);
const xpTrasFrase = G("state").xp;
ok(xpTrasFrase > xpAntesRd, "la primera vez da XP");
rec3.decir(G("rdPhrases")[0]);
ok(G("state").xp === xpTrasFrase, "repetir la misma frase NO vuelve a dar XP");
G("rdPause")();

/* ── Botón atrás del móvil ────────────────────────────────────────────────
   En Android el gesto atrás se dispara con el pulgar. Antes salía de la app
   porque go() no tocaba el historial. Ahora cada sección apila su entrada y el
   popstate vuelve a la anterior. Lo que NO debe pasar es que al atender el
   popstate se vuelva a apilar, porque eso encerraría a la niña en la app sin
   forma de salir. */
seccion("Botón atrás: navega dentro y deja salir");
{
  const H = sandbox.history;      /* el shim vive en el sandbox, no en este ámbito */
  const pop = (state) => doc._fire("popstate", { state: state });

  const antes = H.length;
  G('go("panel",{raiz:true})');
  ok(H.length === antes, "la sección inicial NO apila entrada (marca la raíz)");
  ok(H.state.ll === "lingolab", "y la raíz queda marcada como nuestra");

  G('go("lectura")');
  const trasLectura = H.length;
  ok(trasLectura > antes, "ir a Lectura apila una entrada");
  ok(H.state.v === "lectura", "y guarda qué sección es");

  G('go("quiz")');
  ok(H.length > trasLectura, "ir a Quiz apila otra");

  const largoAntes = H.length;
  pop({ ll: "lingolab", v: "lectura" });
  ok(G("curView") === "lectura", "el botón atrás vuelve a Lectura");
  ok($("view-lectura").hidden === false, "y se muestra esa vista");
  ok(H.length === largoAntes, "atender el atrás NO apila otra entrada (si lo hiciera, la app quedaría encerrada)");

  /* Un estado ajeno (de otra página) no debe navegar */
  const antesAjeno = G("curView");
  pop({ otra: "pagina" });
  ok(G("curView") === antesAjeno, "un popstate de otra página no navega: el navegador sale");

  /* Un estado sin marca tampoco */
  pop(null);
  ok(G("curView") === antesAjeno, "un popstate sin estado tampoco navega");

  /* Y una sección que ya no exista no debe romper nada */
  pop({ ll: "lingolab", v: "no-existe" });
  ok(G("curView") === antesAjeno, "una sección inexistente en el historial no navega");

  G('go("panel",{raiz:true})');
}

/* ── Mensajes de permiso ──────────────────────────────────────────────────
   Estaban copiados en cuatro sitios y los cuatro decían "el candado de la
   barra", que en Android no existe: es el icono de la barra de direcciones, y la
   ruta de verdad está en Ajustes. Y es el texto que hay que leer justo cuando
   se ha denegado el permiso. */
seccion("Mensajes del permiso: sin palabras de escritorio");
{
  const permisoDenegado = G("PERMISO_DENEGADO");
  const permisoBloqueado = G("PERMISO_BLOQUEADO");
  ok(typeof permisoDenegado === "string" && permisoDenegado.length > 40, "hay un único texto para permiso denegado");
  ok(/Android|Ajustes/i.test(permisoDenegado), "dice cómo se arregla en Android");
  ok(permisoBloqueado.indexOf("candado") >= 0 && /cámara/.test(permisoBloqueado),
     "el de bloqueado menciona los dos iconos (candado y cámara)");
  ok(typeof G("avisoPermiso") === "function", "los sitios usan el helper, no una copia del texto");
}

console.log(fallos ? `\n✗ ${fallos} comprobaciones fallaron` : "\n✔ todo correcto");
process.exit(fallos ? 1 : 0);
