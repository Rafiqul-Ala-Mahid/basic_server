const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");
try {
  db.run(
    "CREATE TABLE stops(station_id INTEGER, train_id INTEGER, arrival_time TEXT,departure_time TEXT,fare INTEGER) "
  );
  console.log("database created");
} catch (error) {
  console.log("database present");
}

db.close();
