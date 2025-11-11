import db from "./db.js";

export async function createTableIfNotExists() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS kinder (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        hymne INT,
        verhalten INT,
        anwesenheit_G INT DEFAULT 0,
        anwesenheit_U INT DEFAULT 0,
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
    console.log("✅ Tabelle 'kinder' ist bereit!");
  } catch (err) {
    console.error("❌ Fehler beim Erstellen der Tabelle:", err.message);
  }
}
