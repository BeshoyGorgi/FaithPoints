const tbody = document.querySelector("#kinderDetails tbody");
const role = localStorage.getItem("userRole"); // Rolle aus localStorage

// Kinder aus der DB laden
async function ladeKinderDetails() {
  try {
    const response = await fetch("http://localhost:3000/api/kinder");
    if (!response.ok) throw new Error("Fehler beim Laden der Kinder");

    const kinderListe = await response.json();

    tbody.innerHTML = ""; // Tabelle leeren

    kinderListe.forEach(kind => {
      const tr = document.createElement("tr");
      tr.dataset.id = kind.id; // ID speichern

      // Nur admin darf contenteditable setzen
      tr.innerHTML = `
        <td>${kind.name}</td>
        <td ${role === "admin" ? 'contenteditable="true"' : ""}>${kind.klasse || ""}</td>
        <td ${role === "admin" ? 'contenteditable="true"' : ""}>${kind.eltern || ""}</td>
        <td ${role === "admin" ? 'contenteditable="true"' : ""}>${kind.telefon || ""}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='4'>Fehler beim Laden der Kinder</td></tr>";
  }
}

// Änderungen speichern beim Verlassen der Zelle (nur admin erlaubt)
tbody.addEventListener("blur", async (e) => {
  if (role !== "admin") return; // Gäste dürfen nichts ändern
  const td = e.target;
  if (!td.matches("td[contenteditable='true']")) return;

  const tr = td.parentElement;
  const id = tr.dataset.id;
  if (!id) return;

  const spaltenIndex = td.cellIndex;
  const feldMap = { 1: "klasse", 2: "eltern", 3: "telefon" };
  const feldName = feldMap[spaltenIndex];
  if (!feldName) return;

  const wert = td.textContent.trim();

  try {
    const response = await fetch(`http://localhost:3000/api/kinder/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [feldName]: wert })
    });

    if (!response.ok) {
      const result = await response.json();
      alert(result.error || "Fehler beim Speichern in der DB.");
    }
  } catch (err) {
    console.error("Fehler beim Speichern in der DB:", err);
  }
}, true);

// Enter-Taste speichert automatisch (nur admin)
tbody.addEventListener("keydown", (e) => {
  if (role !== "admin") return; // Gäste dürfen nichts ändern
  if (e.key === "Enter") {
    e.preventDefault(); // Kein Zeilenumbruch
    e.target.blur();    // blur-Event feuert und speichert
  }
});

// Funktion direkt aufrufen
ladeKinderDetails();

// Zurück-Button
document.getElementById("zurueckButton").addEventListener("click", () => {
  window.location.href = "/frontend/main/index.html";
});
