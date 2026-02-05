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

  const res = await fetch(`${API_BASE_URL}/api/kinder?email=${encodeURIComponent(email)}`);
  const kids = await res.json();

  const top5 = kids
    .slice()
    .sort((a, b) => Number(b.gesamt || 0) - Number(a.gesamt || 0))
    .slice(0, 5);

  podium.innerHTML = top5.map((k, i) => `
    <div class="card">
      <div class="top">
        <div>
          <div class="rank">#${i + 1}</div>
          <div class="name">${k.name ?? "-"}</div>
        </div>
        <div class="score">${Number(k.gesamt || 0)} Punkte</div>
      </div>
    </div>
  `).join("");
}

loadTop5();
