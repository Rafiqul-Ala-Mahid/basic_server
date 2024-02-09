const express = require("express");
var sqlite3 = require("sqlite3").verbose();

var db = new sqlite3.Database("database.db");
const app = express();
const port = process.env.port || 8000;

app.use(express.json());

const bodyParser = require("body-parser");

// Sample in-memory data store
const items = [];

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

// Endpoint for adding user
app.post("/api/users", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const { user_id, user_name, balance } = req.body;
  console.log(req.body);
  db.run(
    "INSERT INTO Users VALUES(?,?,?)",
    [user_id, user_name, balance],
    //"CREATE TABLE Users(user_id INTEGER PRIMARY KEY, user_name TEXT,balance INTEGER)"
    function (err) {
      if (err) {
        res.status(400).send({ message: err });
        return;
      }
      console.log("New User has been added");
      res.status(201).send(req.body);
    }
  );
});

// Endpoint for adding station
app.post("/api/stations", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const { station_id, station_name, longitude, latitude } = req.body;
  console.log(req.body);
  db.run(
    "INSERT INTO Stations VALUES(?,?,?,?)",
    [station_id, station_name, longitude, latitude],
    //"CREATE TABLE Stations(station_id INTEGER PRIMARY KEY, station_name TEXT,longitude DECIMAL(10,5), latitude DECIMAL(10,5))"
    function (err) {
      if (err) {
        res.status(400).send({ message: err });
        return;
      }
      console.log("New Station has been added");
      res.status(201).send(req.body);
    }
  );
});

// Endpoint for adding trains
app.post("/api/trains", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const { train_id, train_name, capacity, stops } = req.body;
  console.log(req.body);
  start_time = null;
  end_time = null;
  stops.forEach((element) => {
    if (element.arrival_time === null) start_time = element.departure_time;
    if (element.departure_time === null) end_time = element.arrival_time;
  });

  db.serialize(() => {
    db.run("INSERT INTO Trains VALUES(?,?,?)", [
      train_id,
      train_name,
      capacity,
    ]);
    //"CREATE TABLE Books(id INTEGER PRIMARY KEY, title TEXT,author TEXT , genre TEXT, price DECIMAL(10,5))"
    const insertStmt = db.prepare("INSERT INTO stops VALUES (?, ?, ?,?,?)");

    stops.forEach((stop) => {
      insertStmt.run(
        stop.station_id,
        train_id,
        stop.arrival_time,
        stop.departure_time,
        stop.fare
      );
    });

    insertStmt.finalize();
    res.status(201).send({
      train_id: train_id,
      train_name: train_name,
      capacity: capacity,
      service_start: start_time,
      service_ends: end_time,
      num_stations: stops.length,
    });

    //console.log("New books has been added");
    //res.status(201).send(req.body);
  });
});

// Endpoint for fetching a book by ID
app.get("/api/wallets/:id", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const id = parseInt(req.params.id);
  console.log(id);

  const query = "SELECT * FROM Users WHERE user_id = ?";

  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).send({
        message: `server error`,
        err: err,
      });
      return;
    }
    if (row) {
      res.status(200).send({
        wallet_id: id,
        balance: row.balance,
        wallet_user: {
          user_id: id,
          user_name: row.user_name,
        },
      });
    } else {
      res.status(404).send({
        message: `Wallet with id: ${id} was not found`,
      });
      console.log("User not found");
    }
  });

  // Find the book by ID in the data store
});

// Endpoint for fetching a book by ID
app.get("/api/books/:id", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const bookId = parseInt(req.params.id);
  console.log(bookId);

  const query = "SELECT * FROM Books WHERE id = ?";

  db.get(query, [bookId], (err, row) => {
    if (err) {
      res.status(500).send({
        message: `server error`,
        err: err,
      });
      return;
    }
    if (row) {
      res.status(200).send(row);
    } else {
      res.status(404).send({
        message: `book with id: ${bookId} was not found`,
      });
      console.log("User not found");
    }
  });

  // Find the book by ID in the data store
});

