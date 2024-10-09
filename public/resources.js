document.addEventListener('DOMContentLoaded', () => {
    const userToken = localStorage.getItem('userToken');
    let userType = '';

    if (userToken) {
        const decodedToken = atob(userToken);
        userType = decodedToken.split(':')[1];
    }

    if (userType === 'Funcionário') {
        document.getElementById('resourceForm').style.display = 'none';
    }

    loadResources();

    document.getElementById('resourceForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const descricao = document.getElementById('descricao').value;
        const quantidade = document.getElementById('quantidade').value;
        const valor = document.getElementById('valor').value;
        const status = document.getElementById('status').value;

        try {
            const response = await fetch('/api/recursos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                },
                body: JSON.stringify({ nome_recurso: nome, descricao, quantidade, valor, status }),
            });

            const result = await response.json();

            if (result.success) {
                loadResources();
                document.getElementById('resourceForm').reset();
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    });
});

function loadResources() {
    fetch('/api/recursos', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const resourceList = document.getElementById('resourceList');
            resourceList.innerHTML = '';
            const table = document.createElement('table');
            table.innerHTML = `
                <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Quantidade</th>
                    <th>Valor Unitário ($)</th>
                    <th>Valor Total ($)</th>
                </tr>
            `;
            data.data.forEach(resource => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${resource.nome_recurso}</td>
                    <td>${resource.descricao}</td>
                    <td>${resource.quantidade}</td>
                    <td>${resource.valor.toFixed(2)}</td>
                    <td>${(resource.quantidade * resource.valor).toFixed(2)}</td>
                `;
                table.appendChild(tr);
            });
            resourceList.appendChild(table);
        }
    });
}

function logout() {
    localStorage.removeItem('userToken');
    window.location.href = 'login.html';
}
