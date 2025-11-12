import { API_BASE_URL } from "../config.js";

const tbody = document.querySelector("#kinderDetails tbody");

// ----- Lade Kinder -----
// ----- Lade Kinder -----
async function ladeKinderDetails() {
  try {
    const email = localStorage.getItem("email"); 
    const response = await fetch(`${API_BASE_URL}/api/kinder?email=${email}`);
    if (!response.ok) throw new Error("Fehler beim Laden der Kinder");

    const kinderListe = await response.json();
    tbody.innerHTML = "";

    kinderListe.forEach(kind => {
      const tr = document.createElement("tr");
      tr.dataset.id = kind.id;

      // 🔥 Bild-Spalte + Buttons direkt hier einfügen
      const bildUrl = kind.bildurl || "../images/platzhalter.png";

      tr.innerHTML = `
        <td>${escapeHtml(kind.name)}</td>
        <td contenteditable="true">${escapeHtml(kind.klasse || "")}</td>
        <td contenteditable="true">${escapeHtml(kind.eltern || "")}</td>
        <td contenteditable="true">${escapeHtml(kind.telefon || "")}</td>
        <td>
          <img src="${bildUrl}" alt="Bild von ${kind.name}" class="kind-bild" id="bild-${kind.id}">
          <div class="bild-buttons">
            <button class="add-bild" data-id="${kind.id}">+</button>
            <button class="remove-bild" data-id="${kind.id}">−</button>
          </div>
          <input type="file" accept="image/*" id="file-${kind.id}" style="display:none;">
        </td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='5'>Fehler beim Laden der Kinder</td></tr>";
  }
}

tbody.addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  // === + BUTTON ===
  if (e.target.classList.contains("add-bild")) {
    const fileInput = document.getElementById(`file-${id}`);
    fileInput.click();

    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("bild", file);

      const response = await fetch(`${API_BASE_URL}/api/kinder/${id}/bild`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        document.getElementById(`bild-${id}`).src = result.bildUrl;
      } else {
        alert("Fehler beim Hochladen des Bildes");
      }
    };
  }

  // === − BUTTON ===
  if (e.target.classList.contains("remove-bild")) {
    const confirmDelete = confirm("Bild wirklich entfernen?");
    if (!confirmDelete) return;

    const response = await fetch(`${API_BASE_URL}/api/kinder/${id}/bild`, {
      method: "DELETE",
    });

    if (response.ok) {
      document.getElementById(`bild-${id}`).src = "../images/platzhalter.png";
    } else {
      alert("Fehler beim Löschen des Bildes");
    }
  }
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

// ----- Save changes on blur -----
tbody.addEventListener("blur", async (e) => {
  const td = e.target;
  if (!td.matches("td[contenteditable='true']")) return;

  const tr = td.parentElement;
  const id = tr.dataset.id;
  if (!id) return;

  const feldMap = { 1: "klasse", 2: "eltern", 3: "telefon" };
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

// ----- Hilfsfunktion -----
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
  window.location.href = "/main/index.html";
});

// Logout
document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("email");
  window.location.href = "/login/login.html";
});
