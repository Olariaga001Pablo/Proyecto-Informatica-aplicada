const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(__dirname + '/../data/database.db')

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS cards (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT)")
    const stmt = db.prepare("INSERT INTO cards (title, content) VALUES (?, ?)")
    for (let i = 0; i < 10; i++) {
        stmt.run(`Card ${i + 1}`, `Content for card ${i + 1}`)
    }
    stmt.finalize();

    db.each("SELECT id, title, content FROM cards", (err, row) => {
        console.log(row.id + "-" + row.title + "-" + row.content);
    });

});  

db.close();
