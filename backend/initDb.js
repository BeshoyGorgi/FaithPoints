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
        last_updated TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("✅ Tabelle 'kinder' ist bereit!");
  } catch (err) {
    console.error("❌ Fehler beim Erstellen der Tabelle:", err.message);
  }
}
