const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");
try {
  db.run(
    "CREATE TABLE Trains(train_id INTEGER PRIMARY KEY, train_name TEXT,capacity INTEGER)"
  );
  console.log("database created");
} catch (error) {
  console.log("database present");
}

db.close();
