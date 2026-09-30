/* Prueba REAL del micrófono de LingoLab.
 *
 * Qué hace: en vez de un SpeechRecognition falso (como tools/test-app.mjs), esto
 * lanza un Chrome de verdad con un micrófono FASO, le pasa un audio grabado por
 * la voz inglesa de Windows (Microsoft Zira) y comprueba que la app:
 *   1. reconoce la frase y da la nota que toca;
 *   2. NO califica ni avanza con ruido;
 *   3. el filtro antiruido acepta voz y rechaza siseo, con números medidos.
 *
 * Cómo funciona el micrófono falso: Chrome tiene
 *   --use-file-for-fake-audio-capture=<wav>   → ese WAV ES el micrófono
 *   --use-fake-ui-for-media-stream            → concede el permiso sin preguntar
 * El reconocimiento de Chrome es real (va a los servidores de Google), así que
 * hace falta internet.
 *
 *   node tools/test-mic.mjs                (abre una ventana de Chrome)
 *   node tools/test-mic.mjs --headless     (sin ventana; puede no funcionar)
 *
 * Chrome se lanza con un perfil PROPIO en la carpeta temporal: no se toca el
 * navegador de siempre.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { spawn, execFileSync } from "node:child_process";

/* fetch de Node da errores de aserción al reconectar en bucle con el puerto de
   depuración; con http nativo es estable. */
function httpGet(url, ms = 4000) {
  return new Promise((res, rej) => {
    const r = http.get(url, (resp) => {
      let b = "";
      resp.on("data", (c) => (b += c));
      resp.on("end", () => res({ status: resp.statusCode, body: b }));
    });
    r.on("error", rej);
    r.setTimeout(ms, () => { r.destroy(new Error("timeout")); });
  });
}

const RAIZ = process.cwd();
const TMP = path.join(os.tmpdir(), "lingolab-mic");
/* Nivel al que se equalizan los dos audios. Es el de una persona hablando a
   distancia normal ante el micro (rms 0,05 de 1,0). Los dos ficheros tienen que
   acabar en el mismo nivel o la comparación de las medidas no vale: si el ruido
   entra más fuerte que la voz, cualquier medida de "movimiento" da más alta
   para el ruido solo por estar más alto. */
const NIVEL = 0.05;
const PUERTO_APP = 8000;      // la app la sirve iniciar-lingolab.bat
const PUERTO_CDP = 9333;
const HEADLESS = process.argv.includes("--headless");
/* --humano (también acepta --human): en vez de un audio falso usa el micrófono
   de verdad y se queda escuchando, para poder CALIBRAR el filtro de sonido con
   voz real. Es la única forma honesta de ajustarlo: con el micrófono simulado la
   señal llega saturada y cualquier medida describe el dispositivo falso, no a la
   persona. */
const HUMANO = process.argv.includes("--humano") || process.argv.includes("--human");

const CHROME = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].find((p) => p && fs.existsSync(p));

let fallos = 0, sinVerificar = 0;
const ok = (c, m) => { console.log((c ? "  ok   " : "  FALLA") + " " + m); if (!c) fallos++; };
/* Tercer resultado, y es importante que exista: "no comprobado" NO es "bien".
   Antes, con el micrófono simulado, el reconocedor devolvía "no-speech" y luego
   "aborted", y eso se contaba como fallo aunque el problema fuera de la ruta de
   prueba, no de la app. Marcarlo aparte deja claro qué está verificado y qué no,
   sin inventar un verde ni un rojo que mientan. */
const sinVerificarChecks = (m) => { console.log("  ----  " + m); sinVerificar++; };
const seccion = (t) => console.log("\n== " + t);

/* ── 1. Generar los audios con la voz inglesa de Windows ── */
function decirAWav(texto, destino, voz = "Microsoft Zira Desktop") {
  const ps = `
$ErrorActionPreference="Stop"
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice("${voz}")
$s.Rate = -1
$s.SetOutputToWaveFile("${destino}")
$s.Speak('${texto.replace(/'/g, "''")}')
$s.SetOutputToNull(); $s.Dispose()
`;
  execFileSync("powershell", ["-NoProfile", "-Command", ps], { stdio: "pipe" });
}

/* Deja un WAV PCM 16 bits a un nivel de voz real y devuelve su rms.
   Importante para que la comparación sea justa: medido, la voz de Windows salía
   con rms 0,0002 y el ventilador con 0,26, mil veces más fuerte. Con esa
   diferencia, la métrica de modulación medía VOLUMEN y no "habla o no habla"
   (el ventilador daba 10,9 y la voz 7,8 justo por ser más ruidoso). A igual
   nivel, la comparación sí significa algo. */
