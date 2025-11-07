import { API_BASE_URL } from "../config.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const errorMessage = document.getElementById("errorMessage");

loginButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    errorMessage.textContent = "Bitte Email und Passwort eingeben!";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      errorMessage.textContent = "Email oder Passwort falsch!";
      return;
    }

    const result = await response.json();
    localStorage.setItem("email", result.email);
    window.location.href = "../main/index.html";

  } catch (err) {
    console.error("Login Fehler:", err);
    errorMessage.textContent = "Fehler beim Verbinden zum Server.";
  }
});

// Optional: Logout-Funktion
export function logout() {
  localStorage.removeItem("email");
  window.location.href = "../login/login.html";
}
