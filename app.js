const express = require("express");
var sqlite3 = require("sqlite3").verbose();

var db = new sqlite3.Database("database.db");
const app = express();
const port = process.env.port || 5000;

app.use(express.json());

const bodyParser = require("body-parser");

// Sample in-memory data store
const items = [];

app.get("/", (req, res) => {
  res.json({ message: "Hello, World!" });
});

// Endpoint for adding data
app.post("/api/books", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const { id, title, author, genre, price } = req.body;
  console.log(req.body);
  db.run(
    "INSERT INTO Books VALUES(?,?,?,?,?)",
    [id, title, author, genre, price],
    //"CREATE TABLE Books(id INTEGER PRIMARY KEY, title TEXT,author TEXT , genre TEXT, price DECIMAL(10,5))"
    function (err) {
      if (err) {
        res.status(400).send({ message: err });
        return;
      }
      console.log("New books has been added");
      res.status(201).send();
    }
  );
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

  const query = "SELECT * FROM Books";

  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).send({
        message: `server error`,
        err: err,
      });
      return;
    }

    res.status(200).send({ books: rows });
  });
});

// Endpoint for updating data
app.put("/api/books/:id", (req, res) => {
  const bookId = req.params.id;
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
