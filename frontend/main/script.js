import { API_BASE_URL } from "../config.js";
import { STUFEN_MAP } from "../config.js";

const plusButton = document.getElementById("addRow");
const minusButton = document.getElementById("removeColumn");
const punkteMenue = document.getElementById("punkteMenue");
const tabelle = document.getElementById("meineTabelle");
const tbody = tabelle.querySelector("tbody");

const ORANGE_AFTER_MINUTES = 7 * 24 * 60;  // 14 * 24 * 60   2 Wochen
const RED_AFTER_MINUTES = 14 * 24 * 60;    //  28 * 24 * 60   4 Wochen

let aktiveZelle = null;


const email = localStorage.getItem("email");
const stufenAnzeige = document.getElementById("stufenAnzeige");

if (email && stufenAnzeige) {
  stufenAnzeige.textContent = STUFEN_MAP[email] || "Unbekannte Stufe";
}



// === Farbe nach zeit ändern ===
function updateCellColor(row) {
  const now = Date.now();

  const zellen = {
    hymne: row.children[1],
    verhalten: row.children[2],       // bleibt neutral
    anwesenheit_G: row.children[3],
    anwesenheit_U: row.children[4],
  };

  // Differenzen in Minuten berechnen
  const diffHymne = row.dataset.lastUpdatedHymne ? (now - new Date(row.dataset.lastUpdatedHymne)) / (1000 * 60) : 0;
  const diffAnwG = row.dataset.lastUpdatedAnwesenheitG ? (now - new Date(row.dataset.lastUpdatedAnwesenheitG)) / (1000 * 60) : 0;
  const diffAnwU = row.dataset.lastUpdatedAnwesenheitU ? (now - new Date(row.dataset.lastUpdatedAnwesenheitU)) / (1000 * 60) : 0;

  // Funktion für Farbupdate, aber NUR wenn keine manuelle Änderung passiert ist
  const setColor = (cell, diff) => {
    if (cell.dataset.manualReset === "true") return; // manuell geändert → Farbe bleibt neutral
    if (diff >= RED_AFTER_MINUTES) cell.style.backgroundColor = "red";
    else if (diff >= ORANGE_AFTER_MINUTES) cell.style.backgroundColor = "orange";
    else cell.style.backgroundColor = ""; // sonst neutral
  };


  setColor(zellen.hymne, diffHymne);
  setColor(zellen.anwesenheit_G, diffAnwG);
  setColor(zellen.anwesenheit_U, diffAnwU);
}


// Prüft alle 10 Sekunden, ob sich die Farbe ändern muss
setInterval(() => {
  tbody.querySelectorAll("tr").forEach(row => updateCellColor(row));
}, 10000); // 10000ms = 10 Sekunden


// === Kinder aus DB laden ===

async function ladeKinder() {
  try {
    const email = localStorage.getItem("email"); 
    const response = await fetch(`${API_BASE_URL}/api/kinder?email=${email}`);
    const kinder = await response.json();
    tbody.innerHTML = ""; // Tabelle vorher leeren
    kinder.forEach(k => {
    const neueZeile = document.createElement("tr");
    neueZeile.dataset.id = k.id;

    neueZeile.dataset.lastUpdatedHymne = k.last_updated_hymne;
    neueZeile.dataset.lastUpdatedAnwesenheitG = k.last_updated_anwesenheit_g;
    neueZeile.dataset.lastUpdatedAnwesenheitU = k.last_updated_anwesenheit_u;

    
    neueZeile.innerHTML = `
      <td>${k.name}</td>
      <td>${k.hymne}</td>
      <td>${k.verhalten}</td>
      <td>${k.anwesenheit_G}</td>
      <td>${k.anwesenheit_U}</td>
      <td>${k.gesamt}</td>
    `;
    // erst manualReset setzen
    neueZeile.querySelectorAll("td").forEach(td => td.dataset.manualReset = "false");

    // dann Farbe setzen
    updateCellColor(neueZeile);

    tbody.appendChild(neueZeile);
  });

    markiereHoverbareZellen();
    sortiereNachGesamt();
  } catch (err) {
    console.error("Fehler beim Laden der Kinder:", err);
  }
}

