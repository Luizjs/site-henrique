// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('sistema_seguranca.db');

// Inicializa o banco de dados e cria tabelas
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL,
            tipo_usuario TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS recursos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_recurso TEXT NOT NULL,
            descricao TEXT,
            quantidade INTEGER,
            valor REAL,
            status TEXT
        )
    `);
});

module.exports = db;
