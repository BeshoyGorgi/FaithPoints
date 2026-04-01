const STORAGE_KEY = "lehrplan_hymnen_frontend";

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

let daten = ladeDaten();

renderAlleOrdner();

function ladeDaten() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw) {
    try {
      const parsed = JSON.parse(raw);

      KATEGORIEN.forEach((kategorie) => {
        if (!Array.isArray(parsed[kategorie])) {
          parsed[kategorie] = [];
        }
      });

      return parsed;
    } catch (error) {
      console.error("Fehler beim Laden aus localStorage:", error);
    }
  }

  const startDaten = {};
  KATEGORIEN.forEach((kategorie) => {
    startDaten[kategorie] = [];
  });
  return startDaten;
}

function speichereDaten() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(daten));
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

  const hymnen = daten[kategorie];
  countElement.textContent = `${hymnen.length} Hymnen`;

  const liste = document.createElement("div");
  liste.className = "hymnen-liste";

  if (hymnen.length === 0) {
    const emptyText = document.createElement("div");
    emptyText.className = "empty-text";
    emptyText.textContent = "Noch keine Hymnen vorhanden.";
    content.appendChild(emptyText);
  } else {
    hymnen.forEach((hymne) => {
      const row = baueHymneRow(hymne, kategorie, content, countElement);
      liste.appendChild(row);
    });

    content.appendChild(liste);
  }

  const hint = document.createElement("div");
  hint.className = "edit-hint";
  hint.textContent = "Tipp: Doppelklick auf einen Hymnennamen zum Bearbeiten.";

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

  function speichereNeueHymne() {
    const text = input.value.trim();

    if (!text) {
      alert("Bitte gib einen Hymnennamen ein.");
      return;
    }

    daten[kategorie].push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      name: text,
      checked: false
    });

    speichereDaten();
    renderOrdnerInhalt(content, kategorie, countElement);
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

  if (hymne.checked) {
    row.classList.add("erledigt");
  }

  const checkbox = document.createElement("input");
  checkbox.className = "hymne-check";
  checkbox.type = "checkbox";
  checkbox.checked = !!hymne.checked;

  const text = document.createElement("span");
  text.className = "hymne-text";
  text.textContent = hymne.name;

  const actions = document.createElement("div");
  actions.className = "hymne-actions";

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "Löschen";

  actions.appendChild(deleteButton);

  row.appendChild(checkbox);
  row.appendChild(text);
  row.appendChild(actions);

  checkbox.addEventListener("change", () => {
    const eintrag = daten[kategorie].find((item) => item.id === hymne.id);
    if (!eintrag) return;

    eintrag.checked = checkbox.checked;
    speichereDaten();

    if (checkbox.checked) {
      row.classList.add("erledigt");
    } else {
      row.classList.remove("erledigt");
    }
  });

  deleteButton.addEventListener("click", () => {
    const bestaetigt = confirm(`Möchtest du "${hymne.name}" wirklich löschen?`);
    if (!bestaetigt) return;

    daten[kategorie] = daten[kategorie].filter((item) => item.id !== hymne.id);
    speichereDaten();
    renderOrdnerInhalt(content, kategorie, countElement);
  });

  text.addEventListener("dblclick", () => {
    starteBearbeitung(text, hymne, kategorie, content, countElement);
  });

  return row;
}

function starteBearbeitung(textElement, hymne, kategorie, content, countElement) {
  const row = textElement.parentElement;
  if (!row) return;

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
  row.replaceChild(input, textElement);

  input.focus();
  input.select();

  function beenden(uebernehmen) {
    const neuerText = input.value.trim();

    if (uebernehmen) {
      if (!neuerText) {
        alert("Der Name darf nicht leer sein.");
        input.focus();
        return;
      }

      const eintrag = daten[kategorie].find((item) => item.id === hymne.id);
      if (eintrag) {
        eintrag.name = neuerText;
        speichereDaten();
      }
    }

    renderOrdnerInhalt(content, kategorie, countElement);
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
    beenden(true);
  });
}

const zurueckButton = document.getElementById("zurueckButton");

if (zurueckButton) {
  zurueckButton.addEventListener("click", () => {
    window.location.href = "/hymnen/hymnen.html";
  });
}