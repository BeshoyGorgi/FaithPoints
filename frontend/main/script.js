const plusButton = document.getElementById("addRow");
const minusButton = document.getElementById("removeColumn");
const punkteMenue = document.getElementById("punkteMenue");
const tabelle = document.getElementById("meineTabelle");
const tbody = tabelle.querySelector("tbody");

let aktiveZelle = null;

// === Kinder aus DB laden ===
async function ladeKinder() {
  try {
    const response = await fetch("http://localhost:3000/api/kinder");
    const kinder = await response.json();
    kinder.forEach(k => {
      const neueZeile = document.createElement("tr");
      neueZeile.dataset.id = k.id; // <-- ID speichern
      neueZeile.innerHTML = `
        <td>${k.name}</td>
        <td>${k.hymne}</td>
        <td>${k.verhalten}</td>
        <td>${k.anwesenheit_G}</td>
        <td>${k.anwesenheit_U}</td>
        <td>${k.gesamt}</td>
      `;
      tbody.appendChild(neueZeile);
    });
    markiereHoverbareZellen();
    sortiereNachGesamt();
  } catch (err) {
    console.error("Fehler beim Laden der Kinder:", err);
  }
}

ladeKinder(); // Funktion direkt aufrufen


// === Kind hinzufügen ===
plusButton?.addEventListener("click", async () => {
  if (role === "guest") return; // Gäste blockieren
  const name = prompt("Wie heißt das neue Kind?");
  if (!name || name.trim() === "") return;

  // Prüfen, ob der Name bereits existiert
  const existierendeZeile = Array.from(tbody.querySelectorAll("tr")).find(
    (zeile) => zeile.children[0].textContent.trim().toLowerCase() === name.trim().toLowerCase()
  );

  if (existierendeZeile) {
    alert(`Dieses Kind "${name}" ist schon vorhanden!`);
    existierendeZeile.classList.add("duplicate");
    setTimeout(() => existierendeZeile.classList.remove("duplicate"), 1500);
    return;
  }

  try {
    // Backend-Anfrage, um Kind in DB zu speichern
    const response = await fetch("http://localhost:3000/api/kinder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    const result = await response.json();

    if (response.ok) {
      // Neues Kind aus DB-Antwort in Tabelle einfügen
      const neueZeile = document.createElement("tr");
      neueZeile.dataset.id = result.id; // <-- hier speichern wir die ID des Kindes
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
  if (role === "guest") return; // Gäste blockieren
  const name = prompt("Wie heißt das Kind, das du löschen möchtest?");
  if (!name || name.trim() === "") return;

  // Finde die Zeile lokal
  const zeilen = Array.from(tbody.querySelectorAll("tr"));
  const zeile = zeilen.find(z => z.children[0].textContent.trim().toLowerCase() === name.trim().toLowerCase());

  if (!zeile) {
    alert(`Kein Kind mit dem Namen "${name}" gefunden.`);
    return;
  }

  // ID aus dataset.id
  const id = zeile.dataset.id;
  if (!id) {
    alert("Fehler: Keine ID gefunden. Kind konnte nicht gelöscht werden.");
    return;
  }

  try {
    // DELETE-Anfrage an das Backend
    const response = await fetch(`http://localhost:3000/api/kinder/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // Zeile aus Tabelle entfernen
      zeile.remove();
      alert(`Das Kind "${name}" wurde gelöscht.`);
    } else {
      const result = await response.json();
      alert(result.error || "Fehler beim Löschen des Kindes.");
    }
  } catch (err) {
    console.error("Fehler:", err);
    alert("Fehler bei der Verbindung zum Server.");
  }
});



// === Klick auf Punkte-Zelle +20,-20 +10, ...===
tabelle.addEventListener("click", (e) => {
  if (role === "guest") return; // Gäste können keine Punkte ändern
  const zelle = e.target.closest("td");
  if (!zelle) return;

  const spaltenIndex = zelle.cellIndex;
  const anzahlSpalten = tabelle.rows[0].cells.length;

  // Spalte 0 (Name) und letzte Spalte (Gesamt) ignorieren
  if (spaltenIndex === 0 || spaltenIndex === anzahlSpalten - 1) return;

  aktiveZelle = zelle;

  // === Dynamisch erlaubte Buttons anzeigen ===
  const alleButtons = punkteMenue.querySelectorAll("button");
  alleButtons.forEach(btn => btn.style.display = "none"); // erst alle verstecken

  if (spaltenIndex === 1) {
    // Hymne-Spalte
    zeigeButtons([20, -20, 10, -10]);
  } else if (spaltenIndex === 2) {
    // Verhalten-Spalte
    zeigeButtons([10, -10, 5, -5]);
  } else if (spaltenIndex === 3 || spaltenIndex === 4) {
    // Anwesenheit G / U
    zeigeButtons([5, -5]);
  }

  // Menüposition berechnen
  const rect = zelle.getBoundingClientRect();
  punkteMenue.style.top = `${rect.bottom + window.scrollY + 5}px`;
  punkteMenue.style.left = `${rect.left + window.scrollX}px`;

  // Menü anzeigen
  punkteMenue.classList.remove("hidden");
});

// === Hilfsfunktion zum Anzeigen bestimmter Buttons ===
function zeigeButtons(werte) {
  werte.forEach(wert => {
    const btn = punkteMenue.querySelector(`button[data-wert="${wert}"]`);
    if (btn) btn.style.display = "inline-block";
  });
}



// === Punkte-Menü Klick ===
punkteMenue.addEventListener("click", async (e) => {
  if (role === "guest") return; // Gäste dürfen keine Punkte klicken
  const button = e.target.closest("button");
  if (!button || !aktiveZelle) return;

  const wert = parseInt(button.dataset.wert);
  const aktuellerWert = parseInt(aktiveZelle.textContent) || 0;
  aktiveZelle.textContent = aktuellerWert + wert;

  // Gesamt aktualisieren
  const zeile = aktiveZelle.parentElement;
  aktualisiereGesamt(zeile);

  // In DB speichern
  const id = zeile.dataset.id;
  try {
    const response = await fetch(`http://localhost:3000/api/kinder/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: zeile.children[0].textContent.trim(),
        hymne: Number(zeile.children[1].textContent) || 0,
        verhalten: Number(zeile.children[2].textContent) || 0,
        anwesenheit_G: Number(zeile.children[3].textContent) || 0,
        anwesenheit_U: Number(zeile.children[4].textContent) || 0,
        gesamt: Number(zeile.children[5].textContent) || 0,
      }),
    });

    if (!response.ok) {
      const result = await response.json();
      alert(result.error || "Fehler beim Speichern der Punkte in der DB.");
    }
  } catch (err) {
    console.error("Fehler beim Speichern der Punkte:", err);
    alert("Fehler bei der Verbindung zum Server.");
  }

  // Tabelle sortieren
  sortiereNachGesamt();

  // Menü schließen
  punkteMenue.classList.add("hidden");
  aktiveZelle = null;
});



