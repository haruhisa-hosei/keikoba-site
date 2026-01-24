(() => {
  // =========================================================
  // Season selection
  // - default: month mapping
  // - override for testing:
  //     ?season=winter|spring|summer|autumn|plain
  //     ?m=1..12   (month override)
  // =========================================================
  function getSeasonFromMonth(month){
    if (month === 12 || month === 1 || month === 2) return "winter";
    if (month === 3 || month === 4) return "spring";
    if (month === 5 || month === 6) return "plain";
    if (month === 7 || month === 8) return "summer";
    return "autumn"; // 9-11
  }

  const url = new URL(location.href);
  const seasonOverride = (url.searchParams.get("season") || "").toLowerCase();
  const monthOverride = parseInt(url.searchParams.get("m") || "", 10);

  const month = Number.isFinite(monthOverride) && monthOverride >= 1 && monthOverride <= 12
    ? monthOverride
    : (new Date().getMonth() + 1);

  const season = ["winter","spring","summer","autumn","plain"].includes(seasonOverride)
    ? seasonOverride
    : getSeasonFromMonth(month);

  document.body.dataset.season = season;

  // =========================================================
  // Click -> phoenix fly animation (all seasons)
  // =========================================================
  const link = document.getElementById("mainLink");
  if (link) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const wrapper = document.getElementById("phoenixWrapper");
      const title = document.getElementById("titleArea");
      const linkUrl = link.getAttribute("href");

      if (wrapper) wrapper.classList.add("is-flying");
      if (title) title.classList.add("is-fading-out");

      window.setTimeout(() => {
        window.location.href = linkUrl;
      }, 1100);
    });
  }

  // =========================================================
  // Spring: petal blizzard
  // =========================================================
  function startPetals(){
    const layer = document.getElementById("petalBlizzard");
    if (!layer) return;

    const PETAL_SRCS = [
      "images/spring/petals_5_single.png",
      "images/spring/petals_5_single_2.png",
      "images/spring/petals_5_single_3.png"
    ];

    const MAX = 28;
    const SPAWN_EVERY = 420;
    const rand = (min,max)=>Math.random()*(max-min)+min;

    function spawn(){
      if (layer.childElementCount >= MAX) return;

      const img = new Image();
      img.src = PETAL_SRCS[Math.floor(Math.random()*PETAL_SRCS.length)];
      img.className = "petalItem";

      img.style.left = rand(-5, 105) + "vw";

      const size = rand(14, 34);
      const dur  = rand(10, 22);
      const drift = rand(-180, 180);
      const rot = rand(360, 1080);
      const op = rand(0.35, 0.85);
      const blur = rand(0, 0.35);

      img.style.setProperty("--size", size + "px");
      img.style.setProperty("--dur",  dur + "s");
      img.style.setProperty("--drift", drift + "px");
      img.style.setProperty("--rot", rot + "deg");
      img.style.setProperty("--op", op.toFixed(2));
      img.style.setProperty("--blur", blur.toFixed(2) + "px");

      img.style.animationIterationCount = "1";
      img.addEventListener("animationend", () => img.remove(), { once: true });

      img.style.animationDelay = rand(0, 2.5) + "s";

      layer.appendChild(img);
    }

    for (let i=0; i<12; i++) spawn();
    setInterval(spawn, SPAWN_EVERY);
  }

  // =========================================================
  // Summer: firework (trail up -> trail down -> burst)
  // =========================================================
  function startFirework(){
    const up = document.getElementById("trail-up");
    const down = document.getElementById("trail-down");
    const burst = document.getElementById("firework-burst");
    if(!up || !down || !burst) return;

    const DRAW_DUR  = 1400;
    const OVERLAP   = 380;
    const BURST_GAP = 120;

    const DOWN_START  = Math.max(0, DRAW_DUR - OVERLAP);
    const DOWN_END    = DOWN_START + DRAW_DUR;
    const BURST_DELAY = DOWN_END + BURST_GAP;

    const TRAIL_FADE  = BURST_DELAY + 900;
    const LOOP_MS     = 6800;

    const EASE_DRAW = "linear";
    const EASE_FADE = "cubic-bezier(0.25, 0.1, 0.25, 1)";

    function resetEl(el){
      el.style.transition = "none";
      el.style.opacity = "0";
    }

    function play(){
      [up, down, burst].forEach(resetEl);

      up.style.clipPath   = "inset(100% 0 0 0)";
      down.style.clipPath = "inset(0 0 100% 0)";

      burst.style.transform = "scale(0.78)";
      burst.style.filter = "blur(2px)";

      requestAnimationFrame(()=>{
        up.style.transition = `opacity 120ms ${EASE_FADE}, clip-path ${DRAW_DUR}ms ${EASE_DRAW}`;
        up.style.opacity = "1";
        up.style.clipPath = "inset(0 0 0 0)";

        setTimeout(()=>{
          down.style.transition = `opacity 120ms ${EASE_FADE}, clip-path ${DRAW_DUR}ms ${EASE_DRAW}`;
          down.style.opacity = "1";
          down.style.clipPath = "inset(0 0 0 0)";
        }, DOWN_START);

        setTimeout(()=>{
          burst.style.transition =
            `opacity 180ms ${EASE_FADE}, transform 520ms ${EASE_FADE}, filter 520ms ${EASE_FADE}`;
          burst.style.opacity = "1";
          burst.style.transform = "scale(1.0)";
          burst.style.filter = "blur(0px)";
        }, BURST_DELAY);

        setTimeout(()=>{
          up.style.transition = `opacity 1100ms ${EASE_FADE}`;
          down.style.transition = `opacity 1100ms ${EASE_FADE}`;
          up.style.opacity = "0";
          down.style.opacity = "0";
        }, TRAIL_FADE);

        setTimeout(()=>{
          burst.style.transition = `opacity 2400ms ${EASE_FADE}`;
          burst.style.opacity = "0";
        }, BURST_DELAY + 1300);
      });
    }

    play();
    setInterval(play, LOOP_MS);
  }

  // =========================================================
  // Autumn: maple leaves (DOM creation)
  // =========================================================
  function startMaples(){
    const layer = document.getElementById("mapleLayer");
    if (!layer) return;

    const LEAF_IMAGES = [
      'url("images/autumn/maple_01.png")',
      'url("images/autumn/maple_02.png")',
      'url("images/autumn/maple_03.png")',
      'url("images/autumn/maple_04.png")',
      'url("images/autumn/maple_05.png")',
      'url("images/autumn/maple_06.png")',
      'url("images/autumn/maple_07.png")',
      'url("images/autumn/maple_08.png")',
      'url("images/autumn/maple_09.png")'
    ];

    const isMobile = matchMedia("(max-width: 768px)").matches;
    const COUNT = isMobile ? 18 : 28;
    const MAX_SIZE = isMobile ? 70 : 95;
    const MIN_SIZE = isMobile ? 30 : 40;

    const rnd = (a,b) => a + Math.random() * (b-a);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    function makeLeaf(){
      const el = document.createElement("div");
      el.className = "maple-leaf";

      const size = rnd(MIN_SIZE, MAX_SIZE);
      const dur = rnd(10, 18);
      const delay = rnd(0, 12);
      const op = rnd(0.35, 0.92);
      const rot = rnd(0, 360) + "deg";
      const spin = rnd(360, 980) + "deg";
      const x = rnd(-10, 110);
      const dx = rnd(-70, 70) + "px";
      const sway = rnd(-16, 16) + "px";
      const swayDur = rnd(2.2, 4.8) + "s";

      el.style.left = x + "vw";
      el.style.setProperty("--size", size + "px");
      el.style.setProperty("--dur", dur + "s");
      el.style.setProperty("--delay", (-delay) + "s");
      el.style.setProperty("--op", op);
      el.style.setProperty("--rot", rot);
      el.style.setProperty("--spin", spin);
      el.style.setProperty("--dx", dx);
      el.style.setProperty("--sway", sway);
      el.style.setProperty("--swayDur", swayDur);
      el.style.setProperty("--img", pick(LEAF_IMAGES));

      layer.appendChild(el);
    }

    for (let i=0; i<COUNT; i++) makeLeaf();

    let t = 0;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => {
        Array.from(layer.children).forEach((el) => {
          el.style.left = rnd(-10, 110) + "vw";
          el.style.setProperty("--dx", rnd(-70, 70) + "px");
        });
      }, 250);
    });
  }

  // =========================================================
  // Boot seasonal animations
  // =========================================================
  // winter: CSS only (snow fall/flicker runs by itself)
  if (season === "spring") startPetals();
  if (season === "summer") startFirework();
  if (season === "autumn") startMaples();

})();