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
      id: "osaka", file: "osaka.html", title: "Osaka, At Street Level",
      place: "Japan · Osaka", mood: "City stories", region: "Asia",
      author: "osakastreet", readMins: 8, status: "live",
      blurb: "Market counters, covered arcades, and a city best understood at street level.",
      art: { sky: ["#f5f2eb", "#d8ef57"], hill: "#171717", sun: "#ef6a32", lm: "city" }
    },
    {
      id: "taipei", file: "taipei.html", title: "Taipei, Between Rain",
      place: "Taiwan · Taipei", mood: "City stories", region: "Asia",
      author: "taipeirain", readMins: 8, status: "live",
      blurb: "Morning markets, neighbourhood streets, and the last light from the hills after rain.",
      art: { sky: ["#edf3f5", "#9fc9d7"], hill: "#264b5e", sun: "#cf596d", lm: "city" }
    },
    {
      id: "hong-kong", file: "hong-kong.html", title: "Hong Kong, In Layers",
      place: "Hong Kong · Harbour city", mood: "City stories", region: "Asia",
      author: "harbourlayers", readMins: 8, status: "live",
      blurb: "Tram lines, steep streets, neighbourhood counters, and harbour light between two shores.",
      art: { sky: ["#e9e4eb", "#b7a6bd"], hill: "#343137", sun: "#d65b72", lm: "city" }
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
    osakastreet:  { handle: "osakastreet", name: "Emi Kondo", based: "Osaka, Japan", since: "2026",
                   bio: "Writes Osaka at eye level: market counters, covered arcades, neighbourhood rooms, and the social rhythm of one more stop." },
    taipeirain:   { handle: "taipeirain", name: "Lin Yu-ting", based: "Taipei, Taiwan", since: "2026",
                   bio: "Maps Taipei through changing weather, neighbourhood counters, old streets, and the green hills at the city's edge." },
    harbourlayers:{ handle: "harbourlayers", name: "Ava Leung", based: "Hong Kong", since: "2026",
                   bio: "Reads Hong Kong vertically, following tram lines, stair streets, harbour crossings, and the daily language held between them." },
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
  const coverStyle = document.createElement("style");
  coverStyle.textContent = ".guide-art,.card-art{height:auto!important;aspect-ratio:2/1}.guide-art>svg,.card-art>svg{display:block;width:100%;height:100%}";
  document.head.appendChild(coverStyle);
  const COVER_ART = {
    azores: '<rect x="0" y="0" width="400" height="200" fill="#d3e5e7"/><path d="M0 161Q49 41 127 74Q196 105 236 59Q310 34 400 147V200H0Z" fill="#4e7b62"/><ellipse cx="204" cy="152" rx="131" ry="37" fill="#9bb994"/><ellipse cx="158" cy="152" rx="65" ry="24" fill="#438d9e"/><ellipse cx="264" cy="153" rx="45" ry="22" fill="#477c69"/><path d="M214 127L219 177" fill="none" stroke="#d6dac0" stroke-width="5" stroke-linejoin="round"/>',
    namib: '<rect x="0" y="0" width="400" height="200" fill="#e7d9c5"/><path d="M0 185L170 52L400 185V200H0Z" fill="#c46740"/><path d="M170 52L219 182H0Z" fill="#e18c56"/><path d="M274 190L267 127M268 149L245 136M270 157L293 137" fill="none" stroke="#383631" stroke-width="5" stroke-linejoin="round"/>',
    marrakech: '<rect x="0" y="0" width="400" height="200" fill="#edd4b4"/><rect x="64" y="90" width="42" height="93" fill="#b85742"/><rect x="70" y="76" width="30" height="14" fill="#b85742"/><rect x="77" y="61" width="16" height="15" fill="#b85742"/><path d="M85 48V61" fill="none" stroke="#b85742" stroke-width="3" stroke-linejoin="round"/><rect x="149" y="124" width="191" height="59" fill="#ca7958"/><path d="M219 183V156Q245 111 271 156V183Z" fill="#743e37"/><path d="M290 88Q311 67 342 86M318 81V122" fill="none" stroke="#527361" stroke-width="5" stroke-linejoin="round"/>',
    "hoi-an": '<rect x="0" y="0" width="400" height="200" fill="#233e4c"/><rect x="35" y="116" width="330" height="66" fill="#dca952"/><path d="M25 116L75 86L139 116L194 88L257 116L313 90L375 116Z" fill="#84503c"/><path d="M0 40Q200 82 400 40" fill="none" stroke="#f1d8b1" stroke-width="2" stroke-linejoin="round"/><path d="M75 55V80" fill="none" stroke="#f1d8b1" stroke-width="2" stroke-linejoin="round"/><ellipse cx="75" cy="88" rx="14" ry="20" fill="#d56b59"/><path d="M155 55V80" fill="none" stroke="#f1d8b1" stroke-width="2" stroke-linejoin="round"/><ellipse cx="155" cy="97" rx="14" ry="20" fill="#e8b94d"/><path d="M245 55V80" fill="none" stroke="#f1d8b1" stroke-width="2" stroke-linejoin="round"/><ellipse cx="245" cy="88" rx="14" ry="20" fill="#d56b59"/><path d="M325 55V80" fill="none" stroke="#f1d8b1" stroke-width="2" stroke-linejoin="round"/><ellipse cx="325" cy="97" rx="14" ry="20" fill="#e8b94d"/><rect x="0" y="182" width="400" height="18" fill="#54848b"/>',
    jeju: '<rect x="0" y="0" width="400" height="200" fill="#e5eeea"/><path d="M0 161Q75 155 129 105L180 85L203 96L224 87L264 117Q304 157 400 163V200H0Z" fill="#58766a"/><path d="M166 94Q197 112 233 94" fill="none" stroke="#c5d6cd" stroke-width="4" stroke-linejoin="round"/><rect x="0" y="168" width="400" height="32" fill="#4e8792"/><path d="M60 180Q53 165 64 151V130Q53 122 66 115Q67 97 83 97Q100 97 101 115Q113 122 102 130V152Q113 165 106 180Z" fill="#303d37"/><rect x="69" y="133" width="8" height="4" fill="#b6c6bf"/><rect x="87" y="133" width="8" height="4" fill="#b6c6bf"/><path d="M80 139V150H89M69 160H98" fill="none" stroke="#b6c6bf" stroke-width="3" stroke-linejoin="round"/>',
    shizuka: '<defs><linearGradient id="cover-shizuka-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f7c1a6"/><stop offset="100%" stop-color="#e8826b"/></linearGradient></defs><rect width="400" height="200" fill="url(#cover-shizuka-gradient)"/><circle cx="300" cy="60" r="46" fill="#fff3d6" opacity="0.9"/><rect x="120" y="95" width="14" height="105" fill="#8a3a2c"/><rect x="250" y="95" width="14" height="105" fill="#8a3a2c"/><rect x="104" y="95" width="176" height="12" fill="#8a3a2c"/><rect x="110" y="118" width="164" height="9" fill="#8a3a2c"/><path d="M0 160 Q100 135 200 160 T400 160 L400 200 L0 200 Z" fill="#b8553f"/>',
    "golden-route": '<rect x="0" y="0" width="400" height="200" fill="#0e1411"/><circle cx="287" cy="58" r="28" fill="#c9a24b"/><path d="M30 158L95 93L159 140L222 88L303 148L370 126" fill="none" stroke="#476355" stroke-width="3" stroke-linejoin="round"/><rect x="103" y="134" width="194" height="47" fill="#c9a24b"/><path d="M80 133Q126 126 133 105H267Q277 126 320 133Z" fill="#c9a24b"/><path d="M120 100Q162 93 166 77H234Q239 93 280 100Z" fill="#c9a24b"/><rect x="129" y="143" width="16" height="38" fill="#0e1411"/><rect x="168" y="143" width="16" height="38" fill="#0e1411"/><rect x="207" y="143" width="16" height="38" fill="#0e1411"/><rect x="246" y="143" width="16" height="38" fill="#0e1411"/>',
    patagonia: '<defs><linearGradient id="cover-patagonia-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#cfe6ef"/><stop offset="100%" stop-color="#3c5763"/></linearGradient></defs><rect width="400" height="200" fill="url(#cover-patagonia-gradient)"/><path d="M40 200 L150 70 L210 130 L280 50 L380 200 Z" fill="#5b7d8c"/><path d="M132 92 L150 70 L170 92 Z" fill="#fff"/><path d="M262 74 L280 50 L300 74 Z" fill="#fff"/>',
    seoul: '<rect x="0" y="0" width="400" height="200" fill="#dce4e0"/><circle cx="295" cy="53" r="26" fill="#e86f51"/><path d="M0 180 Q80 165 170 112 Q218 82 272 151 L400 178 V200 H0Z" fill="#668878"/><rect x="192" y="43" width="6" height="82" fill="#25443a"/><rect x="180" y="60" width="30" height="9" fill="#25443a"/><rect x="188" y="70" width="14" height="12" fill="#25443a"/><path d="M195 24 V44" fill="none" stroke="#25443a" stroke-width="3" stroke-linejoin="round"/><path d="M40 160H140L126 148H57Z" fill="#25443a"/><rect x="58" y="161" width="70" height="27" fill="#f5f4ef"/><rect x="76" y="166" width="12" height="22" fill="#25443a"/><rect x="100" y="166" width="12" height="22" fill="#25443a"/>',
    busan: '<rect x="0" y="0" width="400" height="200" fill="#dce9e5"/><circle cx="305" cy="46" r="24" fill="#f07952"/><path d="M0 139L60 104L111 135L159 97L228 140H400V200H0Z" fill="#70a89d"/><rect x="0" y="151" width="400" height="49" fill="#3b7583"/><path d="M69 157V70M324 157V70M40 101Q194 173 355 101M40 144H355" fill="none" stroke="#f7f3e9" stroke-width="5" stroke-linejoin="round"/><path d="M97 121V144M129 133V144M164 141V144M257 137V144M294 125V144" fill="none" stroke="#f7f3e9" stroke-width="2" stroke-linejoin="round"/>',
    tokyo: '<rect x="0" y="0" width="400" height="200" fill="#e9eef2"/><circle cx="292" cy="53" r="27" fill="#e36650"/><rect x="45" y="122" width="52" height="58" fill="#9bbbc7"/><rect x="106" y="103" width="44" height="77" fill="#40566c"/><rect x="270" y="116" width="61" height="64" fill="#40566c"/><path d="M167 179L205 38L243 179 M178 141H232 M186 111H224 M196 75H215 M179 142L232 177 M231 142L179 177" fill="none" stroke="#d7503c" stroke-width="6" stroke-linejoin="round"/><path d="M205 23V40" fill="none" stroke="#d7503c" stroke-width="3" stroke-linejoin="round"/><rect x="0" y="180" width="400" height="20" fill="#25272a"/>',
    osaka: '<rect x="0" y="0" width="400" height="200" fill="#202b42"/><rect x="0" y="154" width="400" height="46" fill="#2155a0"/><rect x="40" y="58" width="63" height="90" fill="#ed6b3b"/><rect x="113" y="35" width="54" height="111" fill="#d8ef57"/><rect x="253" y="57" width="61" height="91" fill="#df6d8e"/><rect x="321" y="86" width="40" height="64" fill="#597cc6"/><rect x="51" y="69" width="40" height="24" fill="#f5f2eb"/><rect x="122" y="47" width="36" height="53" fill="#202b42"/><circle cx="140" cy="62" r="6" fill="#d8ef57"/><path d="M140 70V87M128 73L140 80L152 73M140 87L131 96M140 87L149 96" fill="none" stroke="#d8ef57" stroke-width="3" stroke-linejoin="round"/><path d="M24 155Q200 107 376 155" fill="none" stroke="#f5f2eb" stroke-width="10" stroke-linejoin="round"/><path d="M68 179H119M157 188H218M272 177H331" fill="none" stroke="#e9b669" stroke-width="3" stroke-linejoin="round"/>',
    taipei: '<rect x="0" y="0" width="400" height="200" fill="#dce9ee"/><path d="M0 156L60 114L108 146L153 106L201 157L290 123L400 157V200H0Z" fill="#8fb4a8"/><path d="M202 161H248L251 140H199L202 135H247L250 115H200L203 110H246L249 90H201L204 85H245L248 65H202L209 55H241L239 42H211L209 55 M224 24V43" fill="#264b5e" stroke="#264b5e" stroke-width="3" stroke-linejoin="round"/><rect x="220" y="161" width="10" height="27" fill="#264b5e"/><rect x="54" y="155" width="95" height="30" fill="#f5f4ef"/><path d="M48 154H155L145 143H58Z" fill="#cf596d"/><path d="M77 70L70 88M113 43L106 61M300 64L293 82M328 98L321 116" fill="none" stroke="#75a3b5" stroke-width="3" stroke-linejoin="round"/>',
    "hong-kong": '<rect x="0" y="0" width="400" height="200" fill="#e9e4eb"/><path d="M0 143L54 118L99 135L145 92L207 123L260 106L330 128L400 98V171H0Z" fill="#aaa0b0"/><rect x="55" y="102" width="29" height="61" fill="#343137"/><path d="M99 164V80L129 51V164Z" fill="#4d4850"/><path d="M99 81L129 111L99 142M129 52L99 82L129 112L99 142" fill="none" stroke="#e9e4eb" stroke-width="2" stroke-linejoin="round"/><rect x="149" y="96" width="30" height="68" fill="#343137"/><rect x="191" y="110" width="42" height="54" fill="#4d4850"/><rect x="260" y="77" width="26" height="87" fill="#343137"/><rect x="0" y="164" width="400" height="36" fill="#617a8b"/><path d="M248 178H343L329 188H262Z" fill="#f4f0e9"/><rect x="271" y="168" width="47" height="10" fill="#346b5b"/><path d="M260 166H328" fill="none" stroke="#f4f0e9" stroke-width="3" stroke-linejoin="round"/>',
    "seorak-review": '<rect x="0" y="0" width="400" height="200" fill="#dbe5dc"/><path d="M0 169L56 92L83 127L132 45L171 111L217 70L270 152L312 115L400 175V200H0Z" fill="#527366"/><path d="M98 166L153 112L176 148L208 106L244 167Z" fill="#2f433b"/><path d="M291 114Q267 136 282 165Q306 181 329 165Q344 136 320 114Z" fill="#f6f2ea"/><path d="M288 113H323" fill="none" stroke="#b8332a" stroke-width="5" stroke-linejoin="round"/>',
    "hello-toronto": '<rect width="400" height="200" fill="#f7f4ee"/><rect x="40" y="80" width="60" height="120" fill="#141414"/><rect x="120" y="50" width="40" height="150" fill="#141414"/><rect x="175" y="20" width="14" height="180" fill="#141414"/><ellipse cx="182" cy="70" rx="22" ry="11" fill="#f4c430"/><rect x="250" y="90" width="60" height="110" fill="#1452b8"/><circle cx="340" cy="55" r="26" fill="#e63027"/>',
    lisbon: '<rect x="0" y="0" width="400" height="200" fill="#dceaf3"/><path d="M0 178L400 136V200H0Z" fill="#3a6ea5"/><rect x="53" y="61" width="47" height="99" fill="#f4eee4"/><rect x="307" y="81" width="42" height="68" fill="#f4eee4"/><path d="M43 62H111L77 45Z M298 82H358L329 62Z" fill="#c65e43"/><rect x="144" y="86" width="119" height="72" fill="#edbb39"/><rect x="153" y="96" width="25" height="29" fill="#355c74"/><rect x="185" y="96" width="25" height="29" fill="#355c74"/><rect x="217" y="96" width="35" height="29" fill="#355c74"/><rect x="139" y="78" width="129" height="9" fill="#355c74"/><circle cx="164" cy="162" r="8" fill="#26333c"/><circle cx="242" cy="154" r="8" fill="#26333c"/><path d="M190 77L215 48L240 76M0 46H400" fill="none" stroke="#355c74" stroke-width="3" stroke-linejoin="round"/>',
    reykjavik: '<rect x="0" y="0" width="400" height="200" fill="#162e40"/><path d="M25 62Q124 4 238 62T395 49" fill="none" stroke="#7fae9a" stroke-width="13" stroke-linejoin="round"/><path d="M25 85Q124 27 238 85T395 72" fill="none" stroke="#457e7c" stroke-width="7" stroke-linejoin="round"/><path d="M139 181V142H151V124H163V101H176V78H186V57L200 39L214 57V78H224V101H237V124H249V142H261V181Z" fill="#d7e1df"/><rect x="194" y="123" width="12" height="58" fill="#162e40"/><circle cx="200" cy="88" r="8" fill="#162e40"/>',
  };

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
    if (COVER_ART[g.id]) {
      return '<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'
        + COVER_ART[g.id]
        + '</svg>';
    }
    const a = g.art;
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'
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
