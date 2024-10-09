let editMode = false;
let editingResourceId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadResources();  // Carrega os recursos ao carregar a página

    document.getElementById('goToResources').addEventListener('click', () => {
        window.location.href = 'resources.html';
    });
});

// Função para carregar recursos e exibir na lista
function loadResources() {
    const userToken = localStorage.getItem('userToken');
    let userType = '';

    if (userToken) {
        const decodedToken = atob(userToken);
        userType = decodedToken.split(':')[1];  // Captura o tipo de usuário
    }

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
            resourceList.innerHTML = '';  // Limpar a lista de recursos antes de preencher

            data.data.forEach(resource => {
                const resourceItem = document.createElement('div');
                resourceItem.classList.add('resource-item');
                resourceItem.innerHTML = `
                    <h4>${resource.nome_recurso}</h4>
                    <p>Descrição: ${resource.descricao}</p>
                    <p>Quantidade: ${resource.quantidade}</p>
                    <p>Valor Unitário: $${resource.valor.toFixed(2)}</p>
                    <div id="chartBox-${resource.id}" class="chart-box" style="display:none;">
                        <canvas id="statusChart-${resource.id}"></canvas>
                    </div>
                    <div id="editForm-${resource.id}" style="display:none;" class="edit-form">
                        <form id="form-${resource.id}">
                            <label for="nome">Nome do Recurso:</label>
                            <input type="text" id="nome-${resource.id}" name="nome" value="${resource.nome_recurso}" required>
                            
                            <label for="descricao">Descrição:</label>
                            <input type="text" id="descricao-${resource.id}" name="descricao" value="${resource.descricao}" required>
                            
                            <label for="quantidade">Quantidade:</label>
                            <input type="number" id="quantidade-${resource.id}" name="quantidade" value="${resource.quantidade}" required>
                            
                            <label for="valor">Valor Unitário ($):</label>
                            <input type="number" id="valor-${resource.id}" name="valor" value="${resource.valor}" required step="0.01">
                            
                            <label for="status">Status:</label>
                            <select id="status-${resource.id}" name="status" required>
                                <option value="disponível" ${resource.status === 'disponível' ? 'selected' : ''}>Disponível</option>
                                <option value="em uso" ${resource.status === 'em uso' ? 'selected' : ''}>Em Uso</option>
                            </select>
                            <button type="submit">Salvar</button>
                        </form>
                    </div>
                    <button id="toggleChart-${resource.id}" onclick="toggleChart(${resource.id})">Visualizar Gráfico</button>
                    <button onclick="toggleEditForm(${resource.id})">Editar</button>
                    ${userType === 'Administrador de Segurança' ? `<button onclick="deleteResource(${resource.id})">Excluir</button>` : ''}
                `;
                resourceList.appendChild(resourceItem);

                // Adicionar comportamento de submissão ao formulário de edição
                document.getElementById(`form-${resource.id}`).addEventListener('submit', (e) => {
                    e.preventDefault();
                    updateResource(resource.id);  // Atualizar o recurso com os valores editados
                });
            });
        }
    })
    .catch(error => {
        console.error('Erro ao carregar recursos:', error);
    });
}

// Função para alternar entre exibir/ocultar gráfico
function toggleChart(id) {
    const chartBox = document.getElementById(`chartBox-${id}`);
    const toggleButton = document.getElementById(`toggleChart-${id}`);

    if (chartBox.style.display === 'none') {
        showResourceChart(id);  // Exibir gráfico
        toggleButton.textContent = 'Ocultar Gráfico';
    } else {
        chartBox.style.display = 'none';  // Ocultar gráfico
        toggleButton.textContent = 'Visualizar Gráfico';
    }
}

// Função para mostrar gráfico específico de um recurso
function showResourceChart(id) {
    fetch(`/api/recursos/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const resource = data.data;

            // Mostrar a box do gráfico e gerar o gráfico
            const chartBox = document.getElementById(`chartBox-${id}`);
            chartBox.style.display = 'block';  // Tornar visível a box do gráfico

            // Atualizar o gráfico
            const ctx = document.getElementById(`statusChart-${id}`).getContext('2d');
            const chartData = {
                labels: ['Quantidade', 'Valor Total'],
                datasets: [{
                    label: resource.nome_recurso,
                    data: [resource.quantidade, resource.quantidade * resource.valor],
                    backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                    borderWidth: 1,
                }]
            };
            if (window[`myChart_${id}`]) window[`myChart_${id}`].destroy();  // Destroi o gráfico antigo antes de criar um novo
            window[`myChart_${id}`] = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    })
    .catch(error => {
        console.error('Erro ao carregar gráfico do recurso:', error);
    });
}

// Função para alternar entre exibir/ocultar formulário de edição
function toggleEditForm(id) {
    const editForm = document.getElementById(`editForm-${id}`);
    if (editForm.style.display === 'none') {
        editForm.style.display = 'block';  // Exibir formulário de edição
        toggleButton.textContent = 'Editar';
    } else {
        editForm.style.display = 'none';  // Ocultar formulário de edição
        toggleButton.textContent = 'Ocultar Edição';
    }
}

// Função para atualizar o recurso existente (corrigida)
function updateResource(id) {
    const nome = document.getElementById(`nome-${id}`).value;
    const descricao = document.getElementById(`descricao-${id}`).value;
    const quantidade = document.getElementById(`quantidade-${id}`).value;
    const valor = document.getElementById(`valor-${id}`).value;
    const status = document.getElementById(`status-${id}`).value;

    fetch(`/api/recursos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: JSON.stringify({
            nome_recurso: nome,
            descricao,
            quantidade,
            valor,
            status
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            console.error('Erro ao atualizar recurso:', data.message);
        }
        loadResources();  // Recarrega os recursos após a edição
    })
    .catch(error => {
        console.error('Erro na requisição de atualização:', error);
    });
}

// Função para excluir recurso
function deleteResource(id) {
    fetch(`/api/recursos/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
    })
    .then(() => loadResources())  // Recarrega os recursos após exclusão
    .catch(error => {
        console.error('Erro ao excluir recurso:', error);
    });
}