// Endpoint for getting a list of books
app.get("/api/books", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  console.log(req.query);
  //const query = "SELECT * FROM Books";

  let condition = "TRUE";
  let sort_criteria = "id";
  let sort_order = "ASC";

  if (req.query.title) {
    condition = `title = "` + req.query.title + `"`;
  }
  if (req.query.author) {
    condition = "author = " + req.query.author;
  }
  if (req.query.genre) {
    condition = "genre = " + req.query.genre;
  }

  if (req.query.sort) sort_criteria = req.query.sort;

  if (req.query.order) sort_order = req.query.order;

  const query =
    "SELECT * FROM Books WHERE " +
    condition +
    " ORDER BY " +
    sort_criteria +
    " " +
    sort_order +
    " , id ASC";
  console.log(query);
  db.all(query, (err, rows) => {
    if (err) {
      console.log(err);
      res.status(500).send({
        message: `server error`,
        err: err,
      });
      return;
    }
    res.status(200).send({ books: rows });
  });
});

// Endpoint for getting a list of stations
app.get("/api/stations", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const query = "SELECT * FROM Stations";
  db.all(query, (err, rows) => {
    if (err) {
      console.log(err);
      res.status(500).send({
        message: `server error`,
        err: err,
      });
      return;
    }
    res.status(200).send({ stations: rows });
  });
});

// Endpoint for getting a list of trains
app.get("/api/stations/:id/trains", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const id = req.params.id;
  console.log(id);
  const query = "SELECT * FROM Stations WHERE station_id = ?";

  db.get(query, [id], (err, row) => {
    if (err) {
      console.log(err);
      res.status(500).send({
        message: `server error`,
        err: err,
      });
      return;
    }
    if (row) {
      const query =
        "SELECT stops.train_id,stops.arrival_time,stops.departure_time FROM stops JOIN trains ON stops.train_id = trains.train_id WHERE stops.station_id = " +
        id +
        " ";
      db.all(query, (err, rows) => {
        if (err) {
          console.log(err);
          res.status(500).send({
            message: `server error`,
            err: err,
          });
          return;
        }
        res.status(200).send({ station_id: parseInt(id), trains: rows });
      });
    } else {
      res.status(404).send({
        message: `station with id: ${id} was not found`,
      });
      console.log("User not found");
    }
  });
});

// Endpoint for updating data
app.put("/api/wallets/:id", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const id = parseInt(req.params.id);
  const recharge = req.body.recharge;

  // Check if the book with the given ID exists
  db.get("SELECT * FROM Users WHERE user_id = ?", [id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (!row) {
      // Wallet with the given ID not found
      res.status(404).send({ message: `wallet with id: ${id} was not found` });
      return;
    }
    if (recharge > 10000 || recharge < 100) {
      res.status(400).send({ message: `invalid amount: ${recharge}` });
      return;
    }

    // Update values for the book with the given ID
    const updateQuery = "UPDATE Users SET balance = ? WHERE user_id = ?";
    db.run(updateQuery, [row.balance + recharge, id], (updateErr) => {
      if (updateErr) {
        console.error(updateErr.message);
        res.status(500).json({ error: "Internal Server Error" });
        return;
      }
      row.balance += recharge;
      res.status(200).json(row);
    });
  });
});

app.post("/api/tickets", (req, res) => {
  console.log("hell");
  res.setHeader("Content-Type", "application/json");

  res.status(201).send("hello");
});

app.get("/api/routes", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  
  res.status(200).send("hello");
});

// Endpoint for updating data
app.put("/api/books/:id", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const bookId = parseInt(req.params.id);
  const updatedValues = req.body;

  // Check if the book with the given ID exists
  db.get("SELECT * FROM books WHERE id = ?", [bookId], (err, existingBook) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (!existingBook) {
      // Book with the given ID not found
      res
        .status(404)
        .send({ message: `book with id: ${bookId} was not found` });
      return;
    }

    // Update values for the book with the given ID
    const updateQuery =
      "UPDATE books SET author = ?, title = ?, genre = ?, price = ? WHERE id = ?";
    db.run(
      updateQuery,
      [
        updatedValues.author,
        updatedValues.title,
        updatedValues.genre,
        updatedValues.price,
        bookId,
      ],
      (updateErr) => {
        if (updateErr) {
          console.error(updateErr.message);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
        res.status(200).json({ id: bookId, ...updatedValues });
      }
    );
  });
});

// Start the server
app.listen(port, function () {
  console.log(`Listening on port ${port}!`);
});
