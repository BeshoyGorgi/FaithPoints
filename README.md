# 🎵 FaithPoints

Al7an Punkte ist ein webbasiertes Verwaltungssystem zur Erfassung und Auswertung von Kinderpunkten in kirchlichen oder schulischen Gruppen.
Das System wurde entwickelt, um Betreuern die digitale Verwaltung von Punkten für Hymnen, Verhalten und Anwesenheit zu ermöglichen. Inklusive Kinderprofilen mit Bildern, Kontaktdaten und automatischer Speicherung in einer MySQL-Datenbank.

---

## 📘 Inhaltsverzeichnis
1. [Über das Projekt](#-über-das-projekt)
2. [Funktionen](#-funktionen)
3. [Technologien](#-technologien)
4. [Installation & Setup](#️-installation--setup)
5. [REST-API-Endpunkte](#-rest-api-endpunkte)
6. [Projektstruktur](#️-projektstruktur)

---

## 💡 Über das Projekt

**Al7an Punkte** ist ein Verwaltungssystem, das für Kinderaktivitäten in kirchlichen oder schulischen Gruppen entwickelt wurde.  
Jedes Kind hat zugeordnete Punkte für:
- **Hymnen**
- **Verhalten**
- **Anwesenheit (Gruppe G und U)**  
und kann zusätzlich mit Informationen wie **Klasse**, **Eltern** und **Telefonnummer** versehen werden.

Das Projekt besteht aus:
- einem **Backend** (Node.js + Express + MySQL),
- einem **Frontend** (HTML, CSS, JS),
- und einer **REST-API** zur Kommunikation zwischen beiden.

---

## ✨ Funktionen

✅ Kinderverwaltung – Kinderprofile hinzufügen, bearbeiten, löschen
✅ Punkteverwaltung – Punkte für Hymne, Verhalten und Anwesenheit speichern
✅ Kontaktinformationen – Eltern, Telefonnummer und Klasse speichern
✅ Bilder-Upload – Kinderbilder verwalten (z. B. Platzhalter oder eigenes Bild)
✅ Login-System – Zugangsschutz für Betreuer oder Lehrer
✅ REST-API – Kommunikation zwischen Frontend und Backend per JSON
✅ Automatische Speicherung – Alle Änderungen werden direkt in MySQL gespeichert

---

## 🧠 Technologien

| Bereich | Technologie |
|----------|-------------|
| **Backend** | Node.js, Express.js, MySQL2 |
| **Frontend** | HTML5, CSS3, JavaScript |
| **API-Format** | REST (JSON) |
| **Entwicklung** | Visual Studio Code |

---

## ⚙️ Installation & Setup

🔹 Voraussetzungen

Node.js (v16 oder höher)

MySQL-Datenbank

Git (optional)

🔹 Installation
# Projekt klonen
git clone https://github.com/deinBenutzername/Al7an_Punkte.git

# In das Backend-Verzeichnis wechseln
cd Al7an_Punkte/backend

# Abhängigkeiten installieren
npm install

# Datenbank einrichten

Öffne MySQL und erstelle eine Datenbank:

CREATE DATABASE al7an_punkte;


# Passe deine db.js-Datei an:

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'deinPasswort',
  database: 'al7an_punkte'
});


# Starte den Server:
node server.js


# Öffne das Frontend über:

http://localhost:3000/frontend/main/index.html


# Info: Emails/Passwort stehen im server.js 
(Änderung/Erweiterungen möglich)

---

## 🔌 REST-API-Endpunkte

| Methode  | Endpoint          | Beschreibung                                           |
| -------- | ----------------- | ------------------------------------------------------ |
| `GET`    | `/api/kinder`     | Liste aller Kinder abrufen                             |
| `POST`   | `/api/kinder`     | Neues Kind hinzufügen                                  |
| `PUT`    | `/api/kinder/:id` | Kinderprofil aktualisieren                             |
| `DELETE` | `/api/kinder/:id` | Kind löschen                                           |
| `GET`    | `/api/punkte/:id` | Punktestand eines Kindes abrufen                       |
| `POST`   | `/api/punkte`     | Punkte für Hymne, Verhalten oder Anwesenheit speichern |

---

## 🗂️ Projektstruktur

Al7an_Punkte/
├── backend/
│   ├── db.js              # Verbindung zur MySQL-Datenbank
│   ├── server.js          # Express-Server mit API-Endpunkten
│   ├── package.json       # Node.js-Abhängigkeiten
│
└── frontend/
    ├── main/
    │   ├── index.html     # Hauptseite (Kinderübersicht)
    │   ├── style.css      # Styling der Hauptseite
    │   └── script.js      # Logik der Übersicht
    │
    ├── details/
    │   ├── details.html   # Detailansicht für ein Kind
    │   ├── details.css    # Styling der Detailseite
    │   └── details.js     # Bearbeitungslogik
    │
    ├── login/
    │   ├── login.html     # Login-Seite
    │   ├── login.css      # Styling der Login-Seite
    │   └── login.js       # Login-Validierung
    │
    ├── images/
    │   ├── logo.jpeg      # Logo der Anwendung
    │   └── platzhalter.png # Standard-Bild für Kinder
│
└── README.md
