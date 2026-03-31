import { API_BASE_URL } from "../config.js";

const kinderListe = document.getElementById("kinderListe");
const statusBox = document.getElementById("statusBox");

const OPEN_KIND_KEY = "fp_open_hymnen_kind_id";

async function ladeHymnenUebersicht() {
  try {
    const email = localStorage.getItem("email");
    if (!email) {
      window.location.href = "/login/login.html";
      return;
    }

    statusBox.textContent = "Lade Hymnen...";
    kinderListe.innerHTML = "";

    const response = await fetch(`${API_BASE_URL}/api/hymnen?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error("Fehler beim Laden der Hymnen-Daten");
    }

    const daten = await response.json();

    if (!Array.isArray(daten) || daten.length === 0) {
      statusBox.textContent = "Noch keine Hymnen-Daten vorhanden.";
      return;
    }

    statusBox.textContent = "Klicke auf ein Kind, um die Hymnen-Einträge zu sehen.";

    daten.forEach(kind => {
      const card = baueKindCard(kind);
      kinderListe.appendChild(card);
    });

    const openKindId = localStorage.getItem(OPEN_KIND_KEY);
    if (openKindId) {
      const card = document.querySelector(`.kind-card[data-kind-id="${openKindId}"]`);
      if (card) {
        oeffneKindCard(card);
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      localStorage.removeItem(OPEN_KIND_KEY);
    }
  } catch (err) {
    console.error(err);
    statusBox.textContent = "Fehler beim Laden der Hymnen-Seite.";
  }
}

function baueKindCard(kind) {
  const card = document.createElement("article");
  card.className = "kind-card";
  card.dataset.kindId = kind.kind_id;

  const header = document.createElement("button");
  header.className = "kind-header";
  header.type = "button";

  const details = document.createElement("div");
  details.className = "kind-details";

  header.innerHTML = `
    <span class="kind-name">${escapeHtml(kind.kind_name)}</span>
    <span class="kind-punkte">${Number(kind.gesamt_hymne) || 0} Punkte</span>
  `;

  header.addEventListener("click", () => {
    const istOffen = details.classList.contains("offen");
    schliesseAlleCards();
    if (!istOffen) {
      details.classList.add("offen");
      card.classList.add("aktiv");
    }
  });

  const eintraege = Array.isArray(kind.eintraege) ? kind.eintraege : [];

  if (eintraege.length === 0) {
    details.innerHTML = `
      <div class="leer-text">
        Für dieses Kind gibt es noch keine einzelnen Hymnen-Einträge.
      </div>
    `;
  } else {
    const head = document.createElement("div");
    head.className = "details-head";
    head.innerHTML = `
      <div>Name der Hymne</div>
      <div>Punkte</div>
      <div>Speichern</div>
    `;
    details.appendChild(head);

    eintraege.forEach(eintrag => {
      details.appendChild(baueHymnenZeile(eintrag));
    });
  }

  card.appendChild(header);
  card.appendChild(details);

  return card;
}

function baueHymnenZeile(eintrag) {
  const row = document.createElement("div");
  row.className = "hymnen-row";
  row.dataset.eintragId = eintrag.id;

  row.innerHTML = `
    <input
      class="hymnen-input"
      type="text"
      value="${escapeAttribute(eintrag.titel || "")}"
      placeholder="Name der Hymne eingeben"
    />
    <div class="readonly-box">${Number(eintrag.punkte) || 0}</div>
    <div class="row-actions">
      <button type="button" class="save-button">Speichern</button>
    </div>
  `;

  const input = row.querySelector(".hymnen-input");
  const saveButton = row.querySelector(".save-button");

  saveButton.addEventListener("click", async () => {
    try {
      saveButton.disabled = true;
      saveButton.textContent = "Speichert...";

      const response = await fetch(`${API_BASE_URL}/api/hymnen/${eintrag.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          titel: input.value.trim()
        })
      });

      if (!response.ok) {
        throw new Error("Fehler beim Speichern der Hymne");
      }

      saveButton.textContent = "Gespeichert";
      setTimeout(() => {
        saveButton.textContent = "Speichern";
        saveButton.disabled = false;
      }, 900);
    } catch (err) {
      console.error(err);
      saveButton.textContent = "Fehler";
      setTimeout(() => {
        saveButton.textContent = "Speichern";
        saveButton.disabled = false;
      }, 1200);
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveButton.click();
    }
  });

  return row;
}

function schliesseAlleCards() {
  document.querySelectorAll(".kind-card").forEach(card => {
    card.classList.remove("aktiv");
    const details = card.querySelector(".kind-details");
    if (details) details.classList.remove("offen");
  });
}

function oeffneKindCard(card) {
  schliesseAlleCards();
  card.classList.add("aktiv");
  const details = card.querySelector(".kind-details");
  if (details) details.classList.add("offen");
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(str) {
  return escapeHtml(str);
}

document.getElementById("zurueckButton").addEventListener("click", () => {
  window.location.href = "/main/index.html";
});

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("email");
  localStorage.removeItem(OPEN_KIND_KEY);
  window.location.href = "/login/login.html";
});

ladeHymnenUebersicht();