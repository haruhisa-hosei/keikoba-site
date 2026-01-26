// keikoba.js

const ham = document.getElementById('hamburger');
const nav = document.getElementById('navMenu');

// -----------------------------
// Intro (LINE → Worker → Site)
// -----------------------------
async function loadLatestIntro() {
  const target = document.getElementById('introTextLines');
  if (!target) return;

  // keikoba.htmlで window.KEIKO_INTRO_API を定義していればそれを優先。
  // 未定義なら同一オリジンの /intro を叩く（独自ドメインでWorkerをルートに割り当てた場合に有効）
  const api = (window.KEIKO_INTRO_API && String(window.KEIKO_INTRO_API)) || '/intro';

  try {
    const res = await fetch(api, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return;

    const data = await res.json();
    const text = (data && typeof data.text === 'string') ? data.text : '';
    if (!text) return;

    // 改行で分割して、text-lineとして差し替え
    const lines = text.replace(/\r\n/g, '\n').split('\n');

    target.innerHTML = '';

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    lines.forEach((line, i) => {
      const div = document.createElement('div');
      div.className = 'text-line';
      div.textContent = line === '' ? '　' : line; // 空行は全角スペースで高さ維持
      target.appendChild(div);

      // 生成した行にも確実に「ふわっ」が掛かるように、順番に is-show を付与
      if (!reduceMotion) {
        requestAnimationFrame(() => {
          setTimeout(() => div.classList.add('is-show'), 80 + i * 140);
        });
      } else {
        div.classList.add('is-show');
      }
    });
  } catch (e) {
    console.log('intro fetch failed', e);
  }
}

// -----------------------------
// Hamburger
// -----------------------------
if (ham && nav) {
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      ham.classList.remove('open');
      nav.classList.remove('open');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadLatestIntro();
});
