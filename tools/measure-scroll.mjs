/* LingoLab — mide el scroll de verdad, sección por sección.
 *
 * Por qué existe: dos veces se arregló el scroll "a ojo" y las dos veces la
 * causa real era otra. Esta herramienta no opina: abre la app en un Chrome de
 * verdad y da los números que mueven la barra.
 *
 * La pregunta que responde, en corto: ¿hay píxeles de scroll que no llevan a
 * ninguna parte? Si el documento es más alto que la ventana pero el contenido
 * se acaba antes, la rueda mueve la barra y no se ve nada, que es justo lo que
 * pasaba en Dictado, Escritura, Quiz, Juegos y Lecciones.
 *
 *   node tools/measure-scroll.mjs              mide 1280x800 y 1920x1080
 *   node tools/measure-scroll.mjs --ancho=1440 --alto=900
 *   node tools/measure-scroll.mjs --visible    ventana de verdad, para mirarla
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { spawn, execFileSync } from "node:child_process";
/* WebSocket es el global de Node (>=22), como en test-mic.mjs. El proyecto no
   tiene package.json ni node_modules, así que no se puede importar "ws". */

const PUERTO_APP = 8000;
const PUERTO_CDP = 9345;
const TMP = path.join(os.tmpdir(), "lingolab-scroll");
const HEADLESS = !process.argv.includes("--visible");

const arg = (n, d) => {
  const a = process.argv.find((x) => x.startsWith("--" + n + "="));
  return a ? Number(a.split("=")[1]) : d;
};
const VENTANAS = HEADLESS
  ? [[arg("ancho", 1280), arg("alto", 800)], [1920, 1080]]
  : [[0, 0]];

const CHROME = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].find((p) => p && fs.existsSync(p));

/* Las 11 vistas, en el orden de la barra lateral. juegos lo inyecta games.js
   en RENDER, así que se comprueba en tiempo de ejecución. */
const VISTAS = [
  ["panel", "Panel"], ["vocab", "Vocabulario"], ["lecciones", "Lecciones"],
  ["lectura", "Lectura"], ["dialogs", "Diálogos"], ["pron", "Pronunciación"],
  ["dictado", "Dictado"], ["escritura", "Escritura"], ["quiz", "Quiz"],
  ["juegos", "Juegos"], ["progreso", "Progreso"],
];

let fallos = 0;
const cabecera = (t) => console.log("\n" + t + "\n" + "=".repeat(t.length));
const ok = (c, m) => { console.log((c ? "  ok    " : "  FALLA") + " " + m); if (!c) fallos++; };

function httpGet(url) {
  return new Promise((res, rej) => {
    const req = http.get(url, (r) => {
      let body = "";
      r.on("data", (c) => (body += c));
      r.on("end", () => res({ status: r.statusCode, body }));
    });
    req.on("error", rej);
    req.setTimeout(4000, () => { req.destroy(new Error("timeout")); });
  });
}
async function esperarCDP(puerto, ms = 25000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try { const r = await httpGet(`http://127.0.0.1:${puerto}/json/version`); if (r.status === 200) return JSON.parse(r.body); }
    catch (e) { /* aun no esta */ }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("Chrome no abrió el puerto " + puerto);
}
function matarArbol(pid) {
  try { execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" }); } catch (e) {}
}

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.espera = new Map(); this.sesion = null;
    ws.addEventListener("message", (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && this.espera.has(m.id)) {
        const { res, rej } = this.espera.get(m.id);
        this.espera.delete(m.id);
        m.error ? rej(new Error(m.error.message)) : res(m.result);
      }
    });
  }
  enviar(method, params = {}, sessionId) {
    const id = ++this.id;
    const sid = sessionId === undefined ? this.sesion : sessionId;
    const msg = { id, method, params };
    if (sid) msg.sessionId = sid;
    this.ws.send(JSON.stringify(msg));
    return new Promise((res, rej) => {
      this.espera.set(id, { res, rej });
      setTimeout(() => { if (this.espera.has(id)) { this.espera.delete(id); rej(new Error("timeout en " + method)); } }, 30000);
    });
  }
  async evaluar(expr, awaitPromise = false) {
    const r = await this.enviar("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "error en la página");
    return r.result.value;
  }
  async esperarA(expr, ms = 30000, paso = 400) {
    const t0 = Date.now();
    let u = null;
    while (Date.now() - t0 < ms) {
      u = await this.evaluar(`(()=>{try{return ${expr}}catch(e){return null}})()`);
      if (u) return u;
      await new Promise((r) => setTimeout(r, paso));
    }
    return u;
  }
}

