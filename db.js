const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");
try {
    db.run(
      "CREATE TABLE Books(id INTEGER PRIMARY KEY, title TEXT,author TEXT , genre TEXT, price DECIMAL(10,5))"
    );
        console.log("database created")
 } catch (error) { 
    console.log('database present')
}

db.close();
