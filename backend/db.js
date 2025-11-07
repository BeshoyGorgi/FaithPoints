import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost", //  http://localhost:3000/api/kinder
  user: "Beshoy",
  password: "IHIBHE10d.",
  database: "Faith_Points"
});

// Promisify
const dbPromise = db.promise();

db.connect((err) => {
  if (err) {
    console.error("Fehler bei der Datenbankverbindung:", err.message);
  } else {
    console.log("Erfolgreich mit MySQL verbunden!");
  }
});

export default dbPromise;