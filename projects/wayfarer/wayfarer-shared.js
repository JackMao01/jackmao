/* ============================================================================
 * Wayfarer — shared data, chrome, and saved-guides logic.
 * Loaded by index, author, saved, and (lightly) the guide pages.
 * One source of truth so the index, search, author pages, and "saved" all agree.
 * ==========================================================================*/
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add("wfx-reduced-motion");
    const motionStyle = document.createElement("style");
    motionStyle.textContent =
      "html.wfx-reduced-motion{scroll-behavior:auto !important;}" +
      "html.wfx-reduced-motion *,html.wfx-reduced-motion *::before,html.wfx-reduced-motion *::after{animation-duration:0.001ms !important;animation-iteration-count:1 !important;transition-duration:0.001ms !important;scroll-behavior:auto !important;}" +
      "html.wfx-reduced-motion .reveal,html.wfx-reduced-motion .rv,html.wfx-reduced-motion .word,html.wfx-reduced-motion .fcard{opacity:1 !important;transform:none !important;filter:none !important;}";
    document.head.appendChild(motionStyle);
  }

  /* ---- The guide catalog (the single source of truth) ------------------- */
  const GUIDES = [
    {
      id: "shizuka", file: "shizuka.html", title: "A season in Japan",
      place: "Japan · Kyoto & beyond", mood: "Slow journeys", region: "Asia",
      author: "shizuka", readMins: 9, status: "live",
      blurb: "Slow mornings, temple silences, and the patient art of being a guest.",
      art: { sky: ["#f7c1a6", "#e8826b"], hill: "#b8553f", sun: "#fff3d6", lm: "torii" }
    },
    {
      id: "golden-route", file: "golden-route.html", title: "The Golden Route",
      place: "Korea · The grand manner", mood: "Slow journeys", region: "Asia",
      author: "goldenroute", readMins: 11, status: "live",
      blurb: "A golden-age sojourn through palaces, peaks, and lacquered cities.",
      art: { sky: ["#1a2a22", "#0e1411"], hill: "#c9a24b", sun: "#c9a24b", lm: "compass" }
    },
    {
      id: "seorak-review", file: "seorak-review.html", title: "The Seorak Review",
      place: "Korea · Read slowly", mood: "City stories", region: "Asia",
      author: "seorak", readMins: 12, status: "live",
      blurb: "Ceramics, temples, night cities, and the women of the sea, with an editor's eye.",
      art: { sky: ["#6e9183", "#3a5249"], hill: "#2f433b", sun: "#f6f2ea", lm: "city" }
    },
    {
      id: "seoul", file: "seoul.html", title: "Seoul, Between Stops",
      place: "Korea · Seoul", mood: "City stories", region: "Asia",
      author: "seoulnotes", readMins: 8, status: "live",
      blurb: "A day carried by subway lines, neighbourhood pauses, and the city between destinations.",
      art: { sky: ["#e9e7df", "#b8c8c1"], hill: "#263b35", sun: "#e86f51", lm: "city" }
    },
    {
      id: "tokyo", file: "tokyo.html", title: "Tokyo, Between Signals",
      place: "Japan · Tokyo", mood: "City stories", region: "Asia",
      author: "tokyosignals", readMins: 8, status: "live",
      blurb: "Platforms, counters, side streets, and the quiet intervals inside a city in motion.",
      art: { sky: ["#e9eef2", "#9ec8d2"], hill: "#25272a", sun: "#e36650", lm: "city" }
    },
    {
      id: "busan", file: "busan.html", title: "Busan, Tide to Table",
      place: "Korea · Busan", mood: "Coastal routes", region: "Asia",
      author: "busanlines", readMins: 8, status: "live",
      blurb: "A coastal day moving from working harbour and market counters to the last light on the water.",
      art: { sky: ["#dce9e5", "#70a89d"], hill: "#173f48", sun: "#f07952", lm: "wave" }
    },
    {
      id: "jeju", file: "jeju.html", title: "Jeju, Follow the Wind",
      place: "Korea · Jeju Island", mood: "Island routes", region: "Asia",
      author: "jejufieldnotes", readMins: 9, status: "live",
      blurb: "Volcanic ground, shifting weather, and an island day shaped by the direction of the wind.",
      art: { sky: ["#eef0e7", "#9db8ae"], hill: "#303d37", sun: "#e7bd45", lm: "peaks" }
    },
    {
      id: "hello-toronto", file: "hello-toronto.html", title: "Hello, Toronto",
      place: "Canada · Toronto", mood: "City stories", region: "North America",
      author: "hellotoronto", readMins: 7, status: "live",
      blurb: "A city built in primary colours. Six neighbourhoods, two hundred languages.",
      art: { sky: ["#f7f4ee", "#dfe4ea"], hill: "#141414", sun: "#f4c430", lm: "skyline" }
    },
    {
      id: "patagonia", file: "patagonia.html", title: "The Long Quiet",
      place: "Patagonia · The far south", mood: "Slow journeys", region: "South America",
      author: "thelongquiet", readMins: 10, status: "live",
      blurb: "Wind, granite, and endless light at the bottom of the world.",
      art: { sky: ["#cfe6ef", "#3c5763"], hill: "#5b7d8c", sun: "#ffffff", lm: "peaks" }
    },
    {
      id: "lisbon", file: "lisbon.html", title: "Seven Hills, Slowly",
      place: "Portugal · Lisbon", mood: "City stories", region: "Europe",
      author: "sevenhills", readMins: 8, status: "live",
      blurb: "Trams, tiles, and the long golden light off the Tagus.",
      art: { sky: ["#add2f2", "#274d77"], hill: "#3a6ea5", sun: "#fef0c9", lm: "tram" }
    },
    {
      id: "reykjavik", file: "reykjavik.html", title: "Under the Aurora",
      place: "Iceland · Reykjavik", mood: "Far north", region: "Europe",
      author: "underaurora", readMins: 9, status: "live",
      blurb: "Geothermal pools, black-sand coasts, and the green fire overhead.",
      art: { sky: ["#1f3b4d", "#0d1f2b"], hill: "#16313f", sun: "#7fae9a", lm: "aurora" }
    },
    {
      id: "marrakech", file: null, title: "The Red City, Unhurried",
      place: "Morocco · Marrakech", mood: "City stories", region: "Africa",
      author: "medinanotes", readMins: null, status: "soon",
      blurb: "Souks, riads, and mint tea in the long afternoon shade of the medina.",
      art: { sky: ["#f6c98a", "#c25a3a"], hill: "#9c3a26", sun: "#fff2c4", lm: "dome" }
    },
    {
      id: "hoi-an", file: null, title: "Lantern Light",
      place: "Vietnam · Hội An", mood: "Slow journeys", region: "Asia",
      author: "riverlanterns", readMins: null, status: "soon",
      blurb: "Tailors, river lanterns, and breakfast pho by the old town's yellow walls.",
      art: { sky: ["#ffd9a0", "#d98a3d"], hill: "#8a4a1e", sun: "#fff4cf", lm: "tram" }
    },
    {
      id: "namib", file: null, title: "The Oldest Desert",
      place: "Namibia · Sossusvlei", mood: "Far horizons", region: "Africa",
      author: "dunewalker", readMins: null, status: "soon",
      blurb: "Rust-red dunes at dawn and a silence older than anything you know.",
      art: { sky: ["#f4b878", "#a8421f"], hill: "#7d2e14", sun: "#fff0cf", lm: "dune" }
    },
    {
      id: "azores", file: null, title: "Mid-Atlantic Green",
      place: "Portugal · The Azores", mood: "Far horizons", region: "Europe",
      author: "midatlantic", readMins: null, status: "soon",
      blurb: "Volcanic crater lakes, hot springs, and whales off a green Atlantic rock.",
      art: { sky: ["#a8d8e0", "#2f7d6e"], hill: "#1f5a4e", sun: "#f0fbf5", lm: "wave" }
    }
  ];

  /* ---- Authors ---------------------------------------------------------- */
  const AUTHORS = {
    shizuka:     { handle: "shizuka", name: "Mei Tanaka", based: "Kyoto, Japan", since: "2023",
                   bio: "Writes slowly about the places that ask you to slow down. Tea, temples, and the long way around." },
    goldenroute: { handle: "goldenroute", name: "Évangéline Roux", based: "Seoul · Paris", since: "2022",
                   bio: "A travel essayist drawn to the grand manner — railways, palaces, and arriving as an occasion." },
    seorak:      { handle: "seorak", name: "The Seorak Review", based: "Seoul, Korea", since: "2022",
                   bio: "An editorial collective reading single countries slowly, one quarterly guide at a time." },
    seoulnotes:  { handle: "seoulnotes", name: "Minji Park", based: "Seoul, Korea", since: "2026",
                   bio: "Maps Seoul through transit, street-level rituals, and the useful pauses between one neighbourhood and the next." },
    tokyosignals:{ handle: "tokyosignals", name: "Aiko Mori", based: "Tokyo, Japan", since: "2026",
                   bio: "Reads Tokyo through station rhythms, neighbourhood scale, and the moments when a fast city briefly becomes quiet." },
    busanlines:  { handle: "busanlines", name: "Jiwon Kim", based: "Busan, Korea", since: "2026",
                   bio: "Writes the city from the water inward: harbours, market mornings, hillside streets, and the long coastal evening." },
    jejufieldnotes:{ handle: "jejufieldnotes", name: "Sora Han", based: "Jeju, Korea", since: "2026",
                   bio: "Follows weather, stone walls, and island roads across Jeju, writing the landscape at walking pace." },
    hellotoronto:{ handle: "hellotoronto", name: "Devon Clarke", based: "Toronto, Canada", since: "2024",
                   bio: "Civic booster and neighbourhood obsessive. Believes a city is the people who decided to build it together." },
    thelongquiet:{ handle: "thelongquiet", name: "Sofía Marín", based: "El Chaltén, Argentina", since: "2025",
                   bio: "Mountain guide and writer at the bottom of the world. She documents the long walks most people never make time for." },
    sevenhills:  { handle: "sevenhills", name: "Tomás Reis", based: "Lisbon, Portugal", since: "2025",
                   bio: "Born on the Alfama steps. Tram-rider and tile-spotter, mapping the Lisbon you find on the seventh hill, not the first." },
    underaurora: { handle: "underaurora", name: "Kristín Jónsdóttir", based: "Reykjavik, Iceland", since: "2025",
                   bio: "Photographer and winter-travel writer chasing long light and green fire — for those who would rather travel cold than crowded." },
    medinanotes: { handle: "medinanotes", name: "Yasmine El Fassi", based: "Marrakech, Morocco", since: "2026",
                   bio: "Riad-keeper's daughter writing the medina from the inside. Guide in progress." },
    riverlanterns:{ handle: "riverlanterns", name: "Linh Tran", based: "Hội An, Vietnam", since: "2026",
                   bio: "Follows the river and the lantern light through the old town. Guide in progress." },
    dunewalker:  { handle: "dunewalker", name: "Pieter Botha", based: "Swakopmund, Namibia", since: "2026",
                   bio: "Desert guide writing the silence of the oldest sand on earth. Guide in progress." },
    midatlantic: { handle: "midatlantic", name: "Rita Medeiros", based: "São Miguel, Azores", since: "2026",
                   bio: "Island-born, mapping the green volcanic middle of the Atlantic. Guide in progress." }
  };

  /* ---- SVG art generator (shared by every card across the site) --------- */
  function landmark(lm, c) {
    switch (lm) {
      case "torii":   return '<rect x="120" y="95" width="14" height="105" fill="#1f0d09"/><rect x="250" y="95" width="14" height="105" fill="#1f0d09"/><rect x="104" y="95" width="176" height="12" fill="#1f0d09"/>';
      case "tram":    return '<rect x="150" y="120" width="120" height="70" rx="8" fill="#fff" opacity="0.85"/><circle cx="175" cy="195" r="10" fill="#1a1a1a"/><circle cx="245" cy="195" r="10" fill="#1a1a1a"/>';
      case "city":    return '<rect x="60" y="120" width="50" height="80" fill="#2f433b"/><rect x="125" y="95" width="55" height="105" fill="#1f2e28"/><rect x="195" y="130" width="45" height="70" fill="#2f433b"/><rect x="255" y="105" width="55" height="95" fill="#1f2e28"/>';
      case "skyline": return '<rect x="70" y="110" width="40" height="90" fill="#141414"/><rect x="120" y="70" width="14" height="130" fill="#141414"/><ellipse cx="127" cy="95" rx="16" ry="8" fill="#f4c430"/><rect x="160" y="120" width="44" height="80" fill="#141414"/>';
      case "peaks":   return '<path d="M40 200 L110 90 L160 150 L210 80 L300 200 Z" fill="'+c+'"/><path d="M96 116 L110 90 L126 116 Z" fill="#fff"/>';
      case "aurora":  return '<path d="M60 90 Q150 30 240 80 Q320 120 360 70" fill="none" stroke="#7fae9a" stroke-width="10" stroke-linecap="round" opacity="0.85"/>';
      case "compass": return '<circle cx="190" cy="110" r="48" fill="none" stroke="'+c+'" stroke-width="2" opacity="0.6"/><path d="M190 66 L200 110 L190 154 L180 110 Z" fill="'+c+'"/>';
      case "dune":    return '<path d="M0 200 Q120 120 240 175 Q330 215 400 150 L400 200 Z" fill="'+c+'"/><path d="M0 200 Q160 165 300 200 Z" fill="'+c+'" opacity="0.6"/>';
      case "wave":    return '<path d="M40 150 Q90 110 140 150 T240 150 T340 150" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="0.7"/><path d="M40 180 Q90 145 140 180 T240 180 T340 180" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.45"/>';
      case "dome":    return '<rect x="150" y="120" width="100" height="80" fill="'+c+'"/><path d="M150 120 Q200 60 250 120 Z" fill="'+c+'"/><rect x="193" y="150" width="14" height="50" fill="#fff" opacity="0.7"/><circle cx="200" cy="78" r="6" fill="#fff" opacity="0.8"/>';
      default:        return '';
    }
  }
  function cardArt(g, w, h) {
    w = w || 400; h = h || 220;
    const a = g.art;
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">'
      + '<defs><linearGradient id="g' + g.id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + a.sky[0] + '"/><stop offset="100%" stop-color="' + a.sky[1] + '"/></linearGradient></defs>'
      + '<rect width="' + w + '" height="' + h + '" fill="url(#g' + g.id + ')"/>'
      + '<circle cx="' + (w*0.74) + '" cy="' + (h*0.32) + '" r="' + (h*0.22) + '" fill="' + a.sun + '" opacity="0.85"/>'
      + '<g transform="translate(0,' + (h-200) + ')">' + landmark(a.lm, a.hill) + '</g>'
      + '<path d="M0 ' + (h*0.82) + ' Q' + (w*0.25) + ' ' + (h*0.76) + ' ' + (w*0.5) + ' ' + (h*0.82) + ' T' + w + ' ' + (h*0.82) + ' L' + w + ' ' + h + ' L0 ' + h + ' Z" fill="' + a.hill + '" opacity="0.9"/>'
      + '</svg>';
  }

  /* ---- Persistent store (saved guides + draft contributions) ------------ *
   * Keep the prototype useful across tabs and return visits. The older
   * window.name format remains as a migration and privacy-mode fallback. */
  const STORE_KEY = "wayfarer-store-v1";
  let _store = { saved: [], drafts: [] };
  try {
    let raw = localStorage.getItem(STORE_KEY);
    if (!raw && window.name && window.name.indexOf("wf:") === 0) {
      raw = window.name.slice(3);
    }
    if (raw) {
      if (raw.charAt(0) === "{") {
        _store = JSON.parse(raw);
      } else {
        // migrate old "wf:" comma-list format (saved ids only)
        _store = { saved: raw.split(",").filter(Boolean), drafts: [] };
      }
    }
  } catch (e) { _store = { saved: [], drafts: [] }; }
  if (!_store.saved) _store.saved = [];
  if (!_store.drafts) _store.drafts = [];

  function writeStore() {
    const serialized = JSON.stringify(_store);
    try {
      localStorage.setItem(STORE_KEY, serialized);
    } catch (e) {
      try { window.name = "wf:" + serialized; } catch (fallbackError) {}
    }
  }
  writeStore();

  let saved = new Set(_store.saved);
  function persist() {
    _store.saved = Array.from(saved);
    writeStore();
    document.dispatchEvent(new CustomEvent("wf:saved-changed", { detail: { count: saved.size } }));
  }
  const Saved = {
    has: function (id) { return saved.has(id); },
    toggle: function (id) { if (saved.has(id)) saved.delete(id); else saved.add(id); persist(); return saved.has(id); },
    list: function () { return Array.from(saved); },
    count: function () { return saved.size; }
  };

  /* ---- Drafts (contributor flow, session-persistent) -------------------- */
  const Drafts = {
    list: function () { return _store.drafts.slice(); },
    count: function () { return _store.drafts.length; },
    add: function (draft) {
      draft.id = "draft-" + Date.now();
      draft.createdAt = new Date().toISOString();
      _store.drafts.push(draft);
      writeStore();
      document.dispatchEvent(new CustomEvent("wf:drafts-changed", { detail: { count: _store.drafts.length } }));
      return draft.id;
    },
    remove: function (id) {
      _store.drafts = _store.drafts.filter(function (d) { return d.id !== id; });
      writeStore();
      document.dispatchEvent(new CustomEvent("wf:drafts-changed", { detail: { count: _store.drafts.length } }));
    }
  };

  /* ---- Shared chrome (slim bar injected onto bespoke guide pages) -------- *
   * Fully self-contained inline styles + a unique class prefix so it never
   * collides with each guide's bespoke CSS. Shows: back-to-library, brand,
   * a save toggle for this guide, and next-guide nav. Call:
   *   Wayfarer.mountChrome("shizuka")
   */
  function mountChrome(currentId) {
    if (document.getElementById("wfx-bar")) return;
    var cur = GUIDES.find(function (g) { return g.id === currentId; });
    // Next live guide (wraps around) for "next guide" nav.
    var live = GUIDES.filter(function (g) { return g.status === "live"; });
    var idx = live.findIndex(function (g) { return g.id === currentId; });
    var next = live.length ? live[(idx + 1 + live.length) % live.length] : null;
    if (next && next.id === currentId) next = null;

    var bar = document.createElement("div");
    bar.id = "wfx-bar";
    bar.setAttribute("style", [
      "position:fixed", "top:auto", "bottom:20px", "left:50%", "right:auto", "z-index:99999",
      "width:min(680px,calc(100vw - 40px))",
      "display:grid", "grid-template-columns:1fr auto 1fr", "align-items:center",
      "gap:16px", "padding:10px 18px",
      "font-family:'Inter Tight',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      "background:rgba(20,20,20,0.72)", "backdrop-filter:blur(14px)",
      "-webkit-backdrop-filter:blur(14px)",
      "border:1px solid rgba(255,255,255,0.16)", "border-radius:9999px",
      "box-shadow:0 10px 34px rgba(0,0,0,0.28)",
      "transform:translate(-50%,140%)",
      "transition:transform 0.5s cubic-bezier(0.22,1,0.36,1)"
    ].join(";"));

    var bookmark = function (filled) {
      return '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + (filled ? "#4ECDC4" : "none") +
        '" stroke="' + (filled ? "#4ECDC4" : "#fff") + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
    };

    bar.innerHTML =
      // LEFT: Back to Wayfarer
      '<div class="wfx-left" style="justify-self:start;display:inline-flex;align-items:center;">' +
        '<a href="index.html" aria-label="Back to Wayfarer" style="display:inline-flex;align-items:center;gap:7px;color:rgba(255,255,255,0.85);text-decoration:none;font-size:13px;font-weight:600;">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>' +
          '<span class="wfx-label">Back to Wayfarer</span></a>' +
      '</div>' +
      // CENTER: save buttons
      '<div class="wfx-center" style="justify-self:center;display:inline-flex;align-items:center;gap:8px;">' +
        '<a href="saved.html" id="wfx-saved" style="display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,0.85);text-decoration:none;font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,0.2);border-radius:9999px;padding:6px 11px;">Saved <span id="wfx-ct" style="background:#4ECDC4;color:#062a27;border-radius:9999px;min-width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;padding:0 4px;">0</span></a>' +
        (cur ? '<button id="wfx-save" aria-label="Save this guide" style="display:inline-flex;align-items:center;gap:7px;cursor:pointer;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:9999px;padding:6px 13px;color:#fff;font-family:inherit;font-size:12px;font-weight:600;">' + bookmark(Saved.has(currentId)) + '<span id="wfx-save-tx">' + (Saved.has(currentId) ? "Saved" : "Save") + '</span></button>' : '') +
      '</div>' +
      // RIGHT: Next guide
      '<div class="wfx-right" style="justify-self:end;display:inline-flex;align-items:center;">' +
        (next ? '<a href="' + next.file + '" aria-label="Next guide: ' + next.title + '" style="display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,0.85);text-decoration:none;font-size:13px;font-weight:600;"><span class="wfx-label">Next guide</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>' : '') +
      '</div>';

    document.body.appendChild(bar);
    document.body.classList.add("wfx-chrome-mounted");
    // Keep the shared controls away from each guide's bespoke navigation.
    var padder = document.createElement("style");
    padder.textContent =
      "body.wfx-chrome-mounted{padding-bottom:88px !important;}" +
      "@media(max-width:640px){" +
        "body.wfx-chrome-mounted{padding-bottom:calc(84px + env(safe-area-inset-bottom)) !important;}" +
        "#wfx-bar{bottom:calc(12px + env(safe-area-inset-bottom)) !important;width:calc(100% - 24px) !important;grid-template-columns:40px minmax(0,1fr) 40px !important;gap:6px !important;padding:8px !important;}" +
        "#wfx-bar .wfx-left,#wfx-bar .wfx-right{width:40px;height:40px;justify-content:center;}" +
        "#wfx-bar .wfx-left a,#wfx-bar .wfx-right a{width:40px;height:40px;justify-content:center;}" +
        "#wfx-bar .wfx-label,#wfx-bar #wfx-saved{display:none !important;}" +
        "#wfx-bar #wfx-save{min-height:40px;padding:8px 15px !important;}" +
      "}";
    document.head.appendChild(padder);
    requestAnimationFrame(function () { bar.style.transform = "translate(-50%,0)"; });

    function syncCount() { var c = document.getElementById("wfx-ct"); if (c) c.textContent = Saved.count(); }
    syncCount();
    document.addEventListener("wf:saved-changed", syncCount);

    var saveBtn = document.getElementById("wfx-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var nowSaved = Saved.toggle(currentId);
        saveBtn.innerHTML = bookmark(nowSaved) + '<span id="wfx-save-tx">' + (nowSaved ? "Saved" : "Save") + '</span>';
      });
    }
  }

  /* ---- Public API ------------------------------------------------------- */
  window.Wayfarer = {
    guides: GUIDES,
    authors: AUTHORS,
    guideById: function (id) { return GUIDES.find(function (g) { return g.id === id; }); },
    guidesByAuthor: function (h) { return GUIDES.filter(function (g) { return g.author === h; }); },
    moods: function () { return Array.from(new Set(GUIDES.map(function (g) { return g.mood; }))); },
    regions: function () { return Array.from(new Set(GUIDES.map(function (g) { return g.region; }))); },
    cardArt: cardArt,
    Saved: Saved,
    Drafts: Drafts,
    prefersReducedMotion: prefersReducedMotion,
    mountChrome: mountChrome
  };
})();
