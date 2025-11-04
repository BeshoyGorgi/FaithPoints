# 🎵 Al7an Punkte

Ein webbasiertes Verwaltungssystem für Kinderpunkte (Hymne, Verhalten, Anwesenheit) — entwickelt mit **Node.js**, **Express** und **MySQL**, inklusive Frontend in **HTML**, **CSS** und **JavaScript**.

---

## 📘 Inhaltsverzeichnis
1. [Über das Projekt](#-über-das-projekt)
2. [Funktionen](#-funktionen)
3. [Technologien](#-technologien)
4. [Projektstruktur](#-projektstruktur)
5. [Installation & Start](#-installation--start)
6. [API-Endpunkte](#-api-endpunkte)
7. [Datenbank-Struktur](#-datenbank-struktur)
8. [Deployment](#-deployment)
9. [Autor](#-autor)

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

✅ Kinder hinzufügen, anzeigen, bearbeiten und löschen  
✅ Punkte für Hymne, Verhalten und Anwesenheit verwalten  
✅ Kontaktinformationen (Eltern, Telefon, Klasse) speichern  
✅ Änderungen werden direkt in der MySQL-Datenbank gespeichert  
✅ REST-API für einfache Integration oder Erweiterung  

---

## 🧠 Technologien

| Bereich | Technologie |
|----------|-------------|
| **Backend** | Node.js, Express.js, MySQL2 |
| **Frontend** | HTML5, CSS3, JavaScript |
| **API-Format** | REST (JSON) |
| **Entwicklung** | Visual Studio Code |
| **Empfohlenes Hosting** | Render.com / Railway.app / GitHub Pages |

---

## 🗂️ Projektstruktur

```bash
Al7an_Punkte/
├── backend/
│   ├── db.js              # Verbindung zur MySQL-Datenbank
│   ├── server.js          # Express-Server mit API-Endpunkten
│   ├── package.json       # Node.js-Abhängigkeiten
│
└── frontend/
    ├── main/
    │   ├── index.html     # Hauptseite (Übersicht)
    │   ├── style.css      # Styling der Hauptseite
    │   └── script.js      # Logik der Hauptseite
    │
    ├── details/
    │   ├── details.html   # Detailansicht für Kinder
    │   ├── details.css    # Styling der Detailansicht
    │   └── details.js     # Bearbeitungslogik (editable cells)
