const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const router = express.Router();

// Registro de usuário
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username, hashedPassword, role], (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ message: 'Usuário registrado com sucesso' });
    });
});

// Login de usuário
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, 'secret_key', { expiresIn: '1h' });
        res.json({ token });
    });
});

// Middleware para verificar token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.sendStatus(403);
    }
    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
}

// Gerenciamento de recursos (para administradores)
router.post('/resources', verifyToken, (req, res) => {
    if (req.userRole !== 'admin') {
        return res.sendStatus(403);
    }
    const { name, type, status } = req.body;
    db.run(`INSERT INTO resources (name, type, status) VALUES (?, ?, ?)`, [name, type, status], (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ message: 'Recurso adicionado com sucesso' });
    });
});

// Obter recursos
router.get('/resources', verifyToken, (req, res) => {
    db.all(`SELECT * FROM resources`, [], (err, resources) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(resources);
    });
});

module.exports = router;
