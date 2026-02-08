import { API_BASE_URL } from "../config.js";

const podium = document.getElementById("podium");
const backBtn = document.getElementById("backBtn");

backBtn?.addEventListener("click", () => {
  window.location.href = "/main/index.html";
});

function medalEmoji(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank === 4) return "🏅";
  if (rank === 5) return "🎖️";
  return "⭐";
}

async function loadPlacements() {
  const email = localStorage.getItem("email");
  if (!email) {
    window.location.href = "/login/login.html";
    return;
  }

  const res = await fetch(`${API_BASE_URL}/api/kinder?email=${encodeURIComponent(email)}`);
  const kids = await res.json();

  // 1) Sortieren nach Punkten (absteigend)
  const sorted = kids
    .slice()
    .sort((a, b) => Number(b.gesamt || 0) - Number(a.gesamt || 0));

  // 2) Dense Ranking: 1,2,2,3...
  let rank = 0;
  let lastScore = null;

  const ranked = sorted.map((k) => {
    const score = Number(k.gesamt || 0);

    if (lastScore === null || score !== lastScore) {
      rank += 1;              // nur bei neuer Punktzahl Rang erhöhen
      lastScore = score;
    }

    return { ...k, score, rank };
  });

  // 3) Alle Kinder anzeigen, die Rang <= 5 haben (inkl. Gleichstände)
  const show = ranked.filter(k => k.rank <= 5);

  // 4) Render: jedes Kind eigenes Podest (auch wenn gleicher Rang)
  podium.innerHTML = show.map((k, i) => `
    <div class="pillar" data-rank="${k.rank}" style="animation-delay:${i * 80}ms">
      <div class="podium-face"></div>

      <div class="rank-badge">#${k.rank}</div>
      <div class="medal">${medalEmoji(k.rank)}</div>

      <div class="pillar-content">
        <div class="kid-name">${k.name ?? "-"}</div>
        <div class="kid-score">${k.score} Punkte</div>
      </div>
    </div>
  `).join("");
}

loadPlacements();