/* Una sola evaluación saca todas las medidas de una sección.
   scrollReal: cuánto avanza la página de verdad cuando se le pide bajar mucho.
   Si el recorrido es de 36 px, la rueda no tiene dónde ir y la barra "se
   mueve" sin que haya nada debajo: eso es el defecto que se busca. */
const MEDIR = `(function(){
  var doc = document.documentElement, de = document.scrollingElement;
  var shell = document.querySelector('.shell'), nav = document.querySelector('nav.side');
  var main = document.querySelector('main');
  var comportamiento = getComputedStyle(doc).scrollBehavior;
  /* OJO: scroll-behavior es "smooth" en el CSS, así que un scrollBy normal se
     ANIMA y leer la posición al instante daría 0, que es un 0 falso. Se pide
     "instant" explícitamente para poder medir el recorrido real. */
  de.scrollTop = 0;
  window.scrollTo({top:0, behavior:"instant"});
  window.scrollBy({top:800, behavior:"instant"});
  var avanza = de.scrollTop;
  window.scrollTo({top:0, behavior:"instant"});
  var r = nav ? nav.getBoundingClientRect() : null;
  /* Quién estira el documento: los elementos cuyo fondo llega más abajo que el
     final del shell. Sin esto, cuando el shell mide 880 y el documento 1123 no
     hay forma de saber de dónde salen los 138 px de más. */
  /* Qué elemento llega más abajo, distinguiendo contenido de decoración.
     Un scroll fantasma es: documento más alto que la ventana, pero NADA de
     contenido real más abajo (solo decoración). Eso es un defecto.
     Si en cambio hay contenido de verdad que no cabe, es una página normal y
     larga: no es un fallo, y hay que decirlo así para no marcarlo como error. */
  var shellBottom = shell ? shell.getBoundingClientRect().bottom : 0;
  var decoracion = document.getElementById("bgLetters");
  var lateral = document.querySelector("nav.side");
  var esDecoracion = function (el) {
    while (el && el !== document.body) {
      if (el === decoracion || el === lateral) return true;
      el = el.parentElement;
    }
    return false;
  };
  var fondoReal = 0, culpables = [];
  var todos = document.querySelectorAll("body *");
  for (var i = 0; i < todos.length; i++) {
    var el = todos[i], cs = getComputedStyle(el);
    if (cs.position === "fixed" || cs.display === "none" || cs.visibility === "hidden") continue;
    if (esDecoracion(el)) continue;
    var b = el.getBoundingClientRect();
    if (b.height === 0) continue;
    if (b.bottom > fondoReal) fondoReal = b.bottom;
    if (b.bottom > shellBottom + 2) {
      var ruta = [], n = el, salto = 0;
      while (n && n !== document.body && salto < 4) {
        var id = n.id ? "#" + n.id : (n.className && typeof n.className === "string" ? "." + n.className.trim().split(/\\s+/).join(".") : "");
        ruta.unshift(n.tagName.toLowerCase() + id);
        n = n.parentElement; salto++;
      }
      culpables.push({ q: ruta.join(">").slice(0, 54), b: Math.round(b.bottom - shellBottom), h: Math.round(b.height), p: cs.position });
    }
  }
  var vis = window.innerHeight;
  var document0 = document.documentElement.scrollHeight - window.innerHeight;
  var fantasma = document0 > 2 && fondoReal <= vis + 2;   /* nada real más abajo */
  var top3 = culpables.slice(0, 2).sort(function (a, b) { return b.b - a.b; })
    .map(function (c) { return c.q + " [" + c.p + " h" + c.h + "] +" + c.b; }).join("  |  ");
  return {
    docH: doc.scrollHeight, winH: window.innerHeight,
    recorrido: document0,
    fantasma: fantasma,
    contenidoAbajo: Math.round(fondoReal),
    shellBottom: Math.round(shellBottom),
    estira: top3,
    avanza: avanza,
    shell: shell ? shell.offsetHeight : -1,
    mainH: main ? main.offsetHeight : -1,
    sideH: nav ? nav.offsetHeight : -1,
    sideTop: r ? Math.round(r.top) : -1,
    sideBottom: r ? Math.round(r.bottom) : -1,
    sideScroll: nav ? nav.scrollHeight - nav.clientHeight : -1,
    pos: nav ? getComputedStyle(nav).position : "?",
    shellMin: shell ? getComputedStyle(shell).minHeight : "?",
    behavior: comportamiento
  };
})()`;

/* Espera a que el alto del documento se quede quieto. Sin esto la medición es
   una lotería: se midió Lecciones a 26, 80 y 0 px en tres seguidas porque algo
   carga tarde (una tarjeta, una fuente, un temporizador de la vista) y cambia la
   altura después de haber mirado. Cuatro lecturas iguales seguidas = asentado. */
