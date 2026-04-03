import { API_BASE_URL } from "../config.js";

const kinderListe = document.getElementById("kinderListe");
const suchInput = document.getElementById("kindSuche");
const monatSucheVonInput = document.getElementById("monatSucheVon");
const monatSucheBisInput = document.getElementById("monatSucheBis");
const monatSucheButton = document.getElementById("monatSucheButton");
const monatResetButton = document.getElementById("monatResetButton");
const monatScreenshotButton = document.getElementById("monatScreenshotButton");
const monatInfo = document.getElementById("monatInfo");

let alleKinderDaten = [];
let aktiverMonatsFilterVon = "";
let aktiverMonatsFilterBis = "";
let aktiverKindFilterId = null;

const OPEN_KIND_KEY = "fp_open_hymnen_kind_id";

const HYMNNEN_KATEGORIEN = [
  "Bonus-Hymne",
  "Jährlich",
  "Geburt Christi",
  "Große Fastenzeit",
  "Das Kreuzfest",
  "Karwoche",
  "Al Khamasin (50 hl. Tage)",
  "Apostelfastenzeit",
  "Marienfastenzeit",
  "Koptisches Neujahr (Neiruzfest)",
  "Kiahk"
];

function normalisiereDatum(value) {
  if (!value) return "";
  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const jahr = d.getFullYear();
  const monat = String(d.getMonth() + 1).padStart(2, "0");
  const tag = String(d.getDate()).padStart(2, "0");

  return `${jahr}-${monat}-${tag}`;
}

function holeMonatsGrenzen(monatWert) {
  if (!monatWert) return null;

  const [jahr, monat] = monatWert.split("-").map(Number);
  if (!jahr || !monat) return null;

  const start = `${jahr}-${String(monat).padStart(2, "0")}-01`;
  const letzterTagDate = new Date(jahr, monat, 0);
  const end = `${jahr}-${String(monat).padStart(2, "0")}-${String(letzterTagDate.getDate()).padStart(2, "0")}`;

  return { start, end };
}

function hatAktivenMonatsFilter() {
  return !!(aktiverMonatsFilterVon || aktiverMonatsFilterBis);
}

function holeMonatsbereich(vonWert, bisWert) {
  if (!vonWert && !bisWert) return null;

  const von = vonWert || bisWert;
  const bis = bisWert || vonWert;

  const vonGrenzen = holeMonatsGrenzen(von);
  const bisGrenzen = holeMonatsGrenzen(bis);

  if (!vonGrenzen || !bisGrenzen) return null;

  let start = vonGrenzen.start;
  let end = bisGrenzen.end;

  if (start > end) {
    [start, end] = [end, start];
  }

  return { start, end };
}

function formatiereMonatsbereich(vonWert, bisWert) {
  if (!vonWert && !bisWert) return "";

  const von = vonWert || bisWert;
  const bis = bisWert || vonWert;

  if (von === bis) {
    return formatiereMonatJahr(von);
  }

  return `${formatiereMonatJahr(von)} bis ${formatiereMonatJahr(bis)}`;
}

function baueDateinameMonatsbereich(vonWert, bisWert) {
  if (!vonWert && !bisWert) return "ohne-filter";

  const von = vonWert || bisWert;
  const bis = bisWert || vonWert;

  if (von === bis) {
    return von;
  }

  return `${von}-bis-${bis}`;
}

function formatiereMonatJahr(monatWert) {
  if (!monatWert) return "";
  const [jahr, monat] = monatWert.split("-").map(Number);
  const d = new Date(jahr, monat - 1, 1);

  return d.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric"
  });
}

function eintragPasstZumMonatsbereich(eintrag, vonWert, bisWert) {
  if (!vonWert && !bisWert) return true;

  const bereich = holeMonatsbereich(vonWert, bisWert);
  if (!bereich) return true;

  const datum = normalisiereDatum(eintrag.created_at);
  if (!datum) return false;

  return datum >= bereich.start && datum <= bereich.end;
}

function holeGefilterteKinder() {
  let kinder = [...alleKinderDaten];

  if (hatAktivenMonatsFilter()) {
    kinder = kinder
      .map(kind => {
        const gefilterteEintraege = (Array.isArray(kind.eintraege) ? kind.eintraege : [])
          .filter(eintrag =>
            eintragPasstZumMonatsbereich(
              eintrag,
              aktiverMonatsFilterVon,
              aktiverMonatsFilterBis
            )
          );

        return {
          ...kind,
          eintraege: gefilterteEintraege
        };
      })
      .filter(kind => kind.eintraege.length > 0);
  }

  if (aktiverKindFilterId !== null) {
    kinder = kinder.filter(kind => Number(kind.kind_id) === Number(aktiverKindFilterId));
  }

  return kinder;
}

