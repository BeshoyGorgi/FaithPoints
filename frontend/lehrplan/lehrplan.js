import { API_BASE_URL } from "../config.js";

const KATEGORIEN = [
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

const ordnerListe = document.getElementById("ordnerListe");
const zurueckButton = document.getElementById("zurueckButton");

let aktuellGezogeneHymneId = null;
let aktuellGezogeneKategorie = null;

let daten = leeresDatenObjekt();

init();

function normalisiereDatumFuerInput(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  const d = new Date(value);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatiereDatum(value) {
  if (!value) return "";
  const datum = new Date(`${normalisiereDatumFuerInput(value)}T00:00:00`);
  return datum.toLocaleDateString("de-DE");
}

function formatiereZeitraum(start, end) {
  if (start && end) return `${formatiereDatum(start)} - ${formatiereDatum(end)}`;
  if (start) return `ab ${formatiereDatum(start)}`;
  if (end) return `bis ${formatiereDatum(end)}`;
  return "";
}

async function init() {
  const email = localStorage.getItem("email");

  if (!email) {
    window.location.href = "/login/login.html";
    return;
  }

  await ladeDatenVomServer();
  renderAlleOrdner();
}

function leeresDatenObjekt() {
  const obj = {};
  KATEGORIEN.forEach((kategorie) => {
    obj[kategorie] = [];
  });
  return obj;
}

function ermittleNaechstenSortIndex(kategorie) {
  const offene = (daten[kategorie] || []).filter(item => !item.checked);
  if (offene.length === 0) return 0;
  return Math.max(...offene.map(item => Number(item.sortIndex) || 0)) + 1;
}

function compareErledigteHymnen(a, b) {
  const aStart = a.startDate || "0000-01-01";
  const bStart = b.startDate || "0000-01-01";

  if (aStart !== bStart) {
    return bStart.localeCompare(aStart);
  }

  const aEnd = a.endDate || "0000-01-01";
  const bEnd = b.endDate || "0000-01-01";

  if (aEnd !== bEnd) {
    return bEnd.localeCompare(aEnd);
  }

  return (a.sortIndex || 0) - (b.sortIndex || 0);
}

function sortiereKategorie(kategorie) {
  const alle = [...(daten[kategorie] || [])];

  const erledigt = alle
    .filter(item => item.checked)
    .sort(compareErledigteHymnen);

  const offen = alle
    .filter(item => !item.checked)
    .sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0));

  daten[kategorie] = [...erledigt, ...offen];
}

function holeElementNachPosition(container, y) {
  const elemente = [
    ...container.querySelectorAll(".hymne-row.verschiebbar:not(.dragging)")
  ];

  let naechstes = null;
  let groessterNegativerOffset = Number.NEGATIVE_INFINITY;

  for (const element of elemente) {
    const box = element.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > groessterNegativerOffset) {
      groessterNegativerOffset = offset;
      naechstes = element;
    }
  }

  return naechstes;
}

function uebernehmeOffeneReihenfolgeAusDOM(kategorie, container) {
  const idsInReihenfolge = [
    ...container.querySelectorAll(".hymne-row.verschiebbar")
  ].map(el => Number(el.dataset.id));

  const erledigte = daten[kategorie]
    .filter(item => item.checked)
    .sort(compareErledigteHymnen);

  const offeneMap = new Map(
    daten[kategorie]
      .filter(item => !item.checked)
      .map(item => [Number(item.id), item])
  );

  const offeneNeu = idsInReihenfolge
    .map((id, index) => {
      const item = offeneMap.get(id);
      if (!item) return null;
      item.sortIndex = index;
      return item;
    })
    .filter(Boolean);

  daten[kategorie] = [...erledigte, ...offeneNeu];
}

