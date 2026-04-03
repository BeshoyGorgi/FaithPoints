import { API_BASE_URL } from "../config.js";

const tbody = document.querySelector("#kinderDetails tbody");

// ----- Hilfsfunktion: Stufe in Zahl umwandeln -----
function stufenWert(stufe) {
  if (!stufe) return 9999;
  stufe = stufe.trim().toLowerCase();
  if (stufe === "kita") return 0;
  const num = parseInt(stufe);
  return isNaN(num) ? 9999 : num;
}

// ----- Tabelle sortieren (absteigend) -----
function sortiereTabelle() {
  const rows = Array.from(tbody.querySelectorAll("tr"));
  rows.sort((a, b) => stufenWert(b.children[2].textContent) - stufenWert(a.children[2].textContent));
  rows.forEach(r => tbody.appendChild(r));
}

// ----- Kinder laden -----
async function ladeKinderDetails() {
  try {
    const email = localStorage.getItem("email");
    const response = await fetch(`${API_BASE_URL}/api/kinder?email=${email}`);
    if (!response.ok) throw new Error("Fehler beim Laden der Kinder");

    const kinderListe = await response.json();
    tbody.innerHTML = "";

    // Absteigend nach Klasse sortieren
    kinderListe.sort((a, b) => stufenWert(b.klasse) - stufenWert(a.klasse));

    kinderListe.forEach(kind => {
      const tr = document.createElement("tr");
      tr.dataset.id = kind.id;

      const bildUrl = kind.bildurl
        ? `${API_BASE_URL}${kind.bildurl}`
        : "../images/default.png";

      tr.innerHTML = `
        <td>
          <img src="${bildUrl}" alt="Bild von ${kind.name}" class="kind-bild" id="bild-${kind.id}">
          <div class="bild-buttons">
            <button class="add-bild" data-id="${kind.id}">+</button>
            <button class="remove-bild" data-id="${kind.id}">−</button>
          </div>
          <input type="file" accept="image/*" id="file-${kind.id}" style="display:none;">
        </td>
        <td>${escapeHtml(kind.name)}</td>
        <td contenteditable="true">${escapeHtml(kind.klasse || "")}</td>
        <td contenteditable="true">${escapeHtml(kind.eltern || "")}</td>
        <td contenteditable="true">${escapeHtml(kind.telefon || "")}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='5'>Fehler beim Laden der Kinder</td></tr>";
  }
}

// ----- Bild hoch-/runterladen -----
tbody.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  // + Bild hochladen
  if (e.target.classList.contains("add-bild")) {
  const fileInput = document.getElementById(`file-${id}`);
  fileInput.value = "";
  fileInput.click();

  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("bild", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/kinder/${id}/bild`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        document.getElementById(`bild-${id}`).src = `${API_BASE_URL}${result.bildUrl}`;
      } else {
        const fehler = await response.json();
        alert(fehler.error || "Fehler beim Hochladen des Bildes");
      }
    } catch (err) {
      console.error(err);
      alert("Fehler beim Hochladen des Bildes");
    }
  };
}

  // − Bild löschen
  if (e.target.classList.contains("remove-bild")) {
    if (!confirm("Bild wirklich entfernen?")) return;
    const response = await fetch(`${API_BASE_URL}/api/kinder/${id}/bild`, { method: "DELETE" });
    if (response.ok) document.getElementById(`bild-${id}`).src = "../images/default.png";
    else alert("Fehler beim Löschen des Bildes");
  }
});

// ----- Suche -----
const searchInput = document.getElementById("kinderSearch");
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;
    const rows = Array.from(tbody.querySelectorAll("tr"));
    const match = rows.find(r => r.children[1].textContent.toLowerCase().includes(query));
    if (match) {
      match.scrollIntoView({ behavior: "smooth", block: "center" });
      match.style.backgroundColor = "#ffff99";
      setTimeout(() => match.style.backgroundColor = "", 2000);
    } else alert(`Kein Kind mit Namen "${searchInput.value}" gefunden.`);
  }
});

// ----- Änderungen speichern (blur) -----
tbody.addEventListener("blur", async (e) => {
  const td = e.target;
  if (!td.matches("td[contenteditable='true']")) return;

  const tr = td.parentElement;
  const id = tr.dataset.id;
  if (!id) return;

  const feldMap = { 2: "klasse", 3: "eltern", 4: "telefon" };
  const feldName = feldMap[td.cellIndex];
  if (!feldName) return;

  const wert = td.textContent.trim();

  try {
    const response = await fetch(`${API_BASE_URL}/api/kinder/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [feldName]: wert })
    });

    if (!response.ok) {
      const result = await response.json();
      alert(result.error || "Fehler beim Speichern in der DB.");
    } else if (feldName === "klasse") {
      sortiereTabelle(); // Tabelle nach jeder Klassenänderung absteigend sortieren
    }
  } catch (err) {
    console.error("Fehler beim Speichern in der DB:", err);
  }
}, true);

// ----- Enter speichert -----
tbody.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    e.target.blur();
  }
});

// ----- HTML escapen -----
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ----- Initialisierung -----
ladeKinderDetails();

// ----- Buttons -----
document.getElementById("zurueckButton").addEventListener("click", () => {
  window.location.href = "/main/index.html";
});
