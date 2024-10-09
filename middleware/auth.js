function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ success: false, message: 'Token não fornecido.' });

    try {
        const token = authHeader.split(' ')[1];
        const decoded = Buffer.from(token, 'base64').toString().split(':');
        req.user = { id: decoded[0], tipo: decoded[1] };
        next();
    } catch {
        return res.status(403).json({ success: false, message: 'Token inválido.' });
    }
}

function verificarPermissao(permissaoRequerida) {
    return (req, res, next) => {
        const { tipo } = req.user;
        const permissoes = {
            'Funcionário': ['visualizar'],
            'Gerente': ['visualizar', 'editar', 'adicionar'],
            'Administrador de Segurança': ['visualizar', 'editar', 'adicionar', 'remover'],
        };

        if (!permissoes[tipo] || !permissoes[tipo].includes(permissaoRequerida)) {
            return res.status(403).json({ success: false, message: 'Permissão negada.' });
        }
        next();
    };
}

module.exports = { verificarToken, verificarPermissao };
