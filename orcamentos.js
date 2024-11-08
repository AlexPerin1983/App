// orcamentos.js

// Converte string formatada para número
function parsearMoeda(valor) {
    // Remove todos os caracteres que não são dígitos, vírgulas, pontos ou sinais de menos
    const cleaned = valor.replace(/[^\d,.-]+/g, '').replace(/\./g, '').replace(',', '.');
    console.log(`[DEBUG] parsearMoeda - valor original: "${valor}", cleaned: "${cleaned}"`);
    const parsed = parseFloat(cleaned);
    console.log(`[DEBUG] parsearMoeda - valor parseado: ${parsed}`);
    return parsed || 0;
}




// Formata o valor para moeda brasileira
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Formata a data para exibição (DD/MM/YYYY)
function formatarData(data) {
    const partes = data.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

const OrcamentosModule = (function() {
    // Inicialização do módulo
    function init() {
        document.addEventListener('section:shown', function(e) {
            if (e.detail.sectionId === 'orcamento') {
                carregarHTML();
                listarOrcamentos();
                bindEvents();
            }
        });
    }

    // Carrega o HTML base da seção
    function carregarHTML() {
        const container = document.getElementById('orcamento');
        container.innerHTML = `
            <div class="container-fluid">
                <h2>Orçamentos</h2>
                <p>Aqui você pode criar e gerenciar orçamentos para seus clientes.</p>

                <div class="mb-3">
                    <button class="btn btn-primary" id="btnAdicionarOrcamento">
                        <i class="fas fa-plus mr-1"></i>Novo Orçamento
                    </button>
                </div>

                <!-- Tabela de orçamentos -->
                <div class="table-responsive">
                    <table class="table table-striped" id="tabelaOrcamentos">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th>Total</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Linhas serão inseridas aqui via JavaScript -->
                        </tbody>
                    </table>
                </div>

                <!-- Modal para Adicionar/Editar Orçamento -->
                <div class="modal fade" id="modalOrcamento" tabindex="-1" aria-labelledby="modalOrcamentoLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <!-- Conteúdo será inserido dinamicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Lista os orçamentos do banco de dados
    function listarOrcamentos() {
        db.orcamentos.toArray().then(orcamentos => {
            const tbody = document.querySelector('#tabelaOrcamentos tbody');
            tbody.innerHTML = '';

            if (orcamentos.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">Nenhum orçamento cadastrado.</td>
                    </tr>
                `;
            } else {
                const promises = orcamentos.map(orcamento => {
                    return db.clientes.get(orcamento.clienteId).then(cliente => {
                        return { orcamento, cliente };
                    });
                });

                Promise.all(promises).then(results => {
                    results.forEach(({ orcamento, cliente }) => {
                        const row = `
                            <tr>
                                <td>${orcamento.id}</td>
                                <td>${cliente ? cliente.nome : 'Cliente não encontrado'}</td>
                                <td>${formatarData(orcamento.data)}</td>
                                <td>${formatarMoeda(orcamento.total)}</td>
                                <td>
                                    <button class="btn btn-sm btn-info" onclick="OrcamentosModule.visualizarOrcamento(${orcamento.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-primary" onclick="OrcamentosModule.editarOrcamento(${orcamento.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="OrcamentosModule.excluirOrcamento(${orcamento.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                        tbody.innerHTML += row;
                    });
                });
            }
        }).catch(error => {
            console.error('Erro ao listar orçamentos:', error);
            mostrarToast('Erro', 'Erro ao carregar a lista de orçamentos.', 'danger');
        });
    }

    // Vincula eventos
    function bindEvents() {
        // Evento para abrir o modal de adicionar orçamento
        document.getElementById('btnAdicionarOrcamento').addEventListener('click', function() {
            abrirModalOrcamento();
        });

        // Evento para limpar o formulário quando o modal é fechado
        $('#modalOrcamento').on('hidden.bs.modal', () => {
            $('#formOrcamento')[0].reset();
            $('#orcamentoId').val('');
            $('#itensOrcamento tbody').empty();
            OrcamentosModule.adicionarLinhaItem(); // Adiciona uma linha vazia
        });
    }

    // Abre o modal para adicionar ou editar orçamento
    function abrirModalOrcamento(orcamento = null) {
        const tituloModal = orcamento ? 'Editar Orçamento' : 'Novo Orçamento';

        // Limpa o conteúdo anterior e adiciona o formulário
        $('#modalOrcamento .modal-content').html(`
            <div class="modal-header">
                <h5 class="modal-title" id="modalOrcamentoLabel">${tituloModal}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="formOrcamento">
                    <input type="hidden" id="orcamentoId" value="${orcamento ? orcamento.id : ''}">

                    <div class="form-group">
                        <label for="clienteId">Cliente*</label>
                        <select class="form-control" id="clienteId" required>
                            <option value="">Carregando clientes...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="dataOrcamento">Data*</label>
                        <input type="date" class="form-control" id="dataOrcamento" required>
                    </div>

                    <h5>Itens do Orçamento</h5>
                    <table class="table table-bordered" id="itensOrcamento">
                        <thead>
                            <tr>
                                <th>Serviço/Produto</th>
                                <th>Quantidade</th>
                                <th>Preço Unitário</th>
                                <th>Total</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Linhas de itens serão inseridas aqui via JavaScript -->
                        </tbody>
                    </table>
                    <button type="button" class="btn btn-secondary mb-3" onclick="OrcamentosModule.adicionarLinhaItem()">
                        <i class="fas fa-plus mr-1"></i>Adicionar Item
                    </button>

                    <div class="form-group">
                        <label for="observacoesOrcamento">Observações</label>
                        <textarea class="form-control" id="observacoesOrcamento" rows="3">${orcamento ? orcamento.observacoes : ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="totalOrcamento">Total: <span id="totalOrcamento">R$ 0,00</span></label>
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

        // Carregar opções de clientes
        carregarOpcoesClientes(orcamento ? orcamento.clienteId : null);

        // Configurar o evento de submit do formulário
        $('#formOrcamento').on('submit', function(e) {
            e.preventDefault();
            salvarOrcamento();
        });

        // Adicionar uma linha de item (vazia ou com dados)
        if (orcamento && orcamento.items && orcamento.items.length > 0) {
            $('#itensOrcamento tbody').empty();
            orcamento.items.forEach(item => {
                OrcamentosModule.adicionarLinhaItem(item);
            });
        } else {
            $('#itensOrcamento tbody').empty();
            OrcamentosModule.adicionarLinhaItem();
        }

        // Preencher campos se for edição
        if (orcamento) {
            $('#dataOrcamento').val(orcamento.data);
            $('#observacoesOrcamento').val(orcamento.observacoes);
            calcularTotalOrcamento();
        }

        $('#modalOrcamento').modal('show');
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

    // Adiciona uma nova linha de item no orçamento
    function adicionarLinhaItem(item = null) {
        const tbody = document.querySelector('#itensOrcamento tbody');
        const row = document.createElement('tr');
    
        row.innerHTML = `
            <td>
                <select class="form-control item-servico" required>
                    <option value="">Selecione um serviço/produto</option>
                </select>
            </td>
            <td>
                <input type="number" class="form-control item-quantidade" min="1" value="${item ? item.quantidade : 1}" required>
            </td>
            <td>
                <input type="text" class="form-control item-preco" value="${item ? formatarMoeda(item.precoUnitario) : 'R$ 0,00'}" required readonly>
            </td>
            <td>
                <input type="text" class="form-control item-total" value="${item ? formatarMoeda(item.total) : 'R$ 0,00'}" required readonly>
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-danger remover-item">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    
        tbody.appendChild(row);
    
        // Carregar opções de serviços/produtos no novo select
        carregarOpcoesServicos(row, item ? item.servicoId : null);
    
        // Vincular evento para remover o item
        row.querySelector('.remover-item').addEventListener('click', function() {
            row.remove();
            calcularTotalOrcamento();
        });
    
        // Vincular eventos para cálculo automático
        row.querySelector('.item-servico').addEventListener('change', function() {
            const servicoId = parseInt(this.value, 10);
            const precoInput = row.querySelector('.item-preco');
            const quantidadeInput = row.querySelector('.item-quantidade');
            const totalInput = row.querySelector('.item-total');
    
            console.log(`[DEBUG] Selecionado Serviço ID: ${servicoId}`);
    
            if (!isNaN(servicoId) && servicoId > 0) {
                db.servicos.get(servicoId).then(servico => {
                    if (servico) {
                        console.log(`[DEBUG] Serviço: ${servico.nome}, Preço: ${servico.preco}`);
                        precoInput.value = formatarMoeda(servico.preco);
                        const quantidade = parseInt(quantidadeInput.value, 10) || 1;
                        const total = servico.preco * quantidade;
                        totalInput.value = formatarMoeda(total);
                        calcularTotalOrcamento();
                        console.log(`[DEBUG] Preço Unitário Atualizado: ${precoInput.value}`);
                        console.log(`[DEBUG] Preço Total Atualizado: ${totalInput.value}`);
                    } else {
                        console.log('[DEBUG] Serviço não encontrado no banco de dados.');
                        precoInput.value = 'R$ 0,00';
                        totalInput.value = 'R$ 0,00';
                        calcularTotalOrcamento();
                    }
                }).catch(error => {
                    console.error('Erro ao carregar serviço/produto:', error);
                    mostrarToast('Erro', 'Erro ao carregar os dados do serviço/produto.', 'danger');
                });
            } else {
                precoInput.value = 'R$ 0,00';
                totalInput.value = 'R$ 0,00';
                calcularTotalOrcamento();
                console.log('[DEBUG] Serviço ID inválido. Preço Unitário e Total resetados para R$ 0,00.');
            }
        });
    
        row.querySelector('.item-quantidade').addEventListener('input', function() {
            const quantidade = parseInt(this.value, 10) || 1;
            const precoInput = row.querySelector('.item-preco');
            const totalInput = row.querySelector('.item-total');
            const preco = parsearMoeda(precoInput.value) || 0;
            const total = preco * quantidade;
            totalInput.value = formatarMoeda(total);
            calcularTotalOrcamento();
            console.log(`[DEBUG] Quantidade: ${quantidade}, Preço Unitário: ${preco}, Total Item: ${total}`);
        });
    
        // Se for edição, preencher os dados do item
        if (item) {
            row.querySelector('.item-servico').value = item.servicoId;
            row.querySelector('.item-servico').dispatchEvent(new Event('change'));
        }
    }
    

    // Carrega as opções de serviços/produtos no select de item
    function carregarOpcoesServicos(row, servicoSelecionadoId) {
        db.servicos.toArray().then(servicos => {
            const select = row.querySelector('.item-servico');
            select.innerHTML = '<option value="">Selecione um serviço/produto</option>';
    
            servicos.forEach(servico => {
                const option = document.createElement('option');
                option.value = servico.id;
                option.textContent = servico.nome;
                if (servico.id === servicoSelecionadoId) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
    
            // Se for edição, após carregar os serviços, disparar o 'change' para carregar os preços
            if (servicoSelecionadoId) {
                console.log(`[DEBUG] Serviço Selecionado no Carregamento: ${servicoSelecionadoId}`);
                select.dispatchEvent(new Event('change'));
            }
        }).catch(error => {
            console.error('Erro ao carregar serviços/produtos:', error);
            mostrarToast('Erro', 'Erro ao carregar a lista de serviços/produtos.', 'danger');
        });
    }
    

    // Calcula o total do orçamento
    function calcularTotalOrcamento() {
        let total = 0;
        const totalInputs = document.querySelectorAll('.item-total');

        totalInputs.forEach(input => {
            const valor = parsearMoeda(input.value) || 0;
            total += valor;
        });

        $('#totalOrcamento').text(formatarMoeda(total));
    }

    // Salva o orçamento no banco de dados
    function salvarOrcamento() {
        const orcamentoId = $('#orcamentoId').val();
        const clienteId = parseInt($('#clienteId').val(), 10);
        const data = $('#dataOrcamento').val();
        const observacoes = $('#observacoesOrcamento').val().trim();
    
        if (!clienteId || !data) {
            mostrarToast('Erro', 'Por favor, preencha todos os campos obrigatórios.', 'danger');
            return;
        }
    
        const itens = [];
        let total = 0;
    
        $('#itensOrcamento tbody tr').each(function() {
            const servicoIdValor = $(this).find('.item-servico').val();
            const servicoId = parseInt(servicoIdValor, 10);
            const quantidade = parseInt($(this).find('.item-quantidade').val(), 10) || 1;
            const precoUnitarioValor = $(this).find('.item-preco').val();
            const precoUnitario = parsearMoeda(precoUnitarioValor);
            const totalItemValor = $(this).find('.item-total').val();
            const totalItem = parsearMoeda(totalItemValor);
    
            console.log(`[DEBUG] ServicoId Valor: "${servicoIdValor}", ServicoId: ${servicoId}, Quantidade: ${quantidade}, Preço Unitário Valor: "${precoUnitarioValor}", Preço Unitário: ${precoUnitario}, Total Item Valor: "${totalItemValor}", Total Item: ${totalItem}`);
    
            if (servicoId && quantidade > 0 && precoUnitario > 0) {
                itens.push({ servicoId, quantidade, precoUnitario, total: totalItem });
                total += totalItem;
            } else {
                mostrarToast('Erro', 'Por favor, selecione um serviço/produto válido e preencha os campos corretamente.', 'danger');
            }
        });
    
        console.log(`[DEBUG] Total de Itens: ${itens.length}, Total Orçamento: ${total}`);
    
        if (itens.length === 0) {
            mostrarToast('Erro', 'Por favor, adicione pelo menos um item ao orçamento.', 'danger');
            return;
        }
    
        const orcamento = {
            clienteId,
            items: itens,
            data,
            total,
            observacoes
        };
    
        if (orcamentoId) {
            // Atualização
            db.orcamentos.update(parseInt(orcamentoId, 10), orcamento).then(() => {
                $('#modalOrcamento').modal('hide');
                listarOrcamentos();
                mostrarToast('Sucesso', 'Orçamento atualizado com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao atualizar orçamento:', error);
                mostrarToast('Erro', 'Erro ao atualizar o orçamento.', 'danger');
            });
        } else {
            // Novo orçamento
            db.orcamentos.add(orcamento).then(() => {
                $('#modalOrcamento').modal('hide');
                listarOrcamentos();
                mostrarToast('Sucesso', 'Orçamento cadastrado com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao adicionar orçamento:', error);
                mostrarToast('Erro', 'Erro ao cadastrar o orçamento.', 'danger');
            });
        }
    }
    

    // Abre o modal para editar orçamento
    function editarOrcamento(id) {
        db.orcamentos.get(id).then(orcamento => {
            if (orcamento) {
                abrirModalOrcamento(orcamento);
            }
        }).catch(error => {
            console.error('Erro ao carregar orçamento para edição:', error);
            mostrarToast('Erro', 'Erro ao carregar os dados do orçamento.', 'danger');
        });
    }

    // Exclui o orçamento do banco de dados
    function excluirOrcamento(id) {
        if (confirm('Tem certeza que deseja excluir este orçamento?')) {
            db.orcamentos.delete(id).then(() => {
                listarOrcamentos();
                mostrarToast('Sucesso', 'Orçamento excluído com sucesso!', 'success');
            }).catch(error => {
                console.error('Erro ao excluir orçamento:', error);
                mostrarToast('Erro', 'Erro ao excluir o orçamento.', 'danger');
            });
        }
    }

    // Visualiza o orçamento em detalhes (incluindo a geração do PDF)
    function visualizarOrcamento(id) {
        db.orcamentos.get(id).then(orcamento => {
            if (orcamento) {
                gerarPDFOrcamento(orcamento);
            }
        }).catch(error => {
            console.error('Erro ao carregar orçamento para visualização:', error);
            mostrarToast('Erro', 'Erro ao carregar os dados do orçamento.', 'danger');
        });
    }

    // Gera o PDF do orçamento usando jsPDF e AutoTable
    function gerarPDFOrcamento(orcamento) {
        db.clientes.get(orcamento.clienteId).then(cliente => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Cabeçalho
            doc.setFontSize(20);
            doc.text('Orçamento', 14, 20);

            // Informações da Empresa (pode ser carregada do banco de dados se necessário)
            doc.setFontSize(12);
            doc.text('CarFilm-Pro', 14, 30);
            doc.text('Endereço: Rua Exemplo, 123', 14, 36);
            doc.text('Telefone: (11) 99999-9999', 14, 42);
            doc.text('Email: contato@carfilmpro.com.br', 14, 48);

            // Separador
            doc.line(14, 50, 196, 50);

            // Informações do Cliente
            doc.text('Cliente:', 14, 60);
            doc.text(cliente ? cliente.nome : 'Cliente não encontrado', 14, 66);
            doc.text(cliente ? `CPF/CNPJ: ${cliente.cpfCnpj}` : '', 14, 72);
            doc.text(cliente ? `Telefone: ${cliente.telefone}` : '', 14, 78);
            doc.text(cliente ? `Email: ${cliente.email}` : '', 14, 84);

            // Informações do Orçamento
            doc.text(`Data: ${formatarData(orcamento.data)}`, 120, 60);
            doc.text(`ID: ${orcamento.id}`, 120, 66);

            // Tabela de Itens
            doc.text('Itens:', 14, 100);

            const itens = orcamento.items.map(item => {
                return {
                    Servico: '', // Será preenchido após obter o nome do serviço
                    Quantidade: item.quantidade,
                    'Preço Unitário': formatarMoeda(item.precoUnitario),
                    Total: formatarMoeda(item.total)
                };
            });

            // Obtém os nomes dos serviços/produtos
            Promise.all(orcamento.items.map(item => db.servicos.get(item.servicoId))).then(servicos => {
                orcamento.items.forEach((item, index) => {
                    itens[index].Servico = servicos[index] ? servicos[index].nome : 'Serviço não encontrado';
                });

                // Adicionar Tabela ao PDF usando autoTable
                doc.autoTable({
                    startY: 105,
                    head: [['Serviço/Produto', 'Quantidade', 'Preço Unitário', 'Total']],
                    body: itens.map(item => [item.Servico, item.Quantidade, item['Preço Unitário'], item.Total]),
                    theme: 'striped',
                    styles: { fontSize: 10 },
                    headStyles: { fillColor: [22, 160, 133] },
                    margin: { top: 10 },
                });

                // Total
                const finalY = doc.lastAutoTable.finalY;
                doc.text(`Total: ${formatarMoeda(orcamento.total)}`, 14, finalY + 10);

                // Observações
                if (orcamento.observacoes) {
                    doc.text('Observações:', 14, finalY + 20);
                    doc.text(orcamento.observacoes, 14, finalY + 26, { maxWidth: 180 });
                }

                // Salvar o PDF
                doc.save(`Orcamento_${orcamento.id}.pdf`);
            }).catch(error => {
                console.error('Erro ao carregar serviços/produtos para PDF:', error);
                mostrarToast('Erro', 'Erro ao gerar o PDF do orçamento.', 'danger');
            });
        }).catch(error => {
            console.error('Erro ao carregar cliente para PDF:', error);
            mostrarToast('Erro', 'Erro ao gerar o PDF do orçamento.', 'danger');
        });
    }

    // Retorna as funções públicas
    return {
        init,
        editarOrcamento,
        excluirOrcamento,
        visualizarOrcamento,
        adicionarLinhaItem
    };
})();

// Inicializa o módulo quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    OrcamentosModule.init();
});

// Expõe o módulo globalmente
window.OrcamentosModule = OrcamentosModule;
