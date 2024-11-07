// peliculas.js

const PeliculasModule = (function() {
    // Lista de Categorias Predefinidas
    const categoriasPredefinidas = [
        "Nanocerâmico",
        "Nano Carbono",
        "Fotocromático",
        "Semi-refletiva",
        "Refletiva",
        "Antivandalismo",
        "Profissional",
        "Pigmentada",
        "Sputtering",
        "Híbrido"
    ];

    // Carrega o HTML base da seção
    function carregarHTML() {
        const container = document.getElementById('peliculas');
        container.innerHTML = `
            <div class="container-fluid">
                <h2>Películas</h2>
                <p>Aqui você pode gerenciar as películas disponíveis.</p>
                
                <!-- Cards das Categorias -->
                <div class="row" id="categoriasContainer">
                    <!-- Cards serão inseridos aqui via JavaScript -->
                </div>

                <!-- Modal para Cadastrar/Editar Película -->
                <div class="modal fade" id="modalCadastrarFilme" tabindex="-1" aria-labelledby="modalCadastrarFilmeLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <form id="formCadastrarFilme">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="modalCadastrarFilmeLabel">Cadastrar Película</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <input type="hidden" id="filmeId">
                                    <input type="hidden" id="categoriaSelecionada">
                                    <div class="form-group">
                                        <label for="nomeFilme">Nome</label>
                                        <input type="text" class="form-control" id="nomeFilme" placeholder="Digite o nome da película" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="marcaFilme">Marca da Película</label>
                                        <input type="text" class="form-control" id="marcaFilme" placeholder="Digite a marca da película" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="descricaoFilme">Descrição</label>
                                        <textarea class="form-control" id="descricaoFilme" rows="3" placeholder="Digite a descrição da película" required></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label for="precoFabricante">Preço Fabricante (R$)</label>
                                        <input type="number" step="0.01" class="form-control" id="precoFabricante" placeholder="Digite o preço do fabricante" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="precoMaoObra">Preço Mão de Obra (R$)</label>
                                        <input type="number" step="0.01" class="form-control" id="precoMaoObra" placeholder="Digite o preço da mão de obra" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="quantidadeEstoque">Quantidade em Estoque (m)</label>
                                        <input type="number" step="0.01" class="form-control" id="quantidadeEstoque" placeholder="Digite a quantidade em estoque" required>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                                    <button type="submit" class="btn btn-primary">Salvar Película</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- Modal para Exibir Lista de Películas por Categoria -->
                <div class="modal fade" id="modalListaFilmes" tabindex="-1" aria-labelledby="modalListaFilmesLabel" aria-hidden="true">
                    <div class="modal-dialog modal-xl">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="modalListaFilmesLabel">Películas da Categoria</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Fechar">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="container-fluid">
                                    <div class="row" id="listaFilmesCategoria">
                                        <!-- Cards serão inseridos aqui via JavaScript -->
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Após carregar o HTML, configura os eventos do formulário
        $('#formCadastrarFilme').on('submit', function(event) {
            event.preventDefault();
            salvarFilme();
        });
    }

    // Função para listar as categorias com contadores
    function listarCategoriasComContadores() {
        const container = $('#categoriasContainer');
        container.empty();

        categoriasPredefinidas.forEach(categoria => {
            db.filmes.where('categoria').equals(categoria).count().then(contador => {
                const card = `
                    <div class="col-md-4 col-sm-6 mb-3">
                        <div class="card h-100">
                            <div class="card-body d-flex flex-column justify-content-between align-items-center">
                                <div class="text-center">
                                    <i class="fas fa-film fa-3x mb-3"></i>
                                    <h5 class="card-title">${categoria}</h5>
                                </div>
                                <div class="d-flex justify-content-between align-items-center w-100">
                                    <button class="btn btn-primary btn-block mb-2" onclick="PeliculasModule.abrirModalCadastrarFilme('${categoria}')">
                                        Adicionar Película
                                    </button>
                                    <button class="btn btn-info btn-block" onclick="PeliculasModule.abrirModalListaFilmes('${categoria}')">
                                        <i class="fas fa-eye"></i> ${contador} ${contador === 1 ? 'Película' : 'Películas'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.append(card);
            }).catch(err => {
                console.error(`Erro ao contar películas na categoria ${categoria}:`, err);
                mostrarToast('Erro', `Erro ao contar películas na categoria ${categoria}`, 'danger');
            });
        });
    }

    // Função para abrir o modal de cadastro
    function abrirModalCadastrarFilme(categoria) {
        $('#categoriaSelecionada').val(categoria);
        $('#modalCadastrarFilmeLabel').text(`Cadastrar Película - ${categoria}`);
        $('#formCadastrarFilme')[0].reset();
        $('#filmeId').val('');
        $('#modalCadastrarFilme').modal('show');
    }

    // Função para salvar película
    function salvarFilme() {
        const filmeId = $('#filmeId').val();
        const filme = {
            nome: $('#nomeFilme').val(),
            marca: $('#marcaFilme').val(),
            descricao: $('#descricaoFilme').val(),
            precoFabricante: parseFloat($('#precoFabricante').val()),
            precoMaoObra: parseFloat($('#precoMaoObra').val()),
            quantidadeEstoque: parseFloat($('#quantidadeEstoque').val()),
            categoria: $('#categoriaSelecionada').val()
        };

        // Validação básica
        if (!filme.nome || !filme.marca || !filme.descricao || 
            isNaN(filme.precoFabricante) || isNaN(filme.precoMaoObra) || 
            isNaN(filme.quantidadeEstoque) || !filme.categoria) {
            mostrarToast('Erro', 'Por favor, preencha todos os campos corretamente.', 'danger');
            return;
        }

        const saveOperation = filmeId ? 
            db.filmes.update(parseInt(filmeId), filme) : 
            db.filmes.add(filme);

        saveOperation.then(() => {
            $('#modalCadastrarFilme').modal('hide');
            listarCategoriasComContadores();
            mostrarToast('Sucesso', `Película ${filmeId ? 'atualizada' : 'cadastrada'} com sucesso!`, 'success');
        }).catch(err => {
            console.error('Erro ao salvar película:', err);
            mostrarToast('Erro', 'Erro ao salvar a película.', 'danger');
        });
    }

    // Função para abrir o modal de lista de películas
    function abrirModalListaFilmes(categoria) {
        $('#modalListaFilmesLabel').text(`Películas da Categoria - ${categoria}`);

        db.filmes.where('categoria').equals(categoria).toArray().then(filmes => {
            const container = $('#listaFilmesCategoria');
            container.empty();

            if (filmes.length === 0) {
                container.append('<div class="col-12 text-center">Nenhuma película cadastrada nesta categoria.</div>');
            } else {
                filmes.forEach(filme => {
                    const card = `
                        <div class="col-md-4 col-sm-6 mb-3">
                            <div class="card">
                                <div class="card-body">
                                    <h5 class="card-title">${filme.nome}</h5>
                                    <h6 class="card-subtitle mb-2 text-muted">${filme.marca}</h6>
                                    <p class="card-text">${filme.descricao}</p>
                                    <p class="card-text"><strong>Preço Fabricante:</strong> R$ ${filme.precoFabricante.toFixed(2)}</p>
                                    <p class="card-text"><strong>Preço Mão de Obra:</strong> R$ ${filme.precoMaoObra.toFixed(2)}</p>
                                    <p class="card-text"><strong>Quantidade em Estoque:</strong> ${filme.quantidadeEstoque.toFixed(2)} m</p>
                                    <div class="btn-group w-100">
                                        <button class="btn btn-info btn-sm" onclick="PeliculasModule.editarFilme(${filme.id}, '${categoria}')">
                                            <i class="fas fa-edit"></i> Editar
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="PeliculasModule.excluirFilme(${filme.id}, '${categoria}')">
                                            <i class="fas fa-trash"></i> Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.append(card);
                });
            }

            $('#modalListaFilmes').modal('show');
        }).catch(err => {
            console.error('Erro ao carregar películas:', err);
            mostrarToast('Erro', 'Erro ao carregar a lista de películas.', 'danger');
        });
    }

    // Função para editar película
    function editarFilme(id, categoria) {
        db.filmes.get(id).then(filme => {
            if (filme) {
                $('#filmeId').val(filme.id);
                $('#nomeFilme').val(filme.nome);
                $('#marcaFilme').val(filme.marca);
                $('#descricaoFilme').val(filme.descricao);
                $('#precoFabricante').val(filme.precoFabricante);
                $('#precoMaoObra').val(filme.precoMaoObra);
                $('#quantidadeEstoque').val(filme.quantidadeEstoque);
                $('#categoriaSelecionada').val(filme.categoria);

                $('#modalCadastrarFilmeLabel').text(`Editar Película - ${categoria}`);
                $('#modalListaFilmes').modal('hide');
                $('#modalCadastrarFilme').modal('show');
            }
        }).catch(err => {
            console.error('Erro ao carregar película para edição:', err);
            mostrarToast('Erro', 'Erro ao carregar os dados da película.', 'danger');
        });
    }

    // Função para excluir película
    function excluirFilme(id, categoria) {
        if (confirm('Tem certeza que deseja excluir esta película?')) {
            db.filmes.delete(id).then(() => {
                listarCategoriasComContadores();
                abrirModalListaFilmes(categoria);
                mostrarToast('Sucesso', 'Película excluída com sucesso!', 'success');
            }).catch(err => {
                console.error('Erro ao excluir película:', err);
                mostrarToast('Erro', 'Erro ao excluir a película.', 'danger');
            });
        }
    }

    // Inicialização do módulo
    function init() {
        document.addEventListener('section:shown', function(e) {
            if (e.detail.sectionId === 'peliculas') {
                carregarHTML();
                listarCategoriasComContadores();
            }
        });
    }

    // Retorna as funções públicas
    return {
        init,
        abrirModalCadastrarFilme,
        abrirModalListaFilmes,
        editarFilme,
        excluirFilme,
        salvarFilme
    };
})();

// Inicializa o módulo
document.addEventListener('DOMContentLoaded', () => PeliculasModule.init());

// Expõe funções globalmente
window.PeliculasModule = PeliculasModule;
