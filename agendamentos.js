// agendamentos.js

const AgendamentosModule = (function() {
    // Inicialização do módulo
    function init() {
        document.addEventListener('section:shown', function(e) {
            if (e.detail.sectionId === 'agendamento') {
                carregarHTML();
                listarAgendamentos();
                bindEvents();
            }
        });
    }

    // Carrega o HTML base da seção
    function carregarHTML() {
        const container = document.getElementById('agendamento');
        container.innerHTML = `
            <div class="container-fluid">
                <h2>Agendamentos</h2>
                <p>Aqui você pode gerenciar os agendamentos.</p>

                <div class="mb-3">
                    <button class="btn btn-primary" id="btnAdicionarAgendamento">
                        <i class="fas fa-plus mr-1"></i>Novo Agendamento
                    </button>
                </div>

                <!-- Tabela de agendamentos -->
                <div class="table-responsive">
                    <table class="table table-striped" id="tabelaAgendamentos">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Serviço</th>
                                <th>Data</th>
                                <th>Hora</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Linhas serão inseridas aqui via JavaScript -->
                        </tbody>
                    </table>
                </div>

                <!-- Calendário -->
                <div id="calendar" class="mt-4"></div>

                <!-- Modal para Adicionar/Editar Agendamento -->
                <div class="modal fade" id="modalAgendamento" tabindex="-1" aria-labelledby="modalAgendamentoLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <!-- Conteúdo será inserido dinamicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Lista os agendamentos do banco de dados
    function listarAgendamentos() {
        db.agendamentos.toArray().then(agendamentos => {
            const tbody = document.querySelector('#tabelaAgendamentos tbody');
            tbody.innerHTML = '';

            if (agendamentos.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">Nenhum agendamento cadastrado.</td>
                    </tr>
                `;
                inicializarCalendario([]); // Inicializa o calendário vazio
            } else {
                const eventosCalendario = []; // Array para armazenar os eventos do calendário

                const promises = agendamentos.map(agendamento => {
                    return Promise.all([
                        db.clientes.get(agendamento.clienteId),
                        db.servicos.get(agendamento.servicoId)
                    ]).then(([cliente, servico]) => {
                        // Adiciona o evento ao calendário
                        eventosCalendario.push({
                            id: agendamento.id.toString(),
                            title: `${cliente ? cliente.nome : 'Cliente não encontrado'} - ${servico ? servico.nome : 'Serviço não encontrado'}`,
                            start: `${agendamento.data}T${agendamento.hora}`,
                            color: obterCorPorStatus(agendamento.status),
                        });

                        return { agendamento, cliente, servico };
                    });
                });

                Promise.all(promises).then(results => {
                    results.forEach(({ agendamento, cliente, servico }) => {
                        const row = `
                            <tr>
                                <td>${cliente ? cliente.nome : 'Cliente não encontrado'}</td>
                                <td>${servico ? servico.nome : 'Serviço não encontrado'}</td>
                                <td>${formatarData(agendamento.data)}</td>
                                <td>${agendamento.hora}</td>
                                <td>${formatarStatus(agendamento.status)}</td>
                                <td>
                                    <button class="btn btn-sm btn-info" onclick="AgendamentosModule.editarAgendamento(${agendamento.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="AgendamentosModule.excluirAgendamento(${agendamento.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                        tbody.innerHTML += row;
                    });

                    // Após processar todos os agendamentos, inicializamos o calendário com os eventos
                    inicializarCalendario(eventosCalendario);
                });
            }
        }).catch(error => {
            console.error('Erro ao listar agendamentos:', error);
            mostrarToast('Erro', 'Erro ao carregar a lista de agendamentos.', 'danger');
        });
    }

    // Inicializa o calendário com os eventos fornecidos
    function inicializarCalendario(eventos) {
        const calendarEl = document.getElementById('calendar');
        calendarEl.innerHTML = ''; // Limpa o calendário anterior, se houver

        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'pt-br', // Define o idioma para Português (Brasil)
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: eventos,
            dateClick: function(info) {
                // Ao clicar em um dia no calendário, abre o modal para adicionar um novo agendamento nessa data
                abrirModalAgendamentoPorData(info.dateStr);
            },
            eventClick: function(info) {
                // Ao clicar em um evento, abre o modal para editar o agendamento correspondente
                editarAgendamento(parseInt(info.event.id));
            },
            eventDisplay: 'block', // Exibe o evento como bloco
            height: 'auto' // Ajusta a altura automaticamente
        });

        calendar.render();
    }

    // Função para abrir o modal de agendamento com a data pré-selecionada
    function abrirModalAgendamentoPorData(data) {
        abrirModalAgendamento();
        $('#dataAgendamento').val(data);
    }

    // Vincula eventos
    function bindEvents() {
        // Evento para abrir o modal de adicionar agendamento
        document.getElementById('btnAdicionarAgendamento').addEventListener('click', function() {
            abrirModalAgendamento();
        });

        // Evento para limpar o formulário quando o modal é fechado
        $('#modalAgendamento').on('hidden.bs.modal', () => {
            $('#formAgendamento')[0].reset();
            $('#agendamentoId').val('');
        });
    }

    // Abre o modal para adicionar ou editar agendamento
    function abrirModalAgendamento(agendamento = null) {
        const tituloModal = agendamento ? 'Editar Agendamento' : 'Novo Agendamento';

        // Limpa o conteúdo anterior e adiciona o formulário
        $('#modalAgendamento .modal-content').html(`
            <div class="modal-header">
                <h5 class="modal-title" id="modalAgendamentoLabel">${tituloModal}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="formAgendamento">
                    <input type="hidden" id="agendamentoId" value="${agendamento ? agendamento.id : ''}">

                    <div class="form-group">
                        <label for="clienteId">Cliente*</label>
                        <select class="form-control" id="clienteId" required>
                            <option value="">Carregando clientes...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="servicoId">Serviço*</label>
                        <select class="form-control" id="servicoId" required>
                            <option value="">Carregando serviços...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="dataAgendamento">Data*</label>
                        <input type="date" class="form-control" id="dataAgendamento" required>
                    </div>

                    <div class="form-group">
                        <label for="horaAgendamento">Hora*</label>
                        <input type="time" class="form-control" id="horaAgendamento" required>
                    </div>

                    <div class="form-group">
                        <label for="statusAgendamento">Status*</label>
                        <select class="form-control" id="statusAgendamento" required>
                            <option value="pendente">Pendente</option>
                            <option value="confirmado">Confirmado</option>
                            <option value="concluido">Concluído</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="observacoesAgendamento">Observações</label>
                        <textarea class="form-control" id="observacoesAgendamento" rows="3">${agendamento ? agendamento.observacoes : ''}</textarea>
                    </div>

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

        // Carregar opções de clientes e serviços
        carregarOpcoesClientes(agendamento ? agendamento.clienteId : null);
        carregarOpcoesServicos(agendamento ? agendamento.servicoId : null);

        // Preencher campos se for edição
        if (agendamento) {
            $('#dataAgendamento').val(agendamento.data);
            $('#horaAgendamento').val(agendamento.hora);
            $('#statusAgendamento').val(agendamento.status);
        }

        // Configurar o evento de submit do formulário
        $('#formAgendamento').on('submit', function(e) {
            e.preventDefault();
            salvarAgendamento();
        });

        $('#modalAgendamento').modal('show');
    }

    // Carrega as opções de clientes no select
    function carregarOpcoesClientes(clienteSelecionadoId) {
        db.clientes.toArray().then(clientes => {
            const select = document.getElementById('clienteId');
            select.innerHTML = '<option value="">Selecione um cliente</option>';

            clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.nome;
                if (cliente.id === clienteSelecionadoId) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }).catch(error => {
            console.error('Erro ao carregar clientes:', error);
            mostrarToast('Erro', 'Erro ao carregar a lista de clientes.', 'danger');
        });
    }

    // Carrega as opções de serviços no select
    function carregarOpcoesServicos(servicoSelecionadoId) {
        db.servicos.toArray().then(servicos => {
            const select = document.getElementById('servicoId');
            select.innerHTML = '<option value="">Selecione um serviço</option>';

            servicos.forEach(servico => {
                const option = document.createElement('option');
                option.value = servico.id;
                option.textContent = servico.nome;
                if (servico.id === servicoSelecionadoId) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }).catch(error => {
            console.error('Erro ao carregar serviços:', error);
            mostrarToast('Erro', 'Erro ao carregar a lista de serviços.', 'danger');
        });
    }

    // Salva o agendamento no banco de dados
    function salvarAgendamento() {
        const agendamentoId = $('#agendamentoId').val();
        const agendamento = {
            clienteId: parseInt($('#clienteId').val()),
            servicoId: parseInt($('#servicoId').val()),
            data: $('#dataAgendamento').val(),
            hora: $('#horaAgendamento').val(),
            status: $('#statusAgendamento').val(),
            observacoes: $('#observacoesAgendamento').val().trim()
        };

        // Validação adicional
        if (!agendamento.clienteId || !agendamento.servicoId || !agendamento.data || !agendamento.hora || !agendamento.status) {
            mostrarToast('Erro', 'Por favor, preencha todos os campos obrigatórios.', 'danger');
            return;
        }

        if (agendamentoId) {
            // Atualização
            db.agendamentos.update(parseInt(agendamentoId), agendamento).then(() => {
                $('#modalAgendamento').modal('hide');
                listarAgendamentos();
                mostrarToast('Sucesso', 'Agendamento atualizado com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao atualizar agendamento:', error);
                mostrarToast('Erro', 'Erro ao atualizar o agendamento.', 'danger');
            });
        } else {
            // Novo agendamento
            db.agendamentos.add(agendamento).then(() => {
                $('#modalAgendamento').modal('hide');
                listarAgendamentos();
                mostrarToast('Sucesso', 'Agendamento cadastrado com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao adicionar agendamento:', error);
                mostrarToast('Erro', 'Erro ao cadastrar o agendamento.', 'danger');
            });
        }
    }

    // Abre o modal para editar agendamento
    function editarAgendamento(id) {
        db.agendamentos.get(id).then(agendamento => {
            if (agendamento) {
                abrirModalAgendamento(agendamento);
            }
        }).catch(error => {
            console.error('Erro ao carregar agendamento para edição:', error);
            mostrarToast('Erro', 'Erro ao carregar os dados do agendamento.', 'danger');
        });
    }

    // Exclui o agendamento do banco de dados
    function excluirAgendamento(id) {
        if (confirm('Tem certeza que deseja excluir este agendamento?')) {
            db.agendamentos.delete(id).then(() => {
                listarAgendamentos();
                mostrarToast('Sucesso', 'Agendamento excluído com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao excluir agendamento:', error);
                mostrarToast('Erro', 'Erro ao excluir o agendamento.', 'danger');
            });
        }
    }

    // Formata a data para exibição (DD/MM/YYYY)
    function formatarData(data) {
        const partes = data.split('-');
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    // Formata o status para exibição
    function formatarStatus(status) {
        const statusMap = {
            pendente: 'Pendente',
            confirmado: 'Confirmado',
            concluido: 'Concluído',
            cancelado: 'Cancelado'
        };
        return statusMap[status] || status;
    }

    // Obtém a cor correspondente ao status para o calendário
    function obterCorPorStatus(status) {
        const cores = {
            pendente: 'orange',
            confirmado: 'blue',
            concluido: 'green',
            cancelado: 'red'
        };
        return cores[status] || 'gray';
    }

    // Retorna as funções públicas
    return {
        init,
        editarAgendamento,
        excluirAgendamento
    };
})();

// Inicializa o módulo quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    AgendamentosModule.init();
});

// Expõe o módulo globalmente
window.AgendamentosModule = AgendamentosModule;