async function speichereOffeneReihenfolge(kategorie) {
  const email = localStorage.getItem("email");

  const ids = daten[kategorie]
    .filter(item => !item.checked)
    .sort((a, b) => (a.sortIndex || 0) - (b.sortIndex || 0))
    .map(item => item.id);

  const response = await fetch(`${API_BASE_URL}/api/lehrplan/reihenfolge`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      kategorie,
      ids
    })
  });

  if (!response.ok) {
    throw new Error("Fehler beim Speichern der Reihenfolge");
  }
}

async function ladeDatenVomServer() {
  const email = localStorage.getItem("email");

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/lehrplan?email=${encodeURIComponent(email)}`
    );

    if (!response.ok) {
      throw new Error("Fehler beim Laden des Lehrplans");
    }

    const eintraege = await response.json();

    daten = leeresDatenObjekt();

    eintraege.forEach((eintrag) => {
      if (!daten[eintrag.kategorie]) {
        daten[eintrag.kategorie] = [];
      }

      daten[eintrag.kategorie].push({
        id: eintrag.id,
        name: eintrag.titel,
        checked: !!eintrag.erledigt,
        startDate: normalisiereDatumFuerInput(eintrag.start_datum),
        endDate: normalisiereDatumFuerInput(eintrag.end_datum),
        sortIndex: Number(eintrag.sort_index) || 0,
        createdAt: eintrag.created_at
      });
    });
  } catch (error) {
    console.error(error);
    alert("Fehler beim Laden des Lehrplans.");
  }
}

function renderAlleOrdner() {
  ordnerListe.innerHTML = "";

  KATEGORIEN.forEach((kategorie) => {
    const card = baueOrdnerCard(kategorie);
    ordnerListe.appendChild(card);
  });
}

function baueOrdnerCard(kategorie) {
  const card = document.createElement("article");
  card.className = "ordner-card";

  const header = document.createElement("button");
  header.className = "ordner-header";
  header.type = "button";

  const headerLeft = document.createElement("div");
  headerLeft.className = "ordner-header-left";

  const icon = document.createElement("span");
  icon.className = "ordner-icon";

  const name = document.createElement("span");
  name.className = "ordner-name";
  name.textContent = kategorie;

  headerLeft.appendChild(icon);
  headerLeft.appendChild(name);

  const headerRight = document.createElement("div");
  headerRight.className = "ordner-header-right";

  const count = document.createElement("span");
  count.className = "ordner-count";
  count.textContent = `${daten[kategorie].length} Hymnen`;

  const plusButton = document.createElement("button");
  plusButton.className = "plus-button";
  plusButton.type = "button";
  plusButton.textContent = "+";
  plusButton.title = "Neue Hymne hinzufügen";

  headerRight.appendChild(count);
  headerRight.appendChild(plusButton);

  header.appendChild(headerLeft);
  header.appendChild(headerRight);

  const content = document.createElement("div");
  content.className = "ordner-content";

  header.addEventListener("click", () => {
    card.classList.toggle("offen");
  });

  plusButton.addEventListener("click", (event) => {
    event.stopPropagation();
    card.classList.add("offen");
    zeigeAddForm(content, kategorie, count);
  });

  renderOrdnerInhalt(content, kategorie, count);

  card.appendChild(header);
  card.appendChild(content);

  return card;
}

function renderOrdnerInhalt(content, kategorie, countElement) {
  content.innerHTML = "";

  sortiereKategorie(kategorie);

  const hymnen = daten[kategorie];
  countElement.textContent = `${hymnen.length} Hymnen`;

  const erledigte = hymnen.filter(item => item.checked);
  const offene = hymnen.filter(item => !item.checked);

  if (hymnen.length === 0) {
    const emptyText = document.createElement("div");
    emptyText.className = "empty-text";
    emptyText.textContent = "Noch keine Hymnen vorhanden.";
    content.appendChild(emptyText);
  } else {
    if (erledigte.length > 0) {
      const erledigtListe = document.createElement("div");
      erledigtListe.className = "hymnen-liste";

      erledigte.forEach((hymne) => {
        const row = baueHymneRow(hymne, kategorie, content, countElement);
        erledigtListe.appendChild(row);
      });

      content.appendChild(erledigtListe);
    }

    if (offene.length > 0) {
      const offeneListe = document.createElement("div");
      offeneListe.className = "hymnen-liste offen-dropzone";

      offene.forEach((hymne) => {
        const row = baueHymneRow(hymne, kategorie, content, countElement);
        offeneListe.appendChild(row);
      });

      offeneListe.addEventListener("dragover", (event) => {
        if (aktuellGezogeneKategorie !== kategorie) return;

        event.preventDefault();

        const afterElement = holeElementNachPosition(offeneListe, event.clientY);
        const draggingElement = offeneListe.querySelector(
          `.hymne-row[data-id="${aktuellGezogeneHymneId}"]`
        );

        if (!draggingElement) return;

        if (afterElement == null) {
          offeneListe.appendChild(draggingElement);
        } else {
          offeneListe.insertBefore(draggingElement, afterElement);
        }
      });

      offeneListe.addEventListener("drop", async (event) => {
        if (aktuellGezogeneKategorie !== kategorie) return;

        event.preventDefault();

        try {
          uebernehmeOffeneReihenfolgeAusDOM(kategorie, offeneListe);
          await speichereOffeneReihenfolge(kategorie);
          renderOrdnerInhalt(content, kategorie, countElement);
        } catch (error) {
          console.error(error);
          alert("Fehler beim Speichern der Reihenfolge.");
          await ladeDatenVomServer();
          renderOrdnerInhalt(content, kategorie, countElement);
        }
      });

      content.appendChild(offeneListe);
    }
  }

  const hint = document.createElement("div");
  hint.className = "edit-hint";
  hint.textContent = "Tipp: Doppelklick zum Bearbeiten. Offene Hymnen kannst du per Gedrückthalten und Ziehen innerhalb dieser Box verschieben.";

  content.appendChild(hint);
}

function zeigeAddForm(content, kategorie, countElement) {
  const vorhandenesForm = content.querySelector(".add-form");
  if (vorhandenesForm) {
    const input = vorhandenesForm.querySelector(".add-input");
    if (input) input.focus();
    return;
  }

  const form = document.createElement("div");
  form.className = "add-form";

  const input = document.createElement("input");
  input.className = "add-input";
  input.type = "text";
  input.placeholder = "Name der Hymne eingeben";

  const saveButton = document.createElement("button");
  saveButton.className = "save-button";
  saveButton.type = "button";
  saveButton.textContent = "Speichern";

  const cancelButton = document.createElement("button");
  cancelButton.className = "cancel-button";
  cancelButton.type = "button";
  cancelButton.textContent = "Abbrechen";

  form.appendChild(input);
  form.appendChild(saveButton);
  form.appendChild(cancelButton);

  const hint = content.querySelector(".edit-hint");
  if (hint) {
    content.insertBefore(form, hint);
  } else {
    content.appendChild(form);
  }

  input.focus();

  async function speichereNeueHymne() {
    const text = input.value.trim();
    const email = localStorage.getItem("email");

    if (!text) {
      alert("Bitte gib einen Hymnennamen ein.");
      return;
    }

    try {
      saveButton.disabled = true;
      saveButton.textContent = "Speichert...";

      const response = await fetch(`${API_BASE_URL}/api/lehrplan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          kategorie,
          titel: text
        })
      });

      if (!response.ok) {
        throw new Error("Fehler beim Speichern");
      }

      const neuerEintrag = await response.json();

      daten[kategorie].push({
        id: neuerEintrag.id,
        name: neuerEintrag.titel,
        checked: !!neuerEintrag.erledigt,
        startDate: normalisiereDatumFuerInput(neuerEintrag.start_datum),
        endDate: normalisiereDatumFuerInput(neuerEintrag.end_datum),
        sortIndex: Number(neuerEintrag.sort_index) || ermittleNaechstenSortIndex(kategorie),
        createdAt: neuerEintrag.created_at
      });

      renderOrdnerInhalt(content, kategorie, countElement);
    } catch (error) {
      console.error(error);
      alert("Fehler beim Speichern der Hymne.");
      saveButton.disabled = false;
      saveButton.textContent = "Speichern";
    }
  }

  saveButton.addEventListener("click", speichereNeueHymne);

  cancelButton.addEventListener("click", () => {
    form.remove();
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      speichereNeueHymne();
    }
  });
}

