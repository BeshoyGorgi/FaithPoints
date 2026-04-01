import db from "./db.js";

export async function createTableIfNotExists() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS kinder (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        hymne INT,
        verhalten INT,
        anwesenheit_G INT,
        anwesenheit_U INT,
        gesamt INT,
        klasse VARCHAR(50),
        eltern VARCHAR(100),
        telefon VARCHAR(20),
        bildUrl VARCHAR(255),
        user_id INT,
        user_email VARCHAR(255),
        last_updated_hymne TIMESTAMP DEFAULT NOW(),
        last_updated_anwesenheit_g TIMESTAMP DEFAULT NOW(),
        last_updated_anwesenheit_u TIMESTAMP DEFAULT NOW()
      );
    `);

    await db.query(`
    CREATE TABLE IF NOT EXISTS hymnen_eintraege (
      id SERIAL PRIMARY KEY,
      kind_id INT NOT NULL REFERENCES kinder(id) ON DELETE CASCADE,
      titel VARCHAR(255) DEFAULT '',
      kategorie VARCHAR(150) DEFAULT '',
      punkte INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.query(`
    ALTER TABLE hymnen_eintraege
    ADD COLUMN IF NOT EXISTS kategorie VARCHAR(150) DEFAULT '';
  `);

    console.log("✅ Tabellen 'kinder' und 'hymnen_eintraege' sind bereit!");
  } catch (err) {
    console.error("❌ Fehler beim Erstellen der Tabellen:", err.message);
  }
}