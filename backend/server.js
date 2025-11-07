import express from "express";
import cors from "cors";
import db from "./db.js"; // deine DB-Verbindung
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ==== Statische Frontend-Dateien ====
const frontendPath = path.join(process.cwd(), "..", "frontend");
app.use(express.static(frontendPath));

// Standardroute → login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login", "login.html"));
});

// === LOGIN ===
const users = [
  { email: "Kirchenchor-Klasse1@al7an.com", password: "KGK1" },
  { email: "Kirchenchor-Klasse2@al7an.com", password: "KGK2" },
  { email: "Kirchenchor-Klasse3@al7an.com", password: "KGK3" },
  { email: "Kirchenchor-Oberstufe@al7an.com", password: "KGKO" }
];

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Ungültige Login Daten" });
  res.json({ email: user.email });
});

// ==== BILDER ====
const uploadDir = path.join(frontendPath, "images");
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

// === API: Kinder ===
app.get("/api/kinder", async (req, res) => {
  const { email } = req.query;
  try {
    const [rows] = await db.query("SELECT * FROM kinder WHERE user_email = ?", [email]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/kinder", async (req, res) => {
  const { name, klasse = "", eltern = "", telefon = "", email } = req.body;
  if (!name) return res.status(400).json({ error: "Name ist erforderlich" });

  try {
    const [result] = await db.query(
      `INSERT INTO kinder (name, hymne, verhalten, anwesenheit_G, anwesenheit_U, gesamt, klasse, eltern, telefon, user_email) 
       VALUES (?, 0, 0, 0, 0, 0, ?, ?, ?, ?)`,
      [name, klasse, eltern, telefon, email]
    );
    res.json({ id: result.insertId, name, hymne: 0, verhalten: 0, anwesenheit_G: 0, anwesenheit_U: 0, gesamt: 0, klasse, eltern, telefon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/kinder/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT bildUrl FROM kinder WHERE id = ?", [id]);
    const kind = rows[0];
    if (kind && kind.bildUrl) {
      const filePath = path.join(uploadDir, path.basename(kind.bildUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.query("DELETE FROM kinder WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/kinder/:id/bild", upload.single("bild"), async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.file) return res.status(400).json({ error: "Keine Datei erhalten" });

    const bildUrl = `/images/${req.file.filename}`;
    await db.query("UPDATE kinder SET bildUrl = ? WHERE id = ?", [bildUrl, id]);
    res.json({ bildUrl });
  } catch (err) {
    res.status(500).json({ error: "Upload fehlgeschlagen" });
  }
});

app.delete("/api/kinder/:id/bild", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT bildUrl FROM kinder WHERE id = ?", [id]);
    const kind = rows[0];
    if (kind && kind.bildUrl) {
      const filePath = path.join(uploadDir, path.basename(kind.bildUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.query("UPDATE kinder SET bildUrl = NULL WHERE id = ?", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Löschen des Bildes." });
  }
});

// === Server starten ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server läuft auf Port ${PORT}`));