const ESPERAR_ESTABLE = `(async function(){
  var de = document.scrollingElement;
  var ultima = -1, iguales = 0, vueltas = 0;
  while (vueltas < 40) {
    var h = document.documentElement.scrollHeight;
    if (h === ultima) { iguales++; if (iguales >= 4) return h; }
    else { iguales = 0; ultima = h; }
    vueltas++;
    await new Promise(function(r){ setTimeout(r, 100); });
  }
  return document.documentElement.scrollHeight;
})()`;

async function medir(ancho, alto) {
  fs.mkdirSync(TMP, { recursive: true });
  /* Perfil NUEVO en cada pasada y se borra al terminar. Reutilizarlo hacía que
     la segunda medición se comiera la caché de la primera (y el service worker,
     que precachea los CSS): daba exactamente los mismos números con el código ya
     cambiado, y parecía que el arreglo no hacía nada. Un instrumento de
     medición que miente es peor que no medir. */
  const perfil = path.join(TMP, "perfil-" + ancho + "-" + Date.now());
  const args = [
    `--remote-debugging-port=${PUERTO_CDP}`,
    `--user-data-dir=${perfil}`,
    `--window-size=${ancho},${alto}`,
    "--no-first-run", "--no-default-browser-check", "--disable-features=Translate",
    "about:blank",
  ];
  if (HEADLESS) args.unshift("--headless=new");
  const proc = spawn(CHROME, args, { stdio: "ignore", detached: false });
  let cdp = null;
  try {
    await esperarCDP(PUERTO_CDP);
    const ws = new WebSocket((await esperarCDP(PUERTO_CDP)).webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.addEventListener("open", r); ws.addEventListener("error", j); });
    cdp = new CDP(ws);
    const t = await cdp.enviar("Target.createTarget", { url: "about:blank" });
    const s = await cdp.enviar("Target.attachToTarget", { targetId: t.targetId, flatten: true });
    cdp.sesion = s.sessionId;
    await cdp.enviar("Runtime.enable");
    await cdp.enviar("Page.enable");
    await cdp.enviar("Network.enable");
    await cdp.enviar("Network.clearBrowserCache");   /* por si acaso */
    await cdp.enviar("Page.navigate", { url: `http://localhost:${PUERTO_APP}/index.html` });
    const lista = await cdp.esperarA(`(typeof go==="function" && typeof RENDER!=="undefined") ? 1 : 0`);
    if (!lista) throw new Error("la app no arrancó");
    /* Fuera el service worker y las cachés: si se queda instalado, sirve su
       copia de los CSS y volvemos a medir el código viejo. */
    await cdp.evaluar(`(async function(){
      try{ if(navigator.serviceWorker){ const rs=await navigator.serviceWorker.getRegistrations();
        for(const r of rs) await r.unregister(); } }catch(e){}
      try{ if(window.caches){ const ks=await caches.keys(); for(const k of ks) await caches.delete(k); } }catch(e){}
      return 1 })()`).catch(() => {});
    await cdp.enviar("Page.navigate", { url: `http://localhost:${PUERTO_APP}/index.html` });
    await cdp.esperarA(`(typeof go==="function" && typeof RENDER!=="undefined") ? 1 : 0`);
    if (HEADLESS) await new Promise((r) => setTimeout(r, 700));

    const filas = [];
    for (const [v, nombre] of VISTAS) {
      const hay = await cdp.evaluar(`(typeof RENDER["${v}"]!=="undefined") ? 1 : 0`);
      if (!hay) { filas.push({ v, nombre, error: "no está en RENDER" }); continue; }
      await cdp.evaluar(`go("${v}")`);
      /* Que la vista se pinta y se asiente el alto antes de medir nada */
      await cdp.evaluar(ESPERAR_ESTABLE, true);
      await new Promise((r) => setTimeout(r, 200));
      let m;
      try { m = await cdp.evaluar(MEDIR); }
      catch (e) { filas.push({ v, nombre, error: String(e.message).slice(0, 60) }); continue; }
      filas.push(Object.assign({ v, nombre }, m));
    }
    return filas;
  } finally {
    try { if (cdp) cdp.ws.close(); } catch (e) {}
    matarArbol(proc.pid);
    try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) {}
  }
}