function aktualisiereMonatInfo(sichtbareKinder) {
  if (!monatInfo) return;

  if (!hatAktivenMonatsFilter()) {
    monatInfo.textContent = "";
    return;
  }

  const hymnAnzahl = sichtbareKinder.reduce((summe, kind) => {
    return summe + (Array.isArray(kind.eintraege) ? kind.eintraege.length : 0);
  }, 0);

  monatInfo.textContent =
    `${sichtbareKinder.length} Kinder und ${hymnAnzahl} Hymnen für ${formatiereMonatsbereich(aktiverMonatsFilterVon, aktiverMonatsFilterBis)} gefunden.`;
}

function renderKinderListe() {
  kinderListe.innerHTML = "";

  const sichtbareKinder = holeGefilterteKinder();

  if (sichtbareKinder.length === 0) {
  if (hatAktivenMonatsFilter()) {
    const leer = document.createElement("div");
    leer.className = "keine-monats-treffer";
    leer.textContent = `Für ${formatiereMonatsbereich(aktiverMonatsFilterVon, aktiverMonatsFilterBis)} wurden keine Hymnen gefunden.`;
    kinderListe.appendChild(leer);
  }

  aktualisiereMonatInfo([]);
  return;
}

  sichtbareKinder.forEach(kind => {
    const card = baueKindCard(kind);
    kinderListe.appendChild(card);
  });

  aktualisiereMonatInfo(sichtbareKinder);
}

function aktiviereMonatsFilter() {
  let vonWert = (monatSucheVonInput?.value || "").trim();
  let bisWert = (monatSucheBisInput?.value || "").trim();
  const query = (suchInput?.value || "").trim().toLowerCase();

  if (!vonWert && !bisWert) {
    alert("Bitte wähle mindestens einen Monat aus.");
    return;
  }

  if (!vonWert) vonWert = bisWert;
  if (!bisWert) bisWert = vonWert;

  if (vonWert > bisWert) {
    [vonWert, bisWert] = [bisWert, vonWert];
  }

  aktiverMonatsFilterVon = vonWert;
  aktiverMonatsFilterBis = bisWert;

  if (monatSucheVonInput) monatSucheVonInput.value = vonWert;
  if (monatSucheBisInput) monatSucheBisInput.value = bisWert;

  if (query) {
    const matchKind = alleKinderDaten.find(kind =>
      (kind.kind_name || "").toLowerCase().includes(query)
    );

    if (!matchKind) {
      alert("Kein passendes Kind gefunden.");
      return;
    }

    aktiverKindFilterId = matchKind.kind_id;
  } else {
    aktiverKindFilterId = null;
  }

  renderKinderListe();

  if (aktiverKindFilterId !== null) {
    const gefunden = springeZuKind(aktiverKindFilterId);

    if (!gefunden) {
      const kind = alleKinderDaten.find(k => Number(k.kind_id) === Number(aktiverKindFilterId));
      alert(`"${kind?.kind_name || "Dieses Kind"}" hat in ${formatiereMonatsbereich(vonWert, bisWert)} keine Hymnen.`);
    }
  }
}

function resetMonatsFilter() {
  aktiverMonatsFilterVon = "";
  aktiverMonatsFilterBis = "";
  aktiverKindFilterId = null;

  if (monatSucheVonInput) {
    monatSucheVonInput.value = "";
  }

  if (monatSucheBisInput) {
    monatSucheBisInput.value = "";
  }

  if (suchInput) {
    suchInput.value = "";
  }

  renderKinderListe();
}

