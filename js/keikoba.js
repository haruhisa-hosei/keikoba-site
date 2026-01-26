
const ham = document.getElementById('hamburger');
const nav = document.getElementById('navMenu');

// -----------------------------
// Intro (LINE → Worker → Site)
// -----------------------------
async function loadLatestIntro() {
  const target = document.getElementById('introTextLines');
  if (!target) return;

  // 1) keikoba.html に window.KEIKO_INTRO_API があればそれを優先
  // 2) ない場合は同一オリジンの /intro を叩く（独自ドメインでWorkerに割り当てた場合に有効）
  const api = (window.KEIKO_INTRO_API && String(window.KEIKO_INTRO_API)) || '/intro';

  try {
    const res = await fetch(api, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!res.ok) return;

    const data = await res.json();
    const text = (data && typeof data.text === 'string') ? data.text : '';
    if (!text) return;

    // 表示（改行は分割して1行ずつ）
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    target.innerHTML = '';
    lines.forEach((line) => {
      const div = document.createElement('div');
      div.className = 'line';
      div.textContent = line;
      target.appendChild(div);
    });
  } catch (e) {
    // 失敗しても表示は既存のまま
    console.log('intro fetch failed', e);
  }
}

if (ham && nav) {
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      ham.classList.remove('open');
      nav.classList.remove('open');
    });
  });
}

// DOM準備後に取得
document.addEventListener('DOMContentLoaded', loadLatestIntro);
