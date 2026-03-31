import { API_BASE_URL } from "../config.js";

const kinderListe = document.getElementById("kinderListe");
const statusBox = document.getElementById("statusBox");
const suchInput = document.getElementById("kindSuche");
const suchButton = document.getElementById("suchButton");

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

    statusBox.textContent = "Klicke auf ein Kind oder benutze die Suche.";

    daten.forEach(kind => {
      const card = baueKindCard(kind);
      kinderListe.appendChild(card);
    });

    const openKindId = localStorage.getItem(OPEN_KIND_KEY);
    if (openKindId) {
      const card = document.querySelector(`.kind-card[data-kind-id="${openKindId}"]`);
      if (card) {
        oeffneKindCard(card);
        hervorheben(card);
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
  card.dataset.kindName = (kind.kind_name || "").toLowerCase();

  const header = document.createElement("button");
  header.className = "kind-header";
  header.type = "button";

  const details = document.createElement("div");
  details.className = "kind-details";

  header.innerHTML = `
    <span class="kind-name">${escapeHtml(kind.kind_name)}</span>
    <span class="kind-punkte">${Number(kind.gesamt_hymne) || 0} Punkte</span>
  `;

  const punkteAnzeige = header.querySelector(".kind-punkte");

  header.addEventListener("click", () => {
    const istOffen = details.classList.contains("offen");
    schliesseAlleCards();
    if (!istOffen) {
      details.classList.add("offen");
      card.classList.add("aktiv");
    }
  });

  baueDetailsInhalt(details, kind, punkteAnzeige);

  card.appendChild(header);
  card.appendChild(details);

  return card;
}

function baueDetailsInhalt(details, kind, punkteAnzeige) {
  details.innerHTML = "";

  const eintraege = Array.isArray(kind.eintraege) ? kind.eintraege : [];

  if (eintraege.length === 0) {
    details.innerHTML = `
      <div class="leer-text">
        Für dieses Kind gibt es noch keine einzelnen Hymnen-Einträge.
      </div>
    `;
    return;
  }

  const head = document.createElement("div");
  head.className = "details-head";
  head.innerHTML = `
    <div>Name der Hymne</div>
    <div>Punkte / Datum</div>
  `;
  details.appendChild(head);

  eintraege.forEach(eintrag => {
    details.appendChild(baueHymnenZeile(eintrag, kind, details, punkteAnzeige));
  });
}

function baueHymnenZeile(eintrag, kind, details, punkteAnzeige) {
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
    <div class="punkte-datum-box">
      <span class="punkte-wert">${Number(eintrag.punkte) || 0} Punkte</span>
      <span class="punkte-datum">${formatDatum(eintrag.created_at)}</span>
    </div>
    <div class="row-actions">
      <button type="button" class="save-button">Speichern</button>
      <button type="button" class="delete-button">Löschen</button>
    </div>
  `;

  const input = row.querySelector(".hymnen-input");
  const saveButton = row.querySelector(".save-button");
  const deleteButton = row.querySelector(".delete-button");

  if ((eintrag.titel || "").trim() !== "") {
    sperreInput(input);
  }

  input.addEventListener("dblclick", () => {
    input.readOnly = false;
    input.classList.remove("gesperrt");
    input.focus();
    input.select();
  });

  saveButton.addEventListener("click", async () => {
    try {
      const titel = input.value.trim();

      if (!titel) {
        alert("Bitte gib zuerst den Namen der Hymne ein.");
        return;
      }

      saveButton.disabled = true;
      saveButton.textContent = "Speichert...";

      const response = await fetch(`${API_BASE_URL}/api/hymnen/${eintrag.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          titel
        })
      });

      if (!response.ok) {
        throw new Error("Fehler beim Speichern der Hymne");
      }

      input.value = titel;
      sperreInput(input);

      saveButton.textContent = "Gespeichert";
      setTimeout(() => {
        saveButton.textContent = "Speichern";
        saveButton.disabled = false;
      }, 900);

      statusBox.textContent = `Hymne für ${kind.kind_name} gespeichert.`;
    } catch (err) {
      console.error(err);
      saveButton.textContent = "Fehler";
      setTimeout(() => {
        saveButton.textContent = "Speichern";
        saveButton.disabled = false;
      }, 1200);
    }
  });

  deleteButton.addEventListener("click", async () => {
    const hymnName = input.value.trim() || "ohne Namen";
    const bestaetigt = confirm(
      `Möchtest du die Hymne "${hymnName}" von ${kind.kind_name} wirklich löschen?`
    );

    if (!bestaetigt) return;

    try {
      deleteButton.disabled = true;
      deleteButton.textContent = "Löscht...";

      const response = await fetch(`${API_BASE_URL}/api/hymnen/${eintrag.id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen der Hymne");
      }

      const result = await response.json();

      row.remove();

      if (punkteAnzeige && result.kind) {
        punkteAnzeige.textContent = `${Number(result.kind.hymne) || 0} Punkte`;
      }

      const restRows = details.querySelectorAll(".hymnen-row");
      if (restRows.length === 0) {
        details.innerHTML = `
          <div class="leer-text">
            Für dieses Kind gibt es noch keine einzelnen Hymnen-Einträge.
          </div>
        `;
      }

      statusBox.textContent = `Die Hymne "${hymnName}" von ${kind.kind_name} wurde gelöscht.`;
    } catch (err) {
      console.error(err);
      deleteButton.disabled = false;
      deleteButton.textContent = "Löschen";
      alert("Fehler beim Löschen der Hymne.");
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

function sperreInput(input) {
  input.readOnly = true;
  input.classList.add("gesperrt");
  input.title = "Doppelklick zum Bearbeiten";
}

function sucheKind() {
  const query = (suchInput.value || "").trim().toLowerCase();

  if (!query) {
    statusBox.textContent = "Bitte gib einen Namen ein.";
    return;
  }

  const cards = Array.from(document.querySelectorAll(".kind-card"));
  const match = cards.find(card =>
    (card.dataset.kindName || "").includes(query)
  );

  if (!match) {
    statusBox.textContent = `Kein Kind mit "${suchInput.value}" gefunden.`;
    return;
  }

  oeffneKindCard(match);
  hervorheben(match);
  match.scrollIntoView({ behavior: "smooth", block: "center" });
  statusBox.textContent = `Kind gefunden: ${match.querySelector(".kind-name")?.textContent || ""}`;
}

function hervorheben(card) {
  card.classList.add("suchtreffer");
  setTimeout(() => {
    card.classList.remove("suchtreffer");
  }, 2000);
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

function formatDatum(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("de-DE");
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

suchButton?.addEventListener("click", sucheKind);

suchInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sucheKind();
  }
});

document.getElementById("zurueckButton").addEventListener("click", () => {
  window.location.href = "/main/index.html";
});

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("email");
  localStorage.removeItem(OPEN_KIND_KEY);
  window.location.href = "/login/login.html";
});

ladeHymnenUebersicht();