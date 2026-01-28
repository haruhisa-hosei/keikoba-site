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

document.addEventListener('DOMContentLoaded', () => {
  loadLatestIntro();

  // --- Phoenix Omikuji + click color only ---
  const phoenixLink = document.getElementById("phoenixLogo");
  const phoenixArea = document.querySelector(".phoenix-area");
  const bubble = document.getElementById("omikujiBubble");

  const fortunes = [
    { title: "大吉", text: "今日は音がまっすぐ届く日。\n細かいことは気にせず、ただ一音に集中してみましょう。", item: "今すぐ鳳聲晴久に入門。" },
    { title: "中吉", text: "焦らなくて大丈夫。\n一つずつ整えるほど、運は静かに寄ってきます。", item: "温かい飲み物" },
    { title: "吉", text: "小さな工夫が効く日。\n姿勢を一度だけ整えてから始めると良い流れ。", item: "メトロノーム" },
    { title: "凶", text: "やることが多い日ほど、削る勇気。\n今日は“足さない”が正解。", item: "深呼吸を3回" },
    { title: "大凶", text: "乱れが出やすい日。\n無理に押し切らず、短く締めて次につなげましょう。", item: "早寝" }
  ];

  function hashToIndex(str, mod){
    // tiny deterministic hash
    let h = 2166136261;
    for (let i=0; i<str.length; i++){
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h >>>= 0;
    return h % mod;
  }

  function getDailyFortune(){
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth()+1).padStart(2,"0");
    const d = String(now.getDate()).padStart(2,"0");
    const dayKey = `${y}-${m}-${d}`;
    const ua = navigator.userAgent || "ua";
    const idx = hashToIndex(dayKey + "|" + ua, fortunes.length);
    return fortunes[idx];
  }

  function showBubble(){
    if (!bubble) return;
    const f = getDailyFortune();
    bubble.innerHTML = `
      <div class="omikuji-title">【${f.title}】</div>
      <div class="omikuji-text">${f.text}</div>
      <div class="omikuji-item">──\nラッキーアイテム\n${f.item}</div>
    `;
    bubble.classList.add("is-show");
  }

  function hideBubble(){
    bubble?.classList.remove("is-show");
  }

  function clickFlash(){
    if (!phoenixArea) return;
    phoenixArea.classList.add("is-clicked");
    window.setTimeout(()=>phoenixArea.classList.remove("is-clicked"), 280);
  }

  if (phoenixLink){
    phoenixLink.addEventListener("click", (e) => {
      e.preventDefault(); // ロゴクリックはミニゲーム扱い
      clickFlash();

      // toggle bubble
      if (bubble?.classList.contains("is-show")){
        hideBubble();
      }else{
        showBubble();
      }
    });
  }

  // bubble外クリックで閉じる
  document.addEventListener("click", (e) => {
    if (!bubble?.classList.contains("is-show")) return;
    const target = e.target;
    if (phoenixArea && phoenixArea.contains(target)) return;
    hideBubble();
  });

});
