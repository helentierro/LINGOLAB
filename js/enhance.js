/* LingoLab 2.0 — pegamento: PWA + SRS hooks + auto-escucha. No toca app-legacy. */
(function () {
  "use strict";
  // 1. Registrar Service Worker (solo en http/https, no file://)
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
  // 2. Conectar SRS a los botones de flashcards existentes
  function hookSRS() {
    const again = document.getElementById("btnAgain");
    const almost = document.getElementById("btnAlmost");
    const know = document.getElementById("btnKnow");
    const cur = () => {
      const el = document.getElementById("flashEn");
      return el ? el.textContent.trim() : null;
    };
    if (again && !again.dataset.srs) {
      again.dataset.srs = "1";
      again.addEventListener("click", () => { const w = cur(); if (w && window.LingoSRS) window.LingoSRS.record(w, 0); setTimeout(() => window.LingoSRS && window.LingoSRS.paint(), 50); });
    }
    if (almost && !almost.dataset.srs) {
      almost.dataset.srs = "1";
      almost.addEventListener("click", () => { const w = cur(); if (w && window.LingoSRS) window.LingoSRS.record(w, 1); setTimeout(() => window.LingoSRS && window.LingoSRS.paint(), 50); });
    }
    if (know && !know.dataset.srs) {
      know.dataset.srs = "1";
      know.addEventListener("click", () => { const w = cur(); if (w && window.LingoSRS) window.LingoSRS.record(w, 2); setTimeout(() => window.LingoSRS && window.LingoSRS.paint(), 50); });
    }
    if (window.LingoSRS) window.LingoSRS.paint();
  }
  // 3. Oírme: graba tu voz con MediaRecorder para escucharla (gratis, local)
  //    Antes era un DOBLE CLIC sobre el micro: en móvil casi nunca se dispara y
  //    encima pedía el permiso del micro otra vez. Ahora es un botón propio, y
  //    solo en pantallas con ratón (en el táctil el doble toque hace zoom).
  function hookSelfListen() {
    if (!navigator.mediaDevices || !window.MediaRecorder) return;
    const mic = document.getElementById("btnPrRec");
    if (!mic) return;
    if (matchMedia("(pointer:coarse)").matches) {
      mic.title = "Toca y habla";
      return; // en celular no va: el botón iría a medias
    }
    /* Candado: hookSelfListen se llama dos veces (al cargar y 1,5 s después).
       Sin esto se montaban DOS botones "Oírme" y, como cada montaje cierra su
       propia grabadora y su propio reproductor, quedaban dos de cada y las
       grabaciones persistían al cambiar de frase. */
    if (document.getElementById("btnSelfListen")) return;

    let mr = null, chunks = [], stream = null;
    const caja = document.createElement("div");
    caja.id = "selfListenBox";
    caja.style.cssText = "width:100%;margin-top:8px";
    caja.hidden = true;
    const btn = document.createElement("button");
    btn.className = "btn ghost sm";
    btn.id = "btnSelfListen";
    btn.textContent = "🎧 Oírme";
    btn.title = "Graba 6 segundos de tu voz y te la reproduce";
    const parar = () => { try { if (mr && mr.state === "recording") mr.stop(); } catch (e) {} };
    btn.addEventListener("click", async () => {
      if (mr && mr.state === "recording") { parar(); return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        mr = new MediaRecorder(stream);
        btn.textContent = "⏹ Detener";
        caja.hidden = false;
        mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
        mr.onstop = () => {
          try { stream.getTracks().forEach((t) => t.stop()); } catch (e) {}
          btn.textContent = "🎧 Oírme";
          if (!chunks.length) return;
          const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
          /* un solo reproductor, reutilizado */
          if (!caja.firstElementChild) {
            const au = document.createElement("audio");
            au.controls = true;
            au.style.cssText = "width:100%;margin-top:6px";
            caja.appendChild(au);
          }
          const au = caja.firstElementChild;
          if (au.src) URL.revokeObjectURL(au.src);
          au.src = URL.createObjectURL(blob);
          au.play().catch(() => {});
        };
        mr.start();
        setTimeout(parar, 6000);
      } catch (e) {
        btn.textContent = "🎧 Oírme";
        if (window.toast) toast("No se pudo grabar: revisa el permiso del micrófono", "⚠️");
      }
    });
    mic.parentElement.appendChild(btn);
    mic.parentElement.appendChild(caja);
    mic.title = "Toca y habla";

    /* Al cambiar de frase (app-legacy lanza este evento) se corta la grabación
       y se limpia el reproductor. Sin esto, el audio de la frase anterior se
       quedaba en pantalla y sonando al pasar a la siguiente. */
    document.addEventListener("lingolab:frase", () => {
      parar();
      btn.textContent = "🎧 Oírme";
      const au = caja.firstElementChild;
      if (au) { try { au.pause(); au.removeAttribute("src"); au.load(); } catch (e) {} }
      caja.hidden = true;
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    hookSRS(); hookSelfListen();
    setTimeout(() => { hookSRS(); hookSelfListen(); }, 1500);
  });
})();
