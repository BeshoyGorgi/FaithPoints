import { API_BASE_URL } from "../config.js";

const podium = document.getElementById("podium");
const backBtn = document.getElementById("backBtn");

backBtn?.addEventListener("click", () => {
  window.location.href = "/main/index.html";
});

const DEFAULT_PLACEMENT_IMAGE = "/images/placements/default.png";

function getPlacementImgSrc(rank, indexInRank) {
  const folder = `/images/placements/${rank}`;
  const file = indexInRank === 0 ? `${rank}.png` : `${rank}.${indexInRank}.png`;
  return `${folder}/${file}`;
}

function safeText(v) {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[c]));
}

async function loadPlacements() {
  const email = localStorage.getItem("email");
  if (!email) {
    window.location.href = "/login/login.html";
    return;
  }

  const res = await fetch(`${API_BASE_URL}/api/kinder?email=${encodeURIComponent(email)}`);
  const kids = await res.json();

  // Sortiert nach Punkten (absteigend)
  const sorted = kids.slice().sort((a, b) => Number(b.gesamt || 0) - Number(a.gesamt || 0));

  // Ränge: 1,2,2,3 (keine Lücken)
  let rank = 0;
  let lastScore = null;

  const ranked = sorted.map((k) => {
    const score = Number(k.gesamt || 0);
    if (lastScore === null || score !== lastScore) {
      rank += 1;
      lastScore = score;
    }
    return { ...k, rank, score };
  });

  // Alle Kids mit Rang 1–5 anzeigen (inkl. Gleichstände)
  const shown = ranked.filter(k => k.rank <= 5);

  // ✅ pro Rang mitzählen (für 1.png, 1.1.png, 1.2.png...)
  const rankCounter = {};

  podium.innerHTML = shown.map((k, idx) => {
    const medalEmoji =
      k.rank === 1 ? "🥇" :
      k.rank === 2 ? "🥈" :
      k.rank === 3 ? "🥉" : "🏅";

    rankCounter[k.rank] = (rankCounter[k.rank] || 0);
    const indexInRank = rankCounter[k.rank];
    rankCounter[k.rank] += 1;

    const imgSrc = getPlacementImgSrc(k.rank, indexInRank);

    return `
      <div class="pillar" data-rank="${k.rank}" style="animation-delay:${60 + idx * 80}ms">
        <div class="podium-face"></div>

        <div class="rank-badge">${k.rank}</div>
        <div class="medal" aria-hidden="true">${medalEmoji}</div>

        <img class="kid-avatar"
             src="${imgSrc}"
             alt="Bild von ${safeText(k.name)}"
             onerror="this.src='${DEFAULT_PLACEMENT_IMAGE}';" />

        <div class="pillar-content">
          <div class="kid-name">${safeText(k.name) || "-"}</div>
          <div class="kid-score">${k.score} Punkte</div>
        </div>
      </div>
    `;
  }).join("");
}

loadPlacements();
