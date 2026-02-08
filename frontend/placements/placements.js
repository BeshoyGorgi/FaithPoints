import { API_BASE_URL } from "../config.js";

const podium = document.getElementById("podium");
const ties = document.getElementById("ties");
const backBtn = document.getElementById("backBtn");

backBtn?.addEventListener("click", () => {
  window.location.href = "/main/index.html";
});

function medalEmoji(rank) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank === 4) return "🏅";
  return "🎖️";
}

async function loadTop5() {
  const email = localStorage.getItem("email");
  if (!email) {
    window.location.href = "/login/login.html";
    return;
  }

  const res = await fetch(`${API_BASE_URL}/api/kinder?email=${encodeURIComponent(email)}`);
  const kids = await res.json();

  const sorted = kids
    .slice()
    .sort((a, b) => Number(b.gesamt || 0) - Number(a.gesamt || 0));

  // Cutoff (Platz 5) + alle >= cutoff anzeigen (inkl Gleichstand)
  let list = sorted;
  let cutoffScore = null;

  if (sorted.length > 5) {
    cutoffScore = Number(sorted[4].gesamt || 0);
    list = sorted.filter(k => Number(k.gesamt || 0) >= cutoffScore);
  }

  // Ränge korrekt bei Gleichstand (1,2,2,4...)
  let shown = 0;
  let rank = 0;
  let lastScore = null;

  const ranked = list.map((k) => {
    const score = Number(k.gesamt || 0);
    shown += 1;
    if (lastScore === null || score !== lastScore) {
      rank = shown;
      lastScore = score;
    }
    return { ...k, score, rank };
  });

  // 1) Podium: nur die ersten 5 Positionen (falls weniger, füllen wir mit Platzhalter)
  const topFiveSlots = [];
  for (let r = 1; r <= 5; r++) {
    const kid = ranked.find(x => x.rank === r); // kann null sein
    topFiveSlots.push(kid || null);
  }

  podium.innerHTML = topFiveSlots.map((kid, idx) => {
    const rankNum = idx + 1;

    if (!kid) {
      return `
        <div class="pillar empty" data-rank="${rankNum}">
          <div class="podium-face"></div>
          <div class="rank-badge">${rankNum}</div>
          <div class="medal">${medalEmoji(rankNum)}</div>
          <div class="pillar-content">
            <div class="kid-name">—</div>
            <div class="kid-score">0 Punkte</div>
            <div class="kid-sub">Noch kein Kind</div>
          </div>
        </div>
      `;
    }

    return `
      <div class="pillar" data-rank="${rankNum}">
        <div class="podium-face"></div>
        <div class="rank-badge">${rankNum}</div>
        <div class="medal">${medalEmoji(rankNum)}</div>
        <div class="pillar-content">
          <div class="kid-name">${kid.name ?? "-"}</div>
          <div class="kid-score">${kid.score} Punkte</div>
          <div class="kid-sub">${kid.rank !== rankNum ? `Gleichstand (Platz ${kid.rank})` : ""}</div>
        </div>
      </div>
    `;
  }).join("");

  // 2) Wenn wegen Gleichstand mehr als 5 Kinder angezeigt werden müssen:
  // Alles ab “nach den ersten 5 Einträgen” als Liste darunter
  const extra = ranked.slice(5);

  if (!extra.length) {
    // Keine extras -> Liste verstecken
    ties.innerHTML = "";
    ties.parentElement.style.display = "none";
  } else {
    ties.parentElement.style.display = "block";
    ties.innerHTML = extra.map((k, i) => `
      <div class="tie-card" style="animation-delay:${i * 70}ms">
        <div class="tie-left">
          <div class="tie-rank">Platz #${k.rank}</div>
          <div class="tie-name">${k.name ?? "-"}</div>
        </div>
        <div class="tie-score">${k.score} Punkte</div>
      </div>
    `).join("");
  }
}

loadTop5();
