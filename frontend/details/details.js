import { API_BASE_URL } from "../config.js";

const tbody = document.querySelector("#kinderDetails tbody");

// ----- Lade Kinder -----
async function ladeKinderDetails() {
  try {
    const email = localStorage.getItem("email"); // Email holen
    const response = await fetch(`${API_BASE_URL}/api/kinder?email=${email}`);
    if (!response.ok) throw new Error("Fehler beim Laden der Kinder");

    const kinderListe = await response.json();
    tbody.innerHTML = "";

    kinderListe.forEach(kind => {
      const tr = document.createElement("tr");
      tr.dataset.id = kind.id;

      const bildUrl = kind.bildUrl ? kind.bildUrl : "../images/platzhalter.png";

      tr.innerHTML = `
        <td>
          <div class="bild-container">
            <img src="${bildUrl}" alt="Bild von ${escapeHtml(kind.name)}" class="kinder-bild">
            <div class="bild-buttons">
              <button class="bild-loeschen" data-id="${kind.id}">-</button>
              <label class="bild-upload-label" for="upload-${kind.id}">+</label>
              <input id="upload-${kind.id}" type="file" accept="image/*" class="bild-upload" data-id="${kind.id}">
            </div>
          </div>
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

// ----- Save changes on blur -----
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

// ----- Bild-Upload -----
tbody.addEventListener("change", async (e) => {
  const fileInput = e.target;
  if (!fileInput.classList.contains("bild-upload")) return;

  const file = fileInput.files[0];
  if (!file) return;

  const id = fileInput.dataset.id;
  const formData = new FormData();
  formData.append("bild", file);

  try {
    const response = await fetch(`${API_BASE_URL}/api/kinder/${id}/bild`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Upload fehlgeschlagen' }));
      throw new Error(err.error || "Fehler beim Hochladen");
    }

    const result = await response.json();
    const img = fileInput.parentElement.querySelector("img.kinder-bild");
    if (img && result.bildUrl) img.src = result.bildUrl;
    alert("Bild erfolgreich aktualisiert!");
    ladeKinderDetails();

  } catch (err) {
    console.error("Fehler beim Hochladen des Bildes:", err);
    alert("Fehler beim Hochladen des Bildes.");
  }
});

// ----- Bild löschen -----
tbody.addEventListener("click", async (e) => {
  const btn = e.target;
  if (!btn.classList.contains("bild-loeschen")) return;

  const id = btn.dataset.id;
  if (!confirm("Bild wirklich löschen?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/kinder/${id}/bild`, { method: "DELETE" });
    if (!response.ok) throw new Error("Fehler beim Löschen");

    const img = btn.parentElement.querySelector("img.kinder-bild");
    if (img) img.src = "../images/platzhalter.png";
    alert("Bild gelöscht.");
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
    alert("Fehler beim Löschen des Bildes.");
  }
});

// ----- Hilfsfunktionen -----
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Direkt aufrufen
ladeKinderDetails();

// Zurück-Button
document.getElementById("zurueckButton").addEventListener("click", () => {
  window.location.href = "/Faith_Points/frontend/main/index.html";
});

// Logout
const logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("email");
  window.location.href = "/Faith_Points/frontend/login/login.html";
});
