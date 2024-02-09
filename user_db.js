const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");
try {
  db.run(
    "CREATE TABLE Users(user_id INTEGER PRIMARY KEY, user_name TEXT,balance INTEGER)"
  );
  console.log("database created");
} catch (error) {
  console.log("database present");
}

db.close();