async function screenshotMonatsErgebnis() {
  if (!hatAktivenMonatsFilter()) {
    alert("Bitte wähle zuerst Monat und Jahr aus und suche danach.");
    return;
  }

  if (!window.html2canvas) {
    alert("Screenshot-Bibliothek wurde nicht geladen.");
    return;
  }

  const sichtbareKinder = holeGefilterteKinder();
  if (sichtbareKinder.length === 0) {
    alert("Es gibt keine passenden Hymnen für diesen Monat.");
    return;
  }

  const exportBox = document.createElement("div");
  exportBox.style.position = "fixed";
  exportBox.style.left = "-99999px";
  exportBox.style.top = "0";
  exportBox.style.width = "1300px";
  exportBox.style.background = "#1A3D64";
  exportBox.style.padding = "26px";
  exportBox.style.zIndex = "-1";

  const titel = document.createElement("h1");
titel.textContent = `Hymnen – ${formatiereMonatsbereich(aktiverMonatsFilterVon, aktiverMonatsFilterBis)}`;
  titel.style.color = "white";
  titel.style.margin = "0 0 10px 0";
  titel.style.fontFamily = "Arial, sans-serif";
  titel.style.fontSize = "2rem";

  const untertitel = document.createElement("div");
  untertitel.style.color = "#dbeafe";
  untertitel.style.marginBottom = "22px";
  untertitel.style.fontFamily = "Arial, sans-serif";
  untertitel.style.fontWeight = "600";

  const clone = kinderListe.cloneNode(true);

  const style = document.createElement("style");
  style.textContent = `
    .plus-button,
    .row-actions {
      display: none !important;
    }

    .kind-header-row {
      display: block !important;
      padding: 0 !important;
    }

    .kind-header {
      width: 100% !important;
      cursor: default !important;
      padding: 18px 20px !important;
    }

    .details-head,
    .hymnen-row {
      grid-template-columns: 1.5fr 270px 270px !important;
    }
  `;

  exportBox.appendChild(style);
  exportBox.appendChild(titel);
  exportBox.appendChild(untertitel);
  exportBox.appendChild(clone);
  document.body.appendChild(exportBox);

  try {
    const canvas = await window.html2canvas(exportBox, {
      backgroundColor: "#1A3D64",
      scale: 2,
      useCORS: true
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `hymnen-${baueDateinameMonatsbereich(aktiverMonatsFilterVon, aktiverMonatsFilterBis)}.png`;
    link.click();
  } catch (error) {
    console.error(error);
    alert("Fehler beim Erstellen des Screenshots.");
  } finally {
    exportBox.remove();
  }
}

async function ladeHymnenUebersicht() {
  try {
    const email = localStorage.getItem("email");
    if (!email) {
      window.location.href = "/login/login.html";
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/hymnen?email=${encodeURIComponent(email)}`);
if (!response.ok) {
  throw new Error("Fehler beim Laden der Hymnen-Daten");
}

const daten = await response.json();

daten.sort((a, b) => {
  const punkteA = Number(a.gesamt_hymne) || 0;
  const punkteB = Number(b.gesamt_hymne) || 0;

  if (punkteB !== punkteA) {
    return punkteB - punkteA;
  }

  return (a.kind_name || "").localeCompare(b.kind_name || "", "de");
});

alleKinderDaten = daten;
renderKinderListe();

    const openKindId = localStorage.getItem(OPEN_KIND_KEY);
    if (openKindId && !hatAktivenMonatsFilter()) {
      const card = document.querySelector(`.kind-card[data-kind-id="${openKindId}"]`);
      if (card) {
        oeffneKindCard(card);
        hervorheben(card);
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    localStorage.removeItem(OPEN_KIND_KEY);
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

  const angezeigtePunkte = hatAktivenMonatsFilter()
  ? kind.eintraege.reduce((summe, eintrag) => summe + (Number(eintrag.punkte) || 0), 0)
  : (Number(kind.gesamt_hymne) || 0);

  header.innerHTML = `
    <span class="kind-name">${escapeHtml(kind.kind_name)}</span>
    <span class="kind-punkte">${angezeigtePunkte} Punkte</span>
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

 if (hatAktivenMonatsFilter()) {
  details.classList.add("offen");
  card.classList.add("aktiv");
}

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
    <div>Kategorie</div>
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

  <select class="kategorie-select">
    ${baueKategorieOptionen()}
  </select>

  <div class="punkte-datum-box">
    <input
      class="punkte-input"
      type="number"
      min="0"
      step="1"
      value="0"
      placeholder="Punkte"
    />
    <input
      class="datum-input"
      type="date"
      value="${formatDateInput(new Date())}"
    />
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
  const datumInput = row.querySelector(".datum-input");
  const kategorieSelect = row.querySelector(".kategorie-select");
  const saveButton = row.querySelector(".save-button");
  const cancelButton = row.querySelector(".delete-button");

  titelInput.focus();

  saveButton.addEventListener("click", async () => {
    try {
      const titel = titelInput.value.trim();
      const kategorie = kategorieSelect.value.trim();
      const punkte = Number(punkteInput.value);
      const datum = datumInput.value;

      if (!titel) {
        alert("Bitte gib den Namen der Hymne ein.");
        return;
      }

      if (!kategorie) {
        alert("Bitte wähle eine Kategorie aus.");
        return;
      }

      if (!Number.isFinite(punkte) || punkte < 0) {
        alert("Bitte gib eine gültige Punktzahl ein.");
        return;
      }

      if (!datum) {
        alert("Bitte wähle ein Datum aus.");
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
          kategorie,
          punkte,
          created_at: new Date(`${datum}T00:00:00`).toISOString()
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

  datumInput.addEventListener("keydown", (e) => {
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
    <div>Kategorie</div>
    <div>Punkte / Datum</div>
    <div>Aktionen</div>
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

  <select class="kategorie-select">
    ${baueKategorieOptionen(eintrag.kategorie || "")}
  </select>

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
  const kategorieSelect = row.querySelector(".kategorie-select");

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
      const kategorie = kategorieSelect.value.trim();

      if (!titel) {
        alert("Bitte gib zuerst den Namen der Hymne ein.");
        return;
      }

      if (!kategorie) {
        alert("Bitte wähle zuerst eine Kategorie aus.");
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
        titel,
        kategorie
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

function fuehreSucheAus() {
  const query = (suchInput?.value || "").trim();
  const vonWert = (monatSucheVonInput?.value || "").trim();
  const bisWert = (monatSucheBisInput?.value || "").trim();

  if (query && (vonWert || bisWert)) {
    sucheKind();
    return;
  }

  if (query) {
    sucheKind();
    return;
  }

  if (vonWert || bisWert) {
    aktiviereMonatsFilter();
    return;
  }

  alert("Bitte gib einen Namen ein oder wähle mindestens einen Monat aus.");
}

function sucheKind() {
  const query = (suchInput?.value || "").trim().toLowerCase();
  let vonWert = (monatSucheVonInput?.value || "").trim();
  let bisWert = (monatSucheBisInput?.value || "").trim();

  if (!query) {
    return;
  }

  const matchKind = alleKinderDaten.find(kind =>
    (kind.kind_name || "").toLowerCase().includes(query)
  );

  if (!matchKind) {
    alert("Kein passendes Kind gefunden.");
    return;
  }

  if (vonWert || bisWert) {
    if (!vonWert) vonWert = bisWert;
    if (!bisWert) bisWert = vonWert;

    if (vonWert > bisWert) {
      [vonWert, bisWert] = [bisWert, vonWert];
    }

    aktiverMonatsFilterVon = vonWert;
    aktiverMonatsFilterBis = bisWert;
    aktiverKindFilterId = matchKind.kind_id;

    if (monatSucheVonInput) monatSucheVonInput.value = vonWert;
    if (monatSucheBisInput) monatSucheBisInput.value = bisWert;

    renderKinderListe();

    const gefunden = springeZuKind(matchKind.kind_id);

    if (!gefunden) {
      alert(`"${matchKind.kind_name}" hat in ${formatiereMonatsbereich(vonWert, bisWert)} keine Hymnen.`);
    }

    return;
  }

  aktiverMonatsFilterVon = "";
  aktiverMonatsFilterBis = "";
  aktiverKindFilterId = null;

  if (monatSucheVonInput) {
    monatSucheVonInput.value = "";
  }

  if (monatSucheBisInput) {
    monatSucheBisInput.value = "";
  }

  renderKinderListe();
  springeZuKind(matchKind.kind_id);
}

function springeZuKind(kindId) {
  const card = document.querySelector(`.kind-card[data-kind-id="${kindId}"]`);

  if (!card) {
    return false;
  }

  oeffneKindCard(card);
  hervorheben(card);
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  return true;
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
  return d.toLocaleDateString("de-DE");
}

function formatDateInput(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  const jahr = d.getFullYear();
  const monat = String(d.getMonth() + 1).padStart(2, "0");
  const tag = String(d.getDate()).padStart(2, "0");

  return `${jahr}-${monat}-${tag}`;
}


function baueKategorieOptionen(selectedValue = "") {
  const ersteOption = `<option value="">Bitte wählen</option>`;

  const optionen = HYMNNEN_KATEGORIEN.map(kategorie => {
    const selected = kategorie === selectedValue ? "selected" : "";
    return `<option value="${escapeAttribute(kategorie)}" ${selected}>${escapeHtml(kategorie)}</option>`;
  }).join("");

  return ersteOption + optionen;
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

suchInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    fuehreSucheAus();
  }
});

const zurueckButton = document.getElementById("zurueckButton");
if (zurueckButton) {
  zurueckButton.addEventListener("click", () => {
    window.location.href = "/main/index.html";
  });
}

const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("email");
    localStorage.removeItem(OPEN_KIND_KEY);
    window.location.href = "/login/login.html";
  });
}

monatSucheButton?.addEventListener("click", fuehreSucheAus);
monatResetButton?.addEventListener("click", resetMonatsFilter);
monatScreenshotButton?.addEventListener("click", screenshotMonatsErgebnis);

monatSucheVonInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    fuehreSucheAus();
  }
});

monatSucheBisInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    fuehreSucheAus();
  }
});

ladeHymnenUebersicht();