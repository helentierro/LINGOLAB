/* LingoLab 3.0 — atajos de teclado. Presiona ? para verlos. */
(function () {
  "use strict";
  const VIEWS = ["panel", "vocab", "lecciones", "lectura", "dialogs", "pron", "dictado", "escritura", "quiz", "juegos", "progreso"];
  function inField() {
    const a = document.activeElement;
    return a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT");
  }
  function click(id) { const el = document.getElementById(id); if (el && !el.hidden && el.offsetParent) { el.click(); return true; } return false; }
  function toggleHelp(force) {
    const m = document.getElementById("keysModal"); if (!m) return;
    m.hidden = force !== undefined ? !m.hidden : !m.hidden;
  }

  /* ── Enter global ─────────────────────────────────────────────────────────
     "Presionar enter envía el resultado, presionar enter de nuevo pasa al
     siguiente ejercicio." Antes el atajo global moría en cuanto había un input
     con el foco, así que no existía casi en ninguna sección.

     Regla: si la sección tiene un resultado a la vista y aún no se ha enviado,
     Enter lo envía. Si ya se envió, Enter avanza. Si no hay nada que enviar,
     Enter avanza directamente. */
  const AVANZA = [
    ["btnPrNext", "btnPrSkip"],   // pronunciación
    ["btnRdNext"],                // lectura
    ["dgBtnNext"],                // diálogos
    ["btnDicNext"],               // dictado
    ["btnWrNext", "btnWrSkip"],  // escritura
    ["lpNext"],                   // lecciones
  ];
  /* Secciones donde Enter envía un resultado y, al reenviar, avanza. */
  const ENVIA = [
    { btn: "btnPrTextGo", campo: "prText", caja: "prResult" },
    { btn: "btnDicCheck", campo: "dicInput", caja: "dicResult" },
    { btn: "btnWrCheck", campo: "wrInput", caja: "wrResult" },
  ];

  function visible(el) { return el && !el.hidden && el.offsetParent; }

  function avanzar() {
    for (const ids of AVANZA) {
      for (const id of ids) {
        if (click(id)) return true;
      }
    }
    return false;
  }

  /* Enter global. Se registra en captura y con stopImmediatePropagation para que
     no competing con los listeners de los campos: aquí está toda la lógica. */
  function enterGlobal(e) {
    if (e.key !== "Enter" || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
    const activo = document.activeElement;
    const tag = activo && activo.tagName;
    if (tag === "SELECT") return;
    /* Shift+Enter dentro de un textarea sigue siendo salto de línea (ya retornamos). */

    const envio = ENVIA.find((x) => document.getElementById(x.campo) === activo);
    if (envio) {
      const boton = document.getElementById(envio.btn);
      if (!visible(boton)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const caja = document.getElementById(envio.caja);
      const yaEnviado = caja && !caja.hidden;
      boton.click();
      if (yaEnviado) avanzar();
      return;
    }
    /* Enter con el cuerpo enfocado: avanza directamente. */
    if (tag === "INPUT" || tag === "TEXTAREA") return; // otros campos: no interferir
    if (e.defaultPrevented) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    avanzar();
  }
  document.addEventListener("keydown", enterGlobal, true);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { toggleHelp(false); return; }
    if (inField()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (k === "?") { e.preventDefault(); toggleHelp(); return; }
    const n = parseInt(k, 10);
    if (!isNaN(n)) {
      const v = VIEWS[n === 0 ? 9 : n - 1];
      if (v) { try { go(v); } catch (err) {} }
      return;
    }
    switch (k.toLowerCase()) {
      case " ": e.preventDefault(); click("btnPrRec") || click("btnRdRec") || click("btnDgRec") || click("btnDicPlay") || click("btnQuizStart"); break;
      case "arrowright": avanzar(); break;
      case "f": { const f = document.getElementById("flashCard"); if (f && f.offsetParent) f.click(); break; }
      case "m": click("btnPrRec") || click("btnRdRec") || click("btnDgRec"); break;
      case "t": click("lpEsBtn") || click("btnRdEs") || click("btnDgEs"); break;
      case "l": click("btnPrPlay") || click("btnRdPlay"); break;
    }
  });
  window.LingoKeys = { views: VIEWS, help: toggleHelp, avanzar: avanzar };
})();
