// utils.js

// Função para mostrar toast de feedback
function mostrarToast(titulo, mensagem, tipo = 'info') {
    const toast = $('#feedbackToast');
    const header = toast.find('.toast-header');
    
    $('#toastTitle').text(titulo);
    $('#toastBody').text(mensagem);

    // Remove todas as classes de cor anteriores
    header.removeClass('bg-success bg-danger bg-info text-white');
    
    // Aplica a classe de cor apropriada
    switch (tipo) {
        case 'success':
            header.addClass('bg-success text-white');
            break;
        case 'danger':
            header.addClass('bg-danger text-white');
            break;
        default:
            header.addClass('bg-info text-white');
    }

    toast.toast('show');
}

// Função para disparar eventos personalizados
function dispararEvento(nome, detalhes = {}) {
    const evento = new CustomEvent(nome, { detail: detalhes });
    document.dispatchEvent(evento);
}

// Converte string formatada para número
function parsearMoeda(valor) {
    return parseFloat(valor.replace(/[^0-9,.-]+/g, "").replace(',', '.')) || 0;
}