// === Menü schließen bei Klick außerhalb ===
document.addEventListener("click", (e) => {
  if (!punkteMenue.contains(e.target) && !tabelle.contains(e.target)) {
    punkteMenue.classList.add("hidden");
    aktiveZelle = null;
  }
});

// === Gesamtpunkte berechnen ===
function aktualisiereGesamt(zeile) {
  const zellen = zeile.querySelectorAll("td");
  let summe = 0;
  for (let i = 1; i < zellen.length - 1; i++) {
    summe += parseInt(zellen[i].textContent);
  }
  zellen[zellen.length - 1].textContent = summe;
}

// === Hoverbare Zellen markieren ===
function markiereHoverbareZellen() {
  const zeilen = tbody.querySelectorAll("tr");
  zeilen.forEach((tr) => {
    const zellen = tr.querySelectorAll("td");
    zellen.forEach((td, index) => {
      if (index !== 0 && index !== zellen.length - 1) {
        td.classList.add("punkte-zelle");
      }
    });
  });
}
markiereHoverbareZellen();

// === Name bearbeiten bei Doppelklick ===
tabelle.addEventListener("dblclick", (e) => {
  if (role === "guest") return; // Gäste dürfen nichts bearbeiten
  const zelle = e.target.closest("td");
  if (!zelle || zelle.cellIndex !== 0) return; // nur erste Spalte (Name)

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

    // In DB speichern, nur wenn sich der Name geändert hat
    const neueName = zelle.textContent.trim();
if (neueName && neueName !== alterText) {
  const id = zelle.parentElement.dataset.id;
  try {
    const response = await fetch(`http://localhost:3000/api/kinder/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: neueName }) // <-- nur Name
    });

    if (!response.ok) {
      const result = await response.json();
      alert(result.error || "Fehler beim Speichern des neuen Namens.");
      zelle.textContent = alterText; // zurücksetzen
    }
  } catch (err) {
    console.error("Fehler beim Speichern des Namens:", err);
    alert("Fehler bei der Verbindung zum Server.");
    zelle.textContent = alterText; // zurücksetzen
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
      zelle.textContent = alterText; // Änderung verwerfen
      beenden();
    }
  };

  zelle.addEventListener("blur", beenden);
  zelle.addEventListener("keydown", handleEnter);
});



// === Tabelle nach Gesamt sortieren ===
function sortiereNachGesamt() {
  const zeilen = Array.from(tbody.querySelectorAll("tr"));

  // Alte Reihenfolge merken
  const alteReihenfolge = zeilen.map((tr) => tr.children[0].textContent);

  // Sortieren nach Gesamt
  zeilen.sort((a, b) => {
    const wertA = parseInt(a.children[5].textContent, 10); // Gesamt = 6. Spalte
    const wertB = parseInt(b.children[5].textContent, 10);
    return wertB - wertA;
  });

  // Zeilen wieder anhängen und aufsteigen markieren
  zeilen.forEach((zeile, index) => {
    tbody.appendChild(zeile);

    // Prüfen, ob die Zeile aufgestiegen ist
    const alterIndex = alteReihenfolge.indexOf(zeile.children[0].textContent);
    if (alterIndex > index) { // aufgestiegen
      zeile.classList.add("aufgestiegen");
      setTimeout(() => zeile.classList.remove("aufgestiegen"), 1000);
    }
  });
}

// === Tabelle nach Gesamt sortieren mit doppelklick ===
function aktualisiereGesamt(zeile) {
  const zellen = zeile.querySelectorAll("td");
  let summe = 0;

  for (let i = 1; i < zellen.length - 1; i++) {
    summe += parseInt(zellen[i].textContent) || 0; // Sicherheit für leere Felder
  }

  zellen[zellen.length - 1].textContent = summe;

  // Hervorheben, dass die Zeile sich ändern könnte
  zeile.style.backgroundColor = "#d4edda"; // sanftes Grün
  setTimeout(() => zeile.style.backgroundColor = "", 500);

  // Nach der Änderung sortieren
  sortiereNachGesamt();
}


// === Zahlen manuell ändern bei Doppelklick (außer Name und Gesamt) ===
tabelle.addEventListener("dblclick", (e) => {
  if (role === "guest") return; // Gäste dürfen nichts bearbeiten
  const zelle = e.target.closest("td");
  if (!zelle) return;

  const spaltenIndex = zelle.cellIndex;
  const anzahlSpalten = tabelle.rows[0].cells.length;

  // Name-Spalte (0) und Gesamt-Spalte (letzte) ignorieren
  if (spaltenIndex === 0 || spaltenIndex === anzahlSpalten - 1) return;

  const alterWert = zelle.textContent;

  // contentEditable aktivieren
  zelle.contentEditable = "true";
  zelle.focus();

  // Text markieren
  const range = document.createRange();
  range.selectNodeContents(zelle);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  // Beenden-Funktion
  const beenden = async () => {
    zelle.contentEditable = "false";

    // Gesamtpunkte aktualisieren
    const zeile = zelle.parentElement;
    aktualisiereGesamt(zeile);

    // Punkte in DB speichern
    const id = zeile.dataset.id;
    try {
      const response = await fetch(`http://localhost:3000/api/kinder/${id}`, {
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

      if (!response.ok) {
        const result = await response.json();
        alert(result.error || "Fehler beim Speichern der Punkte in der DB.");
      }
    } catch (err) {
      console.error("Fehler beim Speichern der Punkte:", err);
      alert("Fehler bei der Verbindung zum Server.");
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




// zu Deteils-seite
document.getElementById("zuDetails").addEventListener("click", () => {
  window.location.href = "/frontend/details/details.html";
});


// === login ====

const role = localStorage.getItem("userRole");

if (!role) {
  window.location.href = "../login/login.html";
}
// Alle Zellen vorbereiten
document.querySelectorAll("#meineTabelle td").forEach(td => {
  if (role === "admin") {
    // Nur Punkte-Spalten editierbar (Name & Gesamt = nicht editierbar)
    const spalte = td.cellIndex;
    td.contentEditable = spalte !== 0 && spalte !== 5;
  } else {
    td.contentEditable = false; // Gast kann nichts bearbeiten
  }
});

// Buttons für Gäste ausblenden
if (role === "guest") {
  document.getElementById("addRow")?.remove();
  document.getElementById("removeColumn")?.remove();
}

// logout Button
const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {
  // Benutzerrolle aus localStorage entfernen
  localStorage.removeItem("userRole");

  // Zur Login-Seite weiterleiten
  window.location.href = "/frontend/login/login.html";
});