// =====================================================
// Summer index behavior
// - Click: phoenix fly + fade title, then navigate
// - Firework: trail up -> trail down -> burst (loop)
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

document.addEventListener("DOMContentLoaded", () => {
  const up = document.getElementById("trail-up");
  const down = document.getElementById("trail-down");
  const burst = document.getElementById("firework-burst");
  if (!up || !down || !burst) return;

  // ---- Timing (ms)
  const DRAW_DUR  = 1400;  // 上り/下りの描画時間（一定）
  const OVERLAP   = 380;   // 下り開始を前倒し（上り終端と重ねる）
  const BURST_GAP = 120;   // 下り完了→本体

  const DOWN_START  = Math.max(0, DRAW_DUR - OVERLAP);
  const DOWN_END    = DOWN_START + DRAW_DUR;
  const BURST_DELAY = DOWN_END + BURST_GAP;

  const TRAIL_FADE  = BURST_DELAY + 900;
  const LOOP_MS     = 6800;

  // ---- Easings
  const EASE_DRAW = "linear"; // 速度一定
  const EASE_FADE = "cubic-bezier(0.25, 0.1, 0.25, 1)";

  function resetEl(el){
    el.style.transition = "none";
    el.style.opacity = "0";
  }

  function playFirework(){
    [up, down, burst].forEach(resetEl);

    up.style.clipPath   = "inset(100% 0 0 0)"; // 下→上
    down.style.clipPath = "inset(0 0 100% 0)"; // 上→下

    burst.style.transform = "scale(0.78)";
    burst.style.filter = "blur(2px)";

    requestAnimationFrame(() => {
      // ① 上り（下りが描画しきるまで残す）
      up.style.transition = `opacity 120ms ${EASE_FADE}, clip-path ${DRAW_DUR}ms ${EASE_DRAW}`;
      up.style.opacity = "1";
      up.style.clipPath = "inset(0 0 0 0)";

      // ② 下り（早めに開始して“切れない”）
      window.setTimeout(() => {
        down.style.transition = `opacity 120ms ${EASE_FADE}, clip-path ${DRAW_DUR}ms ${EASE_DRAW}`;
        down.style.opacity = "1";
        down.style.clipPath = "inset(0 0 0 0)";
      }, DOWN_START);

      // ③ 本体（下り完了後）
      window.setTimeout(() => {
        burst.style.transition =
          `opacity 180ms ${EASE_FADE}, transform 520ms ${EASE_FADE}, filter 520ms ${EASE_FADE}`;
        burst.style.opacity = "1";
        burst.style.transform = "scale(1.0)";
        burst.style.filter = "blur(0px)";
      }, BURST_DELAY);

      // trail fade
      window.setTimeout(() => {
        up.style.transition = `opacity 1100ms ${EASE_FADE}`;
        down.style.transition = `opacity 1100ms ${EASE_FADE}`;
        up.style.opacity = "0";
        down.style.opacity = "0";
      }, TRAIL_FADE);

      // burst fade
      window.setTimeout(() => {
        burst.style.transition = `opacity 2400ms ${EASE_FADE}`;
        burst.style.opacity = "0";
      }, BURST_DELAY + 1300);
    });
  }

  playFirework();
  window.setInterval(playFirework, LOOP_MS);
});