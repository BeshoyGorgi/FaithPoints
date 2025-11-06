import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost", //  http://localhost:3000/api/kinder
  user: "root",
  password: "IHIBHE10d.",
  database: "al7an_punkte"
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