document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
        });

        const result = await response.json();
        if (result.success) {
            localStorage.setItem('userToken', result.token);
            window.location.href = 'dashboard.html';
        } else {
            document.getElementById('loginError').textContent = result.message;
        }
    } catch (error) {
        document.getElementById('loginError').textContent = 'Erro na conexão com o servidor.';
    }
});
