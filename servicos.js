// servicos.js

const ServicosModule = (function() {
    // Configurações e constantes
    const config = {
        tipos: {
            ppf: {
                nome: 'PPF - Paint Protection Film',
                icone: 'far fa-gem' // Ícone personalizado para PPF
            },
            envelopamento: {
                nome: 'Envelopamento',
                icone: 'fas fa-car' // Ícone personalizado para Envelopamento
            },
            'window-film': {
                nome: 'Window Film',
                icone: 'fas fa-car-crash' // Ícone personalizado para Window Film
            }
        },
        modalIds: {
            adicionar: '#modalServico',
            listar: '#modalListaServicos'
        }
    };

   // Inicialização do módulo
   function init() {
    document.addEventListener('section:shown', function(e) {
        if (e.detail.sectionId === 'servicos') {
            carregarHTML();
            atualizarContadores();
            bindEvents();
        }
    });
}

   // Carrega o HTML base da seção
   function carregarHTML() {
    const container = document.getElementById('servicos');
    container.innerHTML = `
        <div class="container-fluid">
            <h2>Serviços</h2>
            <p>Aqui você pode gerenciar os serviços oferecidos.</p>
            
            <!-- Cards dos Tipos de Serviços -->
            <div class="row" id="tiposServicosContainer">
                <!-- Cards serão inseridos aqui via JavaScript -->
            </div>

            <!-- Modais -->
            <!-- Modal para Adicionar/Editar Serviço -->
            <div class="modal fade" id="modalServico" tabindex="-1" aria-labelledby="modalServicoLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <!-- Conteúdo será inserido dinamicamente -->
                    </div>
                </div>
            </div>

            <!-- Modal para Listar Serviços -->
            <div class="modal fade" id="modalListaServicos" tabindex="-1" aria-labelledby="modalListaServicosLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <!-- Conteúdo será inserido dinamicamente -->
                    </div>
                </div>
            </div>
        </div>
    `;

    // Após carregar o HTML, lista os tipos de serviços
    listarTiposServicos();
}

     // Lista os tipos de serviços com contadores
     function listarTiposServicos() {
        const container = document.getElementById('tiposServicosContainer');
        container.innerHTML = '';

        Object.keys(config.tipos).forEach(tipo => {
            db.servicos.where('tipo').equals(tipo).count().then(count => {
                const tipoConfig = config.tipos[tipo];
                const card = `
                    <div class="col-md-4 col-sm-6 mb-3">
                        <div class="card h-100">
                            <div class="card-body d-flex flex-column justify-content-between align-items-center">
                                <div class="text-center">
                                    <i class="${tipoConfig.icone} fa-3x mb-3"></i>
                                    <h5 class="card-title">${tipoConfig.nome}</h5>
                                </div>
                                <div class="d-flex flex-column w-100">
                                    <button class="btn btn-primary btn-block mb-2" onclick="ServicosModule.abrirModalAdicionarServico('${tipo}')">
                                        Adicionar Serviço
                                    </button>
                                    <button class="btn btn-info btn-block" onclick="ServicosModule.abrirModalListaServicos('${tipo}')">
                                        <i class="fas fa-eye"></i> ${count} ${count === 1 ? 'Serviço' : 'Serviços'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.innerHTML += card;
            }).catch(error => {
                console.error(`Erro ao contar serviços do tipo ${tipo}:`, error);
                mostrarToast('Erro', `Erro ao contar serviços do tipo ${config.tipos[tipo].nome}`, 'danger');
            });
        });
    }

   // Vincula eventos
   function bindEvents() {
    // Evento para limpar formulário quando o modal for fechado
    $(config.modalIds.adicionar).on('hidden.bs.modal', () => {
        $('#formServico')[0].reset();
        $('#servicoId').val('');
    });
}

// Funções utilitárias de formatação
function formatarTipoServico(tipo) {
    return config.tipos[tipo]?.nome || tipo;
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
}

    // Funções principais
    function abrirModalAdicionarServico(tipo) {
        const tipoFormatado = formatarTipoServico(tipo);
        $('#modalServicoLabel').text(`Adicionar Serviço - ${tipoFormatado}`);
        
        // Limpa o conteúdo anterior e adiciona o formulário
        $(`${config.modalIds.adicionar} .modal-content`).html(`
            <div class="modal-header">
                <h5 class="modal-title" id="modalServicoLabel">Adicionar Serviço - ${tipoFormatado}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
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
            </div>
        `);
        
        // Configurar o evento de submit do formulário
        $('#formServico').on('submit', (e) => {
            e.preventDefault();
            salvarServico();
        });

        $(config.modalIds.adicionar).modal('show');
    }

    function salvarServico() {
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
                $(config.modalIds.adicionar).modal('hide');
                atualizarContadores();
                mostrarToast('Sucesso', 'Serviço atualizado com sucesso!', 'success');
                if ($(config.modalIds.listar).is(':visible')) {
                    abrirModalListaServicos(servico.tipo);
                }
            }).catch(error => {
                console.error('Erro ao atualizar serviço:', error);
                mostrarToast('Erro', 'Erro ao atualizar o serviço.', 'danger');
            });
        } else {
            // Novo serviço
            db.servicos.add(servico).then(() => {
                $(config.modalIds.adicionar).modal('hide');
                atualizarContadores();
                mostrarToast('Sucesso', 'Serviço cadastrado com sucesso!', 'success');
                if ($(config.modalIds.listar).is(':visible')) {
                    abrirModalListaServicos(servico.tipo);
                }
            }).catch(error => {
                console.error('Erro ao adicionar serviço:', error);
                mostrarToast('Erro', 'Erro ao cadastrar o serviço.', 'danger');
            });
        }
    }

    function abrirModalListaServicos(tipo) {
        const tipoFormatado = formatarTipoServico(tipo);
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
                                        <span><strong>Preço:</strong> ${formatarMoeda(servico.preco)}</span>
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
            
            $(`${config.modalIds.listar} .modal-content`).html(`
                <div class="modal-header">
                    <h5 class="modal-title" id="modalListaServicosLabel">Lista de Serviços - ${tipoFormatado}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
                </div>
            `);
            $(`${config.modalIds.listar} .modal-body`).empty().append(container);
        }).catch(error => {
            console.error('Erro ao carregar serviços:', error);
            mostrarToast('Erro', 'Erro ao carregar a lista de serviços.', 'danger');
        });

        $(config.modalIds.listar).modal('show');
    }

    function editarServico(id) {
        db.servicos.get(id).then(servico => {
            if (servico) {
                abrirModalAdicionarServico(servico.tipo);
                
                setTimeout(() => {
                    $('#servicoId').val(servico.id);
                    $('#nomeServico').val(servico.nome);
                    $('#descricaoServico').val(servico.descricao);
                    $('#precoServico').val(servico.preco);
                    $('#tempoEstimado').val(servico.tempoEstimado);
                    $('#observacoesServico').val(servico.observacoes);
                    
                    $('#modalServicoLabel').text(`Editar Serviço - ${formatarTipoServico(servico.tipo)}`);
                }, 300);
            }
        }).catch(error => {
            console.error('Erro ao carregar serviço para edição:', error);
            mostrarToast('Erro', 'Erro ao carregar os dados do serviço.', 'danger');
        });
    }

    function excluirServico(id, tipo) {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            db.servicos.delete(id).then(() => {
                atualizarContadores();
                abrirModalListaServicos(tipo);
                mostrarToast('Sucesso', 'Serviço excluído com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao excluir serviço:', error);
                mostrarToast('Erro', 'Erro ao excluir o serviço.', 'danger');
            });
        }
    }

    function atualizarContadores() {
        // Atualiza os contadores de cada tipo de serviço
        Object.keys(config.tipos).forEach(tipo => {
            db.servicos.where('tipo').equals(tipo).count().then(count => {
                // Atualiza o card com o novo contador
                const cardButton = document.querySelector(`button[onclick="ServicosModule.abrirModalListaServicos('${tipo}')"]`);
                if (cardButton) {
                    cardButton.innerHTML = `<i class="fas fa-eye"></i> ${count} ${count === 1 ? 'Serviço' : 'Serviços'}`;
                }
            }).catch(error => {
                console.error(`Erro ao contar serviços do tipo ${tipo}:`, error);
            });
        });
    }

  // Retorna as funções públicas
  return {
    init,
    abrirModalAdicionarServico,
    abrirModalListaServicos,
    editarServico,
    excluirServico
};
})();

// Inicializa o módulo quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
ServicosModule.init();
});

// Expõe o módulo globalmente
window.ServicosModule = ServicosModule;
