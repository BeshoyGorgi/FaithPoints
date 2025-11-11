import express from "express";
import cors from "cors";
import db from "./db.js"; // PostgreSQL Pool
import { createTableIfNotExists } from "./initDb.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --------- HIER BILDER ORDNER FREIGEBEN ---------
app.use('/images', express.static(path.join(__dirname, 'frontend', 'images')));
// Andere Middlewares wie bodyParser etc.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==== Statische Frontend-Dateien ====
const frontendPath = path.join(process.cwd(), "..", "frontend");
app.use(express.static(frontendPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "login", "login.html"));
});

// === LOGIN ===
const users = [
  { email: "Kirchenchor-Stufe1@al7an.com", password: "KS1" },
  { email: "Kirchenchor-Stufe2@al7an.com", password: "KS2" },
  { email: "Kirchenchor-Stufe3@al7an.com", password: "KS3" },
  { email: "Kirchenchor-Oberstufe@al7an.com", password: "KO" }
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
    const result = await db.query(`
      SELECT 
        id,
        name,
        hymne,
        verhalten,
        anwesenheit_g AS "anwesenheit_G",
        anwesenheit_u AS "anwesenheit_U",
        gesamt,
        last_updated_hymne,
        last_updated_anwesenheit_g,
        last_updated_anwesenheit_u,
        klasse,
        eltern,
        telefon,
        bildUrl,
        user_email
      FROM kinder
      WHERE user_email = $1
    `, [email]);


    res.json(result.rows); // Jetzt liefert die DB die Keys korrekt
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/kinder", async (req, res) => {
  const { name, klasse = "", eltern = "", telefon = "", email } = req.body;
  if (!name) return res.status(400).json({ error: "Name ist erforderlich" });

  try {
    const result = await db.query(
      `INSERT INTO kinder (name, hymne, verhalten, anwesenheit_G, anwesenheit_U, gesamt, klasse, eltern, telefon, user_email)
       VALUES ($1, 0, 0, 0, 0, 0, $2, $3, $4, $5) RETURNING *`,
      [name, klasse, eltern, telefon, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  app.put("/api/kinder/:id", async (req, res) => {
  const { id } = req.params;
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);

  const jetzt = new Date();

  if ("hymne" in req.body) {
    fields.push("last_updated_hymne");
    values.push(jetzt);
  }
  if ("anwesenheit_G" in req.body) {
    fields.push("last_updated_anwesenheit_g");
    values.push(jetzt);
  }
  if ("anwesenheit_U" in req.body) {
    fields.push("last_updated_anwesenheit_u");
    values.push(jetzt);
  }

  if (fields.length === 0) return res.status(400).json({ error: "Keine Felder zum Aktualisieren" });

  const setString = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  try {
    await db.query(`UPDATE kinder SET ${setString} WHERE id = $${fields.length + 1}`, [...values, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/kinder/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT bildUrl FROM kinder WHERE id = $1", [id]);
    const kind = result.rows[0];
    if (kind && kind.bildUrl) {
      const filePath = path.join(uploadDir, path.basename(kind.bildUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.query("DELETE FROM kinder WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/kinder/:id/bild", upload.single("bild"), async (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: "Keine Datei erhalten" });

  const bildUrl = `../images/${req.file.filename}`;

  try {
    // Alte Bilddatei löschen
    const result = await db.query("SELECT bildUrl FROM kinder WHERE id = $1", [id]);
    const kind = result.rows[0];
    if (kind && kind.bildUrl) {
      const oldPath = path.join(uploadDir, path.basename(kind.bildUrl));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Neues Bild in DB speichern
    await db.query("UPDATE kinder SET bildUrl = $1 WHERE id = $2", [bildUrl, id]);

    res.json({ bildUrl });
  } catch (err) {
    res.status(500).json({ error: "Upload fehlgeschlagen" });
  }
});


app.delete("/api/kinder/:id/bild", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT bildUrl FROM kinder WHERE id = $1", [id]);
    const kind = result.rows[0];
    if (kind && kind.bildUrl) {
      const filePath = path.join(uploadDir, path.basename(kind.bildUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await db.query("UPDATE kinder SET bildUrl = NULL WHERE id = $1", [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Löschen des Bildes." });
  }
});

// === Tabelle erstellen und Server starten ===
createTableIfNotExists().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ Server läuft auf Port ${PORT}`));
});