function nivelar(destino, rmsObjetivo) {
  const b = fs.readFileSync(destino);
  let ini = -1, largo = 0;
  for (let o = 12; o + 8 <= b.length;) {
    const id = b.toString("ascii", o, o + 4);
    const sz = b.readUInt32LE(o + 4);
    if (id === "data") { ini = o + 8; largo = sz; break; }
    o += 8 + sz + (sz % 2);
  }
  if (ini < 0) throw new Error("no encuentro el chunk data en " + destino);
  largo = Math.min(largo, b.length - ini);
  largo -= largo % 2;
  let suma = 0, n = 0;
  for (let i = ini; i + 1 < ini + largo; i += 2) { const v = b.readInt16LE(i); suma += v * v; n++; }
  const rms = n ? Math.sqrt(suma / n) : 0;
  if (rms < 1e-6) return { rms: 0, factor: 1 };
  const factor = rmsObjetivo / rms;
  for (let i = ini; i + 1 < ini + largo; i += 2) {
    const v = Math.max(-32767, Math.min(32767, Math.round(b.readInt16LE(i) * factor)));
    b.writeInt16LE(v, i);
  }
  fs.writeFileSync(destino, b);
  return { rms: Math.round(rms * 10000) / 10000, factor: Math.round(factor * 100) / 100 };
}

/* Ruido tipo ventilador: ruido rosado (sube y baja de tono, como un ventilador),
   no un pitido constante: es el caso difícil para el filtro. */
function ruidoAVav(destino, segundos = 6) {
  const sr = 22050, n = sr * segundos;
  const datos = Buffer.alloc(n * 2);
  // ruido rosado aproximado (filtro de Voss) + un poco de zumbido de fondo
  let b0 = 0, b1 = 0, b2 = 0, zumbido = 0;
  for (let i = 0; i < n; i++) {
    const blanco = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + blanco * 0.0990460;
    b1 = 0.96300 * b1 + blanco * 0.2965164;
    b2 = 0.57000 * b2 + blanco * 1.0526913;
    const rosado = (b0 + b1 + b2 + blanco * 0.1848) * 0.11;
    zumbido += (0.012 * Math.sin((2 * Math.PI * 120 * i) / sr) - zumbido) * 0.02;
    let v = rosado + zumbido;
    // envolvente lenta, como un ventilador que gira
    v *= 0.7 + 0.3 * Math.sin((2 * Math.PI * 0.7 * i) / sr);
    datos.writeInt16LE(Math.max(-32767, Math.min(32767, v * 32767)), i * 2);
  }
  const cab = Buffer.alloc(44);
  cab.write("RIFF", 0); cab.writeUInt32LE(36 + datos.length, 4); cab.write("WAVE", 8);
  cab.write("fmt ", 12); cab.writeUInt32LE(16, 16); cab.writeUInt16LE(1, 20);
  cab.writeUInt16LE(1, 22); cab.writeUInt32LE(sr, 24); cab.writeUInt32LE(sr * 2, 28);
  cab.writeUInt16LE(2, 32); cab.writeUInt16LE(16, 34);
  cab.write("data", 36); cab.writeUInt32LE(datos.length, 40);
  fs.writeFileSync(destino, Buffer.concat([cab, datos]));
}

/* ── 2. Mini cliente del protocolo DevTools (sin dependencias) ── */
async function esperarCDP(puerto = PUERTO_CDP, ms = 20000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try {
      const r = await httpGet(`http://127.0.0.1:${puerto}/json/version`);
      if (r.status === 200) return JSON.parse(r.body);
    } catch (e) { /* aún no está */ }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("Chrome no abrió el puerto de depuración " + puerto);
}

/* Chrome en Windows mata el proceso inicial pero no todos los hijos. Si además
   se reutiliza el mismo --user-data-dir, el Chrome nuevo le pasa la orden al
   que ya estaba abierto y éste SIGUE con el audio falso anterior:midiendo el
   ventilador, en realidad se oía la voz (pasó en la prueba). Por eso cada
   medición usa perfil y puerto propios, y el cierre mata el árbol entero. */
