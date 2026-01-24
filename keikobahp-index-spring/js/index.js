// =====================================================
// Spring index behavior
// - Click: phoenix fly + fade title, then navigate
// - Petal blizzard: spawn petals and remove after one fall
// =====================================================

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

(() => {
  const layer = document.getElementById('petalBlizzard');
  if (!layer) return;

  const PETAL_SRCS = [
    'images/spring/petals_5_single.png',
    'images/spring/petals_5_single_2.png',
    'images/spring/petals_5_single_3.png'
  ];

  const MAX = 28;          // 同時に存在する上限
  const SPAWN_EVERY = 420; // 生成間隔(ms)

  const rand = (min, max) => Math.random() * (max - min) + min;

  function spawn() {
    if (layer.childElementCount >= MAX) return;

    const img = new Image();
    img.src = PETAL_SRCS[Math.floor(Math.random() * PETAL_SRCS.length)];
    img.className = 'petalItem';

    // 位置（画面外にはみ出しすぎない）
    img.style.left = rand(-5, 105) + 'vw';

    // サイズ・速度・揺れ・回転
    img.style.setProperty('--size',  rand(14, 34) + 'px');
    img.style.setProperty('--dur',   rand(10, 22) + 's');
    img.style.setProperty('--drift', rand(-180, 180) + 'px');
    img.style.setProperty('--rot',   rand(360, 1080) + 'deg');
    img.style.setProperty('--op',    rand(0.35, 0.85).toFixed(2));
    img.style.setProperty('--blur',  rand(0, 0.35).toFixed(2) + 'px');

    // 1周で破棄（DOM肥大防止）
    img.style.animationIterationCount = '1';
    img.addEventListener('animationend', () => img.remove(), { once: true });

    // ランダム遅延
    img.style.animationDelay = rand(0, 2.5) + 's';

    layer.appendChild(img);
  }

  // 初期に少し撒く
  for (let i = 0; i < 12; i++) spawn();

  // 継続生成
  window.setInterval(spawn, SPAWN_EVERY);
})();
