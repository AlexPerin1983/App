// servicos.js

const ServicosModule = {
    // Configurações e constantes
    config: {
        tipos: {
            ppf: 'PPF - Paint Protection Film',
            envelopamento: 'Envelopamento',
            'window-film': 'Window Film'
        },
        modalIds: {
            adicionar: '#modalServico',
            listar: '#modalListaServicos'
        }
    },

    // Inicialização do módulo
    init: function() {
        this.atualizarContadores();
        this.bindEvents();
    },

    // Vincula eventos
    bindEvents: function() {
        $(document).ready(() => {
            this.atualizarContadores();
        });

        // Evento para limpar formulário quando o modal for fechado
        $(this.config.modalIds.adicionar).on('hidden.bs.modal', () => {
            $('#formServico')[0].reset();
            $('#servicoId').val('');
        });
    },

    // Funções principais
    abrirModalAdicionarServico: function(tipo) {
        const tipoFormatado = this.formatarTipoServico(tipo);
        $('#modalServicoLabel').text(`Adicionar Serviço - ${tipoFormatado}`);
        
        // Limpa o corpo do modal e adiciona o formulário
        $(`${this.config.modalIds.adicionar} .modal-body`).html(`
            <form id="formServico">
                <input type="hidden" id="servicoId">
                <input type="hidden" id="servicoTipo" value="${tipo}">
                
                <div class="form-group">
                    <label for="nomeServico">Nome do Serviço*</label>
                    <input type="text" class="form-control" id="nomeServico" required>
                </div>
                
                <div class="form-group">
                    <label for="descricaoServico">Descrição*</label>
                    <textarea class="form-control" id="descricaoServico" rows="3" required></textarea>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="precoServico">Preço (R$)*</label>
                            <input type="number" step="0.01" min="0" class="form-control" id="precoServico" required>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label for="tempoEstimado">Tempo Estimado (horas)*</label>
                            <input type="number" step="0.5" min="0.5" class="form-control" id="tempoEstimado" required>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="observacoesServico">Observações</label>
                    <textarea class="form-control" id="observacoesServico" rows="2" 
                        placeholder="Observações adicionais sobre o serviço..."></textarea>
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
        `);
        
        // Configurar o evento de submit do formulário
        $('#formServico').on('submit', (e) => {
            e.preventDefault();
            this.salvarServico();
        });

        $(this.config.modalIds.adicionar).modal('show');
    },

    formatarTipoServico: function(tipo) {
        return this.config.tipos[tipo] || tipo;
    },

    formatarMoeda: function(valor) {
        return valor.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });
    },

    salvarServico: function() {
        const servico = {
            tipo: $('#servicoTipo').val(),
            nome: $('#nomeServico').val().trim(),
            descricao: $('#descricaoServico').val().trim(),
            preco: parseFloat($('#precoServico').val()),
            tempoEstimado: parseFloat($('#tempoEstimado').val()),
            observacoes: $('#observacoesServico').val().trim(),
            dataCadastro: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
        };

        const servicoId = $('#servicoId').val();
        
        // Validação adicional
        if (!servico.nome || !servico.descricao || isNaN(servico.preco) || isNaN(servico.tempoEstimado)) {
            mostrarToast('Erro', 'Por favor, preencha todos os campos obrigatórios.', 'danger');
            return;
        }

        if (servicoId) {
            // Atualização
            db.servicos.update(parseInt(servicoId), servico).then(() => {
                $(this.config.modalIds.adicionar).modal('hide');
                this.atualizarContadores();
                mostrarToast('Sucesso', 'Serviço atualizado com sucesso!', 'success');
                if ($(this.config.modalIds.listar).is(':visible')) {
                    this.abrirModalListaServicos(servico.tipo);
                }
            }).catch(error => {
                console.error('Erro ao atualizar serviço:', error);
                mostrarToast('Erro', 'Erro ao atualizar o serviço.', 'danger');
            });
        } else {
            // Novo serviço
            db.servicos.add(servico).then(() => {
                $(this.config.modalIds.adicionar).modal('hide');
                this.atualizarContadores();
                mostrarToast('Sucesso', 'Serviço cadastrado com sucesso!', 'success');
                if ($(this.config.modalIds.listar).is(':visible')) {
                    this.abrirModalListaServicos(servico.tipo);
                }
            }).catch(error => {
                console.error('Erro ao adicionar serviço:', error);
                mostrarToast('Erro', 'Erro ao cadastrar o serviço.', 'danger');
            });
        }
    },

    abrirModalListaServicos: function(tipo) {
        const tipoFormatado = this.formatarTipoServico(tipo);
        $('#modalListaServicosLabel').text(`Lista de Serviços - ${tipoFormatado}`);
        
        // Carregar serviços do banco de dados
        db.servicos.where('tipo').equals(tipo).toArray().then(servicos => {
            const container = $('<div class="row"></div>');
            
            if (servicos.length === 0) {
                container.append(`
                    <div class="col-12 text-center">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle mr-2"></i>
                            Nenhum serviço cadastrado para ${tipoFormatado}.
                        </div>
                    </div>
                `);
            } else {
                servicos
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .forEach(servico => {
                    container.append(`
                        <div class="col-md-6 mb-3">
                            <div class="card h-100">
                                <div class="card-body">
                                    <h5 class="card-title">${servico.nome}</h5>
                                    <p class="card-text">${servico.descricao}</p>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span><strong>Preço:</strong> ${this.formatarMoeda(servico.preco)}</span>
                                        <span><strong>Tempo:</strong> ${servico.tempoEstimado}h</span>
                                    </div>
                                    ${servico.observacoes ? `
                                        <div class="alert alert-light p-2 mb-3">
                                            <small class="text-muted">
                                                <i class="fas fa-info-circle mr-1"></i>
                                                ${servico.observacoes}
                                            </small>
                                        </div>
                                    ` : ''}
                                    <div class="btn-group w-100">
                                        <button class="btn btn-sm btn-info" onclick="ServicosModule.editarServico(${servico.id})">
                                            <i class="fas fa-edit mr-1"></i> Editar
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="ServicosModule.excluirServico(${servico.id}, '${tipo}')">
                                            <i class="fas fa-trash mr-1"></i> Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `);
                });
            }
            
            $(`${this.config.modalIds.listar} .modal-body`).empty().append(container);
        }).catch(error => {
            console.error('Erro ao carregar serviços:', error);
            mostrarToast('Erro', 'Erro ao carregar a lista de serviços.', 'danger');
        });

        $(this.config.modalIds.listar).modal('show');
    },

    editarServico: function(id) {
        db.servicos.get(id).then(servico => {
            if (servico) {
                this.abrirModalAdicionarServico(servico.tipo);
                
                setTimeout(() => {
                    $('#servicoId').val(servico.id);
                    $('#nomeServico').val(servico.nome);
                    $('#descricaoServico').val(servico.descricao);
                    $('#precoServico').val(servico.preco);
                    $('#tempoEstimado').val(servico.tempoEstimado);
                    $('#observacoesServico').val(servico.observacoes);
                    
                    $('#modalServicoLabel').text(`Editar Serviço - ${this.formatarTipoServico(servico.tipo)}`);
                }, 300);
            }
        }).catch(error => {
            console.error('Erro ao carregar serviço para edição:', error);
            mostrarToast('Erro', 'Erro ao carregar os dados do serviço.', 'danger');
        });
    },

    excluirServico: function(id, tipo) {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            db.servicos.delete(id).then(() => {
                this.atualizarContadores();
                this.abrirModalListaServicos(tipo);
                mostrarToast('Sucesso', 'Serviço excluído com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao excluir serviço:', error);
                mostrarToast('Erro', 'Erro ao excluir o serviço.', 'danger');
            });
        }
    },

    atualizarContadores: function() {
        // Atualiza os contadores de cada tipo de serviço
        Object.keys(this.config.tipos).forEach(tipo => {
            db.servicos.where('tipo').equals(tipo).count().then(count => {
                $(`.contador-servicos-${tipo}`).text(count);
            }).catch(error => {
                console.error(`Erro ao contar serviços do tipo ${tipo}:`, error);
            });
        });
    }
};

// Inicializa o módulo
ServicosModule.init();

// Expõe as funções necessárias globalmente
window.abrirModalAdicionarServico = ServicosModule.abrirModalAdicionarServico.bind(ServicosModule);
window.abrirModalListaServicos = ServicosModule.abrirModalListaServicos.bind(ServicosModule);