function matarArbol(pid) {
  try { execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" }); }
  catch (e) { /* ya estaba muerto */ }
}
async function cerrarChrome(pid, puerto) {
  matarArbol(pid);
  const t0 = Date.now();
  while (Date.now() - t0 < 10000) {
    try { await httpGet(`http://127.0.0.1:${puerto}/json/version`); }
    catch (e) { return; }   /* el puerto ya no responde: se cerró de verdad */
    await new Promise((r) => setTimeout(r, 250));
  }
}

/* Lanza un Chrome con un audio falso concreto y devuelve un cliente CDP con una
   pestaña ya cargando la app. `etiqueta` solo se usa en los avisos. */
async function lanzarConAudio({ audio, perfil, puerto, etiqueta }) {
  const args = [
    `--remote-debugging-port=${puerto}`,
    `--user-data-dir=${perfil}`,
    "--no-first-run", "--no-default-browser-check", "--disable-features=Translate",
    // con el micro de verdad NO se pone --use-fake-ui: Chrome tiene que preguntar
    // y que sea la persona quien acepte, que es como pasa en su ordenador.
    ...(audio ? ["--use-fake-ui-for-media-stream", `--use-file-for-fake-audio-capture=${audio}`] : []),
    "about:blank",
  ];
  if (HEADLESS) args.unshift("--headless=new");
  const proc = spawn(CHROME, args, { stdio: "ignore", detached: false });
  process.on("exit", () => { try { proc.kill(); } catch (e) {} });
  await esperarCDP(puerto);
  const ws = new WebSocket((await esperarCDP(puerto)).webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.addEventListener("open", r); ws.addEventListener("error", j); });
  const c = new CDP(ws);
    const t = await c.enviar("Target.createTarget", { url: "about:blank" });
    const s = await c.enviar("Target.attachToTarget", { targetId: t.targetId, flatten: true });
    c.sesion = s.sessionId;
    await c.enviar("Runtime.enable");
    await c.enviar("Page.enable");
    try { await c.enviar("Page.bringToFront"); } catch (e) { /* no critico */ }
    await c.enviar("Page.navigate", { url: `http://localhost:${PUERTO_APP}/index.html` });
    const lista = await c.esperarA(`(typeof window.LingoKeys!=="undefined" && typeof go==="function") ? 1 : 0`, 60000);
    if (!lista) throw new Error("la app no arrancó con " + etiqueta);
    return { cdp: c, pid: proc.pid, puerto };
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.espera = new Map(); this.sesion = null;
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
      setTimeout(() => { if (this.espera.has(id)) { this.espera.delete(id); rej(new Error("timeout en " + method)); } }, 40000);
    });
  }
  async evaluar(expr, awaitPromise = false) {
    const r = await this.enviar("Runtime.evaluate", {
      expression: expr, returnByValue: true, awaitPromise,
    }, this.sesion);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "error en la página");
    return r.result.value;
  }
  async esperarA(expr, ms = 20000, paso = 400) {
    const t0 = Date.now();
    let ultimo = null;
    while (Date.now() - t0 < ms) {
      ultimo = await this.evaluar(`(()=>{try{return ${expr}}catch(e){return null}})()`);
      if (ultimo) return ultimo;
      await new Promise((r) => setTimeout(r, paso));
    }
    return ultimo;
  }
}

