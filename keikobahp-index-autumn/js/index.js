(() => {
  const link = document.getElementById('mainLink');
  if (!link) return;

  link.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const wrapper = document.getElementById('phoenixWrapper');
    const title = document.getElementById('titleArea');
    const linkUrl = link.getAttribute('href');

    if (wrapper) wrapper.classList.add('is-flying');
    if (title) title.classList.add('is-fading-out');

    window.setTimeout(() => {
      window.location.href = linkUrl;
    }, 1100);
  });
})();

/* Maple leaves falling overlay for Keikoba index (autumn version) */
(() => {
  const layer = document.getElementById("mapleLayer");
  if (!layer) return;

  // NOTE:
  // We set backgroundImage directly (URL is resolved relative to the HTML page),
  // so paths like "images/autumn/..." will always work even if CSS lives in /css/.
  const LEAF_IMAGES = [
    "images/autumn/maple_01.png",
    "images/autumn/maple_02.png",
    "images/autumn/maple_03.png",
    "images/autumn/maple_04.png",
    "images/autumn/maple_05.png",
    "images/autumn/maple_06.png",
    "images/autumn/maple_07.png",
    "images/autumn/maple_08.png",
    "images/autumn/maple_09.png"
  ];

  const isMobile = matchMedia("(max-width: 768px)").matches;
  const COUNT = isMobile ? 18 : 28;
  const MAX_SIZE = isMobile ? 70 : 95;
  const MIN_SIZE = isMobile ? 30 : 40;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function makeLeaf() {
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
    el.style.setProperty("--delay", (-delay) + "s"); // already falling on load
    el.style.setProperty("--op", op);
    el.style.setProperty("--rot", rot);
    el.style.setProperty("--spin", spin);
    el.style.setProperty("--dx", dx);
    el.style.setProperty("--sway", sway);
    el.style.setProperty("--swayDur", swayDur);

    // Set actual image (reliable path resolution)
    const src = pick(LEAF_IMAGES);
    el.style.backgroundImage = `url("${src}")`;

    layer.appendChild(el);
  }

  for (let i = 0; i < COUNT; i++) makeLeaf();

  // light refresh on resize
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
})();
