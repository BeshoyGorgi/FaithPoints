import express from "express";
import cors from "cors";
import db from "./db.js"; // db ist db.promise()

import multer from "multer";
import path from "path";
import fs from "fs";


const app = express();
app.use(cors());
app.use(express.json());


// === BILDER-UPLOAD KONFIGURATION ===
const uploadDir = path.join("D:", "Al7an Punkte", "Al7an_Punkte", "frontend", "images");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `kid_${req.params.id}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

app.use("/images", express.static(path.join("D:", "Al7an Punkte", "Al7an_Punkte", "frontend", "images")));


// === Alle Kinder abrufen ===
app.get("/api/kinder", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM kinder");
    res.json(rows);
  } catch (err) {
    console.error("GET Fehler:", err);
    res.status(500).json({ error: err.message });
  }
});

// === BILD HOCHLADEN ===
app.post("/api/kinder/:id/bild", upload.single("bild"), async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.file) return res.status(400).json({ error: "Keine Datei erhalten" });
    
    const bildUrl = `../images/${req.file.filename}`;
    
    console.log("Bild gespeichert unter:", uploadDir, "als:", req.file.filename);
    await db.query("UPDATE kinder SET bildUrl = ? WHERE id = ?", [bildUrl, id]);

    res.json({ bildUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload fehlgeschlagen" });
  }
});


// === Neues Kind hinzufügen ===
app.post("/api/kinder", async (req, res) => {
  const { name, klasse = "", eltern = "", telefon = "" } = req.body;
  if (!name) return res.status(400).json({ error: "Name ist erforderlich" });

  try {
    const [result] = await db.query(
      `INSERT INTO kinder 
       (name, hymne, verhalten, anwesenheit_G, anwesenheit_U, gesamt, klasse, eltern, telefon) 
       VALUES (?, 0, 0, 0, 0, 0, ?, ?, ?)`,
      [name, klasse, eltern, telefon]
    );

    res.json({
      id: result.insertId,
      name,
      hymne: 0,
      verhalten: 0,
      anwesenheit_G: 0,
      anwesenheit_U: 0,
      gesamt: 0,
      klasse,
      eltern,
      telefon
    });
  } catch (err) {
    console.error("POST Fehler:", err);
    res.status(500).json({ error: err.message });
  }
});

// === Kind aktualisieren ===
app.put("/api/kinder/:id", async (req, res) => {
  const { id } = req.params;
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);

  if (fields.length === 0) return res.status(400).json({ error: "Keine Felder zum Aktualisieren" });

  const setString = fields.map(f => `${f} = ?`).join(", ");

  try {
    await db.query(`UPDATE kinder SET ${setString} WHERE id = ?`, [...values, id]);
    res.json({ success: true });
  } catch (err) {
    console.error("PUT Fehler:", err);
    res.status(500).json({ error: err.message });
  }
});

// === Kind löschen ===
app.delete("/api/kinder/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM kinder WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE Fehler:", err);
    res.status(500).json({ error: err.message });
  }
});

// === BILD LÖSCHEN ===
app.delete("/api/kinder/:id/bild", async (req, res) => {
  try {
    const id = req.params.id;

    // Bildpfad aus DB holen
    const [rows] = await db.query("SELECT bildUrl FROM kinder WHERE id = ?", [id]);
    const kind = rows[0];

    if (kind && kind.bildUrl) {
      const filePath = path.join("D:", "Al7an Punkte", "Al7an_Punkte", "frontend", "images", path.basename(kind.bildUrl));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fsErr) {
          console.error("Fehler beim Löschen der Datei:", fsErr);
        }
      }
    }

    // DB-Eintrag zurücksetzen
    await db.query("UPDATE kinder SET bildUrl = NULL WHERE id = ?", [id]);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fehler beim Löschen des Bildes." });
  }
});




app.listen(3000, () => console.log("✅ Server läuft auf http://localhost:3000"));