// script.js

// Configuração do IndexedDB usando Dexie.js
const db = new Dexie('CarFilmProDB');

// Definição do schema do banco de dados
db.version(5).stores({
    empresa: 'id,nome,cnpj,cpf,whatsapp,email,cep,cidade,bairro,rua,numero,corTema,logo',
    clientes: '++id,nome,cpfCnpj,telefone,email,empresa,endereco,numero,complemento,bairro,cidade,estado,cep',
    filmes: '++id,nome,descricao,marca,precoFabricante,precoMaoObra,quantidadeEstoque,categoria',
    servicos: '++id,tipo,nome,descricao,preco,observacoes,categoria',
    agendamentos: '++id,clienteId,servicoId,data,hora,observacoes,status'
});

// Em caso de erro na abertura do banco
db.open().catch(error => {
    console.error("Erro ao abrir o banco de dados:", error);
    if (error.name === 'VersionError') {
        Dexie.delete('CarFilmProDB').then(() => {
            window.location.reload();
        });
    }
});

// Função para mostrar a seção selecionada
function showSection(sectionId) {
    console.log('Mostrando seção:', sectionId);
    
    // Remove a classe 'active' de todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Adiciona a classe 'active' à seção selecionada
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        selectedSection.style.display = 'block';
        
        // Dispara evento de seção mostrada
        const event = new CustomEvent('section:shown', { detail: { sectionId: sectionId } });
        document.dispatchEvent(event);
    } else {
        console.error(`Seção com ID '${sectionId}' não encontrada.`);
    }

    // Atualiza o menu lateral
    document.querySelectorAll('.menu-item').forEach(item => {
        if (item.getAttribute('onclick').includes(sectionId)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Fecha o menu lateral em dispositivos móveis
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

// Função para exibir mensagens de feedback (Toast)
function mostrarToast(titulo, mensagem, tipo = 'info') {
    const toast = $('#feedbackToast');
    toast.find('#toastTitle').text(titulo);
    toast.find('#toastBody').text(mensagem);
    toast.removeClass('bg-info bg-success bg-danger bg-warning');
    toast.addClass(`bg-${tipo}`);
    toast.toast('show');
}

// Se precisar adicionar mais funções globais, faça aqui
