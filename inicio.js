// inicio.js

const InicioModule = {
    // Configurações e constantes
    config: {
        containerId: 'inicio'
    },

    // Inicialização do módulo
    init: function() {
        this.carregarConteudo();
        this.bindEvents();
    },

    // Carrega o conteúdo HTML da seção
    carregarConteudo: function() {
        const container = document.getElementById(this.config.containerId);
        
        container.innerHTML = `
            <div class="container-fluid">
                <h2>Inicio</h2>
                <div class="row">
                    <div class="col-md-12">
                        <div class="card shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title">Bem-vindo ao CarFilm-Pro</h5>
                                <p class="card-text">
                                    Aqui você pode gerenciar todos os serviços oferecidos pela sua empresa.
                                    Use o menu lateral para navegar entre as diferentes seções do sistema.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mt-4">
                    <!-- Resumo de Clientes -->
                    <div class="col-md-4 mb-4">
                        <div class="card border-left-primary shadow h-100">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                            Clientes</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800" id="totalClientes">0</div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-users fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Resumo de Serviços -->
                    <div class="col-md-4 mb-4">
                        <div class="card border-left-success shadow h-100">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                            Serviços Ativos</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800" id="totalServicos">0</div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-tools fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Resumo de Películas -->
                    <div class="col-md-4 mb-4">
                        <div class="card border-left-info shadow h-100">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                            Películas em Estoque</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800" id="totalPeliculas">0</div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-film fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mt-4">
                    <!-- Atalhos Rápidos -->
                    <div class="col-md-12">
                        <div class="card shadow-sm">
                            <div class="card-header bg-primary text-white">
                                <h5 class="card-title mb-0">Atalhos Rápidos</h5>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-3 mb-3">
                                        <button class="btn btn-light btn-block" onclick="showSection('clientes')">
                                            <i class="fas fa-user-plus mb-2"></i><br>
                                            Novo Cliente
                                        </button>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <button class="btn btn-light btn-block" onclick="showSection('agendamento')">
                                            <i class="fas fa-calendar-plus mb-2"></i><br>
                                            Novo Agendamento
                                        </button>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <button class="btn btn-light btn-block" onclick="showSection('orcamento')">
                                            <i class="fas fa-file-invoice-dollar mb-2"></i><br>
                                            Novo Orçamento
                                        </button>
                                    </div>
                                    <div class="col-md-3 mb-3">
                                        <button class="btn btn-light btn-block" onclick="showSection('servicos')">
                                            <i class="fas fa-tools mb-2"></i><br>
                                            Novo Serviço
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.atualizarContadores();
    },

    // Vincula eventos
    bindEvents: function() {
        // Atualiza os contadores quando a seção é mostrada
        document.addEventListener('section:shown', (e) => {
            if (e.detail.sectionId === this.config.containerId) {
                this.atualizarContadores();
            }
        });
    },

    // Atualiza os contadores do dashboard
    atualizarContadores: function() {
        // Conta total de clientes
        db.clientes.count().then(total => {
            document.getElementById('totalClientes').textContent = total;
        });

        // Conta total de serviços
        db.servicos.count().then(total => {
            document.getElementById('totalServicos').textContent = total;
        });

        // Conta total de películas
        db.filmes.count().then(total => {
            document.getElementById('totalPeliculas').textContent = total;
        });
    }
};

// Inicializa o módulo
document.addEventListener('DOMContentLoaded', () => InicioModule.init());
