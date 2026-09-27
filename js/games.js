/* LingoLab 3.0 — Juegos culturales mágicos. Usa data/culture.json + WORDS. */
(function () {
  "use strict";
  let CULT = [];
  fetch("data/culture.json").then((r) => r.json()).then((j) => {
    CULT = j; window.LingoCulture = { list: CULT };
  }).catch(() => {});
  window.LingoCulture = window.LingoCulture || { list: CULT };

  const $ = (id) => document.getElementById(id);
  const escH = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function back() { return '<button class="btn ghost sm" id="gmBack">← Juegos</button>'; }
  function shell(inner) { return back() + '<div class="mg-t">' + inner + "</div>"; }
  function done(xp, msg) {
    try { addXP(xp, "juego"); LingoMagic.sparkle(14); LingoMagic.Sounds.win(); } catch (e) {}
    return '<div class="card mg-t" style="text-align:center;padding:30px"><div style="font-size:48px">🎉</div><h3 style="font-family:var(--disp);font-size:24px">+' + xp + " XP</h3><p class='mut'>" + escH(msg) + "</p></div>";
  }

  /* ── MENÚ ── */
  function renderGames() {
    const box = $("gamesBox"); if (!box) return;
    box.innerHTML =
      '<div class="grid g4">' +
      gmCard("memory", "🃏", "Memoria mágica", "Empareja país ↔ capital") +
      gmCard("anagram", "🔤", "Anagrama", "Ordena las letras") +
      gmCard("hangman", "🎪", "Ahorcado", "Adivina el país") +
      gmCard("order", "🧩", "Ordena la frase", "Dato curioso en orden") +
      "</div><p class='mut mg-t' style='font-size:13px'>🌍 Todo con cultura real: países, capitales, cocina y curiosidades. ¡Gana XP en cada juego!</p>";
    box.querySelectorAll("[data-gm]").forEach((b) => (b.onclick = () => {
      try { LingoMagic.Sounds.click(); } catch (e) {}
      GAMES[b.dataset.gm]();
    }));
  }
  function gmCard(id, em, t, d) {
    return '<div class="card lift" data-gm="' + id + '" style="cursor:pointer;text-align:center"><div style="font-size:44px">' + em + '</div><div style="font-family:var(--disp);font-weight:800;font-size:18px;margin-top:6px">' + t + '</div><p class="mut" style="font-size:13px">' + d + "</p></div>";
  }

  /* ── 1. MEMORIA ── */
  function gmMemory() {
    const box = $("gamesBox");
    const pool = CULT.length >= 6 ? shuffle(CULT.slice()).slice(0, 6) : null;
    if (!pool) { box.innerHTML = shell("<div class='skel' style='height:120px'></div><div class='skel mg-t' style='height:20px;width:60%'></div>"); return; }
    const cards = shuffle(pool.flatMap((c) => [
      { k: c.id, t: c.emoji + " " + c.country.en }, { k: c.id, t: "🏛️ " + c.capital.en }
    ]));
    let open = [], hits = 0, tries = 0;
    box.innerHTML = shell('<p class="mono dim" id="memStat" style="font-size:12px"></p><div class="grid g4" id="memGrid" style="grid-template-columns:repeat(4,1fr)"></div>');
    $("gmBack").onclick = renderGames;
    const g = $("memGrid");
    const paint = () => { $("memStat").textContent = "Aciertos " + hits + "/6 · Intentos " + tries; };
    paint();
    g.innerHTML = cards.map((c, i) => '<button class="card" data-mi="' + i + '" style="min-height:86px;font-weight:700;font-size:15px">✨</button>').join("");
    g.querySelectorAll("[data-mi]").forEach((b) => (b.onclick = () => {
      const i = +b.dataset.mi, c = cards[i];
      if (b.dataset.done || b.dataset.open || open.length === 2) return;
      b.dataset.open = "1"; b.innerHTML = escH(c.t);
      try { LingoMagic.Sounds.flip(); } catch (e) {}
      open.push({ i, c, el: b });
      if (open.length === 2) {
        tries++;
        const [a, d] = open;
        if (a.c.k === d.c.k) {
          setTimeout(() => {
            a.el.dataset.done = d.el.dataset.done = "1";
            a.el.style.borderColor = "var(--mint)"; d.el.style.borderColor = "var(--mint)";
            try { LingoMagic.Sounds.good(); LingoMagic.sparkle(6); } catch (e) {}
            hits++; open = []; paint();
            if (hits === 6) { g.innerHTML = ""; box.innerHTML = shell(done(12, "¡Memoria perfecta en " + tries + " intentos!")); $("gmBack").onclick = renderGames; }
          }, 500);
        } else {
          setTimeout(() => { a.el.removeAttribute("data-open"); d.el.removeAttribute("data-open"); a.el.innerHTML = d.el.innerHTML = "✨"; open = []; paint(); }, 800);
        }
        paint();
      }
    }));
  }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ── 2. ANAGRAMA ── */
  let anCur = null, anScore = 0;
  function gmAnagram() {
    anScore = 0; anNext();
  }
  function anNext() {
    const box = $("gamesBox");
    const cands = CULT.filter((c) => /^[A-Za-z ]+$/.test(c.capital.en) && c.capital.en.replace(/ /g, "").length >= 4);
    if (!cands.length) { box.innerHTML = shell("<div class='skel' style='height:96px'></div><div class='skel mg-t' style='height:20px;width:50%'></div>"); return; }
    anCur = cands[Math.floor(Math.random() * cands.length)];
    const word = anCur.capital.en.toUpperCase().replace(/ /g, "");
    const scr = shuffle(word.split("")).join("");
    box.innerHTML = shell(
      '<div class="card" style="text-align:center;padding:28px"><span class="eyebrow">Adivina la capital</span>' +
      '<div style="font-size:52px">' + anCur.emoji + "</div>" +
      '<div class="q-prompt" style="letter-spacing:.3em">' + escH(scr) + "</div>" +
      '<p class="mut">💡 ' + escH(anCur.fact.es) + "</p>" +
      '<div class="row mg-t" style="justify-content:center"><input class="txt" id="anIn" style="max-width:280px" placeholder="Escribe la capital…"><button class="btn amber" id="anGo">¡Magia!</button></div>' +
      '<p class="mono mg-t" style="color:var(--mint);font-size:13px">Racha: ' + anScore + " · cada acierto +3 XP</p></div>"
    );
    $("gmBack").onclick = renderGames;
    $("anGo").onclick = anCheck;
    $("anIn").addEventListener("keydown", (e) => { if (e.key === "Enter") anCheck(); });
    $("anIn").focus();
  }
  function anCheck() {
    const v = ($("anIn").value || "").trim().toLowerCase();
    if (v === anCur.capital.en.toLowerCase()) {
      anScore++;
      try { addXP(3, "anagrama"); LingoMagic.Sounds.great(); LingoMagic.sparkle(10); } catch (e) {}
      toast("¡Correcto! " + anCur.capital.en + " " + anCur.emoji, "🔤");
      setTimeout(anNext, 900);
    } else {
      try { LingoMagic.Sounds.bad(); } catch (e) {}
      toast("Casi… ¡intenta otra vez!", "✨");
    }
  }

  /* ── 3. AHORCADO ── */
  function gmHang() {
    const box = $("gamesBox");
    if (!CULT.length) { box.innerHTML = shell("<div class='skel' style='height:96px'></div><div class='skel mg-t' style='height:20px;width:50%'></div>"); return; }
    const c = CULT[Math.floor(Math.random() * CULT.length)];
    const word = c.country.en.toUpperCase().replace(/[^A-Z]/g, "");
    let lives = 6, got = new Set(), bad = [];
    const stages = ["🎪", "😐", "😟", "😰", "🥵", "😵", "💀"];
    const draw = () => {
      const shown = word.split("").map((ch) => (got.has(ch) ? ch : "_")).join(" ");
      box.innerHTML = shell(
        '<div class="card" style="text-align:center;padding:28px"><span class="eyebrow">Adivina el país ' + stages[6 - lives] + "</span>" +
        '<div style="font-size:52px">' + (lives === 6 ? "🌍" : c.emoji) + "</div>" +
        '<div class="q-prompt" style="letter-spacing:.2em;font-size:30px">' + shown + "</div>" +
        '<p class="mono" style="font-size:13px">Vidas: ' + "❤️".repeat(lives) + " · Mal: " + (bad.join(" ") || "—") + "</p>" +
        '<div class="chips mg-t" style="justify-content:center">' + "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch) =>
          '<button class="chip" data-l="' + ch + '"' + (got.has(ch) || bad.includes(ch) ? " disabled style='opacity:.35'" : "") + ">" + ch + "</button>").join("") + "</div></div>"
      );
      $("gmBack").onclick = renderGames;
      box.querySelectorAll("[data-l]").forEach((b) => (b.onclick = () => {
        const ch = b.dataset.l;
        if (word.includes(ch)) {
          got.add(ch);
          try { LingoMagic.Sounds.click(); } catch (e) {}
          if (word.split("").every((x) => got.has(x))) {
            box.innerHTML = shell(done(10, c.country.en + " " + c.emoji + " · " + c.fact.es));
            $("gmBack").onclick = renderGames;
            return;
          }
        } else { bad.push(ch); lives--; try { LingoMagic.Sounds.bad(); } catch (e) {} }
        if (lives <= 0) {
          box.innerHTML = shell('<div class="card" style="text-align:center;padding:30px"><div style="font-size:48px">💀</div><p>Era <b>' + escH(c.country.en) + "</b> " + c.emoji + "</p><p class='mut'>" + escH(c.fact.es) + "</p></div>");
          $("gmBack").onclick = renderGames;
          return;
        }
        draw();
      }));
    };
    draw();
  }

  /* ── 4. ORDENA LA FRASE ── */
  function gmOrder() {
    const box = $("gamesBox");
    if (!CULT.length) { box.innerHTML = shell("<div class='skel' style='height:96px'></div><div class='skel mg-t' style='height:20px;width:50%'></div>"); return; }
    const c = CULT[Math.floor(Math.random() * CULT.length)];
    const target = c.fact.en.replace(/[.]/g, "").split(" ");
    let pool = shuffle(target.map((w, i) => ({ w, i }))), built = [];
    const draw = () => {
      box.innerHTML = shell(
        '<div class="card" style="padding:26px"><span class="eyebrow">Ordena el dato ' + c.emoji + "</span>" +
        '<p class="mut">🇪🇸 ' + escH(c.fact.es) + "</p>" +
        '<div class="card mg-t" style="background:#0c1824;min-height:60px" id="orBuilt">' + (built.map((b) => escH(b.w)).join(" ") || "<span class='dim'>Toca las palabras en orden…</span>") + "</div>" +
        '<div class="chips mg-t">' + pool.map((p, i) => '<button class="chip" data-oi="' + i + '">' + escH(p.w) + "</button>").join("") + "</div>" +
        '<div class="row mg-t"><button class="btn ghost sm" id="orUndo">↩ Deshacer</button><button class="btn amber sm" id="orCheck">¡Magia!</button></div></div>'
      );
      $("gmBack").onclick = renderGames;
      box.querySelectorAll("[data-oi]").forEach((b) => (b.onclick = () => {
        const p = pool.splice(+b.dataset.oi, 1)[0]; built.push(p);
        try { LingoMagic.Sounds.click(); } catch (e) {}
        draw();
      }));
      $("orUndo").onclick = () => { const p = built.pop(); if (p) pool.push(p); draw(); };
      $("orCheck").onclick = () => {
        if (built.map((b) => b.w).join(" ") === target.join(" ")) {
          try { addXP(8, "ordena frase"); LingoMagic.Sounds.win(); } catch (e) {}
          box.innerHTML = shell(done(8, "¡Frase perfecta! " + c.country.en + " " + c.emoji));
          $("gmBack").onclick = renderGames;
        } else {
          try { LingoMagic.Sounds.bad(); } catch (e) {}
          toast("Casi… el orden brilla diferente ✨", "🧩");
          pool = pool.concat(built); built = []; pool = shuffle(pool); draw();
        }
      };
    };
    draw();
  }

  const GAMES = { memory: gmMemory, anagram: gmAnagram, hangman: gmHang, order: gmOrder };
  window.LingoGames = { render: renderGames };
  // Registra la vista en el router legacy
  try { if (typeof RENDER !== "undefined") RENDER.juegos = renderGames; } catch (e) {}
  document.addEventListener("DOMContentLoaded", () => {
    try { if (typeof RENDER !== "undefined") RENDER.juegos = renderGames; } catch (e) {}
  });
  function toast(m, i) { try { if (window.toast) window.toast(m, i); } catch (e) {} }
})();
