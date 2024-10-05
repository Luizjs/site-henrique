// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const db = new sqlite3.Database('./db/database.db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

app.use(express.static('public'));

// Middleware para verificar se o usuário é admin
function isAdmin(req, res, next) {
    if (req.session.role === 'admin') {
        return next();
    }
    return res.status(403).send('Acesso negado. Você não tem permissão para realizar esta ação.');
}

// Middleware para verificar se o usuário é gerente
function isManager(req, res, next) {
    if (req.session.role === 'manager') {
        return next();
    }
    return isAdmin(req, res, next);
}

// Rota para autenticação de usuário
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        if (row) {
            req.session.userId = row.id;
            req.session.role = row.role;
            res.redirect('/dashboard.html');
        } else {
            res.status(401).send('Credenciais inválidas');
        }
    });
});

// Rota para adicionar recurso (apenas admin)
app.post('/add-resource', isAdmin, (req, res) => {
    const { name, type, status, quantity } = req.body;
    db.run('INSERT INTO resources (name, type, status, quantity) VALUES (?, ?, ?, ?)', [name, type, status, quantity], (err) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/dashboard.html');
    });
});

// Rota para editar recurso (apenas gerente)
app.post('/edit-resource/:id', isManager, (req, res) => {
    const { id } = req.params;
    const { name, type, status, quantity } = req.body;
    db.run('UPDATE resources SET name = ?, type = ?, status = ?, quantity = ? WHERE id = ?', [name, type, status, quantity, id], (err) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/dashboard.html');
    });
});

// Rota para excluir recurso (apenas admin)
app.post('/delete-resource/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM resources WHERE id = ?', id, (err) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/dashboard.html');
    });
});

// Rota para mudar status (qualquer usuário)
app.post('/change-status/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.run('UPDATE resources SET status = ? WHERE id = ?', [status, id], (err) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/dashboard.html');
    });
});

// Rota para obter recursos
app.get('/resources', (req, res) => {
    db.all('SELECT * FROM resources', [], (err, rows) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.json(rows);
    });
});

// Rota para logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
