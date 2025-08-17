const express = require('express');
const   sqlite3 = require('sqlite3').verbose();
const cors = require('cors');


const app = express();
const db = new sqlite3.Database(__dirname + '/../data/database.db');
if (db) {
    console.log("Connected to the database.");
} else {
    console.error("Failed to connect to the database.");
}

//middleware
app.use(cors());
app.use(express.json());


//endpoint para obtener todas las cards
app.get('/', (req, res) => {
    console.log('Request type:', req.method);
    //db.all trae todos los elementos
    db.all("SELECT * FROM cards", [], (err, row) => {
        if (err) {
            console.error("Error fetching card:", err);
            res.status(500).json({ error: "Failed to fetch card" });
            return;
        }
        res.json(row);
    });
});

app.post('/', (req, res) => {
    const { title, content } = req.body;
    db.run("INSERT INTO cards (title, content) VALUES (?, ?)", [title, content], function(err) {
        if (err) {
            console.error("Error inserting card:", err);
            res.status(500).json({ error: "Failed to insert card" });
            return;
        }
        res.status(201).json({ id: this.lastID, title, content });
    });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/`);
});
