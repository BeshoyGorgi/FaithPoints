import { API_BASE_URL } from "../config.js";

const podium = document.getElementById("podium");
const backBtn = document.getElementById("backBtn");

backBtn?.addEventListener("click", () => {
  window.location.href = "/main/index.html";
});

async function loadTop5() {
  const email = localStorage.getItem("email");
  if (!email) {
    window.location.href = "/login/login.html";
    return;
  }

  const res = await fetch(
    `${API_BASE_URL}/api/kinder?email=${encodeURIComponent(email)}`
  );
  const kids = await res.json();

  // Sortiert nach Punkten absteigend
  const sorted = kids
    .slice()
    .sort((a, b) => Number(b.gesamt || 0) - Number(a.gesamt || 0));

  // Alle anzeigen, die bis zum "Top-5-Cutoff" gehören (inkl. Gleichstand)
  let list = sorted;
  if (sorted.length > 5) {
    const cutoffScore = Number(sorted[4].gesamt || 0); // Punkte vom 5. Platz
    list = sorted.filter((k) => Number(k.gesamt || 0) >= cutoffScore);
  }

  // Ränge korrekt bei Gleichstand: 1,2,2,4...
  let shown = 0;
  let currentRank = 0;
  let lastScore = null;

  const ranked = list.map((k) => {
    const score = Number(k.gesamt || 0);

    shown += 1;
    if (lastScore === null || score !== lastScore) {
      currentRank = shown;
      lastScore = score;
    }

    return { ...k, rank: currentRank, score };
  });

  podium.innerHTML = ranked
    .map(
      (k) => `
    <div class="card">
      <div class="top">
        <div>
          <div class="rank">#${k.rank}</div>
          <div class="name">${k.name ?? "-"}</div>
        </div>
        <div class="score">${k.score} Punkte</div>
      </div>
    </div>
  `
    )
    .join("");
}

loadTop5();
