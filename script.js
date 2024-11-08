// script.js

// Configuração do IndexedDB usando Dexie.js
const db = new Dexie('CarFilmProDB');

// Definição do schema do banco de dados na versão 5
db.version(5).stores({
    empresa: 'id,nome,cnpj,cpf,whatsapp,email,cep,cidade,bairro,rua,numero,corTema,logo',
    clientes: '++id,nome,cpfCnpj,telefone,email,empresa,endereco,numero,complemento,bairro,cidade,estado,cep',
    filmes: '++id,nome,descricao,marca,precoFabricante,precoMaoObra,quantidadeEstoque,categoria',
    servicos: '++id,tipo,nome,descricao,preco,observacoes,categoria',
    agendamentos: '++id,clienteId,servicoId,data,hora,observacoes,status',
    orcamentos: '++id,clienteId,items,data,total,observacoes',
    pagamentos: '++id,tipo,detalhes,observacoes' // Definindo a store de pagamentos
});

// Atualização do banco de dados para a versão 6 que inclui o campo 'horarios' na store 'empresa'
db.version(6).stores({
    empresa: 'id,nome,cnpj,cpf,whatsapp,email,cep,cidade,bairro,rua,numero,corTema,logo,horarios'
});

// Inicializa a store pagamentos
db.pagamentos = db.table('pagamentos');

// Função para exibir mensagens de feedback (Toast)
function mostrarToast(titulo, mensagem, tipo = 'info') {
    const toastElement = $('#feedbackToast');
    toastElement.find('#toastTitle').text(titulo);
    toastElement.find('#toastBody').text(mensagem);
    toastElement.removeClass('bg-info bg-success bg-danger bg-warning');
    toastElement.addClass(`bg-${tipo}`);
    toastElement.toast('show');
}

// Função para navegar entre as seções do sistema
function showSection(sectionId) {
    console.log('Mostrando seção:', sectionId);

    // Ocultar todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Exibir a seção selecionada
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        selectedSection.style.display = 'block';

        // Disparar evento personalizado para que o módulo correspondente atualize seu conteúdo
        const event = new CustomEvent('section:shown', { detail: { sectionId: sectionId } });
        document.dispatchEvent(event);
    } else {
        console.error(`Seção com ID '${sectionId}' não encontrada.`);
        mostrarToast('Aviso', `A seção "${sectionId}" não foi encontrada.`, 'warning');
    }

    // Atualizar o menu lateral
    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Fechar o menu lateral em dispositivos móveis
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
}

// Função para alternar o menu lateral
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Função para ajustar altura do conteúdo
function ajustarAlturaConteudo() {
    const header = document.querySelector('.header');
    const mainContent = document.getElementById('mainContent');
    if (header && mainContent) {
        const headerHeight = header.offsetHeight;
        mainContent.style.marginTop = headerHeight + 'px';
        mainContent.style.minHeight = `calc(100vh - ${headerHeight}px)`;
    }
}

// Inicialização quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Mostrar seção inicial
    showSection('inicio');

    // Ajustar altura do conteúdo
    ajustarAlturaConteudo();
    window.addEventListener('resize', ajustarAlturaConteudo);

    // Aplicar máscaras nos inputs (se existirem)
    if (window.jQuery) {
        $('[data-mask]').each(function() {
            $(this).mask($(this).data('mask'));
        });
    }
});

// Função para aplicar tema
function aplicarCorTema(cor) {
    document.documentElement.style.setProperty('--primary-color', cor);
}

// Escutar eventos para inicializar módulos
document.addEventListener('section:shown', (e) => {
    const sectionId = e.detail.sectionId;
    switch (sectionId) {
        case 'inicio':
            if (InicioModule && typeof InicioModule.init === 'function') {
                InicioModule.init();
            }
            break;
        case 'clientes':
            if (ClientesModule && typeof ClientesModule.init === 'function') {
                ClientesModule.init();
            }
            break;
        case 'servicos':
            if (ServicosModule && typeof ServicosModule.init === 'function') {
                ServicosModule.init();
            }
            break;
        case 'peliculas':
            if (PeliculasModule && typeof PeliculasModule.init === 'function') {
                PeliculasModule.init();
            }
            break;
        case 'agendamentos':
            if (AgendamentosModule && typeof AgendamentosModule.init === 'function') {
                AgendamentosModule.init();
            }
            break;
        case 'orcamentos':
            if (OrcamentosModule && typeof OrcamentosModule.init === 'function') {
                OrcamentosModule.init();
            }
            break;
        case 'pagamentos':
            if (PagamentosModule && typeof PagamentosModule.init === 'function') {
                PagamentosModule.init();
            }
            break;
        case 'fornecedores':
            if (FornecedoresModule && typeof FornecedoresModule.init === 'function') {
                FornecedoresModule.init();
            }
            break;
        case 'estoque':
            if (EstoqueModule && typeof EstoqueModule.init === 'function') {
                EstoqueModule.init();
            }
            break;
        case 'empresa':
            if (EmpresaModule && typeof EmpresaModule.init === 'function') {
                EmpresaModule.init();
            }
            break;
        default:
            console.warn(`Módulo para a seção "${sectionId}" não está registrado.`);
    }
});
