/* LingoLab 5.0 — Crispy 2.0: bebé gato blanco estilo Talking Tom. ES primero + toggle EN. */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function st() { try { return JSON.parse(localStorage.getItem("lingolab_v1") || "{}"); } catch (e) { return {}; } }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ── Idioma: ES primero ── */
  function lang() { try { return localStorage.getItem("lingolab-crispy-lang") || "es"; } catch (e) { return "es"; } }
  function setLang(l) { try { localStorage.setItem("lingolab-crispy-lang", l); } catch (e) {} paintLang(); }
  function paintLang() { const b = $("crispyLang"); if (b) b.textContent = lang() === "es" ? "🌐 ES" : "🌐 EN"; }
  function kidName() { try { return localStorage.getItem("lingolab-crispy-name") || ""; } catch (e) { return ""; } }

  /* ── Voz tierna ES/EN (TTS local, sin tocar speak legacy) ── */
  let VO = [];
  try {
    VO = speechSynthesis.getVoices() || [];
    speechSynthesis.onvoiceschanged = () => { try { VO = speechSynthesis.getVoices() || []; } catch (e) {} };
  } catch (e) {}
  function tts(text, langCode) {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = (VO || []).filter((x) => (x.lang || "").toLowerCase().startsWith(langCode));
      if (v.length) u.voice = v.sort((a, b) => (/google|natural|neural/i.test(b.name) ? 1 : 0) - (/google|natural|neural/i.test(a.name) ? 1 : 0))[0];
      u.lang = langCode === "es" ? "es-ES" : "en-US";
      u.rate = 1.05; u.pitch = 1.4;
      u.onend = u.onerror = () => talking(false);
      talking(true);
      speechSynthesis.speak(u);
      setTimeout(() => talking(false), Math.min(9000, 1200 + text.length * 70));
    } catch (e) {}
  }
  function talking(on) { const c = $("crispyCard"); if (c) c.classList.toggle("talking", !!on); }

  /* ── SVG bebé blanco + motor de emociones ── */
  const EYES = {
    normal: '<g class="ceye"><ellipse cx="76" cy="102" rx="10" ry="12" fill="#23233d"/><circle cx="79" cy="98" r="3.4" fill="#fff"/></g><g class="ceye"><ellipse cx="124" cy="102" rx="10" ry="12" fill="#23233d"/><circle cx="127" cy="98" r="3.4" fill="#fff"/></g>',
    happy: '<path d="M64 102 Q76 90 88 102" stroke="#23233d" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M112 102 Q124 90 136 102" stroke="#23233d" stroke-width="4" fill="none" stroke-linecap="round"/>',
    sad: '<ellipse cx="76" cy="104" rx="8" ry="10" fill="#23233d"/><circle cx="78" cy="101" r="2.6" fill="#fff"/><ellipse cx="124" cy="104" rx="8" ry="10" fill="#23233d"/><circle cx="126" cy="101" r="2.6" fill="#fff"/><path d="M64 88 L86 92 M136 88 L114 92" stroke="#8a86b8" stroke-width="3" stroke-linecap="round"/>',
    sleep: '<path d="M66 102 Q76 106 86 102" stroke="#23233d" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M114 102 Q124 106 134 102" stroke="#23233d" stroke-width="4" fill="none" stroke-linecap="round"/>',
    wow: '<ellipse cx="76" cy="102" rx="13" ry="15" fill="#fff" stroke="#23233d" stroke-width="3"/><circle cx="76" cy="104" r="5" fill="#23233d"/><ellipse cx="124" cy="102" rx="13" ry="15" fill="#fff" stroke="#23233d" stroke-width="3"/><circle cx="124" cy="104" r="5" fill="#23233d"/>',
    love: '<text x="76" y="112" font-size="22" text-anchor="middle" fill="#ff6e9e">♥</text><text x="124" y="112" font-size="22" text-anchor="middle" fill="#ff6e9e">♥</text>'
  };
  const MOUTHS = {
    smile: '<path d="M88 128 Q100 140 112 128" stroke="#7a5a4a" stroke-width="3.4" fill="none" stroke-linecap="round"/>',
    open: '<ellipse class="cmouth" cx="100" cy="132" rx="7" ry="9" fill="#8a4a5a"/><ellipse cx="100" cy="136" rx="3.6" ry="4" fill="#ff9eb0"/>',
    sad: '<path d="M90 136 Q100 128 110 136" stroke="#7a5a4a" stroke-width="3.4" fill="none" stroke-linecap="round"/>',
    laugh: '<ellipse class="cmouth" cx="100" cy="133" rx="11" ry="12" fill="#8a4a5a"/><ellipse cx="100" cy="138" rx="5.4" ry="5.4" fill="#ff9eb0"/>',
    sleep: '<circle cx="100" cy="132" r="3" fill="#7a5a4a"/>',
    wow: '<ellipse class="cmouth" cx="100" cy="133" rx="6" ry="8" fill="#8a4a5a"/>'
  };
  const SVG =
    '<svg id="crispySvg" viewBox="0 0 200 210" width="156" height="164" role="img" aria-label="Crispy, bebé gato blanco">' +
    '<ellipse cx="100" cy="196" rx="54" ry="9" fill="rgba(108,200,255,.20)"/>' +
    '<g id="crispyFloat">' +
    '<path id="crispyTail" d="M150 158 Q184 156 178 118 Q176 104 164 108 Q154 111 159 124 Q163 140 144 142 Z" fill="#fffdf8" stroke="#d9d4f5" stroke-width="2"/>' +
    '<ellipse cx="100" cy="162" rx="30" ry="26" fill="#fffdf8" stroke="#d9d4f5" stroke-width="2"/>' +
    '<ellipse cx="100" cy="168" rx="14" ry="12" fill="#ffe9f2"/>' +
    '<ellipse cx="82" cy="188" rx="11" ry="7" fill="#fffdf8" stroke="#d9d4f5" stroke-width="2"/><ellipse cx="118" cy="188" rx="11" ry="7" fill="#fffdf8" stroke="#d9d4f5" stroke-width="2"/>' +
    '<g id="crispyHead">' +
    '<polygon points="52,72 44,30 78,50" fill="#fffdf8" stroke="#d9d4f5" stroke-width="2"/><polygon points="148,72 156,30 122,50" fill="#fffdf8" stroke="#d9d4f5" stroke-width="2"/>' +
    '<polygon points="54,62 50,40 68,50" fill="#ffc7d9"/><polygon points="146,62 150,40 132,50" fill="#ffc7d9"/>' +
    '<circle cx="100" cy="102" r="52" fill="#fffdf8" stroke="#d9d4f5" stroke-width="2.5"/>' +
    '<ellipse cx="58" cy="118" rx="10" ry="7" fill="#ffc7d9" opacity=".8"/><ellipse cx="142" cy="118" rx="10" ry="7" fill="#ffc7d9" opacity=".8"/>' +
    '<g id="cEyes">' + EYES.normal + "</g>" +
    '<path d="M96 120 L104 120 L100 125 Z" fill="#f28ba8"/>' +
    '<g id="cMouth">' + MOUTHS.smile + "</g>" +
    '<g id="cTears" hidden><path d="M70 116 Q66 130 70 142 Q74 130 70 116" fill="#6cc8ff"/><path d="M130 116 Q126 130 130 142 Q134 130 130 116" fill="#6cc8ff"/></g>' +
    '<g id="cHeart" hidden><text x="100" y="34" font-size="26" text-anchor="middle" fill="#ff6e9e">♥</text></g>' +
    '<path d="M52 62 A56 56 0 0 1 148 62" stroke="rgba(108,200,255,.85)" stroke-width="6" fill="none" stroke-linecap="round"/>' +
    '<circle cx="100" cy="8" r="5" fill="#ffcf5c"/>' +
    "</g></g></svg>";
  const CSS = "#crispyFloat{animation:cfloat 3.4s ease-in-out infinite;transform-origin:100px 150px}#crispyTail{animation:ctail 2.6s ease-in-out infinite;transform-origin:148px 150px}.ceye{animation:cblink 4.6s infinite}@keyframes cfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}@keyframes ctail{0%,100%{transform:rotate(0)}50%{transform:rotate(-13deg)}}@keyframes cblink{0%,93%,100%{transform:scaleY(1)}95%,97%{transform:scaleY(.08)}}.purring #crispyFloat{animation:cfloat .35s ease-in-out infinite}#crispyBubble{transition:opacity .3s}.emo-laugh #crispyFloat{animation:claugh .4s ease-in-out infinite}@keyframes claugh{0%,100%{transform:rotate(0)}25%{transform:rotate(-4deg) translateY(-4px)}75%{transform:rotate(4deg)}}.emo-angry #crispyHead{animation:ctant .5s ease-in-out infinite;transform-origin:100px 102px}@keyframes ctant{0%,100%{transform:rotate(0)}25%{transform:rotate(-7deg)}75%{transform:rotate(7deg)}}.emo-sleep #crispyFloat{animation:cfloat 5.5s ease-in-out infinite}#cTears:not([hidden]){animation:ctear 1.2s ease-in infinite}@keyframes ctear{0%{opacity:0;transform:translateY(-4px)}30%{opacity:1}100%{opacity:0;transform:translateY(10px)}}#cHeart:not([hidden]){animation:cheart 1s ease-out infinite}@keyframes cheart{0%{transform:scale(.4);opacity:0}40%{transform:scale(1.25);opacity:1}100%{transform:scale(1) translateY(-6px);opacity:.9}}.talking #cMouth{animation:ctalk .28s ease-in-out infinite}@keyframes ctalk{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.3)}}#cMouth{transform-origin:center;transform-box:fill-box}.ceye{transform-origin:center;transform-box:fill-box}#cHeart{transform-origin:center;transform-box:fill-box}.cneed{height:8px;border-radius:99px;background:#0a0d24;overflow:hidden}.cneed i{display:block;height:100%;border-radius:99px;transition:width .6s}";
  let emo = "normal";
  function setEmo(name, ms) {
    emo = name;
    const eyes = $("cEyes"), mouth = $("cMouth"), tears = $("cTears"), heart = $("cHeart"), card = $("crispyCard");
    if (!eyes) return;
    const map = { normal: ["normal", "smile"], happy: ["happy", "smile"], laugh: ["happy", "laugh"], sad: ["sad", "sad"], angry: ["normal", "sad"], sleep: ["sleep", "sleep"], wow: ["wow", "wow"], love: ["love", "smile"] };
    const [e, m] = map[name] || map.normal;
    eyes.innerHTML = EYES[e]; mouth.innerHTML = MOUTHS[m];
    if (tears) tears.hidden = name !== "sad";
    if (heart) heart.hidden = !(name === "love" || name === "happy");
    if (card) card.classList.remove("emo-laugh", "emo-angry", "emo-sleep");
    if (card && (name === "laugh" || name === "angry" || name === "sleep")) card.classList.add("emo-" + name);
    if (ms) setTimeout(() => { if (emo === name) setEmo(autoEmo()); }, ms);
  }
  function autoEmo() {
    const n = needs();
    if (n.sleeping) return "sleep";
    if (Math.min(n.belly, n.fun, n.energy) < 25) return "sad";
    const h = new Date().getHours();
    if (h >= 22 || h < 6) return "sleep";
    return "normal";
  }

  /* ── Necesidades tamagotchi-lite ── */
  const NKEY = "lingolab-crispy-needs";
  function needs() {
    let n = { belly: 80, fun: 80, energy: 80, t: Date.now(), sleeping: false };
    try { n = Object.assign(n, JSON.parse(localStorage.getItem(NKEY) || "{}")); } catch (e) {}
    // deterioro offline: -1 cada 10 min despierto
    if (!n.sleeping) {
      const mins = Math.min(720, Math.max(0, (Date.now() - (n.t || Date.now())) / 60000));
      const drop = Math.floor(mins / 10);
      n.belly = Math.max(0, n.belly - drop); n.fun = Math.max(0, n.fun - drop); n.energy = Math.max(0, n.energy - Math.floor(drop / 2));
    }
    n.t = Date.now();
    return n;
  }
  function saveNeeds(n) { n.t = Date.now(); try { localStorage.setItem(NKEY, JSON.stringify(n)); } catch (e) {} }
  function paintNeeds() {
    const n = needs();
    const set = (id, v, c) => { const el = $(id); if (el) { el.style.width = Math.max(0, Math.min(100, v)) + "%"; el.style.background = c; } };
    set("cnBelly", n.belly, n.belly < 25 ? "var(--coral)" : "#ffb84f");
    set("cnFun", n.fun, n.fun < 25 ? "var(--coral)" : "var(--lilac)");
    set("cnEnergy", n.energy, n.energy < 25 ? "var(--coral)" : "var(--sky)");
    const lbl = $("cnState");
    if (lbl) lbl.textContent = n.sleeping ? "😴 dormido… tócalo para despertar" : Math.min(n.belly, n.fun, n.energy) < 25 ? "🥺 necesito mimos…" : "😺 feliz";
  }
  const CD = {};
  function cooldown(k, ms) { const now = Date.now(); if (CD[k] && now - CD[k] < ms) return false; CD[k] = now; return true; }
  function dailyXP(key, n, reason) {
    try {
      const day = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem(key) !== day) { localStorage.setItem(key, day); addXP(n, reason); return true; }
    } catch (e) {}
    return false;
  }

  /* ── Interacciones ES primero ── */
  function N() { const n = kidName(); return n ? ", " + n : ""; }
  function INTER() {
    const h = new Date().getHours(), S = st();
    const known = Object.values(S.words || {}).filter((w) => w.st === "known").length;
    return [
      { id: "morn", es: "¡Buenos días" + N() + "! ¿Jugamos en inglés hoy?", en: "Good morning" + N() + "! Shall we play in English?", emo: "happy", when: () => h < 12 },
      { id: "after", es: "¡Buenas tardes" + N() + "! Las estrellas estudian contigo.", en: "Good afternoon" + N() + "! The stars study with you.", emo: "happy", when: () => h >= 12 && h < 21 },
      { id: "night", es: "Shhh… de noche el inglés es más soñador. ¡Bostezo! Es broma, ¡vamos!", en: "Shhh… night English is dreamiest. Yawn… kidding, let's go!", emo: "sleep", when: () => h >= 21 },
      { id: "streak7", es: "¡¿SIETE días seguidos?! ¡Eres una supernova" + N() + "!", en: "SEVEN days?! You are a supernova" + N() + "!", emo: "wow", when: () => (S.streak || 0) >= 7 },
      { id: "streak3", es: "¡Racha de 3 días! ¡Mis bigotes tiemblan de orgullo!", en: "Three-day streak! My whiskers tingle!", emo: "happy", when: () => (S.streak || 0) >= 3 },
      { id: "streak1", es: "¡Día uno de tu racha! Todo astronauta empieza así.", en: "Day one! Every astronaut starts somewhere!", emo: "happy", when: () => (S.streak || 0) >= 1 },
      { id: "goal", es: "¡Meta diaria cumplida! ¡Houston, tenemos un genio!", en: "Daily goal crushed! Houston, we have a genius!", emo: "laugh", when: () => (S.todayXP || 0) >= (S.goal || 60) && S.todayXP > 0 },
      { id: "xp100", es: "¡Cien XP! ¡Me quito el casco ante ti!", en: "One hundred XP! Helmet off to you!", emo: "wow", when: () => (S.xp || 0) >= 100 },
      { id: "words", es: "¡50 palabras! ¡Tu cerebro es una galaxia!", en: "Fifty words! Your brain is a galaxy!", emo: "love", when: () => known >= 50 },
      { id: "hello", es: "¡Miau! Eso significa: ¡te quiero" + N() + "!", en: "Meow! That means: I love you" + N() + "!", emo: "love", when: () => true },
      { id: "pet", es: "Ronroneo… tu mano es mi planeta favorito.", en: "Purrrr… your hand is my favorite planet.", emo: "love", when: () => true },
      { id: "tickle", es: "¡Ji ji! ¡Mis patitas tienen cosquillas!", en: "Hee hee! My paws are ticklish!", emo: "laugh", when: () => true },
      { id: "poke", es: "¡Oye! ¡Mi nariz no es un botón! …Bueno, otra vez.", en: "Hey! My nose is not a button! …Okay, again.", emo: "angry", when: () => true },
      { id: "idle", es: "Conté 200 estrellas esperándote. ¿Jugamos?", en: "I counted 200 stars waiting. Play?", emo: "normal", when: () => true },
      { id: "enc1", es: "Los errores son cráteres lunares. ¡Sáltalos!", en: "Mistakes are moon craters. Jump them!", emo: "happy", when: () => true },
      { id: "enc2", es: "Hasta los cohetes tiemblan antes de volar.", en: "Even rockets wobble before flying.", emo: "happy", when: () => true },
      { id: "joke1", es: "¿Qué dice un gato en la computadora? ¡Miau-soft!", en: "What does a cat say at the computer? Mew-soft!", emo: "laugh", when: () => true },
      { id: "joke2", es: "¿Por qué el gato se sentó en la computadora? ¡Para vigilar al ratón!", en: "Why did the cat sit on the computer? To watch the mouse!", emo: "laugh", when: () => true },
      { id: "song", es: "Canta conmigo en inglés: one, two, three… ¡sigue tú!", en: "Sing with me: one, two, three… your turn!", emo: "happy", when: () => true },
      { id: "tipmic", es: "Consejo: mantén el micrófono y habla despacito.", en: "Tip: hold the mic and speak slowly.", emo: "normal", when: () => true },
      { id: "tipgoal", es: "Metas chiquitas cada día ganan a las gigantes.", en: "Tiny daily goals beat giant ones.", emo: "normal", when: () => true },
      { id: "tipflash", es: "Repite las tarjetas aunque las sepas. ¡Velocidad!", en: "Repeat cards even known ones. Speed!", emo: "normal", when: () => true },
    ];
  }
  function cultureOnes() {
    const C = (window.LingoCulture && window.LingoCulture.list) || [];
    if (!C.length) return [];
    return shuffle(C.slice()).slice(0, 4).map((c) => ({
      id: "cult-" + c.id, emo: "wow",
      es: "¿Sabías? " + c.fact.es, en: "Did you know? " + c.fact.en, when: () => true,
    }));
  }
  let lastId = "";
  function pick() {
    const pool = INTER().concat(cultureOnes()).filter((x) => { try { return x.when(); } catch (e) { return true; } });
    const fresh = pool.filter((x) => x.id !== lastId);
    const list = fresh.length ? fresh : pool;
    return list[Math.floor(Math.random() * list.length)] || INTER()[9];
  }
  function say(it, silent) {
    if (!it) return;
    lastId = it.id;
    setEmo(it.emo || "happy", 3500);
    const b = $("crispyBubble"); if (!b) return;
    const L = lang();
    const main = L === "es" ? it.es : it.en, sub = L === "es" ? it.en : it.es;
    b.innerHTML = "<b>“" + esc(main) + "”</b><br><span class='dim'>" + esc(sub) + "</span>";
    if (!silent) tts(main, L);
  }

  /* ── Acciones ── */
  function pet() {
    const card = $("crispyCard"); if (!card) return;
    card.classList.add("purring");
    setTimeout(() => card.classList.remove("purring"), 1200);
    try { LingoMagic.Sounds.meow(); } catch (e) {}
    const n = needs(); n.fun = Math.min(100, n.fun + 8); saveNeeds(n); paintNeeds();
    dailyXP("lingolab-pet-day", 1, "cariño a Crispy");
    say(INTER().find((x) => x.id === "pet"), true);
    tts("Purrrr!", lang());
  }
  function feed() {
    if (!cooldown("feed", 30000)) { say({ id: "full", es: "¡Estoy llenito! Dame 30 segunditos.", en: "I'm full! Give me 30 seconds.", emo: "happy" }); return; }
    const foods = [
      { e: "🥛", es: "¡Leche tibia! ¡Mi favorita!", en: "Warm milk! My favorite!" },
      { e: "🐟", es: "¡Pescadito! ¡Crujiente y rico!", en: "Little fish! Crispy yum!" },
      { e: "🍪", es: "¡Galleta! Solo una, ¿sí?", en: "Cookie! Just one, okay?" },
    ];
    const f = foods[Math.floor(Math.random() * foods.length)];
    const n = needs(); n.belly = Math.min(100, n.belly + 20); n.fun = Math.min(100, n.fun + 4); saveNeeds(n); paintNeeds();
    dailyXP("lingolab-feed-day", 1, "alimentar a Crispy");
    try { LingoMagic.Sounds.good(); } catch (e) {}
    say({ id: "eat" + Date.now(), es: f.e + " " + f.es, en: f.e + " " + f.en, emo: "happy" });
  }
  function sleepToggle() {
    const n = needs(); n.sleeping = !n.sleeping;
    if (!n.sleeping) n.energy = Math.min(100, n.energy + 30);
    saveNeeds(n); paintNeeds(); setEmo(n.sleeping ? "sleep" : "happy", 3000);
    say({ id: "slp", es: n.sleeping ? "Zzz… cuídame los sueños." : "¡Despierto! ¿Jugamos?", en: n.sleeping ? "Zzz… watch my dreams." : "Awake! Play?", emo: n.sleeping ? "sleep" : "happy" });
    const b = $("crispySleep"); if (b) b.textContent = n.sleeping ? "☀️ Despertar" : "😴 Dormir";
  }
  function poke() {
    setEmo("angry", 1500);
    try { LingoMagic.Sounds.bad(); } catch (e) {}
    say(INTER().find((x) => x.id === "poke"));
    setTimeout(() => setEmo("laugh", 2000), 1600);
  }
  /* Efecto Tom: graba y devuelve agudo */
  let mr = null, chunks = [];
  function echo() {
    const L = lang();
    if (!navigator.mediaDevices || !window.MediaRecorder) { echoText(); return; }
    const b = $("crispyBubble");
    if (mr && mr.state === "recording") { try { mr.stop(); } catch (e) {} return; }
    setEmo("wow");
    if (b) b.innerHTML = "<b>🎙️ " + (L === "es" ? "¡Habla! Te repito en gatuno…" : "Speak! I'll repeat in cat…") + "</b>";
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      chunks = [];
      mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      mr.onstop = () => {
        try { stream.getTracks().forEach((t) => t.stop()); } catch (e) {}
        const url = URL.createObjectURL(new Blob(chunks, { type: (mr.mimeType || "audio/webm") }));
        const au = new Audio(url);
        au.playbackRate = 1.55; au.preservesPitch = false;
        talking(true); setEmo("happy");
        au.play().catch(() => {});
        au.onended = () => { talking(false); setEmo(autoEmo()); };
        try { LingoMagic.Sounds.flip(); } catch (e) {}
      };
      mr.start();
      talking(true);
      setTimeout(() => { try { if (mr.state === "recording") mr.stop(); } catch (e) {} }, 5000);
    }).catch(() => echoText());
  }
  function echoText() {
    const L = lang();
    const b = $("crispyBubble");
    if (!b) return;
    b.innerHTML = "<div class='row'><input class='txt' id='crispyEchoIn' style='flex:1' placeholder='" + (L === "es" ? "Escríbeme algo…" : "Type something…") + "'><button class='btn amber sm' id='crispyEchoGo'>🐱</button></div>";
    const go = () => {
      const v = ($("crispyEchoIn").value || "").trim(); if (!v) return;
      setEmo("happy");
      // voz Tom: aguda y juguetona
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(v);
        const vs = (VO || []).filter((x) => (x.lang || "").toLowerCase().startsWith(L));
        if (vs.length) u.voice = vs[0];
        u.lang = L === "es" ? "es-ES" : "en-US";
        u.rate = 1.25; u.pitch = 1.8;
        u.onend = u.onerror = () => talking(false);
        talking(true); speechSynthesis.speak(u);
        setTimeout(() => talking(false), 6000);
      } catch (e) {}
      b.innerHTML = "<b>“" + esc(v) + "”</b><br><span class='dim'>" + (L === "es" ? "¡Así hablo yo, miau!" : "That's me talking, meow!") + "</span>";
    };
    $("crispyEchoGo").onclick = go;
    $("crispyEchoIn").addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
    $("crispyEchoIn").focus();
  }
  function askName() {
    const L = lang(), b = $("crispyBubble");
    if (!b) return;
    setEmo("wow");
    b.innerHTML = "<div class='row'><input class='txt' id='crispyNameIn' style='flex:1' value='" + esc(kidName()) + "' placeholder='" + (L === "es" ? "¿Cómo te llamas?" : "What's your name?") + "'><button class='btn amber sm' id='crispyNameGo'>💾</button></div>";
    $("crispyNameGo").onclick = () => {
      const v = ($("crispyNameIn").value || "").trim().slice(0, 20);
      try { localStorage.setItem("lingolab-crispy-name", v); } catch (e) {}
      say({ id: "hi", es: v ? "¡Hola, " + v + "! ¡Seremos mejores amigos!" : "¡Hola, amigo! ¡Seremos mejores amigos!", en: v ? "Hi, " + v + "! Best friends!" : "Hi, friend! Best friends!", emo: "love" });
    };
    $("crispyNameIn").addEventListener("keydown", (e) => { if (e.key === "Enter") $("crispyNameGo").click(); });
    $("crispyNameIn").focus();
  }

  /* ── Montaje ── */
  function mount() {
    if ($("crispySvg") || !$("crispyCard")) return;
    const stEl = document.createElement("style"); stEl.textContent = CSS; document.head.appendChild(stEl);
    $("crispyArt").innerHTML = SVG;
    paintNeeds(); paintLang();
    const n = needs();
    const sb = $("crispySleep"); if (sb) sb.textContent = n.sleeping ? "☀️ Despertar" : "😴 Dormir";
    if (!kidName()) {
      setEmo("wow");
      setTimeout(askName, 1200);
    } else {
      setEmo(autoEmo());
      say(pick(), true);
      setTimeout(() => say(pick()), 1200);
    }
    setInterval(() => { // latido tamagotchi
      const c = $("crispyCard"); if (!c || !c.offsetParent) return;
      const nn = needs(); saveNeeds(nn); paintNeeds();
      if (Math.min(nn.belly, nn.fun, nn.energy) < 25 && emo !== "sad") {
        setEmo("sad");
        say({ id: "need", es: nn.belly < 25 ? "¡Mi pancita ruge! ¿Me das de comer?" : nn.fun < 25 ? "¿Juegas conmigo? ¡Estoy aburrido!" : "¡Tengo sueñito! ¿Dormimos?", en: nn.belly < 25 ? "My tummy rumbles! Feed me?" : nn.fun < 25 ? "Play with me? I'm bored!" : "Sleepy! Nap time?", emo: "sad" }, true);
      }
    }, 60000);
    setInterval(() => { const c = $("crispyCard"); if (c && c.offsetParent && document.hasFocus()) say(pick()); }, 120000);
  }
  document.addEventListener("DOMContentLoaded", () => {
    mount(); setTimeout(mount, 1500);
    paintLang();
    document.addEventListener("click", (e) => {
      if (e.target.closest("#crispyPet")) pet();
      else if (e.target.closest("#crispyTalk")) say(pick());
      else if (e.target.closest("#crispyEcho")) echo();
      else if (e.target.closest("#crispyFeed")) feed();
      else if (e.target.closest("#crispySleep")) sleepToggle();
      else if (e.target.closest("#crispyLang")) { setLang(lang() === "es" ? "en" : "es"); say(pick()); }
      else if (e.target.closest("#crispyName")) askName();
      else if (e.target.closest("#crispyArt")) poke();
    });
  });
  window.Crispy = { say, pet, pick, feed, echo, setEmo, setLang };
})();
