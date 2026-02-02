// keikoba.js

const ham = document.getElementById('hamburger');
const nav = document.getElementById('navMenu');


// -----------------------------
// GA4 helper (safe + non-breaking)
// -----------------------------
function trackGA4(eventName, params = {}) {
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
      return true;
    }
    // Fallback: push to dataLayer (useful if gtag loads a bit later / GTM setups)
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...params });
      return true;
    }
    console.warn("[GA4] gtag/dataLayer not ready:", eventName, params);
    return false;
  } catch (e) {
    console.warn("[GA4] track error:", e);
    return false;
  }
}


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


// --- Omikuji (Phoenix Logo) ---
function getDeviceId() {
  const KEY = "omikuji_device_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
    localStorage.setItem(KEY, id);
  }
  return id;
}

function getTodayJST() {
  // JST date key like 2026-01-28
  return new Date().toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).split("/").join("-");
}

// 32-bit unsigned hash (stable, good for seeded randomness)
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0; // keep as 32-bit signed
  }
  return (h >>> 0); // convert to unsigned 32-bit
}

// seed → [0, 1) の疑似乱数（端末×日付で固定）
function seededUnit(seed) {
  const h = hashCode(seed);          // 0..2^32-1
  return h / 4294967296;             // 2^32
}

// 正規分布（N(0,1)）を5段階に離散化したときの累積確率で判定
// しきい値は z=-1.5,-0.5,0.5,1.5 のCDFを採用（左右対称）
// 目安：大凶 6.7% / 凶 24.2% / 吉 38.2% / 中吉 24.2% / 大吉 6.7%
function rankFromUnitCDF(u) {
  if (u < 0.0668) return "大凶";
  if (u < 0.3085) return "凶";
  if (u < 0.6915) return "吉";
  if (u < 0.9332) return "中吉";
  return "大吉";
}

async function pickFortuneFixed() {
  const res = await fetch("/assets/fortunes.json?t=" + Date.now());
  if (!res.ok) throw new Error("fortunes.json not found");

  const data = await res.json();

  // 互換：配列 or { fortunes:[...] } or { candidates:[...] }
  const fortunes = Array.isArray(data) ? data : (data.fortunes || data.candidates || []);
  if (!Array.isArray(fortunes) || fortunes.length === 0) throw new Error("fortunes empty");

  // ★ 端末ID × 今日の日付で「その日固定」を維持
  const seed = getDeviceId() + "_" + getTodayJST();

  // ★ ただし、出目確率は「正規分布（吉が多く、大吉大凶がレア）」に歪める
  const u = seededUnit(seed);
  const targetRank = rankFromUnitCDF(u);

  // ランク一致を探す（見つからなければ「吉」→中央→先頭の順で保険）
  const hit =
    fortunes.find(x => x && x.rank === targetRank) ||
    fortunes.find(x => x && x.rank === "吉") ||
    fortunes[Math.floor(fortunes.length / 2)] ||
    fortunes[0];

  return hit;
}

function setupOmikujiUI() {
  const btn = document.getElementById("phoenixBtn");
  const bubble = document.getElementById("omikujiBubble");
  const rankEl = document.getElementById("omikujiRank");
  const textEl = document.getElementById("omikujiText");

  if (!btn || !bubble || !rankEl || !textEl) return;

  // ---- GA4 helper: 必ず window.gtag を参照する（スコープ問題回避）
  const trackGA4 = (eventName, params = {}) => {
    try {
      const g = window.gtag;
      if (typeof g === "function") {
        g("event", eventName, params);
        return true;
      }
    } catch (_) {}
    return false;
  };

  // ---- 連打/二重発火対策
  let openingLock = false;   // 取得〜表示までの間の再入を止める
  let openToken = 0;         // 非同期の古い結果を破棄するためのトークン
  let firedThisOpen = false; // 「この1回のオープン」につき1回だけ計測

  const show = (rank, text) => {
    rankEl.textContent = rank || "";
    textEl.textContent = text || "";
    bubble.classList.add("is-show");

    // ★ここで「吹き出しが出た」ことを計測（1オープン=1回）
    if (!firedThisOpen) {
      firedThisOpen = true;
      trackGA4("omikuji_open", { ui: "bubble", source: "phoenixBtn" });
    }
  };

  const hide = () => {
    bubble.classList.remove("is-show");
    openingLock = false;
    firedThisOpen = false;
    // 以降の遅延showを無効化
    openToken++;
  };

  // 吹き出しの外側をタップで閉じる
  document.addEventListener("pointerdown", (e) => {
    if (!bubble.classList.contains("is-show")) return;
    if (bubble.contains(e.target) || btn.contains(e.target)) return;
    hide();
  }, { passive: true });

  // iOSの「click二重発火」や遅延を避けるため pointerup を採用
  btn.addEventListener("pointerup", async (e) => {
    e.preventDefault();

    // すでに表示中なら閉じる
    if (bubble.classList.contains("is-show")) {
      hide();
      return;
    }

    // 表示準備中（取得中）に再度押されたら無視
    if (openingLock) return;
    openingLock = true;

    // このオープンのトークン
    const myToken = ++openToken;
    firedThisOpen = false;

    try {
      const { rank, text } = await pickFortuneFixed();

      // 取得中に「別のオープン/クローズ」が起きていたら破棄
      if (myToken !== openToken) return;

      // アニメーションのタイミングに合わせて表示
      window.setTimeout(() => {
        if (myToken !== openToken) return;
        show(rank, text);
        // 表示が確定したのでロック解除（閉じるまでは「表示中」判定で制御）
        openingLock = false;
      }, 800);

    } catch (err) {
      console.error("Omikuji fetch failed:", err);
      openingLock = false;
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  loadLatestIntro();
  setupOmikujiUI();
});
