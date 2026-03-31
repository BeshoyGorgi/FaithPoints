import { API_BASE_URL } from "../config.js";

const kinderListe = document.getElementById("kinderListe");
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
    
    kinderListe.innerHTML = "";

    const response = await fetch(`${API_BASE_URL}/api/hymnen?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error("Fehler beim Laden der Hymnen-Daten");
    }

    const daten = await response.json();

    daten.sort((a, b) => {
  const punkteA = Number(a.gesamt_hymne) || 0;
  const punkteB = Number(b.gesamt_hymne) || 0;

  if (punkteB !== punkteA) {
    return punkteB - punkteA; // größte Punktzahl zuerst
  }

  return (a.kind_name || "").localeCompare(b.kind_name || "", "de");    
    });

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
  }
}

function baueKindCard(kind) {
  const card = document.createElement("article");
  card.className = "kind-card";
  card.dataset.kindId = kind.kind_id;
  card.dataset.kindName = (kind.kind_name || "").toLowerCase();

  const headerRow = document.createElement("div");
  headerRow.className = "kind-header-row";

  const header = document.createElement("button");
  header.className = "kind-header";
  header.type = "button";

  const plusButton = document.createElement("button");
  plusButton.className = "plus-button";
  plusButton.type = "button";
  plusButton.textContent = "+";
  plusButton.title = "Neue Hymne hinzufügen";

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

  plusButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    schliesseAlleCards();
    details.classList.add("offen");
    card.classList.add("aktiv");

    fuegeNeueHymnenZeileEin(details, kind, punkteAnzeige);
  });

  baueDetailsInhalt(details, kind, punkteAnzeige);

  headerRow.appendChild(header);
  headerRow.appendChild(plusButton);

  card.appendChild(headerRow);
  card.appendChild(details);

  return card;
}

function stelleDetailsGrundgeruestSicher(details) {
  const leerText = details.querySelector(".leer-text");
  if (leerText) {
    leerText.remove();
  }

  const hatHead = details.querySelector(".details-head");
  if (!hatHead) {
    const head = document.createElement("div");
    head.className = "details-head";
    head.innerHTML = `
      <div>Name der Hymne</div>
      <div>Punkte / Datum</div>
      <div>Aktionen</div>
    `;
    details.prepend(head);
  }
}

function fuegeNeueHymnenZeileEin(details, kind, punkteAnzeige) {
  const vorhandeneNeueZeile = details.querySelector(".hymnen-row.neu");
  if (vorhandeneNeueZeile) {
    const vorhandenesInput = vorhandeneNeueZeile.querySelector(".hymnen-input");
    vorhandenesInput?.focus();
    return;
  }

  stelleDetailsGrundgeruestSicher(details);

  const row = document.createElement("div");
  row.className = "hymnen-row neu";

  row.innerHTML = `
    <input
      class="hymnen-input"
      type="text"
      value=""
      placeholder="Name der Hymne eingeben"
    />
    <div class="punkte-datum-box">
      <input
        class="punkte-input"
        type="number"
        min="0"
        step="1"
        value="0"
        placeholder="Punkte"
      />
      <span class="punkte-datum">${formatDatum(new Date().toISOString())}</span>
    </div>
    <div class="row-actions">
      <button type="button" class="save-button">Speichern</button>
      <button type="button" class="delete-button">Abbrechen</button>
    </div>
  `;

  const head = details.querySelector(".details-head");
  if (head && head.nextSibling) {
    details.insertBefore(row, head.nextSibling);
  } else {
    details.appendChild(row);
  }

  const titelInput = row.querySelector(".hymnen-input");
  const punkteInput = row.querySelector(".punkte-input");
  const saveButton = row.querySelector(".save-button");
  const cancelButton = row.querySelector(".delete-button");

  titelInput.focus();

  saveButton.addEventListener("click", async () => {
    try {
      const titel = titelInput.value.trim();
      const punkte = Number(punkteInput.value);

      if (!titel) {
        alert("Bitte gib den Namen der Hymne ein.");
        return;
      }

      if (!Number.isFinite(punkte) || punkte < 0) {
        alert("Bitte gib eine gültige Punktzahl ein.");
        return;
      }

      saveButton.disabled = true;
      saveButton.textContent = "Speichert...";

      const response = await fetch(`${API_BASE_URL}/api/hymnen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          kind_id: kind.kind_id,
          titel,
          punkte
        })
      });

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen der neuen Hymne");
      }

      localStorage.setItem(OPEN_KIND_KEY, String(kind.kind_id));
      await ladeHymnenUebersicht();

    } catch (err) {
      console.error(err);
      saveButton.disabled = false;
      saveButton.textContent = "Speichern";
      alert("Fehler beim Speichern der neuen Hymne.");
    }
  });

  cancelButton.addEventListener("click", () => {
    row.remove();

    const restRows = details.querySelectorAll(".hymnen-row");
    if (restRows.length === 0) {
      details.innerHTML = `
        <div class="leer-text">
          Für dieses Kind gibt es noch keine einzelnen Hymnen-Einträge.
        </div>
      `;
    }
  });

  titelInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveButton.click();
    }
  });

  punkteInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveButton.click();
    }
  });
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

  const cards = Array.from(document.querySelectorAll(".kind-card"));
  const match = cards.find(card =>
    (card.dataset.kindName || "").includes(query)
  );

  oeffneKindCard(match);
  hervorheben(match);
  match.scrollIntoView({ behavior: "smooth", block: "center" });
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