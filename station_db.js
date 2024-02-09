const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");
try {
  db.run(
    "CREATE TABLE Stations(station_id INTEGER PRIMARY KEY, station_name TEXT,longitude DECIMAL(10,5), latitude DECIMAL(10,5))"
  );
  console.log("database created");
} catch (error) {
  console.log("database present");
}

db.close();
