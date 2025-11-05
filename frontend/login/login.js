const PASSWORD = "123";

const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const guestButton = document.getElementById("guestButton");
const errorMessage = document.getElementById("errorMessage");

loginButton.addEventListener("click", () => {
  const pass = passwordInput.value;
  if (pass === PASSWORD) {
    // Admin: Zugriff auf Hauptseite
    localStorage.setItem("userRole", "admin");
    window.location.href = "../main/index.html";
  } else {
    errorMessage.textContent = "Falsches Passwort!";
  }
});

guestButton.addEventListener("click", () => {
  // Gast: nur Ansicht
  localStorage.setItem("userRole", "guest");
  window.location.href = "../main/index.html";
});


function logout() {
  localStorage.removeItem("userRole");
 window.location.href = "../main/login.html";
}