ladeKinder(); // Direkt aufrufen

// === Kind hinzufügen ===
plusButton?.addEventListener("click", async () => {
  const name = prompt("Wie heißt das neue Kind?");
  if (!name || name.trim() === "") return;

  const existierendeZeile = Array.from(tbody.querySelectorAll("tr")).find(
    z => z.children[0].textContent.trim().toLowerCase() === name.trim().toLowerCase()
  );
  if (existierendeZeile) {
    alert(`Dieses Kind "${name}" ist schon vorhanden!`);
    existierendeZeile.classList.add("duplicate");
    setTimeout(() => existierendeZeile.classList.remove("duplicate"), 1500);
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/kinder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email: localStorage.getItem("email") })
    });
    const result = await response.json();

    if (response.ok) {
      const neueZeile = document.createElement("tr");
      neueZeile.dataset.id = result.id;

      // NEU: Timestamps initialisieren
      neueZeile.dataset.lastUpdatedHymne = new Date();
      neueZeile.dataset.lastUpdatedAnwesenheitG = new Date();
      neueZeile.dataset.lastUpdatedAnwesenheitU = new Date();

      neueZeile.innerHTML = `
        <td>${result.name}</td>
        <td>${result.hymne}</td>
        <td>${result.verhalten}</td>
        <td>${result.anwesenheit_G}</td>
        <td>${result.anwesenheit_U}</td>
        <td>${result.gesamt}</td>
      `;
      tbody.appendChild(neueZeile);
      markiereHoverbareZellen();
      sortiereNachGesamt();
    } else {
      alert(result.error || "Fehler beim Hinzufügen des Kindes.");
    }
  } catch (err) {
    console.error("Fehler:", err);
    alert("Fehler bei der Verbindung zum Server.");
  }
});

// === Kind löschen ===
minusButton?.addEventListener("click", async () => {
  const name = prompt("Wie heißt das Kind, das du löschen möchtest?");
  if (!name || name.trim() === "") return;

  const zeilen = Array.from(tbody.querySelectorAll("tr"));
  const zeile = zeilen.find(z => z.children[0].textContent.trim().toLowerCase() === name.trim().toLowerCase());
  if (!zeile) { alert(`Kein Kind mit dem Namen "${name}" gefunden.`); return; }

  const id = zeile.dataset.id;
  if (!id) { alert("Fehler: Keine ID gefunden."); return; }

  try {
    const response = await fetch(`${API_BASE_URL}/api/kinder/${id}`, { method: "DELETE" });
    if (response.ok) {
      zeile.remove();
      alert(`Das Kind "${name}" wurde gelöscht.`);
    } else {
      const result = await response.json();
      alert(result.error || "Fehler beim Löschen.");
    }
  } catch (err) {
    console.error("Fehler:", err);
    alert("Fehler bei der Verbindung zum Server.");
  }
});

// === Klick auf Punkte-Zelle + Punkte-Menü ===
tabelle.addEventListener("click", (e) => {
  const zelle = e.target.closest("td");
  if (!zelle) return;

  const spaltenIndex = zelle.cellIndex;
  const anzahlSpalten = tabelle.rows[0].cells.length;
  if (spaltenIndex === 0 || spaltenIndex === anzahlSpalten - 1) return;

  aktiveZelle = zelle;
  const alleButtons = punkteMenue.querySelectorAll("button");
  alleButtons.forEach(btn => btn.style.display = "none");

  if (spaltenIndex === 1) zeigeButtons([20, -20, 10, -10]);
  else if (spaltenIndex === 2) zeigeButtons([10, -10, 5, -5]);
  else if (spaltenIndex === 3 || spaltenIndex === 4) zeigeButtons([5, -5]);

  const rect = zelle.getBoundingClientRect();
  punkteMenue.style.top = `${rect.bottom + window.scrollY + 5}px`;
  punkteMenue.style.left = `${rect.left + window.scrollX}px`;
  punkteMenue.classList.remove("hidden");
});

