/* LingoLab 3.0 — magia: sparkles + sonidos WebAudio. Sin archivos, 100% local. */
(function () {
  "use strict";
  // ── Sonidos (WebAudio, oscilador) ──
  let AC = null;
  function ac() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (AC && AC.state === "suspended") AC.resume().catch(() => {});
    return AC;
  }
  function tone(freq, t0, dur, type, vol) {
    const c = ac(); if (!c) return;
    try {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t0); o.stop(t0 + dur + 0.05);
    } catch (e) {}
  }
  function seq(notes, step, type, vol) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + 0.01;
    notes.forEach((f, i) => tone(f, t + i * (step || 0.09), 0.22, type, vol));
  }
  const Sounds = {
    good() { seq([523, 659, 784], 0.08, "triangle"); },
    great() { seq([523, 659, 784, 1047], 0.09, "triangle"); },
    bad() { seq([220, 175], 0.14, "sawtooth", 0.06); },
    click() { seq([660], 0.05, "sine", 0.06); },
    flip() { seq([440, 660], 0.06, "sine", 0.07); },
    win() { seq([523, 659, 784, 1047, 1319], 0.1, "triangle"); },
    meow() {
      const c = ac(); if (!c) return;
      try {
        const t = c.currentTime + 0.01;
        const o = c.createOscillator(), g = c.createGain();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(600, t);
        o.frequency.exponentialRampToValueAtTime(900, t + 0.12);
        o.frequency.exponentialRampToValueAtTime(500, t + 0.3);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.08, t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
        o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.4);
      } catch (e) {}
    }
  };
  // ── Sparkles mágicos (usa el canvas de confetti existente) ──
  function sparkle(n) {
    try {
      if (typeof confetti === "function") { confetti(); return; }
    } catch (e) {}
    // Fallback: destellos DOM
    const layer = document.getElementById("floatLayer");
    if (!layer) return;
    for (let i = 0; i < (n || 12); i++) {
      const s = document.createElement("div");
      const em = ["✨", "⭐", "💫", "🌟"][Math.floor(Math.random() * 4)];
      s.textContent = em;
      s.style.cssText = "position:fixed;z-index:290;pointer-events:none;font-size:" + (14 + Math.random() * 18) + "px;left:" + (Math.random() * 100) + "vw;top:" + (20 + Math.random() * 60) + "vh;transition:all 1.1s ease-out;";
      layer.appendChild(s);
      requestAnimationFrame(() => {
        s.style.transform = "translateY(-90px) rotate(" + (Math.random() * 120 - 60) + "deg) scale(.3)";
        s.style.opacity = "0";
      });
      setTimeout(() => s.remove(), 1200);
    }
  }
  // Celebración por niveles + Crispy salta al ganar XP
  function celebrate(tier) {
    if (tier >= 3) { sparkle(22); Sounds.win(); }
    else if (tier === 2) { sparkle(14); Sounds.great(); }
    else { sparkle(8); Sounds.good(); }
    const card = document.getElementById("crispyCard");
    if (card && card.offsetParent) {
      card.classList.remove("xp-jump");
      requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add("xp-jump")));
      setTimeout(() => card.classList.remove("xp-jump"), 700);
    }
  }
  // Envuelve floatXP legacy: cada +XP hace saltar a Crispy (máx 1/min el salto grande)
  let lastJump = 0;
  function hookXP() {
    try {
      if (typeof floatXP !== "function" || floatXP.__crispy) return;
      const orig = floatXP;
      const wrapped = function (n) {
        orig(n);
        const now = Date.now();
        if (now - lastJump > 4000) {
          lastJump = now;
          const card = document.getElementById("crispyCard");
          if (card && card.offsetParent) {
            card.classList.remove("xp-jump");
            requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add("xp-jump")));
            setTimeout(() => card.classList.remove("xp-jump"), 700);
          }
        }
      };
      wrapped.__crispy = true;
      window.floatXP = wrapped;
    } catch (e) {}
  }
  document.addEventListener("DOMContentLoaded", () => setTimeout(hookXP, 800));
  window.LingoMagic = { Sounds, sparkle, celebrate };
})();
