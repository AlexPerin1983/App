// pagamentos.js

const PagamentosModule = (function() {
    // Configurações e constantes
    const config = {
        modalIds: {
            adicionar: '#modalPagamento',
            listar: '#modalListaPagamentos'
        },
        maxParcelasSemJuros: 12, // Exemplo: até 12 parcelas sem juros
        maxParcelasComJuros: 24, // Exemplo: até 24 parcelas com juros
    };

    // Inicialização do módulo
    function init() {
        document.addEventListener('section:shown', function(e) {
            if (e.detail.sectionId === 'pagamentos') {
                carregarHTML();
                listarPagamentos();
                bindEvents();
            }
        });
    }

    // Carrega o HTML base da seção
    function carregarHTML() {
        const container = document.getElementById('pagamentos');
        container.innerHTML = `
            <div class="container-fluid">
                <h2>Formas de Pagamento</h2>
                <p>Aqui você pode gerenciar as formas de pagamento aceitas pela sua empresa.</p>
                
                <!-- Botão para adicionar nova forma de pagamento -->
                <div class="mb-3">
                    <button class="btn btn-primary" id="btnAdicionarPagamento">
                        <i class="fas fa-plus mr-1"></i>Adicionar Forma de Pagamento
                    </button>
                </div>
    
                <!-- Tabela de formas de pagamento -->
                <div class="table-responsive">
                    <table class="table table-striped" id="tabelaPagamentos">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Forma de Pagamento</th>
                                <th>Detalhes</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Linhas serão inseridas aqui via JavaScript -->
                        </tbody>
                    </table>
                </div>
    
                <!-- Modal para Adicionar/Editar Forma de Pagamento -->
                <div class="modal fade" id="modalPagamento" tabindex="-1" aria-labelledby="modalPagamentoLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <!-- Conteúdo será inserido dinamicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Vincula eventos aos elementos da seção
    function bindEvents() {
        // Evento para abrir o modal de adicionar pagamento
        document.getElementById('btnAdicionarPagamento').addEventListener('click', function() {
            abrirModalPagamento();
        });

        // Evento para limpar o formulário quando o modal for fechado
        $(config.modalIds.adicionar).on('hidden.bs.modal', () => {
            $('#formPagamento')[0].reset();
            $('#pagamentoId').val('');
        });
    }

    // Lista as formas de pagamento do banco de dados
    function listarPagamentos() {
        db.pagamentos.toArray().then(pagamentos => {
            const tbody = document.querySelector('#tabelaPagamentos tbody');
            tbody.innerHTML = '';

            if (pagamentos.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center">Nenhuma forma de pagamento cadastrada.</td>
                    </tr>
                `;
            } else {
                pagamentos.forEach(pagamento => {
                    const row = `
                        <tr>
                            <td>${pagamento.id}</td>
                            <td>${pagamento.tipo}</td>
                            <td>${detalhesPagamento(pagamento)}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="PagamentosModule.editarPagamento(${pagamento.id})">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="PagamentosModule.excluirPagamento(${pagamento.id})">
                                    <i class="fas fa-trash"></i> Excluir
                                </button>
                            </td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            }
        }).catch(error => {
            console.error('Erro ao listar formas de pagamento:', error);
            mostrarToast('Erro', 'Erro ao carregar a lista de formas de pagamento.', 'danger');
        });
    }

    // Função para gerar detalhes da forma de pagamento
    function detalhesPagamento(pagamento) {
        switch (pagamento.tipo) {
            case 'Pix':
                return `<input type="checkbox" disabled ${pagamento.selecionado ? 'checked' : ''}> Aceito Pix`;
            case 'Boleto':
                return `Datas Disponíveis: ${pagamento.diasBoleto.join(', ')}`;
            case 'Cartão Sem Juros':
                return `Até ${pagamento.maxParcelasSemJuros} parcelas sem juros`;
            case 'Cartão Com Juros':
                return `Até ${pagamento.maxParcelasComJuros} parcelas com juros (${pagamento.taxaJuros}%)`;
            case 'Adiantamento':
                return `Adiantamento: ${pagamento.adiantamentoTipo === 'valor' ? 'R$ ' + pagamento.adiantamentoValor : pagamento.adiantamentoValor + '%'}`;
            case 'Outro':
                return pagamento.outroDetalhe;
            default:
                return 'Detalhes não disponíveis';
        }
    }

    // Abre o modal para adicionar ou editar forma de pagamento
    function abrirModalPagamento(pagamento = null) {
        const tituloModal = pagamento ? 'Editar Forma de Pagamento' : 'Adicionar Forma de Pagamento';

        // Limpa o conteúdo anterior e adiciona o formulário
        $('#modalPagamento .modal-content').html(`
            <div class="modal-header">
                <h5 class="modal-title" id="modalPagamentoLabel">${tituloModal}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="formPagamento">
                    <input type="hidden" id="pagamentoId" value="${pagamento ? pagamento.id : ''}">

                    <div class="form-group">
                        <label for="tipoPagamento">Tipo de Pagamento*</label>
                        <select class="form-control" id="tipoPagamento" required onchange="PagamentosModule.tipoPagamentoAlterado(this.value)">
                            <option value="">Selecione uma forma de pagamento</option>
                            <option value="Pix" ${pagamento && pagamento.tipo === 'Pix' ? 'selected' : ''}>Pix</option>
                            <option value="Boleto" ${pagamento && pagamento.tipo === 'Boleto' ? 'selected' : ''}>Boleto</option>
                            <option value="Cartão Sem Juros" ${pagamento && pagamento.tipo === 'Cartão Sem Juros' ? 'selected' : ''}>Cartão Sem Juros</option>
                            <option value="Cartão Com Juros" ${pagamento && pagamento.tipo === 'Cartão Com Juros' ? 'selected' : ''}>Cartão Com Juros</option>
                            <option value="Adiantamento" ${pagamento && pagamento.tipo === 'Adiantamento' ? 'selected' : ''}>Solicitar Adiantamento</option>
                            <option value="Outro" ${pagamento && pagamento.tipo === 'Outro' ? 'selected' : ''}>Outra Forma</option>
                        </select>
                    </div>

                    <div id="detalhesPagamento">
                        <!-- Campos específicos serão inseridos aqui via JavaScript -->
                        ${pagamento ? gerarCamposEspecificos(pagamento) : ''}
                    </div>

                    <div class="form-group">
                        <label for="observacoesPagamento">Observações</label>
                        <textarea class="form-control" id="observacoesPagamento" rows="2" placeholder="Observações adicionais sobre a forma de pagamento...">${pagamento ? pagamento.observacoes : ''}</textarea>
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
        $('#formPagamento').on('submit', function(e) {
            e.preventDefault();
            salvarPagamento();
        });

        // Se for edição, preencher os campos específicos
        if (pagamento) {
            preencherCamposEspecificos(pagamento);
        }

        $('#modalPagamento').modal('show');
    }

    // Função para gerar campos específicos com base no tipo de pagamento
    function gerarCamposEspecificos(pagamento) {
        switch (pagamento.tipo) {
            case 'Pix':
                return `
                    <div class="form-group">
                        <label for="selecionadoPix">Aceita Pix?</label>
                        <input type="checkbox" id="selecionadoPix" ${pagamento.selecionado ? 'checked' : ''}>
                    </div>
                `;
            case 'Boleto':
                return `
                    <div class="form-group">
                        <label for="diasBoleto">Dias Disponíveis para Boleto*</label>
                        <select multiple class="form-control" id="diasBoleto" required>
                            <option value="7" ${pagamento.diasBoleto && pagamento.diasBoleto.includes(7) ? 'selected' : ''}>7 dias</option>
                            <option value="14" ${pagamento.diasBoleto && pagamento.diasBoleto.includes(14) ? 'selected' : ''}>14 dias</option>
                            <option value="21" ${pagamento.diasBoleto && pagamento.diasBoleto.includes(21) ? 'selected' : ''}>21 dias</option>
                            <option value="30" ${pagamento.diasBoleto && pagamento.diasBoleto.includes(30) ? 'selected' : ''}>30 dias</option>
                        </select>
                        <small class="form-text text-muted">Use Ctrl/Cmd para selecionar múltiplos dias.</small>
                    </div>
                `;
            case 'Cartão Sem Juros':
                return `
                    <div class="form-group">
                        <label for="maxParcelasSemJuros">Número de Parcelas Sem Juros*</label>
                        <input type="number" class="form-control" id="maxParcelasSemJuros" min="1" max="${config.maxParcelasSemJuros}" value="${pagamento.maxParcelasSemJuros || 1}" required>
                    </div>
                `;
            case 'Cartão Com Juros':
                return `
                    <div class="form-group">
                        <label for="maxParcelasComJuros">Número de Parcelas Com Juros*</label>
                        <input type="number" class="form-control" id="maxParcelasComJuros" min="1" max="${config.maxParcelasComJuros}" value="${pagamento.maxParcelasComJuros || 1}" required>
                    </div>
                    <div class="form-group">
                        <label for="taxaJuros">Taxa de Juros (%)*</label>
                        <input type="number" class="form-control" id="taxaJuros" step="0.1" min="0" value="${pagamento.taxaJuros || 0}" required>
                    </div>
                `;
            case 'Adiantamento':
                return `
                    <div class="form-group">
                        <label for="tipoAdiantamento">Tipo de Adiantamento*</label>
                        <select class="form-control" id="tipoAdiantamento" required onchange="PagamentosModule.tipoAdiantamentoAlterado(this.value)">
                            <option value="">Selecione</option>
                            <option value="valor" ${pagamento.adiantamentoTipo === 'valor' ? 'selected' : ''}>Valor Fixo</option>
                            <option value="porcentagem" ${pagamento.adiantamentoTipo === 'porcentagem' ? 'selected' : ''}>Porcentagem</option>
                        </select>
                    </div>
                    <div class="form-group" id="campoAdiantamento">
                        ${pagamento.adiantamentoTipo === 'valor' ? `
                            <label for="adiantamentoValor">Valor do Adiantamento (R$)*</label>
                            <input type="number" step="0.01" class="form-control" id="adiantamentoValor" min="0" value="${pagamento.adiantamentoValor || 0}" required>
                        ` : pagamento.adiantamentoTipo === 'porcentagem' ? `
                            <label for="adiantamentoValor">Porcentagem do Adiantamento (%)*</label>
                            <input type="number" step="0.1" class="form-control" id="adiantamentoValor" min="0" max="100" value="${pagamento.adiantamentoValor || 0}" required>
                        ` : ''}
                    </div>
                `;
            case 'Outro':
                return `
                    <div class="form-group">
                        <label for="outroDetalhe">Detalhe da Outra Forma de Pagamento*</label>
                        <input type="text" class="form-control" id="outroDetalhe" value="${pagamento.outroDetalhe || ''}" required>
                    </div>
                `;
            default:
                return '';
        }
    }

    // Função para preencher campos específicos durante a edição
    function preencherCamposEspecificos(pagamento) {
        switch (pagamento.tipo) {
            case 'Pix':
                $('#selecionadoPix').prop('checked', pagamento.selecionado);
                break;
            case 'Boleto':
                $('#diasBoleto').val(pagamento.diasBoleto);
                break;
            case 'Cartão Sem Juros':
                $('#maxParcelasSemJuros').val(pagamento.maxParcelasSemJuros);
                break;
            case 'Cartão Com Juros':
                $('#maxParcelasComJuros').val(pagamento.maxParcelasComJuros);
                $('#taxaJuros').val(pagamento.taxaJuros);
                break;
            case 'Adiantamento':
                $('#tipoAdiantamento').val(pagamento.adiantamentoTipo);
                PagamentosModule.tipoAdiantamentoAlterado(pagamento.adiantamentoTipo);
                $('#adiantamentoValor').val(pagamento.adiantamentoValor);
                break;
            case 'Outro':
                $('#outroDetalhe').val(pagamento.outroDetalhe);
                break;
            default:
                break;
        }
    }

    // Função para lidar com a mudança de tipo de pagamento
    function tipoPagamentoAlterado(tipo) {
        const detalhesContainer = $('#detalhesPagamento');
        if (!tipo) {
            detalhesContainer.html('');
            return;
        }
        const pagamentoObj = { tipo };
        detalhesContainer.html(gerarCamposEspecificos(pagamentoObj));
    }

    // Função para lidar com a mudança de tipo de adiantamento
    function tipoAdiantamentoAlterado(tipo) {
        const campoAdiantamento = $('#campoAdiantamento');
        if (tipo === 'valor') {
            campoAdiantamento.html(`
                <label for="adiantamentoValor">Valor do Adiantamento (R$)*</label>
                <input type="number" step="0.01" class="form-control" id="adiantamentoValor" min="0" required>
            `);
        } else if (tipo === 'porcentagem') {
            campoAdiantamento.html(`
                <label for="adiantamentoValor">Porcentagem do Adiantamento (%)*</label>
                <input type="number" step="0.1" class="form-control" id="adiantamentoValor" min="0" max="100" required>
            `);
        } else {
            campoAdiantamento.html('');
        }
    }

    // Salva a forma de pagamento no banco de dados
    function salvarPagamento() {
        const pagamentoId = $('#pagamentoId').val();
        const tipo = $('#tipoPagamento').val();
        const observacoes = $('#observacoesPagamento').val().trim();

        if (!tipo) {
            mostrarToast('Erro', 'Por favor, selecione uma forma de pagamento.', 'danger');
            return;
        }

        // Inicializa o objeto de pagamento
        let pagamento = {
            tipo,
            observacoes
        };

        // Adiciona campos específicos com base no tipo
        switch (tipo) {
            case 'Pix':
                pagamento.selecionado = $('#selecionadoPix').is(':checked');
                break;
            case 'Boleto':
                const diasBoleto = $('#diasBoleto').val().map(Number);
                pagamento.diasBoleto = diasBoleto;
                break;
            case 'Cartão Sem Juros':
                pagamento.maxParcelasSemJuros = parseInt($('#maxParcelasSemJuros').val(), 10);
                break;
            case 'Cartão Com Juros':
                pagamento.maxParcelasComJuros = parseInt($('#maxParcelasComJuros').val(), 10);
                pagamento.taxaJuros = parseFloat($('#taxaJuros').val());
                break;
            case 'Adiantamento':
                pagamento.adiantamentoTipo = $('#tipoAdiantamento').val();
                pagamento.adiantamentoValor = parseFloat($('#adiantamentoValor').val());
                break;
            case 'Outro':
                pagamento.outroDetalhe = $('#outroDetalhe').val().trim();
                break;
            default:
                break;
        }

        // Validação adicional
        if (tipo === 'Boleto' && (!pagamento.diasBoleto || pagamento.diasBoleto.length === 0)) {
            mostrarToast('Erro', 'Por favor, selecione pelo menos um dia para Boleto.', 'danger');
            return;
        }
        if (tipo === 'Adiantamento' && (isNaN(pagamento.adiantamentoValor) || pagamento.adiantamentoValor < 0)) {
            mostrarToast('Erro', 'Por favor, insira um valor ou porcentagem válido para o adiantamento.', 'danger');
            return;
        }

        if (pagamentoId) {
            // Atualização
            db.pagamentos.update(parseInt(pagamentoId), pagamento).then(() => {
                $(config.modalIds.adicionar).modal('hide');
                listarPagamentos();
                mostrarToast('Sucesso', 'Forma de pagamento atualizada com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao atualizar forma de pagamento:', error);
                mostrarToast('Erro', 'Erro ao atualizar a forma de pagamento.', 'danger');
            });
        } else {
            // Nova forma de pagamento
            db.pagamentos.add(pagamento).then(() => {
                $(config.modalIds.adicionar).modal('hide');
                listarPagamentos();
                mostrarToast('Sucesso', 'Forma de pagamento adicionada com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao adicionar forma de pagamento:', error);
                mostrarToast('Erro', 'Erro ao adicionar a forma de pagamento.', 'danger');
            });
        }
    }

    // Abre o modal para editar uma forma de pagamento existente
    function editarPagamento(id) {
        db.pagamentos.get(id).then(pagamento => {
            if (pagamento) {
                abrirModalPagamento(pagamento);
            } else {
                console.log(`[DEBUG] Forma de Pagamento ID: ${id} não encontrada.`);
                mostrarToast('Erro', 'Forma de pagamento não encontrada.', 'danger');
            }
        }).catch(error => {
            console.error('Erro ao carregar forma de pagamento para edição:', error);
            mostrarToast('Erro', 'Erro ao carregar os dados da forma de pagamento.', 'danger');
        });
    }

    // Exclui uma forma de pagamento do banco de dados
    function excluirPagamento(id) {
        if (confirm('Tem certeza que deseja excluir esta forma de pagamento?')) {
            db.pagamentos.delete(id).then(() => {
                listarPagamentos();
                mostrarToast('Sucesso', 'Forma de pagamento excluída com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao excluir forma de pagamento:', error);
                mostrarToast('Erro', 'Erro ao excluir a forma de pagamento.', 'danger');
            });
        }
    }

    // Retorna as funções públicas
    return {
        init,
        abrirModalPagamento,
        tipoPagamentoAlterado,
        tipoAdiantamentoAlterado,
        salvarPagamento,
        editarPagamento,
        excluirPagamento
    };
})();

// Inicializa o módulo quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    PagamentosModule.init();
});

// Expõe o módulo globalmente
window.PagamentosModule = PagamentosModule;
