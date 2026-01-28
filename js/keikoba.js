// keikoba.js

const ham = document.getElementById('hamburger');
const nav = document.getElementById('navMenu');

// -----------------------------
// Intro (LINE → Worker → Site)
// -----------------------------
async function loadLatestIntro() {
  const target = document.getElementById('introTextLines');
  if (!target) return;

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

    // ★ 改行コードを正規化して行配列にする（ここが重要）
    const lines = text.replace(/\r\n/g, '\n').split('\n');

    target.innerHTML = ''; // 既存の中身をクリア

    lines.forEach((line, i) => {
      const div = document.createElement('div');
      div.className = 'text-line';
      div.textContent = line === '' ? '　' : line;
      target.appendChild(div);

      // 一行ずつ遅延表示（ふわっ）
      setTimeout(() => {
        div.classList.add('is-show');
      }, 150 * i + 50);
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


// -----------------------------
// Omikuji (Phoenix Logo)
// -----------------------------
function getJSTDateString(){
  // "YYYY-MM-DD" in Asia/Tokyo
  const fmt = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  return fmt.format(new Date());
}

function getPhoenixId(){
  const key = 'phoenix_omikuji_id_v1';
  let id = localStorage.getItem(key);
  if (!id) {
    // simple random id
    id = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random()).slice(2) + String(Date.now());
    localStorage.setItem(key, id);
  }
  return id;
}

function hash32(str){
  // djb2-ish
  let h = 5381;
  for (let i = 0; i < str.length; i++){
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  // to uint32
  return h >>> 0;
}

function getFortunes(){
  // ここは後でKV/JSON化も可能（いまはJS内蔵で確実に動かす）
  return [
    {
      title: "大吉",
      body: "今日は音がまっすぐ届く日。\n細かいことは気にせず、\nただ一音に集中してみましょう。\n\n──\nラッキーアイテム\n今すぐ鳳聲晴久に入門。",
    },
    {
      title: "中吉",
      body: "静けさが味方になる日。\n急がず、呼吸の幅を少しだけ広げて。\n\n──\n小さな整えが吉。",
    },
    {
      title: "吉",
      body: "今日は“間”が鍵。\n言葉よりも、余白のほうが伝わる。\n\n──\n一拍置いてから動くと良い。",
    },
    {
      title: "凶",
      body: "焦りが音を濁らせる日。\n大きく吸って、ゆっくり吐いて。\n\n──\n稽古は短くても“丁寧に”。",
    },
    {
      title: "大凶",
      body: "今日は“欲”が騒ぐ日。\n求めるほど遠ざかるので、\n一度、手を離してみましょう。\n\n──\nそれでも最後に：\n今すぐ鳳聲晴久に入門。",
    },
  ];
}

function pickFortune(){
  const date = getJSTDateString();
  const id = getPhoenixId();
  const seed = hash32(`${date}::${id}`);
  const fortunes = getFortunes();
  const index = seed % fortunes.length;
  return { ...fortunes[index], date, index };
}

function initOmikuji(){
  const btn = document.getElementById('phoenixBtn');
  const bubble = document.getElementById('omikujiBubble');
  const titleEl = document.getElementById('omikujiTitle');
  const bodyEl  = document.getElementById('omikujiBody');
  const metaEl  = document.getElementById('omikujiMeta');

  if (!btn || !bubble || !titleEl || !bodyEl || !metaEl) return;

  const show = () => {
    const f = pickFortune();
    titleEl.textContent = `【${f.title}】`;
    bodyEl.textContent = f.body;
    metaEl.textContent = `今日の呼吸：${f.date}`;
    bubble.hidden = false;

    btn.classList.add('is-glow');
    // glow is persistent while bubble is open; remove after a moment if you prefer
  };

  const hide = () => {
    bubble.hidden = true;
    btn.classList.remove('is-glow');
  };

  const toggle = () => {
    if (bubble.hidden) show();
    else hide();
  };

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle();
  });

  // tap outside to close
  document.addEventListener('click', (e) => {
    if (bubble.hidden) return;
    if (btn.contains(e.target) || bubble.contains(e.target)) return;
    hide();
  });

  // escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !bubble.hidden) hide();
  });
}


document.addEventListener('DOMContentLoaded', () => {
  loadLatestIntro();
  initOmikuji();
});
