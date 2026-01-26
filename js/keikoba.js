const ham = document.getElementById('hamburger');
const nav = document.getElementById('navMenu');

// -----------------------------
// Intro (LINE → Worker → KV → Site)
// -----------------------------
async function loadLatestIntro() {
  const target = document.getElementById('introTextLines');
  if (!target) return;

  // keikoba.html 側で window.KEIKO_INTRO_API を定義していればそれを使う
  // なければ /intro（同一ドメイン想定）
  const api =
    (window.KEIKO_INTRO_API && String(window.KEIKO_INTRO_API)) || "/intro";

  try {
    const res = await fetch(api, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.log("intro fetch failed:", res.status);
      return;
    }

    const data = await res.json();
    const text = data && typeof data.text === "string" ? data.text : "";
    if (!text) return;

    // 改行で分割して1行ずつ表示
    const lines = text.replace(/\r\n/g, "\n").split("\n");

    target.innerHTML = "";
    lines.forEach((line) => {
      const div = document.createElement("div");
      div.className = "line";
      div.textContent = line;
      target.appendChild(div);
    });
  } catch (e) {
    console.log("intro fetch error", e);
  }
}

// -----------------------------
// Hamburger menu
// -----------------------------
if (ham && nav) {
  ham.addEventListener("click", () => {
    ham.classList.toggle("open");
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      ham.classList.remove("open");
      nav.classList.remove("open");
    });
  });
}

// -----------------------------
// DOM ready
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadLatestIntro();
});