function imprimir(filas) {
  const cols = [
    ["seccion", 14, (f) => f.nombre],
    ["doc", 6, (f) => (f.docH != null ? f.docH : "-")],
    ["ventana", 8, (f) => (f.winH != null ? f.winH : "-")],
    ["recorrido", 10, (f) => (f.recorrido != null ? f.recorrido + " px" : "-")],
    ["avanza", 8, (f) => (f.avanza != null ? f.avanza + " px" : "-")],
    ["shell", 7, (f) => (f.shell != null ? f.shell : "-")],
    ["sideH", 7, (f) => (f.sideH != null ? f.sideH : "-")],
    ["sideTop", 8, (f) => (f.sideTop != null ? f.sideTop : "-")],
    ["sideBot", 8, (f) => (f.sideBottom != null ? f.sideBottom : "-")],
    ["latScroll", 10, (f) => (f.sideScroll != null ? f.sideScroll + " px" : "-")],
    ["pos", 8, (f) => f.pos || "-"],
    ["fantasma", 9, (f) => (f.fantasma === undefined ? "-" : f.fantasma ? "SI " + f.recorrido + "px" : "no")],
    ["estira", 52, (f) => f.estira || "-"],
  ];
  const cab = cols.map((c) => c[0].padEnd(c[1])).join(" ");
  console.log(cab);
  console.log("-".repeat(cab.length));
  for (const f of filas) {
    if (f.error) { console.log(f.nombre.padEnd(14) + " ERROR: " + f.error); continue; }
    console.log(cols.map((c) => String(c[2](f)).padEnd(c[1])).join(" "));
  }
}

async function main() {
  if (!CHROME) { console.error("No encuentro Chrome ni Edge."); process.exit(1); }
  try {
    const r = await httpGet(`http://localhost:${PUERTO_APP}/index.html`);
    if (r.status !== 200) throw new Error("HTTP " + r.status);
  } catch (e) {
    console.error("La app no responde en localhost:" + PUERTO_APP);
    console.error("Arranca iniciar-lingolab.bat en otra ventana y vuelve a ejecutar esto.");
    process.exit(2);
  }
  console.log("Navegador: " + CHROME);
  if (!HEADLESS) console.log("Se abrirá una ventana de verdad: mírala mientras recorre las secciones.");

  for (const [ancho, alto] of VENTANAS) {
    if (ancho) {
      cabecera("Ventana " + ancho + " x " + alto);
      const filas = await medir(ancho, alto);
      imprimir(filas);

      /* El defecto es un recorrido que NO lleva a nada: el documento es más alto
         que la ventana, pero por debajo no hay contenido real, solo decoración.
         Una página larga de verdad (contenido que no cabe) NO es un fallo. */
      const conFantasma = filas.filter((f) => !f.error && f.fantasma);
      const noCabe = filas.filter((f) => !f.error && !f.fantasma && f.recorrido > 2);
      const lateralSeSale = filas.filter((f) => !f.error && f.sideBottom > f.winH + 2);
      const lateralConScroll = filas.filter((f) => !f.error && f.sideScroll > 2);

      console.log("");
      ok(conFantasma.length === 0,
         "ninguna sección tiene scroll que no lleve a nada" +
         (conFantasma.length ? " -> " + conFantasma.map((f) => f.nombre + " (" + f.recorrido + "px)").join(", ") : ""));
      ok(lateralSeSale.length === 0,
         "la barra lateral no se sale por abajo de la ventana" +
         (lateralSeSale.length ? " -> " + lateralSeSale.map((f) => f.nombre + " (" + (f.sideBottom - f.winH) + "px)").join(", ") : ""));
      /* Esto no es un fallo: una lateral con 11 entradas en una ventana baja
         necesita su propio scroll. Se informa para poder distinguirla de la
         barra de la página, que es donde se confundían las dos. */
      console.log("  info  la lateral necesita scroll propio en: " +
         (lateralConScroll.length ? lateralConScroll.map((f) => f.nombre + " (" + f.sideScroll + "px)").join(", ") : "ninguna"));
      console.log("  info  con contenido real más abajo de la pantalla: " +
         (noCabe.length ? noCabe.map((f) => f.nombre + " (" + f.recorrido + "px)").join(", ") : "ninguna"));
      const ejemplo = filas.find((f) => !f.error);
      if (ejemplo) {
        console.log("  medidas de referencia: shell " + ejemplo.shell + "px, min-height " + ejemplo.shellMin +
                    ", lateral " + ejemplo.sideH + "px position:" + ejemplo.pos + ", scroll-behavior:" + ejemplo.behavior);
      }
    }
  }

  console.log(fallos ? `\n✗ ${fallos} comprobaciones fallaron` : "\n✔ el scroll se porta bien en todas las secciones");
  process.exit(fallos ? 1 : 0);
}
main();
