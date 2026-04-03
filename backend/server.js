import express from "express";
import cors from "cors";
import db from "./db.js";
import { createTableIfNotExists } from "./initDb.js";
import dotenv from "dotenv";
import path from "path";        
import { fileURLToPath } from "url"; 
import multer from "multer";
import fs from "fs";

// Kinderbilder sollen im Frontend unter images/kinderbilder gespeichert werden
const uploadDir = path.join(process.cwd(), "..", "frontend", "images", "kinderbilder");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer-Konfiguration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalExt = path.extname(file.originalname).toLowerCase();
    const erlaubteEndungen = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const ext = erlaubteEndungen.includes(originalExt) ? originalExt : ".jpg";

    const dateiname = `kind-${req.params.id}-${Date.now()}${ext}`;
    cb(null, dateiname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // max. 5 MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Nur Bilddateien sind erlaubt."));
    }
    cb(null, true);
  }
});


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statische Frontend-Dateien
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
        bildurl,
        user_email
      FROM kinder
      WHERE user_email = $1
    `, [email]);
    res.json(result.rows);
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

//Neu
app.put("/api/kinder/:id", async (req, res) => {
  const { id } = req.params;

  const feldMap = {
    name: "name",
    hymne: "hymne",
    verhalten: "verhalten",
    anwesenheit_G: "anwesenheit_g",
    anwesenheit_U: "anwesenheit_u",
    gesamt: "gesamt",
    klasse: "klasse",
    eltern: "eltern",
    telefon: "telefon",
    bildurl: "bildurl",
    lastUpdatedHymne: "last_updated_hymne",
    lastUpdatedAnwesenheitG: "last_updated_anwesenheit_g",
    lastUpdatedAnwesenheitU: "last_updated_anwesenheit_u"
  };

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const vorherResult = await client.query(
      "SELECT hymne FROM kinder WHERE id = $1",
      [id]
    );

    if (vorherResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Kind nicht gefunden" });
    }

    const vorherigeHymne = Number(vorherResult.rows[0].hymne) || 0;

    const updates = [];
    const values = [];

    Object.entries(req.body).forEach(([key, value]) => {
      const dbFeld = feldMap[key];
      if (!dbFeld) return;
      updates.push(`${dbFeld} = $${updates.length + 1}`);
      values.push(value);
    });

    if ("hymne" in req.body && !("lastUpdatedHymne" in req.body)) {
      updates.push(`last_updated_hymne = $${updates.length + 1}`);
      values.push(new Date());
    }

    if ("anwesenheit_G" in req.body && !("lastUpdatedAnwesenheitG" in req.body)) {
      updates.push(`last_updated_anwesenheit_g = $${updates.length + 1}`);
      values.push(new Date());
    }

    if ("anwesenheit_U" in req.body && !("lastUpdatedAnwesenheitU" in req.body)) {
      updates.push(`last_updated_anwesenheit_u = $${updates.length + 1}`);
      values.push(new Date());
    }

    if (updates.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Keine gültigen Felder zum Aktualisieren" });
    }

    const updateQuery = `
      UPDATE kinder
      SET ${updates.join(", ")}
      WHERE id = $${values.length + 1}
      RETURNING *
    `;

    const updateResult = await client.query(updateQuery, [...values, id]);

    if ("hymne" in req.body) {
      const neueHymne = Number(req.body.hymne) || 0;
      const diff = neueHymne - vorherigeHymne;

      if (diff > 0) {
        await client.query(
          `
            INSERT INTO hymnen_eintraege (kind_id, titel, punkte)
            VALUES ($1, '', $2)
          `,
          [id, diff]
        );
      }
    }

    await client.query("COMMIT");
    res.json(updateResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});
app.get("/api/hymnen", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "E-Mail ist erforderlich" });
  }

  try {
    const result = await db.query(
      `
        SELECT
          k.id AS kind_id,
          k.name AS kind_name,
          k.hymne AS gesamt_hymne,
          h.id AS eintrag_id,
          h.titel,
          h.kategorie,
          h.punkte,
          h.created_at
        FROM kinder k
        LEFT JOIN hymnen_eintraege h ON h.kind_id = k.id
        WHERE k.user_email = $1
        ORDER BY k.name ASC, h.created_at ASC, h.id ASC
      `,
      [email]
    );

    const gruppiert = [];
    const map = new Map();

    for (const row of result.rows) {
      if (!map.has(row.kind_id)) {
        const kindObj = {
          kind_id: row.kind_id,
          kind_name: row.kind_name,
          gesamt_hymne: Number(row.gesamt_hymne) || 0,
          eintraege: []
        };
        map.set(row.kind_id, kindObj);
        gruppiert.push(kindObj);
      }

      if (row.eintrag_id) {
        map.get(row.kind_id).eintraege.push({
        id: row.eintrag_id,
        titel: row.titel || "",
        kategorie: row.kategorie || "",
        punkte: Number(row.punkte) || 0,
        created_at: row.created_at
      });
      }
    }

    res.json(gruppiert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/hymnen", async (req, res) => {
  const { kind_id, titel = "", kategorie = "", punkte = 0, created_at } = req.body;

  if (!kategorie || !kategorie.trim()) {
  return res.status(400).json({ error: "Kategorie ist erforderlich" });
}

  if (!kind_id) {
    return res.status(400).json({ error: "kind_id ist erforderlich" });
  }

  const punkteZahl = Number(punkte);

  if (!Number.isFinite(punkteZahl) || punkteZahl < 0) {
    return res.status(400).json({ error: "Ungültige Punktzahl" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const kindResult = await client.query(
      `
        SELECT id, name, hymne, gesamt
        FROM kinder
        WHERE id = $1
      `,
      [kind_id]
    );

    if (kindResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Kind nicht gefunden" });
    }

    const insertResult = await client.query(
      `
        INSERT INTO hymnen_eintraege (kind_id, titel, kategorie, punkte, created_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, kind_id, titel, kategorie, punkte, created_at
      `,
      [
        kind_id,
        titel.trim(),
        kategorie.trim(),
        punkteZahl,
        created_at ? new Date(created_at) : new Date()
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      eintrag: insertResult.rows[0],
      kind: {
        id: kindResult.rows[0].id,
        name: kindResult.rows[0].name,
        hymne: Number(kindResult.rows[0].hymne) || 0,
        gesamt: Number(kindResult.rows[0].gesamt) || 0
      }
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.put("/api/hymnen/:id", async (req, res) => {
  const { id } = req.params;
  const { titel = "", kategorie = "" } = req.body;

  if (!kategorie || !kategorie.trim()) {
    return res.status(400).json({ error: "Kategorie ist erforderlich" });
  }

  try {
    const result = await db.query(
      `
        UPDATE hymnen_eintraege
        SET titel = $1,
            kategorie = $2
        WHERE id = $3
        RETURNING *
      `,
      [titel.trim(), kategorie.trim(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hymnen-Eintrag nicht gefunden" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === API: Lehrplan ===
app.get("/api/lehrplan", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "E-Mail ist erforderlich" });
  }

  try {
    const result = await db.query(
      `
        SELECT id, user_email, kategorie, titel, erledigt, start_datum, end_datum, sort_index, created_at
        FROM lehrplan_eintraege
        WHERE user_email = $1
        ORDER BY kategorie ASC, erledigt DESC, sort_index ASC, created_at ASC, id ASC
      `,
      [email]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/lehrplan", async (req, res) => {
  const { email, kategorie, titel, start_datum = null, end_datum = null } = req.body;

  if (!email) {
    return res.status(400).json({ error: "E-Mail ist erforderlich" });
  }

  if (!kategorie || !kategorie.trim()) {
    return res.status(400).json({ error: "Kategorie ist erforderlich" });
  }

  if (!titel || !titel.trim()) {
    return res.status(400).json({ error: "Titel ist erforderlich" });
  }

  if (start_datum && end_datum && start_datum > end_datum) {
    return res.status(400).json({ error: "Startdatum darf nicht nach Enddatum liegen" });
  }

  try {
    const cleanKategorie = kategorie.trim();

    const posResult = await db.query(
      `
        SELECT COALESCE(MAX(sort_index), -1) AS max_sort
        FROM lehrplan_eintraege
        WHERE user_email = $1
          AND kategorie = $2
          AND erledigt = false
      `,
      [email, cleanKategorie]
    );

    const nextSortIndex = Number(posResult.rows[0].max_sort) + 1;


    const result = await db.query(
      `
        INSERT INTO lehrplan_eintraege
          (user_email, kategorie, titel, erledigt, start_datum, end_datum, sort_index)
        VALUES ($1, $2, $3, false, $4, $5, $6)
        RETURNING id, user_email, kategorie, titel, erledigt, start_datum, end_datum, sort_index, created_at
      `,
      [email, cleanKategorie, titel.trim(), start_datum || null, end_datum || null, nextSortIndex]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/lehrplan/reihenfolge", async (req, res) => {
  const { email, kategorie, ids } = req.body;

  if (!email) {
    return res.status(400).json({ error: "E-Mail ist erforderlich" });
  }

  if (!kategorie || !kategorie.trim()) {
    return res.status(400).json({ error: "Kategorie ist erforderlich" });
  }

  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: "ids muss ein Array sein" });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const vorhandene = await client.query(
      `
        SELECT id
        FROM lehrplan_eintraege
        WHERE user_email = $1
          AND kategorie = $2
          AND erledigt = false
      `,
      [email, kategorie.trim()]
    );

    const dbIds = vorhandene.rows.map(r => Number(r.id)).sort((a, b) => a - b);
    const neueIds = ids.map(Number).sort((a, b) => a - b);

    if (
      dbIds.length !== neueIds.length ||
      dbIds.some((id, index) => id !== neueIds[index])
    ) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Ungültige Reihenfolge-Daten" });
    }

    for (let i = 0; i < ids.length; i++) {
      await client.query(
        `
          UPDATE lehrplan_eintraege
          SET sort_index = $1
          WHERE id = $2
            AND user_email = $3
            AND kategorie = $4
            AND erledigt = false
        `,
        [i, ids[i], email, kategorie.trim()]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.put("/api/lehrplan/:id", async (req, res) => {
  const { id } = req.params;
  const { email, titel, erledigt, start_datum, end_datum, sort_index } = req.body;

  if (!email) {
    return res.status(400).json({ error: "E-Mail ist erforderlich" });
  }

  if (start_datum && end_datum && start_datum > end_datum) {
    return res.status(400).json({ error: "Startdatum darf nicht nach Enddatum liegen" });
  }

  const updates = [];
  const values = [];

  if (typeof titel === "string") {
    if (!titel.trim()) {
      return res.status(400).json({ error: "Titel darf nicht leer sein" });
    }
    updates.push(`titel = $${values.length + 1}`);
    values.push(titel.trim());
  }

  if (typeof erledigt === "boolean") {
    updates.push(`erledigt = $${values.length + 1}`);
    values.push(erledigt);

    // Wenn Check entfernt wird:
    // nur Datum löschen, Name bleibt bestehen
    if (!erledigt) {
      updates.push(`start_datum = NULL`);
      updates.push(`end_datum = NULL`);
    }
  }

  // Datumsfelder nur setzen, wenn nicht gerade explizit auf erledigt = false gesetzt wird
  if (erledigt !== false) {
    if ("start_datum" in req.body) {
      updates.push(`start_datum = $${values.length + 1}`);
      values.push(start_datum || null);
    }

    if ("end_datum" in req.body) {
      updates.push(`end_datum = $${values.length + 1}`);
      values.push(end_datum || null);
    }
  }

  if ("sort_index" in req.body) {
  const sortNum = Number(sort_index);

  if (!Number.isInteger(sortNum) || sortNum < 0) {
    return res.status(400).json({ error: "sort_index ist ungültig" });
  }

  updates.push(`sort_index = $${values.length + 1}`);
  values.push(sortNum);
}

  if (updates.length === 0) {
    return res.status(400).json({ error: "Keine gültigen Felder zum Aktualisieren" });
  }

  const idPos = values.length + 1;
  const emailPos = values.length + 2;

  values.push(id, email);

  try {
    const result = await db.query(
      `
        UPDATE lehrplan_eintraege
        SET ${updates.join(", ")}
        WHERE id = $${idPos} AND user_email = $${emailPos}
        RETURNING id, user_email, kategorie, titel, erledigt, start_datum, end_datum, sort_index, created_at
      `,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lehrplan-Eintrag nicht gefunden" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/lehrplan/:id", async (req, res) => {
  const { id } = req.params;
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "E-Mail ist erforderlich" });
  }

  try {
    const result = await db.query(
      `
        DELETE FROM lehrplan_eintraege
        WHERE id = $1 AND user_email = $2
        RETURNING id, user_email, kategorie, titel, erledigt, created_at
      `,
      [id, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lehrplan-Eintrag nicht gefunden" });
    }

    res.json({
      success: true,
      geloescht: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/hymnen/:id", async (req, res) => {
  const { id } = req.params;
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const eintragResult = await client.query(
      `
        SELECT
          h.id,
          h.kind_id,
          h.titel,
          h.punkte,
          k.name AS kind_name,
          k.hymne,
          k.gesamt
        FROM hymnen_eintraege h
        JOIN kinder k ON k.id = h.kind_id
        WHERE h.id = $1
      `,
      [id]
    );

    if (eintragResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Hymnen-Eintrag nicht gefunden" });
    }

    const eintrag = eintragResult.rows[0];

    await client.query(
      `DELETE FROM hymnen_eintraege WHERE id = $1`,
      [id]
    );

    await client.query("COMMIT");

    res.json({
      success: true,
      geloeschter_eintrag: {
        id: eintrag.id,
        titel: eintrag.titel,
        punkte: Number(eintrag.punkte) || 0
      },
      kind: {
        id: eintrag.kind_id,
        name: eintrag.kind_name,
        hymne: Number(eintrag.hymne) || 0,
        gesamt: Number(eintrag.gesamt) || 0
      }
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.delete("/api/kinder/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM kinder WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// === BILD HOCHLADEN ===
app.post("/api/kinder/:id/bild", upload.single("bild"), async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: "Kein Bild hochgeladen" });
  }

  const neueBildUrl = `/images/kinderbilder/${req.file.filename}`;

  try {
    // Prüfen, ob das Kind existiert und altes Bild holen
    const result = await db.query(
      `SELECT bildurl FROM kinder WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      // Falls Kind nicht existiert: neu hochgeladene Datei wieder löschen
      const neuerPfad = path.join(uploadDir, req.file.filename);
      if (fs.existsSync(neuerPfad)) {
        fs.unlinkSync(neuerPfad);
      }

      return res.status(404).json({ error: "Kind nicht gefunden" });
    }

    const alteBildUrl = result.rows[0].bildurl;

    // Neues Bild in DB speichern
    await db.query(
      `UPDATE kinder SET bildurl = $1 WHERE id = $2`,
      [neueBildUrl, id]
    );

    // Altes Bild löschen, falls vorhanden
    if (alteBildUrl) {
      const alterDateiname = path.basename(alteBildUrl);
      const alterPfad = path.join(uploadDir, alterDateiname);

      if (fs.existsSync(alterPfad)) {
        fs.unlinkSync(alterPfad);
      }
    }

    res.json({ bildUrl: neueBildUrl });
  } catch (err) {
    console.error("Fehler beim Speichern des Bildes:", err);
    res.status(500).json({ error: err.message });
  }
});


// === BILD LÖSCHEN ===
app.delete("/api/kinder/:id/bild", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT bildurl FROM kinder WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Kind nicht gefunden" });
    }

    const bildUrl = result.rows[0].bildurl;

    if (bildUrl) {
      const dateiname = path.basename(bildUrl);
      const filePath = path.join(uploadDir, dateiname);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.query(
      `UPDATE kinder SET bildurl = NULL WHERE id = $1`,
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Löschen des Bildes:", err);
    res.status(500).json({ error: err.message });
  }
});

// === Tabelle erstellen und Server starten ===
createTableIfNotExists().then(() => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`✅ Server läuft auf Port ${PORT}`));
});
