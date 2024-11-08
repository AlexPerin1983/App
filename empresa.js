// empresa.js

const EmpresaModule = (function() {
    // Configurações e constantes
    const empresaId = 1; // ID fixo para a empresa

    // Inicialização do módulo
    function init() {
        carregarHTML();
        carregarDadosEmpresa();
        bindEvents();
    }

    // Carrega o HTML base da seção Empresa
    function carregarHTML() {
        const container = document.getElementById('empresa');
        container.innerHTML = `
            <div class="container-fluid">
                <h2 class="mb-4">Configurações da Empresa</h2>
                <form id="formEmpresa" novalidate>
                    <!-- Informações Básicas -->
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="nomeEmpresa">Nome da Empresa <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="nomeEmpresa" placeholder="Digite o nome da empresa" required>
                            <div class="invalid-feedback">
                                Por favor, insira o nome da empresa.
                            </div>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="cnpjEmpresa">CNPJ <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="cnpjEmpresa" placeholder="00.000.000/0000-00" data-mask="00.000.000/0000-00" required>
                            <div class="invalid-feedback">
                                Por favor, insira um CNPJ válido.
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="emailEmpresa">Email <span class="text-danger">*</span></label>
                        <input type="email" class="form-control" id="emailEmpresa" placeholder="nome@empresa.com" required>
                        <div class="invalid-feedback">
                            Por favor, insira um email válido.
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="telefoneEmpresa">Telefone <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="telefoneEmpresa" placeholder="(00) 00000-0000" data-mask="(00) 00000-0000" required>
                        <div class="invalid-feedback">
                            Por favor, insira um telefone válido.
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="enderecoEmpresa">Endereço Completo <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="enderecoEmpresa" placeholder="Rua, Número, Complemento, Bairro, Cidade, Estado, CEP" required>
                        <div class="invalid-feedback">
                            Por favor, insira o endereço completo.
                        </div>
                    </div>

                    <hr>

                    <!-- Horários de Funcionamento -->
                    <h4 class="mb-3">Horários de Funcionamento</h4>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead class="thead-light">
                                <tr>
                                    <th>Dia</th>
                                    <th>Aberto</th>
                                    <th>Abertura</th>
                                    <th>Fechamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${getHorarioDiaHTML('seg', 'Seg')}
                                ${getHorarioDiaHTML('ter', 'Ter')}
                                ${getHorarioDiaHTML('qua', 'Qua')}
                                ${getHorarioDiaHTML('qui', 'Qui')}
                                ${getHorarioDiaHTML('sex', 'Sex')}
                                ${getHorarioDiaHTML('sab', 'Sab')}
                                ${getHorarioDiaHTML('dom', 'Dom')}
                            </tbody>
                        </table>
                    </div>

                    <hr>

                    <!-- Cores e Logo -->
                    <div class="form-row">
                        <div class="form-group col-md-6">
                            <label for="corPrimaria">Cor Primária <span class="text-danger">*</span></label>
                            <input type="color" class="form-control-color form-control" id="corPrimaria" value="#007bff" title="Escolha a cor primária da empresa" required>
                            <div class="invalid-feedback">
                                Por favor, selecione uma cor primária.
                            </div>
                        </div>
                        <div class="form-group col-md-6">
                            <label for="corSecundaria">Cor Secundária <span class="text-danger">*</span></label>
                            <input type="color" class="form-control-color form-control" id="corSecundaria" value="#6c757d" title="Escolha a cor secundária da empresa" required>
                            <div class="invalid-feedback">
                                Por favor, selecione uma cor secundária.
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="logoEmpresa">Logo da Empresa</label>
                        <input type="file" class="form-control-file" id="logoEmpresa" accept="image/*">
                        <small class="form-text text-muted">Escolha uma imagem para a logo da empresa. (Opcional)</small>
                    </div>

                    <div class="form-group">
                        <label>Pré-visualização da Logo</label>
                        <div>
                            <img id="logoPreview" src="#" alt="Logo da Empresa" style="max-width: 200px; display: none;" class="img-thumbnail">
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save mr-2"></i>Salvar Configurações
                    </button>
                </form>
            </div>
        `;
    }

    /**
     * Gera o HTML para os campos de horário de um dia específico.
     * @param {string} diaKey - Chave do dia (seg, ter, etc.).
     * @param {string} diaNome - Nome abreviado do dia para exibição.
     * @returns {string} - HTML do dia.
     */
    function getHorarioDiaHTML(diaKey, diaNome) {
        return `
            <tr>
                <td>${diaNome}</td>
                <td class="text-center">
                    <input type="checkbox" class="form-check-input abrir-dia" id="aberto_${diaKey}" data-dia="${diaKey}">
                </td>
                <td>
                    <input type="time" class="form-control horario-abertura" id="abertura_${diaKey}" disabled>
                    <div class="invalid-feedback">
                        Por favor, insira o horário de abertura.
                    </div>
                </td>
                <td>
                    <input type="time" class="form-control horario-fechamento" id="fechamento_${diaKey}" disabled>
                    <div class="invalid-feedback">
                        Por favor, insira o horário de fechamento.
                    </div>
                </td>
            </tr>
        `;
    }

    // Carrega os dados da empresa do banco de dados
    function carregarDadosEmpresa() {
        db.empresa.get(empresaId).then(empresa => {
            if (empresa) {
                $('#nomeEmpresa').val(empresa.nome);
                $('#cnpjEmpresa').val(empresa.cnpj);
                $('#emailEmpresa').val(empresa.email);
                $('#telefoneEmpresa').val(empresa.telefone);
                $('#enderecoEmpresa').val(empresa.endereco);
                $('#corPrimaria').val(empresa.corPrimaria || '#007bff');
                $('#corSecundaria').val(empresa.corSecundaria || '#6c757d');

                // Pré-visualização da logo
                if (empresa.logo) {
                    $('#logoPreview').attr('src', empresa.logo).show();
                } else {
                    $('#logoPreview').hide();
                }

                // Carregar horários
                if (empresa.horarios) {
                    for (const dia in empresa.horarios) {
                        const diaHorario = empresa.horarios[dia];
                        if (diaHorario.aberto) {
                            $(`#aberto_${dia}`).prop('checked', true);
                            $(`#abertura_${dia}`).val(diaHorario.abertura).prop('disabled', false);
                            $(`#fechamento_${dia}`).val(diaHorario.fechamento).prop('disabled', false);
                        } else {
                            $(`#aberto_${dia}`).prop('checked', false);
                            $(`#abertura_${dia}`).val('').prop('disabled', true);
                            $(`#fechamento_${dia}`).val('').prop('disabled', true);
                        }
                    }
                }
            }
        }).catch(error => {
            console.error('Erro ao carregar dados da empresa:', error);
            mostrarToast('Erro', 'Erro ao carregar os dados da empresa.', 'danger');
        });
    }

    // Vincula eventos aos elementos da seção
    function bindEvents() {
        // Evento de submit do formulário
        $('#formEmpresa').on('submit', function(e) {
            e.preventDefault();
            if (this.checkValidity() === false) {
                e.stopPropagation();
                $(this).addClass('was-validated');
                mostrarToast('Erro', 'Por favor, corrija os erros no formulário.', 'danger');
                return;
            }
            salvarDadosEmpresa();
        });

        // Evento para pré-visualizar a logo
        $('#logoEmpresa').on('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    $('#logoPreview').attr('src', e.target.result).show();
                };
                reader.readAsDataURL(file);
            } else {
                $('#logoPreview').attr('src', '#').hide();
            }
        });

        // Eventos para habilitar/desabilitar horários com base na checkbox
        $('.abrir-dia').on('change', function() {
            const dia = $(this).data('dia');
            const abertura = $(`#abertura_${dia}`);
            const fechamento = $(`#fechamento_${dia}`);

            if ($(this).is(':checked')) {
                abertura.prop('disabled', false);
                fechamento.prop('disabled', false);
            } else {
                abertura.val('').prop('disabled', true);
                fechamento.val('').prop('disabled', true);
            }
        });
    }

    // Salva os dados da empresa no banco de dados
    function salvarDadosEmpresa() {
        const nome = $('#nomeEmpresa').val().trim();
        const cnpj = $('#cnpjEmpresa').val().trim();
        const email = $('#emailEmpresa').val().trim();
        const telefone = $('#telefoneEmpresa').val().trim();
        const endereco = $('#enderecoEmpresa').val().trim();
        const corPrimaria = $('#corPrimaria').val();
        const corSecundaria = $('#corSecundaria').val();
        const logoInput = document.getElementById('logoEmpresa');
        const logoFile = logoInput.files[0];

        // Coletar horários
        const diasSemana = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
        const horarios = {};

        for (const dia of diasSemana) {
            const aberto = $(`#aberto_${dia}`).is(':checked');
            if (aberto) {
                const abertura = $(`#abertura_${dia}`).val();
                const fechamento = $(`#fechamento_${dia}`).val();

                // Validação de horários
                if (!abertura || !fechamento) {
                    mostrarToast('Erro', `Por favor, preencha os horários de abertura e fechamento para ${getDiaNome(dia)}.`, 'danger');
                    return;
                }

                horarios[dia] = {
                    aberto: true,
                    abertura: abertura,
                    fechamento: fechamento
                };
            } else {
                horarios[dia] = {
                    aberto: false
                };
            }
        }

        // Função para salvar dados sem logo
        function salvarSemLogo(logoDataUrl = null) {
            const empresa = {
                id: empresaId,
                nome,
                cnpj,
                email,
                telefone,
                endereco,
                corPrimaria,
                corSecundaria,
                horarios,
                logo: logoDataUrl // Pode ser null se não houver logo
            };

            // Salvar ou atualizar no banco de dados
            db.empresa.put(empresa).then(() => {
                mostrarToast('Sucesso', 'Configurações da empresa salvas com sucesso!', 'success');
                carregarDadosEmpresa(); // Atualizar a pré-visualização
                // Resetar validações
                $('#formEmpresa').removeClass('was-validated');
                // Disparar evento de atividade
                dispararEvento('atividade:registrada', {
                    tipo: 'Configurações da Empresa Atualizadas',
                    descricao: `Informações da empresa "${nome}" foram atualizadas.`,
                    data: new Date().toISOString()
                });
                // Aplicar as cores selecionadas imediatamente
                aplicarTema(corPrimaria, corSecundaria);
            }).catch(error => {
                console.error('Erro ao salvar dados da empresa:', error);
                mostrarToast('Erro', 'Erro ao salvar as configurações da empresa.', 'danger');
            });
        }

        // Se houver logo, ler o arquivo e converter para Data URL
        if (logoFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const logoDataUrl = e.target.result;
                salvarSemLogo(logoDataUrl);
            };
            reader.readAsDataURL(logoFile);
        } else {
            // Se não houver logo, manter a logo existente
            db.empresa.get(empresaId).then(empresaExistente => {
                const logoDataUrl = empresaExistente ? empresaExistente.logo : null;
                salvarSemLogo(logoDataUrl);
            }).catch(error => {
                console.error('Erro ao buscar logo existente:', error);
                mostrarToast('Erro', 'Erro ao salvar as configurações da empresa.', 'danger');
            });
        }
    }

    /**
     * Obtém o nome completo do dia a partir da chave.
     * @param {string} diaKey - Chave do dia (seg, ter, etc.).
     * @returns {string} - Nome completo do dia.
     */
    function getDiaNome(diaKey) {
        const dias = {
            seg: 'Segunda-feira',
            ter: 'Terça-feira',
            qua: 'Quarta-feira',
            qui: 'Quinta-feira',
            sex: 'Sexta-feira',
            sab: 'Sábado',
            dom: 'Domingo'
        };
        return dias[diaKey] || diaKey;
    }

    /**
     * Aplica as cores selecionadas no tema da aplicação.
     * @param {string} corPrimaria - Cor primária selecionada.
     * @param {string} corSecundaria - Cor secundária selecionada.
     */
    function aplicarTema(corPrimaria, corSecundaria) {
        document.documentElement.style.setProperty('--primary-color', corPrimaria);
        document.documentElement.style.setProperty('--secondary-color', corSecundaria);
    }

    // Função para disparar eventos personalizados
    function dispararEvento(nome, detalhes = {}) {
        const evento = new CustomEvent(nome, { detail: detalhes });
        document.dispatchEvent(evento);
    }

    // Retorna as funções públicas
    return {
        init
    };
})();

// Inicializa o módulo quando o evento 'section:shown' para 'empresa' for disparado
document.addEventListener('section:shown', function(e) {
    if (e.detail.sectionId === 'empresa') {
        EmpresaModule.init();
    }
});

// Expõe o módulo globalmente, se necessário
window.EmpresaModule = EmpresaModule;
