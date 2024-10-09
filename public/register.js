document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const tipo = document.getElementById('tipo').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email, senha, tipo }),
        });

        const result = await response.json();
        if (result.success) {
            alert('Registro realizado com sucesso! Faça login.');
            window.location.href = 'login.html';
        } else {
            document.getElementById('registerError').textContent = result.message;
        }
    } catch (error) {
        document.getElementById('registerError').textContent = 'Erro na conexão com o servidor.';
    }
});