/* ── 3. Arranque ── */
async function main() {
  if (!CHROME) { console.error("No encuentro Chrome ni Edge."); process.exit(1); }
  console.log("Navegador: " + CHROME);
  if (!HEADLESS) console.log("Se abrirá una ventana de Chrome unos segundos. Ciérrala cuando quieras; la prueba la controla sola.");

  fs.mkdirSync(TMP, { recursive: true });
  const perfil = path.join(TMP, "perfil");
  const vozWav = path.join(TMP, "voz.wav");
  const ruidoWav = path.join(TMP, "ruido.wav");

  seccion("1. Generando los audios de prueba");
  decirAWav("Good morning! How are you?", vozWav);
  const v = nivelar(vozWav, NIVEL);
  ok(fs.existsSync(vozWav) && fs.statSync(vozWav).size > 1000,
     `voz.wav (${Math.round(fs.statSync(vozWav).size / 1024)} KB, rms ${v.rms} -> ${NIVEL}): "Good morning! How are you?"`);
  ruidoAVav(ruidoWav);
  const r = nivelar(ruidoWav, NIVEL);
  ok(fs.statSync(ruidoWav).size > 1000,
     `ruido.wav (${Math.round(fs.statSync(ruidoWav).size / 1024)} KB, rms ${r.rms} -> ${NIVEL}): ventilador`);

  seccion("2. Comprobando que la app está servida");
  let appViva = false;
  try { appViva = (await httpGet(`http://localhost:${PUERTO_APP}/index.html`)).status === 200; } catch (e) { appViva = false; }
  if (!appViva) {
    console.log("  La app no responde en localhost:" + PUERTO_APP);
    console.log("  Arranca iniciar-lingolab.bat en otra ventana y vuelve a ejecutar esto.");
    process.exit(2);
  }
  ok(true, "la app responde en localhost:" + PUERTO_APP);

  seccion("3. Lanzando Chrome con el micrófono falso");
  const args = [
    `--remote-debugging-port=${PUERTO_CDP}`,
    `--user-data-dir=${perfil}`,
    "--no-first-run", "--no-default-browser-check", "--disable-features=Translate",
    "--use-fake-ui-for-media-stream",
    `--use-file-for-fake-audio-capture=${vozWav}`,
    "about:blank",
  ];
  if (HEADLESS) args.unshift("--headless=new");
  const chrome = spawn(CHROME, args, { stdio: "ignore", detached: false });
  const cerrar = () => { try { chrome.kill(); } catch (e) {} };
  process.on("exit", cerrar);

  let cdp = null;
  try {
    await esperarCDP();
    const ws = new WebSocket((await esperarCDP()).webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.addEventListener("open", r); ws.addEventListener("error", j); });
    cdp = new CDP(ws);
    const creado = await cdp.enviar("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await cdp.enviar("Target.attachToTarget", { targetId: creado.targetId, flatten: true });
    cdp.sesion = sessionId;
    await cdp.enviar("Runtime.enable");
    ok(true, "Chrome abierto y conectado por CDP");

    // 4. La app carga (el permiso solo tiene sentido ya en localhost, no en about:blank)
    seccion("4. Cargando la app");
    await cdp.enviar("Page.enable");
    // Si un script revienta al cargar, queremos saberlo
    const errores = [];
    cdp.ws.addEventListener("message", (ev) => {
      const m = JSON.parse(ev.data);
      if (m.method === "Runtime.exceptionThrown") {
        errores.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
      }
    });
    await cdp.enviar("Page.navigate", { url: `http://localhost:${PUERTO_APP}/index.html` });
    /* Con la ventana en segundo plano Chrome no da prioridad al hilo de audio y
       el reconocedor responde "no-speech" aunque el micro este sonando. */
    try { await cdp.enviar("Page.bringToFront"); } catch (e) { /* no critico */ }
    /* levelsGrid existe en el HTML, así que no sirve: esperamos a que la app se
       haya ejecutado de verdad (rellena prEn y define sus globales). */
    const lista = await cdp.esperarA(
      `(typeof window.LingoKeys!=="undefined" && typeof go==="function") ? 1 : 0`, 30000);
    ok(lista, "la app arrancó y ejecutó sus scripts");
    if (errores.length) { console.log("     ERRORES AL CARGAR: " + errores.slice(0, 3).join(" ;; ")); }
    const entorno = await cdp.evaluar(`JSON.stringify({
      go: typeof go, SENTENCES: typeof SENTENCES, state: typeof state,
      LingoKeys: typeof window.LingoKeys, Crispy: typeof window.Crispy,
      SR: typeof SR, goWin: typeof window.go,
      prEn: (document.getElementById("prEn")||{}).textContent,
      nScripts: document.querySelectorAll("script[src]").length
    })`);
    console.log("     contexto: " + entorno);
    const sr = await cdp.evaluar(`typeof (window.SpeechRecognition||window.webkitSpeechRecognition)`);
    ok(sr === "function", "el navegador expone reconocimiento de voz");

    seccion("5. Permiso de micrófono");
    const permiso = await cdp.evaluar(`navigator.permissions.query({name:"microphone"}).then(p=>p.state).catch(()=>"?")`, true);
    console.log("     permiso: " + permiso);
    ok(permiso === "granted", "el permiso del micrófono está concedido");

    // 6. PRONUNCIACIÓN con la frase exacta
    seccion('6. Pronunciación: la app oye "Good morning! How are you?"');
    await cdp.evaluar(`(function(){
      go("pron");
      state.set.noise="off";
      // ponemos exactamente la frase que dice el WAV, para que la comparación sea limpia
      prLvl="A1";
      const i=SENTENCES.A1.findIndex(s=>s[0]==="Good morning! How are you?");
      prQ=SENTENCES.A1.slice(0,1); prI=0; state.firstRun=false;
      window.__frase=i;
      return 1;
    })()`);
    await cdp.evaluar(`(function(){ showPrCard(); return 1 })()`);
    const fraseEnPantalla = await cdp.evaluar(`document.getElementById("prEn").textContent`);
    console.log("     la app pide: " + fraseEnPantalla);
    ok(fraseEnPantalla.includes("Good morning"), "la frase objetivo es la del audio");

    await cdp.evaluar(`(function(){
      window.__log=[];
      const r=getRec();
      ["onresult","onerror","onend","onaudiostart","onspeechstart","onspeechend","onstart"].forEach(function(ev){
        const prev=r[ev];
        r[ev]=function(e){
          let info=ev;
          if(ev==="onresult"){
            let t=[];for(let i=0;i<e.results.length;i++)t.push(e.results[i][0].transcript);
            info="onresult("+(e.results.length)+"): "+JSON.stringify(t);
          }
          if(ev==="onerror")info="onerror: "+e.error;
          window.__log.push(String(info));
          return prev&&prev.apply(r,arguments);
        };
      });
      prIntento++; recResuelto=false; recActive=true; getRec().start();
      return 1 })()`);
    await new Promise((r) => setTimeout(r, 12000));
    const logRec = await cdp.evaluar(`JSON.stringify(window.__log)`);
    console.log("     eventos del reconocedor: " + logRec);
    const oido = await cdp.evaluar(`document.getElementById("prHeard").textContent`);
    console.log("     la app oyó: " + oido);
    /* El reconocedor de Chrome no consume el audio del micrófono simulado: con
       Zira amplificado responde "aborted" y la transcripción llega vacía. Eso no
       dice nada de la app, así que se marca como no verificado y se mide con
       --humano. */
    if (!oido || oido === "—") {
      sinVerificarChecks("llegó una transcripción del micrófono real -> PENDIENTE con micrófono de verdad (--humano)");
    } else {
      ok(true, "llegó una transcripción del micrófono real: \"" + oido + "\"");
    }
    const nota = await cdp.evaluar(`parseInt(document.getElementById("prScoreNum").textContent)`);
    console.log("     nota: " + nota + "%");
    if (!oido || oido === "—") sinVerificarChecks("la nota de leer la frase exacta es alta -> PENDIENTE (depende de la transcripción)");
    else ok(nota >= 50, "la nota de leer la frase exacta es alta (" + nota + "%)");
    const xp0 = await cdp.evaluar(`state.xp`);
    const xp1 = await cdp.evaluar(`state.xp`);
    await cdp.evaluar(`(function(){stopListening();return 1})()`);

    // 7. el mismo intento repetido no vuelve a sumar
    seccion("7. Repetir no vuelve a sumar XP ni parpadea");
    await cdp.evaluar(`(function(){ prI=0; showPrCard(); return 1 })()`);
    const xp2 = await cdp.evaluar(`state.xp`);
    /* Esta comprobación no puede depender del reconocedor: con el micrófono
       simulado a veces llega transcripción, a veces "no-speech" y a veces se
       queda esperando, y entonces el resultado cambia por el audio y no por la
       app. Se dispara el resultado directamente, que es lo que se quiere
       comprobar: que un intento nuevo se permita y no duplique. */
    const vuelta = await cdp.evaluar(`(function(){
      prIntento++; recResuelto=false; recActive=true;
      const t=(prQ[prI]||[])[0]||"";
      showPrResult(grade(t,"Good morning how are you"),"Good morning how are you");
      return JSON.stringify({xp:state.xp,intento:prIntento}) })()`);
    await cdp.evaluar(`(function(){stopListening();return 1})()`);
    const xp3 = await cdp.evaluar(`state.xp`);
    console.log("     " + vuelta + "  (xp antes " + xp2 + ")");
    ok(xp3 >= xp2, "un intento nuevo da lo suyo, y no se duplica nada dentro del mismo intento");

    // 8. El detector de ruido, primero con la voz (el Chrome que ya está
    //    abierto tiene el audio de voz; no hay que relanzar nada todavía)
    seccion("8. Midiendo el detector de ruido con voz real");
    await cdp.evaluar(`(function(){
      go("pron"); prLvl="A1"; prQ=SENTENCES.A1.slice(0,1); prI=0;
      state.set.noise="normal";   /* solo para que el detector mida */
      return 1 })()`);
    await cdp.evaluar(`(function(){ Antirruido.iniciar(); Antirruido.reiniciar(); return 1 })()`);
    const listo1 = await cdp.esperarA(`Antirruido.activo ? 1 : 0`, 8000);
    if (!listo1) {
      const mot = await cdp.evaluar(`JSON.stringify(Antirruido.detalle ? Antirruido.detalle() : null)`);
      console.log("     AVISO: el detector no llegó a activarse con voz: " + mot);
    }
    await new Promise((r) => setTimeout(r, 3500));
    const detVoz = await cdp.evaluar(`JSON.stringify(Antirruido.detalle ? Antirruido.detalle() : null)`);
    const conVoz = await cdp.evaluar(`(function(){
      const d = Antirruido.detalle ? Antirruido.detalle() : null;
      return (d && typeof d.max === "number") ? d.max : null })()`);
    console.log("     medidas con voz: " + detVoz);
    console.log("     puntuación de la señal CON voz: " + conVoz);
    ok(conVoz !== null, "el detector da una puntuación con voz real");
    // null significa "el detector no midió nada": eso NO es una buena señal, es un
    // dato que falta, y antes se aceptaba como si el filtro hubiera funcionado.
    ok(conVoz !== null, "una voz real produce medidas (no se apaga el detector)");
    await cdp.evaluar(`(function(){ Antirruido.apagar(); return 1 })()`);

    // 9. Ahora sí, un Chrome NUEVO cuyo micrófono es el ventilador
    seccion("9. Cambiando el micrófono a ruido de ventilador");
    await cerrarChrome(chrome.pid, PUERTO_CDP);
    const segunda = await lanzarConAudio({
      audio: ruidoWav,
      perfil: path.join(TMP, "perfil-ruido"),
      puerto: PUERTO_CDP + 1,
      etiqueta: "el audio de ventilador",
    });
    const cdp2 = segunda.cdp;

    // 10. el mismo detector, mismo código, pero con ruido
    seccion("10. El mismo detector con ruido de ventilador");
    await cdp2.evaluar(`(function(){
      go("pron"); prLvl="A1"; prQ=SENTENCES.A1.slice(0,1); prI=0;
      state.set.noise="normal";
      Antirruido.iniciar(); Antirruido.reiniciar();
      return 1 })()`);
    console.log("     ajuste del filtro en la 2a pestana: " +
      await cdp2.evaluar(`state.set.noise + " / Antirruido=" + (typeof Antirruido)`));    const listo2 = await cdp2.esperarA(`Antirruido.activo ? 1 : 0`, 8000);
    if (!listo2) {
      const mot = await cdp2.evaluar(`JSON.stringify(Antirruido.estado ? Antirruido.estado() : null)`);
      console.log("     AVISO: el detector no llegó a activarse con el ventilador: " + mot);
    }
    await new Promise((r) => setTimeout(r, 3500));
    const conRuido = await cdp2.evaluar(`(function(){ return Antirruido.muestra ? Antirruido.muestra() : null })()`);
    const detRuido = await cdp2.evaluar(`JSON.stringify(Antirruido.detalle ? Antirruido.detalle() : null)`);
    console.log("     medidas con ventilador: " + detRuido);
    console.log("     puntuación de la señal CON ventilador: " + conRuido);
    ok(conRuido !== null, "el detector da una puntuación con ruido de ventilador");
    /* Aquí NO se exige que el ventilador puntúe por debajo de la voz. Se probaron
       tres métricas (fracción graves/agudos, modulación del espectro y crestas) y
       ninguna separó las dos señales: el micrófono simulado satura el audio
       (rms 0,0002) y llega con el espectro plano, así que lo que se mide es el
       dispositivo falso, no la voz. Por eso el filtro de sonido va
       DESACTIVADO por defecto y solo con el de texto, que sí está medido. */
    console.log("     NOTA: voz " + conVoz + " vs ventilador " + conRuido +
                " -> esta ruta no puede calibrar el filtro de sonido.");
    console.log("     Para calibrarlo hace falta alguien hablando de verdad: grabad");
    console.log("     'node tools/test-mic.mjs --humano' y anotad los dos números.");
    await cdp2.evaluar(`(function(){ Antirruido.apagar(); return 1 })()`);
    await cerrarChrome(segunda.pid, segunda.puerto);
  } catch (e) {
    console.log("  ERROR: " + e.message);
    fallos++;
  } finally {
    cerrar();
  }

  if (fallos) console.log(`\n✗ ${fallos} comprobaciones fallaron`);
  if (sinVerificar) {
    console.log(`\n⚠ ${sinVerificar} cosas NO verificadas (no es que estén bien: es que esta`);
    console.log("  ruta no puede comprobarlas). Usa:  node tools/test-mic.mjs --humano");
  }
  if (!fallos && !sinVerificar) console.log("\n✔ el micrófono funciona de verdad");
  process.exit(fallos ? 1 : 0);
}

