// clientes.js

const ClientesModule = (function() {
    // Inicialização do módulo
    function init() {
        document.addEventListener('section:shown', function(e) {
            if (e.detail.sectionId === 'clientes') {
                carregarHTML();
                listarClientes();
                bindEvents();
            }
        });
    }

    // Carrega o HTML base da seção
    function carregarHTML() {
        const container = document.getElementById('clientes');
        container.innerHTML = `
            <div class="container-fluid">
                <h2>Clientes</h2>
                <p>Aqui você pode gerenciar seus clientes.</p>

                <div class="mb-3">
                    <button class="btn btn-primary" id="btnAdicionarCliente">
                        <i class="fas fa-plus mr-1"></i>Adicionar Cliente
                    </button>
                </div>

                <!-- Tabela de clientes -->
                <div class="table-responsive">
                    <table class="table table-striped" id="tabelaClientes">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF/CNPJ</th>
                                <th>Telefone</th>
                                <th>Email</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Linhas serão inseridas aqui via JavaScript -->
                        </tbody>
                    </table>
                </div>

                <!-- Modal para Adicionar/Editar Cliente -->
                <div class="modal fade" id="modalCliente" tabindex="-1" aria-labelledby="modalClienteLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <!-- Conteúdo será inserido dinamicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Lista os clientes do banco de dados
    function listarClientes() {
        db.clientes.toArray().then(clientes => {
            const tbody = document.querySelector('#tabelaClientes tbody');
            tbody.innerHTML = '';

            if (clientes.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">Nenhum cliente cadastrado.</td>
                    </tr>
                `;
            } else {
                clientes.forEach(cliente => {
                    const row = `
                        <tr>
                            <td>${cliente.nome}</td>
                            <td>${cliente.cpfCnpj}</td>
                            <td>${cliente.telefone}</td>
                            <td>${cliente.email}</td>
                            <td>
                                <button class="btn btn-sm btn-info" onclick="ClientesModule.editarCliente(${cliente.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="ClientesModule.excluirCliente(${cliente.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            }
        }).catch(error => {
            console.error('Erro ao listar clientes:', error);
            mostrarToast('Erro', 'Erro ao carregar a lista de clientes.', 'danger');
        });
    }

    // Vincula eventos
    function bindEvents() {
        // Evento para abrir o modal de adicionar cliente
        document.getElementById('btnAdicionarCliente').addEventListener('click', function() {
            abrirModalCliente();
        });

        // Evento para limpar o formulário quando o modal é fechado
        $('#modalCliente').on('hidden.bs.modal', () => {
            $('#formCliente')[0].reset();
            $('#clienteId').val('');
        });
    }

    // Abre o modal para adicionar ou editar cliente
    function abrirModalCliente(cliente = null) {
        const tituloModal = cliente ? 'Editar Cliente' : 'Adicionar Cliente';

        // Limpa o conteúdo anterior e adiciona o formulário
        $('#modalCliente .modal-content').html(`
            <div class="modal-header">
                <h5 class="modal-title" id="modalClienteLabel">${tituloModal}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="formCliente">
                    <input type="hidden" id="clienteId" value="${cliente ? cliente.id : ''}">
                    
                    <div class="form-group">
                        <label for="nomeCliente">Nome*</label>
                        <input type="text" class="form-control" id="nomeCliente" value="${cliente ? cliente.nome : ''}" required>
                    </div>

                    <div class="form-group">
                        <label for="cpfCnpjCliente">CPF/CNPJ*</label>
                        <input type="text" class="form-control" id="cpfCnpjCliente" value="${cliente ? cliente.cpfCnpj : ''}" required>
                    </div>

                    <div class="form-group">
                        <label for="telefoneCliente">Telefone*</label>
                        <input type="text" class="form-control" id="telefoneCliente" value="${cliente ? cliente.telefone : ''}" required>
                    </div>

                    <div class="form-group">
                        <label for="emailCliente">Email</label>
                        <input type="email" class="form-control" id="emailCliente" value="${cliente ? cliente.email : ''}">
                    </div>

                    <!-- Você pode adicionar mais campos conforme necessário -->

                    <div class="text-right mt-4">
                        <button type="button" class="btn btn-secondary mr-2" data-dismiss="modal">
                            <i class="fas fa-times mr-1"></i>Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save mr-1"></i>Salvar
                        </button>
                    </div>
                </form>
            </div>
        `);

        // Aplicar máscaras nos inputs
        if (window.jQuery) {
            $('#cpfCnpjCliente').mask('000.000.000-00', { reverse: true });
            $('#telefoneCliente').mask('(00) 00000-0000');
        }

        // Configurar o evento de submit do formulário
        $('#formCliente').on('submit', function(e) {
            e.preventDefault();
            salvarCliente();
        });

        $('#modalCliente').modal('show');
    }

    // Salva o cliente no banco de dados
    function salvarCliente() {
        const clienteId = $('#clienteId').val();
        const cliente = {
            nome: $('#nomeCliente').val().trim(),
            cpfCnpj: $('#cpfCnpjCliente').val().trim(),
            telefone: $('#telefoneCliente').val().trim(),
            email: $('#emailCliente').val().trim()
            // Adicione mais campos se necessário
        };

        // Validação adicional
        if (!cliente.nome || !cliente.cpfCnpj || !cliente.telefone) {
            mostrarToast('Erro', 'Por favor, preencha todos os campos obrigatórios.', 'danger');
            return;
        }

        if (clienteId) {
            // Atualização
            db.clientes.update(parseInt(clienteId), cliente).then(() => {
                $('#modalCliente').modal('hide');
                listarClientes();
                mostrarToast('Sucesso', 'Cliente atualizado com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao atualizar cliente:', error);
                mostrarToast('Erro', 'Erro ao atualizar o cliente.', 'danger');
            });
        } else {
            // Novo cliente
            db.clientes.add(cliente).then(() => {
                $('#modalCliente').modal('hide');
                listarClientes();
                mostrarToast('Sucesso', 'Cliente cadastrado com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao adicionar cliente:', error);
                mostrarToast('Erro', 'Erro ao cadastrar o cliente.', 'danger');
            });
        }
    }

    // Abre o modal para editar cliente
    function editarCliente(id) {
        db.clientes.get(id).then(cliente => {
            if (cliente) {
                abrirModalCliente(cliente);
            }
        }).catch(error => {
            console.error('Erro ao carregar cliente para edição:', error);
            mostrarToast('Erro', 'Erro ao carregar os dados do cliente.', 'danger');
        });
    }

    // Exclui o cliente do banco de dados
    function excluirCliente(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            db.clientes.delete(id).then(() => {
                listarClientes();
                mostrarToast('Sucesso', 'Cliente excluído com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao excluir cliente:', error);
                mostrarToast('Erro', 'Erro ao excluir o cliente.', 'danger');
            });
        }
    }

    // Retorna as funções públicas
    return {
        init,
        editarCliente,
        excluirCliente
    };
})();

// Inicializa o módulo quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    ClientesModule.init();
});

// Expõe o módulo globalmente
window.ClientesModule = ClientesModule;
