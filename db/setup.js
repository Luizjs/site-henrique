// update_schema.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.run(`ALTER TABLE resources ADD COLUMN quantity INTEGER NOT NULL DEFAULT 0`, (err) => {
        if (err) {
            console.error('Could not update resources table:', err.message);
        } else {
            console.log('Updated resources table to include quantity.');
        }
    });
});

db.close();
