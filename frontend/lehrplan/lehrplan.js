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

let daten = leeresDatenObjekt();

init();

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
        checked: !!eintrag.erledigt
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
  icon.textContent = "📁";

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
        checked: !!neuerEintrag.erledigt
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

  checkbox.addEventListener("change", async () => {
    const email = localStorage.getItem("email");
    const vorher = !checkbox.checked;

    try {
      checkbox.disabled = true;

      const response = await fetch(`${API_BASE_URL}/api/lehrplan/${hymne.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          erledigt: checkbox.checked
        })
      });

      if (!response.ok) {
        throw new Error("Fehler beim Aktualisieren der Checkbox");
      }

      const eintrag = daten[kategorie].find((item) => item.id === hymne.id);
      if (eintrag) {
        eintrag.checked = checkbox.checked;
      }

      if (checkbox.checked) {
        row.classList.add("erledigt");
      } else {
        row.classList.remove("erledigt");
      }
    } catch (error) {
      console.error(error);
      checkbox.checked = vorher;
      alert("Fehler beim Speichern der Checkbox.");
    } finally {
      checkbox.disabled = false;
    }
  });

  deleteButton.addEventListener("click", async () => {
    const bestaetigt = confirm(`Möchtest du "${hymne.name}" wirklich löschen?`);
    if (!bestaetigt) return;

    const email = localStorage.getItem("email");

    try {
      deleteButton.disabled = true;
      deleteButton.textContent = "Löscht...";

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
      deleteButton.textContent = "Löschen";
      alert("Fehler beim Löschen der Hymne.");
    }
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

  let fertig = false;

  async function beenden(uebernehmen) {
    if (fertig) return;
    fertig = true;

    const neuerText = input.value.trim();
    const email = localStorage.getItem("email");

    if (!uebernehmen) {
      renderOrdnerInhalt(content, kategorie, countElement);
      return;
    }

    if (!neuerText) {
      alert("Der Name darf nicht leer sein.");
      fertig = false;
      input.focus();
      return;
    }

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
    beenden(true);
  });
}

if (zurueckButton) {
  zurueckButton.addEventListener("click", () => {
    window.location.href = "/hymnen/hymnen.html";
  });
}