function baueHymneRow(hymne, kategorie, content, countElement) {
  const row = document.createElement("div");
  row.className = "hymne-row";
  row.dataset.id = String(hymne.id);

  if (hymne.checked) {
    row.classList.add("erledigt");
  }

  if (!hymne.checked) {
  row.classList.add("verschiebbar");
  row.draggable = true;

  row.addEventListener("dragstart", (event) => {
    aktuellGezogeneHymneId = hymne.id;
    aktuellGezogeneKategorie = kategorie;
    row.classList.add("dragging");

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  });

  row.addEventListener("dragend", () => {
    row.classList.remove("dragging");
    aktuellGezogeneHymneId = null;
    aktuellGezogeneKategorie = null;
  });
}

  const checkbox = document.createElement("input");
  checkbox.className = "hymne-check";
  checkbox.type = "checkbox";
  checkbox.checked = !!hymne.checked;

  const info = document.createElement("div");
  info.className = "hymne-info";

  const titleLine = document.createElement("div");
  titleLine.className = "hymne-title-line";

  const text = document.createElement("span");
  text.className = "hymne-text";
  text.textContent = hymne.name;

  const dateLabel = document.createElement("span");
  dateLabel.className = "hymne-date-label";

  titleLine.appendChild(text);
  titleLine.appendChild(dateLabel);

  const zeitraumBox = document.createElement("div");
  zeitraumBox.className = "zeitraum-box";

  const startInputWrap = document.createElement("div");
  startInputWrap.className = "date-input-wrap";

  const vonInput = document.createElement("input");
  vonInput.type = "date";
  vonInput.className = "date-input";
  vonInput.value = hymne.startDate || "";

  const startPlaceholder = document.createElement("span");
  startPlaceholder.className = "fake-placeholder";
  startPlaceholder.textContent = "Anfangsdatum auswählen...";

  startInputWrap.appendChild(vonInput);
  startInputWrap.appendChild(startPlaceholder);

  const endInputWrap = document.createElement("div");
  endInputWrap.className = "date-input-wrap";

  const bisInput = document.createElement("input");
  bisInput.type = "date";
  bisInput.className = "date-input";
  bisInput.value = hymne.endDate || "";

  const endPlaceholder = document.createElement("span");
  endPlaceholder.className = "fake-placeholder";
  endPlaceholder.textContent = "Enddatum auswählen...";

  endInputWrap.appendChild(bisInput);
  endInputWrap.appendChild(endPlaceholder);

  zeitraumBox.appendChild(startInputWrap);
  zeitraumBox.appendChild(endInputWrap);

  info.appendChild(titleLine);
  info.appendChild(zeitraumBox);

  const actions = document.createElement("div");
  actions.className = "hymne-actions";

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "−";
  deleteButton.title = "Eintrag löschen";
  deleteButton.setAttribute("aria-label", `Eintrag ${hymne.name} löschen`);

  actions.appendChild(deleteButton);

  row.appendChild(checkbox);
  row.appendChild(info);
  row.appendChild(actions);

  function hatVollstaendigenZeitraum() {
  return !!(hymne.startDate && hymne.endDate);
  }

  function aktualisiereDateInputPlaceholder(input) {
    if (input.value) {
      input.classList.remove("show-placeholder");
    } else {
      input.classList.add("show-placeholder");
    }
  }

  function aktualisiereZeitraumAnzeige() {
    const zeitraumText = formatiereZeitraum(hymne.startDate, hymne.endDate);

    if (zeitraumText) {
      dateLabel.textContent = `(${zeitraumText})`;
      dateLabel.style.display = "inline-flex";
    } else {
      dateLabel.textContent = "";
      dateLabel.style.display = "none";
    }

    if (!hymne.checked) {
      zeitraumBox.style.display = "none";
    } else if (hatVollstaendigenZeitraum()) {
      zeitraumBox.style.display = "none";
    } else {
      zeitraumBox.style.display = "flex";
    }

    aktualisiereDateInputPlaceholder(vonInput);
    aktualisiereDateInputPlaceholder(bisInput);
  }

  aktualisiereZeitraumAnzeige();

  checkbox.addEventListener("change", async () => {
    const email = localStorage.getItem("email");
    const vorherChecked = !checkbox.checked;
    const vorherStart = hymne.startDate;
    const vorherEnd = hymne.endDate;
    const vorherSortIndex = hymne.sortIndex;

    try {
      checkbox.disabled = true;
      vonInput.disabled = true;
      bisInput.disabled = true;

      const body = {
        email,
        erledigt: checkbox.checked
      };

      if (!checkbox.checked) {
        body.start_datum = null;
        body.end_datum = null;
        body.sort_index = ermittleNaechstenSortIndex(kategorie);
      }

      const response = await fetch(`${API_BASE_URL}/api/lehrplan/${hymne.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error("Fehler beim Aktualisieren der Checkbox");
      }

      hymne.checked = checkbox.checked;

      if (!checkbox.checked) {
        hymne.startDate = "";
        hymne.endDate = "";
        hymne.sortIndex = body.sort_index;
        vonInput.value = "";
        bisInput.value = "";
      }

     const eintrag = daten[kategorie].find((item) => item.id === hymne.id);
      if (eintrag) {
        eintrag.checked = hymne.checked;
        eintrag.startDate = hymne.startDate;
        eintrag.endDate = hymne.endDate;
        if (!checkbox.checked) {
          eintrag.sortIndex = hymne.sortIndex;
        }
      }

      renderOrdnerInhalt(content, kategorie, countElement);

    } catch (error) {
      console.error(error);
      checkbox.checked = vorherChecked;
      hymne.checked = vorherChecked;
      hymne.startDate = vorherStart;
      hymne.endDate = vorherEnd;
      hymne.sortIndex = vorherSortIndex;
      vonInput.value = vorherStart || "";
      bisInput.value = vorherEnd || "";
      row.classList.toggle("erledigt", vorherChecked);
      aktualisiereZeitraumAnzeige();

      const eintrag = daten[kategorie].find((item) => item.id === hymne.id);
      if (eintrag) {
        eintrag.checked = vorherChecked;
        eintrag.startDate = vorherStart;
        eintrag.endDate = vorherEnd;
        eintrag.sortIndex = vorherSortIndex;
      }

      renderOrdnerInhalt(content, kategorie, countElement);
      alert("Fehler beim Speichern der Checkbox.");

    } finally {
      checkbox.disabled = false;
      vonInput.disabled = false;
      bisInput.disabled = false;
    }
  });

  async function speichereZeitraum() {
    if (!checkbox.checked) return;

    const email = localStorage.getItem("email");
    const neuesStart = vonInput.value || null;
    const neuesEnde = bisInput.value || null;

    if (neuesStart && neuesEnde && neuesStart > neuesEnde) {
      alert("Das Von-Datum darf nicht nach dem Bis-Datum liegen.");
      vonInput.value = hymne.startDate || "";
      bisInput.value = hymne.endDate || "";
      return;
    }

    const vorherStart = hymne.startDate;
    const vorherEnd = hymne.endDate;

    try {
      vonInput.disabled = true;
      bisInput.disabled = true;

      const response = await fetch(`${API_BASE_URL}/api/lehrplan/${hymne.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          erledigt: true,
          start_datum: neuesStart,
          end_datum: neuesEnde
        })
      });

      if (!response.ok) {
        throw new Error("Fehler beim Speichern des Zeitraums");
      }

      hymne.startDate = neuesStart || "";
      hymne.endDate = neuesEnde || "";

      const eintrag = daten[kategorie].find((item) => item.id === hymne.id);
      if (eintrag) {
        eintrag.startDate = hymne.startDate;
        eintrag.endDate = hymne.endDate;
        eintrag.checked = true;
      }

      aktualisiereZeitraumAnzeige();
      renderOrdnerInhalt(content, kategorie, countElement);
    } catch (error) {
      console.error(error);
      hymne.startDate = vorherStart;
      hymne.endDate = vorherEnd;
      vonInput.value = vorherStart || "";
      bisInput.value = vorherEnd || "";
      aktualisiereZeitraumAnzeige();
      renderOrdnerInhalt(content, kategorie, countElement);
      alert("Fehler beim Speichern des Datums.");
    } finally {
      vonInput.disabled = false;
      bisInput.disabled = false;
    }
  }

  vonInput.addEventListener("change", speichereZeitraum);
  bisInput.addEventListener("change", speichereZeitraum);

  deleteButton.addEventListener("click", async () => {
    const bestaetigt = confirm(`Möchtest du "${hymne.name}" wirklich löschen?`);
    if (!bestaetigt) return;

    const email = localStorage.getItem("email");

    try {
      deleteButton.disabled = true;

      const response = await fetch(
        `${API_BASE_URL}/api/lehrplan/${hymne.id}?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Fehler beim Löschen");
      }

      daten[kategorie] = daten[kategorie].filter((item) => item.id !== hymne.id);
      renderOrdnerInhalt(content, kategorie, countElement);
    } catch (error) {
      console.error(error);
      deleteButton.disabled = false;
      alert("Fehler beim Löschen der Hymne.");
    }
  });

  text.addEventListener("dblclick", () => {
    starteBearbeitung(text, hymne, kategorie, content, countElement);
  });

  return row;
}

function starteBearbeitung(textElement, hymne, kategorie, content, countElement) {
  const row = textElement.closest(".hymne-row");
  const textParent = textElement.parentElement;

  if (!row || !textParent) return;

  const alterText = hymne.name;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "hymne-edit-input";
  input.value = alterText;

  const actions = row.querySelector(".hymne-actions");
  if (!actions) return;

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.className = "edit-save-button";
  saveButton.textContent = "Speichern";

  const deleteButton = actions.querySelector(".delete-button");
  if (deleteButton) {
    deleteButton.style.display = "none";
  }

  actions.prepend(saveButton);
  textParent.replaceChild(input, textElement);

  input.focus();
  input.select();

let fertig = false;

saveButton.addEventListener("mousedown", (event) => {
  event.preventDefault();
});

async function beenden(uebernehmen) {
  if (fertig) return;

  const neuerText = input.value.trim();

  if (!uebernehmen) {
    fertig = true;
    renderOrdnerInhalt(content, kategorie, countElement);
    return;
  }

  if (!neuerText) {
    fertig = true;
    alert("Der Name darf nicht leer sein.");
    renderOrdnerInhalt(content, kategorie, countElement);
    return;
  }

  fertig = true;
  const email = localStorage.getItem("email");

  try {
    const response = await fetch(`${API_BASE_URL}/api/lehrplan/${hymne.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        titel: neuerText
      })
    });

    if (!response.ok) {
      throw new Error("Fehler beim Bearbeiten");
    }

    const eintrag = daten[kategorie].find((item) => item.id === hymne.id);
    if (eintrag) {
      eintrag.name = neuerText;
    }

    renderOrdnerInhalt(content, kategorie, countElement);
  } catch (error) {
    console.error(error);
    alert("Fehler beim Bearbeiten der Hymne.");
    fertig = false;
    input.focus();
  }
}

saveButton.addEventListener("click", () => beenden(true));

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    beenden(true);
  }

  if (event.key === "Escape") {
    event.preventDefault();
    beenden(false);
  }
});

input.addEventListener("blur", () => {
  beenden(false);
});
}

if (zurueckButton) {
  zurueckButton.addEventListener("click", () => {
    window.location.href = "/hymnen/hymnen.html";
  });
}