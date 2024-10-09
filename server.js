// server.js
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const db = require('./db');
const { verificarToken, verificarPermissao } = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rota para registro de usuário
app.post('/register', (req, res) => {
    const { nome, email, senha, tipo } = req.body;
    const senhaHash = bcrypt.hashSync(senha, 10);

    db.run('INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES (?, ?, ?, ?)',
        [nome, email, senhaHash, tipo],
        (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Erro ao registrar usuário.' });
            }
            res.json({ success: true });
        });
});

// Rota para login de usuário
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
        if (!user || !bcrypt.compareSync(senha, user.senha_hash)) {
            return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
        }

        const token = Buffer.from(`${user.id}:${user.tipo_usuario}`).toString('base64');
        res.json({ success: true, token });
    });
});

// Rota para listar recursos
app.get('/api/recursos', verificarToken, verificarPermissao('visualizar'), (req, res) => {
    db.all('SELECT * FROM recursos', [], (err, rows) => {
        if (err) {
            console.error('Erro ao listar recursos:', err.message);
            return res.status(500).json({ success: false, message: 'Erro ao listar recursos.' });
        }
        res.json({ success: true, data: rows });
    });
});

// Rota para adicionar recurso
app.post('/api/recursos', verificarToken, verificarPermissao('adicionar'), (req, res) => {
    const { nome_recurso, descricao, quantidade, valor, status } = req.body;
    db.run('INSERT INTO recursos (nome_recurso, descricao, quantidade, valor, status) VALUES (?, ?, ?, ?, ?)',
        [nome_recurso, descricao, quantidade, valor, status],
        (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Erro ao adicionar recurso' });
            res.json({ success: true });
        });
});

// Rota para buscar um recurso específico
app.get('/api/recursos/:id', verificarToken, verificarPermissao('visualizar'), (req, res) => {
    db.get('SELECT * FROM recursos WHERE id = ?', [req.params.id], (err, row) => {
        if (err || !row) return res.status(404).json({ success: false, message: 'Recurso não encontrado' });
        res.json({ success: true, data: row });
    });
});

// Rota para atualizar um recurso
app.put('/api/recursos/:id', verificarToken, verificarPermissao('editar'), (req, res) => {
    const { nome_recurso, descricao, quantidade, valor, status } = req.body;
    db.run('UPDATE recursos SET nome_recurso = ?, descricao = ?, quantidade = ?, valor = ?, status = ? WHERE id = ?',
        [nome_recurso, descricao, quantidade, valor, status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Erro ao atualizar recurso' });
            res.json({ success: true });
        });
});

// Rota para deletar um recurso
app.delete('/api/recursos/:id', verificarToken, verificarPermissao('remover'), (req, res) => {
    db.run('DELETE FROM recursos WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Erro ao excluir recurso' });
        res.json({ success: true });
    });
});

app.use(errorHandler);

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