function zeigeButtons(werte) {
  werte.forEach(wert => {
    const btn = punkteMenue.querySelector(`button[data-wert="${wert}"]`);
    if (btn) btn.style.display = "inline-block";
  });
}

// === Punkte-Menü Klick ===
punkteMenue.addEventListener("click", async (e) => {
  const button = e.target.closest("button");
  if (!button || !aktiveZelle) return;

  const wert = parseInt(button.dataset.wert);
  const aktuellerWert = parseInt(aktiveZelle.textContent) || 0;
  aktiveZelle.textContent = aktuellerWert + wert;

  const zeile = aktiveZelle.parentElement;
  aktualisiereGesamt(zeile);

  const id = zeile.dataset.id;
  try {
    await fetch(`${API_BASE_URL}/api/kinder/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: zeile.children[0].textContent.trim(),
        hymne: Number(zeile.children[1].textContent) || 0,
        verhalten: Number(zeile.children[2].textContent) || 0,
        anwesenheit_G: Number(zeile.children[3].textContent) || 0,
        anwesenheit_U: Number(zeile.children[4].textContent) || 0,
        gesamt: Number(zeile.children[5].textContent) || 0
      }),
    });

    // **Timestamp sofort auf jetzt setzen**
    const spaltenIndex = aktiveZelle.cellIndex;
    const jetzt = new Date();

    // Payload für DB
    let payload = {
      name: zeile.children[0].textContent.trim(),
      hymne: Number(zeile.children[1].textContent) || 0,
      verhalten: Number(zeile.children[2].textContent) || 0,
      anwesenheit_G: Number(zeile.children[3].textContent) || 0,
      anwesenheit_U: Number(zeile.children[4].textContent) || 0,
      gesamt: Number(zeile.children[5].textContent) || 0
    };

    // Timestamp nur für die geänderte Spalte setzen
    if (spaltenIndex === 1) payload.lastUpdatedHymne = jetzt;
    if (spaltenIndex === 3) payload.lastUpdatedAnwesenheitG = jetzt;
    if (spaltenIndex === 4) payload.lastUpdatedAnwesenheitU = jetzt;

    // Update in DB
    await fetch(`${API_BASE_URL}/api/kinder/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Timestamp auch im DOM speichern
    if (spaltenIndex === 1) zeile.dataset.lastUpdatedHymne = jetzt;
    if (spaltenIndex === 3) zeile.dataset.lastUpdatedAnwesenheitG = jetzt;
    if (spaltenIndex === 4) zeile.dataset.lastUpdatedAnwesenheitU = jetzt;


    // **Hintergrund neutral setzen**
    aktiveZelle.style.backgroundColor = "";
    // manualReset muss false sein, damit Zeit wieder zählt
    aktiveZelle.dataset.manualReset = "false";

    updateCellColor(zeile); // Farbe sofort neu berechnen

  } catch (err) {
    console.error("Fehler beim Speichern der Punkte:", err);
  }

  sortiereNachGesamt();
  punkteMenue.classList.add("hidden");
  aktiveZelle = null;
});


// === Name bearbeiten bei Doppelklick ===
tabelle.addEventListener("dblclick", (e) => {
  const zelle = e.target.closest("td");
  if (!zelle || zelle.cellIndex !== 0) return; // nur erste Spalte

  const alterText = zelle.textContent;
  zelle.contentEditable = "true";
  zelle.focus();

  const range = document.createRange();
  range.selectNodeContents(zelle);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  const beenden = async () => {
    zelle.contentEditable = "false";
    const neueName = zelle.textContent.trim();
    if (neueName && neueName !== alterText) {
      const id = zelle.parentElement.dataset.id;
      try {
        const response = await fetch(`${API_BASE_URL}/api/kinder/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: neueName })
        });
        if (!response.ok) {
          const result = await response.json();
          alert(result.error || "Fehler beim Speichern des neuen Namens.");
          zelle.textContent = alterText;
        }
      } catch (err) {
        console.error("Fehler beim Speichern des Namens:", err);
        alert("Fehler bei der Verbindung zum Server.");
        zelle.textContent = alterText;
      }
    }
    zelle.removeEventListener("blur", beenden);
    zelle.removeEventListener("keydown", handleEnter);
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      beenden();
    } else if (event.key === "Escape") {
      zelle.textContent = alterText;
      beenden();
    }
  };

  zelle.addEventListener("blur", beenden);
  zelle.addEventListener("keydown", handleEnter);
});


// === Zahlen manuell ändern bei Doppelklick (außer Name und Gesamt) ===
tabelle.addEventListener("dblclick", (e) => {
  const zelle = e.target.closest("td");
  if (!zelle) return;

  const spaltenIndex = zelle.cellIndex;
  const anzahlSpalten = tabelle.rows[0].cells.length;

  // Name-Spalte (0) und Gesamt-Spalte (letzte) ignorieren
  if (spaltenIndex === 0 || spaltenIndex === anzahlSpalten - 1) return;

  const alterWert = zelle.textContent;

  zelle.contentEditable = "true";
  zelle.focus();

  // Text markieren
  const range = document.createRange();
  range.selectNodeContents(zelle);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  const beenden = async () => {
    zelle.contentEditable = "false";

    // Wert sicher in Zahl umwandeln
    zelle.textContent = Number(zelle.textContent) || 0;

    const zeile = zelle.parentElement;
    aktualisiereGesamt(zeile);

    const id = zeile.dataset.id;
    try {
      await fetch(`${API_BASE_URL}/api/kinder/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: zeile.children[0].textContent.trim(),
          hymne: Number(zeile.children[1].textContent) || 0,
          verhalten: Number(zeile.children[2].textContent) || 0,
          anwesenheit_G: Number(zeile.children[3].textContent) || 0,
          anwesenheit_U: Number(zeile.children[4].textContent) || 0,
          gesamt: Number(zeile.children[5].textContent) || 0
        }),
      });
      const spaltenIndex = zelle.cellIndex;
      const jetzt = new Date();

      // Payload für DB
      let payload = {
        name: zeile.children[0].textContent.trim(),
        hymne: Number(zeile.children[1].textContent) || 0,
        verhalten: Number(zeile.children[2].textContent) || 0,
        anwesenheit_G: Number(zeile.children[3].textContent) || 0,
        anwesenheit_U: Number(zeile.children[4].textContent) || 0,
        gesamt: Number(zeile.children[5].textContent) || 0
      };

      // Timestamp nur für geänderte Spalte setzen
      if (spaltenIndex === 1) payload.lastUpdatedHymne = jetzt;
      if (spaltenIndex === 3) payload.lastUpdatedAnwesenheitG = jetzt;
      if (spaltenIndex === 4) payload.lastUpdatedAnwesenheitU = jetzt;

      // Update in DB
      await fetch(`${API_BASE_URL}/api/kinder/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Timestamp auch im DOM speichern
      if (spaltenIndex === 1) zeile.dataset.lastUpdatedHymne = jetzt;
      if (spaltenIndex === 3) zeile.dataset.lastUpdatedAnwesenheitG = jetzt;
      if (spaltenIndex === 4) zeile.dataset.lastUpdatedAnwesenheitU = jetzt;

     
      // Wenn Zelle neu geändert wurde, darf sie später wieder automatisch orange/rot werden
      aktiveZelle.dataset.manualReset = "false";

      updateCellColor(zeile); // Farbe sofort neu berechnen


    } catch (err) {
      console.error("Fehler beim Speichern der Punkte:", err);
      alert("Fehler bei der Verbindung zum Server.");
      zelle.textContent = alterWert;
    }

    zelle.removeEventListener("blur", beenden);
    zelle.removeEventListener("keydown", handleEnter);
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // kein Zeilenumbruch
      beenden();
    } else if (event.key === "Escape") {
      zelle.textContent = alterWert; // Änderung verwerfen
      beenden();
    }
  };

  zelle.addEventListener("blur", beenden);
  zelle.addEventListener("keydown", handleEnter);
});



// === Menü schließen bei Klick außerhalb ===
document.addEventListener("click", e => {
  if (!punkteMenue.contains(e.target) && !tabelle.contains(e.target)) {
    punkteMenue.classList.add("hidden");
    aktiveZelle = null;
  }
});

// === Gesamtpunkte aktualisieren ===
function aktualisiereGesamt(zeile) {
  const zellen = zeile.querySelectorAll("td");
  let summe = 0;
  for (let i = 1; i < zellen.length - 1; i++) {
    summe += parseInt(zellen[i].textContent) || 0;
  }
  zellen[zellen.length - 1].textContent = summe;
  zeile.style.backgroundColor = "#d4edda";
  setTimeout(() => zeile.style.backgroundColor = "", 500);
  sortiereNachGesamt();
}

// === Hoverbare Zellen markieren ===
function markiereHoverbareZellen() {
  tbody.querySelectorAll("tr").forEach(tr => {
    const zellen = tr.querySelectorAll("td");
    zellen.forEach((td, i) => {
      if (i !== 0 && i !== zellen.length - 1) td.classList.add("punkte-zelle");
    });
  });
}
markiereHoverbareZellen();


// === Hover über Hymne / Anwesenheit ===
const tooltip = document.getElementById("customTooltip");

tabelle.addEventListener("mousemove", (e) => {
  const zelle = e.target.closest("td");
  if (!zelle) {
    tooltip.style.opacity = 0;
    return;
  }

  const zeile = zelle.parentElement;
  const spalte = zelle.cellIndex;

  // Nur bei Hymne (1), Anwesenheit G (3) und Anwesenheit U (4)
  if (![1, 3, 4].includes(spalte)) {
    tooltip.style.opacity = 0;
    return;
  }

  // Nur anzeigen, wenn die Zelle orange oder rot ist
  const bg = zelle.style.backgroundColor;
  if (bg !== "orange" && bg !== "red") {
    tooltip.style.opacity = 0;
    return;
  }

  // Datum ermitteln
  let datum = null;
  if (spalte === 1 && zeile.dataset.lastUpdatedHymne)
    datum = zeile.dataset.lastUpdatedHymne;
  if (spalte === 3 && zeile.dataset.lastUpdatedAnwesenheitG)
    datum = zeile.dataset.lastUpdatedAnwesenheitG;
  if (spalte === 4 && zeile.dataset.lastUpdatedAnwesenheitU)
    datum = zeile.dataset.lastUpdatedAnwesenheitU;

  // Tooltip anzeigen
  if (datum) {
    tooltip.textContent = `Letzte Änderung: ${new Date(datum).toLocaleString("de-DE")}`;
    tooltip.style.opacity = 1;
    tooltip.style.top = `${e.pageY - 35}px`;
    tooltip.style.left = `${e.pageX + 10}px`;
  } else {
    tooltip.style.opacity = 0;
  }
});

// Tooltip ausblenden, wenn man die Tabelle verlässt
tabelle.addEventListener("mouseleave", () => {
  tooltip.style.opacity = 0;
});



// === Tabelle sortieren ===
function sortiereNachGesamt() {
  const zeilen = Array.from(tbody.querySelectorAll("tr"));
  zeilen.sort((a, b) => parseInt(b.children[5].textContent) - parseInt(a.children[5].textContent));
  zeilen.forEach(z => tbody.appendChild(z));
}

// === Navigation zur Details-Seite ===
document.getElementById("zuDetails")?.addEventListener("click", () => {
  window.location.href = "/details/details.html";
});

// === Logout ===
document.getElementById("logoutButton")?.addEventListener("click", () => {
  localStorage.removeItem("email");
  window.location.href = "/login/login.html";
});


// ====== SUCHFUNKTION ======
const searchInput = document.getElementById("kinderSearch");
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;

    const rows = Array.from(tbody.querySelectorAll("tr"));
    const match = rows.find(row => row.children[0].textContent.toLowerCase().includes(query));

    if (match) {
      match.scrollIntoView({ behavior: "smooth", block: "center" });
      match.style.backgroundColor = "#ffff99"; 
      setTimeout(() => match.style.backgroundColor = "", 2000);
    } else {
      alert(`Kein Kind mit Namen "${searchInput.value}" gefunden.`);
    }
  }
});