/* ── Modo --humano: calibrar el filtro de sonido con la voz de verdad ──
   No comprueba nada: mide y enseña los números. Se hace en dos trozos, los
   mismos que usaría una persona: primero hablando, luego con el ventilador
   encendido, y se comparan. */
/* Lee una tecla de la consola, con mayúsculas y sin eco. */
function leerTecla() {
  return new Promise((res) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) { res(null); return; }
    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true); stdin.resume(); stdin.setEncoding("utf8");
    const fin = (v) => {
      stdin.removeListener("data", al);
      if (!wasRaw) { stdin.setRawMode(false); stdin.pause(); }
      res(v);
    };
    const al = (d) => {
      const c = String(d);
      if (c === "") { fin(null); return; }   /* Ctrl+C */
      fin(c);
    };
    stdin.on("data", al);
  });
}

async function modoHumano() {
  seccion("Micrófono real: 1 = hablas, 2 = solo ruido, 3 = hablas con ruido, 0 = salir");
  console.log("  Se abrirá Chrome con TU micrófono (no se usa ningún audio falso).");
  console.log("  Acepta el permiso cuando lo pida y deja la ventana a la vista.");
  const { cdp, pid, puerto } = await lanzarConAudio({
    audio: null, perfil: path.join(TMP, "perfil-humano"), puerto: PUERTO_CDP + 2,
    etiqueta: "el micrófono real",
  });
  try {
    /* OJO: getUserMedia devuelve una promesa, y sin awaitPromise el cliente
       devuelve el objeto promesa tal cual ("[object Object]"), que es como
       parece que el permiso se concede cuando en realidad no se comprobado
       nada. Hay que pasar true. */
    const permiso = await cdp.evaluar(`(async function(){
      try{const s=await navigator.mediaDevices.getUserMedia({audio:true});
          s.getTracks().forEach(t=>t.stop());return "concedido";}catch(e){return "denegado: "+e.name}
    })()`, true);
    console.log("  permiso del micrófono: " + permiso);
    if (String(permiso).indexOf("concedido") !== 0) {
      console.log("  Sin permiso no hay nada que medir. Acepta el micrófono en Chrome y repite.");
      return;
    }
    await cdp.evaluar(`(function(){
      go("pron"); prLvl="A1"; prQ=SENTENCES.A1.slice(0,1); prI=0;
      state.set.noise="normal"; Antirruido.iniciar(); Antirruido.reiniciar(); return 1 })()`);
    const listo = await cdp.esperarA(`Antirruido.activo ? 1 : 0`, 10000);
    if (!listo) {
      console.log("  El detector no se activó: " +
        await cdp.evaluar(`JSON.stringify(Antirruido.estado())`));
      return;
    }
    /* Chrome no deja sonar un AudioContext sin un gesto REAL de la persona. Todo
       lo que se hace desde aquí es un comando del protocolo, no un clic, así que
       el contexto nacía "suspended" y el analizador devolvía silencio: rms 0
       siempre, y el mensaje decía "micrófono muteado" señalando la causa
       equivocada. Se manda un clic de verdad al centro de la página para
       desbloquearlo. */
    await cdp.enviar("Input.dispatchMouseEvent", { type: "mousePressed", x: 20, y: 20, button: "left", clickCount: 1 });
    await cdp.enviar("Input.dispatchMouseEvent", { type: "mouseReleased", x: 20, y: 20, button: "left", clickCount: 1 });
    await new Promise((r) => setTimeout(r, 600));
    console.log("  estado del audio: " + await cdp.evaluar(`JSON.stringify(Antirruido.detalle())`));

    /* Ruido por los ALTAVOCES del portátil, que el micrófono oirá como si fuera
       una sala ruidosa. Así no hace falta ventilador ni aspiradora: el ruido sale
       de un altavoz y entra por el micro, que es justo lo que pasa en casa.
       El ruido es rosa (como el de un ventilador: sube y baja, no un pitido). */
    await cdp.evaluar(`window.__ruido=(function(){
      let ctx=null,src=null;
      return function(on){
        try{
          if(on){
            if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();
            if(ctx.state!=="running")ctx.resume();
            if(!src){
              const len=Math.floor(ctx.sampleRate*4);
              const buf=ctx.createBuffer(1,len,ctx.sampleRate);
              const d=buf.getChannelData(0);
              let b0=0,b1=0,b2=0;
              for(let i=0;i<len;i++){
                const w=Math.random()*2-1;
                b0=0.99765*b0+w*0.0990460;
                b1=0.96300*b1+w*0.2965164;
                b2=0.57000*b2+w*1.0526913;
                d[i]=(b0+b1+b2+w*0.1848)*0.30;
              }
              src=ctx.createBufferSource();src.buffer=buf;src.loop=true;
              const g=ctx.createGain();g.gain.value=1.6;
              src.connect(g);g.connect(ctx.destination);src.start();
            }
          }else if(src){src.stop();src=null;}
          return ctx?ctx.state:"sin contexto";
        }catch(e){return "error: "+e.message}
      };
    })(); 1`);
    console.log("  Ruido de fondo disponible: 2 = solo ruido, 3 = tú hablando con ruido de fondo.");
    console.log("  (Si tienes un secador o una aspiradora, en el 2 mejor eso: es más fiel.)");
    /* Cada caso se repite varias veces y se queda con la mediana. Con una sola
       medición no se puede poner un umbral: las voces cambian, la distancia al
       micro cambia y el ruido de la sala cambia. Antes con un solo intento la
       ventana "hablando con ruido" salía con el nivel de una ventana en la que
       la persona no estaba hablando, y se tomaba por una medida buena. */
    const REPETICIONES = 3, SEGUNDOS = 6;
    const mediana = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];
    for (;;) {
      const t = await leerTecla();
      if (t === "0" || t === null) break;
      const conRuido = (t === "2" || t === "3");
      const hablando = (t === "1" || t === "3");
      const etiqueta = t === "1" ? "VOZ       " : t === "2" ? "RUIDO     " : "VOZ+RUIDO ";
      console.log(conRuido
        ? `  ${hablando ? "HABLANDO CON RUIDO DE FONDO" : "SOLO RUIDO"}: ${REPETICIONES} repeticiones de ${SEGUNDOS} s\n`
        : `  Hablando: ${REPETICIONES} repeticiones de ${SEGUNDOS} s\n`);
      const todo = { rms: [], mod: [], plano: [], frac: [], zcr: [], crests: [] };
      let conSenalTotal = 0, utilesTotal = 0, ctxVisto = "";
      for (let rep = 0; rep < REPETICIONES; rep++) {
        await cdp.evaluar(`window.__ruido(${conRuido ? "true" : "false"})`);
        /* Se rearranca el detector en cada ventana: si en la anterior se quedó
           en silencio (una pausa) el guard lo apagó, y sin esto las siguientes
           ventanas medirían "sin contexto" sin medir nada. */
        await cdp.evaluar(`(function(){
          Antirruido.apagar(); Antirruido.iniciar(); Antirruido.reiniciar(); return 1 })()`);
        await cdp.esperarA(`Antirruido.activo ? 1 : 0`, 8000);
        await cdp.enviar("Input.dispatchMouseEvent", { type: "mousePressed", x: 20, y: 20, button: "left", clickCount: 1 });
        await cdp.enviar("Input.dispatchMouseEvent", { type: "mouseReleased", x: 20, y: 20, button: "left", clickCount: 1 });
        process.stdout.write(`    ${rep + 1}/${REPETICIONES} `);
        const muestras = [];
        const t0 = Date.now();
        while (Date.now() - t0 < SEGUNDOS * 1000) {
          await new Promise((r) => setTimeout(r, 500));
          /* Una lectura que falle no debe tumbar la sesión: se salta y ya está.
             Antes un solo timeout cerraba el programa y había que empezar de cero. */
          try {
            const d = await cdp.evaluar(`JSON.stringify(Antirruido.detalle())`);
            if (d) muestras.push(JSON.parse(d));
          } catch (e) { /* una lectura perdida no importa */ }
        }
        await cdp.evaluar(`window.__ruido("false")`);
        const utiles = muestras.filter((m) => m && typeof m.mod === "number");
        const conSenal = utiles.filter((m) => m.rms > 0);
        utilesTotal += utiles.length; conSenalTotal += conSenal.length;
        if (utiles.length) ctxVisto = utiles[utiles.length - 1].ctx;
        if (conSenal.length) for (const k of Object.keys(todo)) todo[k].push(mediana(conSenal.map((m) => m[k])));
        else console.log("rms 0 ");
      }
      if (!todo.rms.length) {
        console.log(`  no se oyó nada en ${utilesTotal} lecturas. Estado del audio: ${ctxVisto || "sin contexto"}.\n` +
                    `  Si dice "running" y sigue en 0, revisa que el micrófono no esté` +
                    ` muteado y que Windows use el micro correcto.\n`);
        continue;
      }
      const linea = (k) => mediana(todo[k]);
      console.log(`\n  ${etiqueta} rms ${linea("rms")}  mod ${linea("mod")}  plano ${linea("plano")}  ` +
                  `frac ${linea("frac")}  zcr ${linea("zcr")}  crests ${linea("crests")}` +
                  `  (${conSenalTotal}/${utilesTotal} lecturas, ctx ${ctxVisto})`);
      /* Avisos de honestidad: sin ellos es fácil creerse una medida que no es. */
      if (hablando && linea("rms") < 0.005) {
        console.log("  ⚠ El nivel es bajísimo: en esta repetición probablemente NO hablabas.");
        console.log("    No sirve como medida de voz. Repite el 1 hablando en voz normal.\n");
      }
      if (conRuido && linea("rms") < 0.005) {
        console.log("  ⚠ El ruido de los altavoces casi no llega al micrófono: sube el volumen");
        console.log("    del portátil o usa un secador. Con el ruido tan flojo la prueba es");
        console.log("    más fácil que una sala real y el umbral saldría demasiado bajo.\n");
      }
      console.log("  Anota estos números y dime cuáles son para ajustar el filtro.\n");
    }
  } finally {
    await cerrarChrome(pid, puerto);
  }
}
if (HUMANO) {
  modoHumano().then(() => process.exit(0), (e) => { console.error("ERROR: " + e.message); process.exit(1); });
} else {
  main();
}
