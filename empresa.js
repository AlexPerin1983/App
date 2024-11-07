// empresa.js

const EmpresaModule = (function() {
    // Variáveis e configurações
    const empresaId = 1; // Usaremos um ID fixo para a empresa

    // Inicialização do módulo
    function init() {
        document.addEventListener('section:shown', function(e) {
            if (e.detail.sectionId === 'empresa') {
                carregarHTML();
                carregarDadosEmpresa();
                bindEvents();
            }
        });
    }

    // Carrega o HTML base da seção
    function carregarHTML() {
        const container = document.getElementById('empresa');
        container.innerHTML = `
            <div class="container-fluid">
                <h2>Minha Empresa</h2>
                <p>Aqui você pode gerenciar as informações da sua empresa.</p>

                <form id="formEmpresa">
                    <div class="form-group">
                        <label for="nomeEmpresa">Nome da Empresa*</label>
                        <input type="text" class="form-control" id="nomeEmpresa" required>
                    </div>

                    <div class="form-group">
                        <label for="cnpjEmpresa">CNPJ*</label>
                        <input type="text" class="form-control" id="cnpjEmpresa" required data-mask="00.000.000/0000-00">
                    </div>

                    <div class="form-group">
                        <label for="emailEmpresa">Email*</label>
                        <input type="email" class="form-control" id="emailEmpresa" required>
                    </div>

                    <div class="form-group">
                        <label for="telefoneEmpresa">Telefone*</label>
                        <input type="text" class="form-control" id="telefoneEmpresa" required data-mask="(00) 00000-0000">
                    </div>

                    <div class="form-group">
                        <label for="enderecoEmpresa">Endereço*</label>
                        <input type="text" class="form-control" id="enderecoEmpresa" required>
                    </div>

                    <div class="form-group">
                        <label for="logoEmpresa">Logo da Empresa</label>
                        <input type="file" class="form-control-file" id="logoEmpresa">
                    </div>

                    <div class="text-right mt-4">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save mr-1"></i>Salvar Dados
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Aplicar máscaras nos inputs
        if (window.jQuery) {
            $('#cnpjEmpresa').mask('00.000.000/0000-00');
            $('#telefoneEmpresa').mask('(00) 00000-0000');
        }
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

                // Se tiver logo, pode exibir em algum lugar, por exemplo:
                // $('#logoPreview').attr('src', empresa.logo);
            }
        }).catch(error => {
            console.error('Erro ao carregar dados da empresa:', error);
            mostrarToast('Erro', 'Erro ao carregar os dados da empresa.', 'danger');
        });
    }

    // Vincula eventos
    function bindEvents() {
        // Evento de submit do formulário
        $('#formEmpresa').on('submit', function(e) {
            e.preventDefault();
            salvarDadosEmpresa();
        });

        // Evento para pré-visualizar a logo (se desejar implementar)
        $('#logoEmpresa').on('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Exibir pré-visualização
                    // $('#logoPreview').attr('src', e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Salva os dados da empresa no banco de dados
    function salvarDadosEmpresa() {
        const empresa = {
            id: empresaId,
            nome: $('#nomeEmpresa').val().trim(),
            cnpj: $('#cnpjEmpresa').val().trim(),
            email: $('#emailEmpresa').val().trim(),
            telefone: $('#telefoneEmpresa').val().trim(),
            endereco: $('#enderecoEmpresa').val().trim(),
            // logo: ... (pode ser implementado o upload da logo)
        };

        // Validação adicional
        if (!empresa.nome || !empresa.cnpj || !empresa.email || !empresa.telefone || !empresa.endereco) {
            mostrarToast('Erro', 'Por favor, preencha todos os campos obrigatórios.', 'danger');
            return;
        }

        // Salvar no banco de dados
        db.empresa.put(empresa).then(() => {
            mostrarToast('Sucesso', 'Dados da empresa salvos com sucesso!', 'success');
        }).catch(error => {
            console.error('Erro ao salvar dados da empresa:', error);
            mostrarToast('Erro', 'Erro ao salvar os dados da empresa.', 'danger');
        });
    }

    // Retorna as funções públicas
    return {
        init
    };
})();

// Inicializa o módulo quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    EmpresaModule.init();
});

// Expõe o módulo globalmente (se necessário)
window.EmpresaModule = EmpresaModule;
