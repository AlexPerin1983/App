// peliculas.js

// Funções e variáveis relacionadas à seção "Películas"
(function() {
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

    // Função para listar as categorias com contadores
    function listarCategoriasComContadores() {
        const container = $('#categoriasContainer');
        container.empty(); // Limpa o container antes de adicionar os cards

        categoriasPredefinidas.forEach(categoria => {
            // Conta a quantidade de películas na categoria atual
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
                                    <button class="btn btn-primary btn-block mb-2" onclick="abrirModalCadastrarFilme('${categoria}')">Adicionar Película</button>
                                    <button class="btn btn-info btn-block" onclick="abrirModalListaFilmes('${categoria}')">
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
            });
        });
    }

    // Função para abrir o modal de cadastro de película (Adicionar)
    window.abrirModalCadastrarFilme = function(categoria) {
        $('#categoriaSelecionada').val(categoria); // Define a categoria selecionada no campo oculto
        $('#modalCadastrarFilmeLabel').text(`Cadastrar Película - ${categoria}`); // Atualiza o título do modal
        $('#formCadastrarFilme')[0].reset(); // Limpa os campos do formulário
        $('#filmeId').val(''); // Assegura que não há ID definido
        // Reconfigurar o formulário para adicionar novas películas
        $('#formCadastrarFilme').off('submit').on('submit', salvarFilme);
        $('#modalCadastrarFilme').modal('show'); // Exibe o modal
    }

    // Função para salvar a película no IndexedDB
    window.salvarFilme = function(event) {
        event.preventDefault(); // Previne o comportamento padrão do formulário

        const filmeId = $('#filmeId').val(); // Verifica se é uma edição
        const nome = $('#nomeFilme').val();
        const marca = $('#marcaFilme').val();
        const descricao = $('#descricaoFilme').val();
        const precoFabricante = parseFloat($('#precoFabricante').val());
        const precoMaoObra = parseFloat($('#precoMaoObra').val());
        const quantidadeEstoque = parseFloat($('#quantidadeEstoque').val());
        const categoria = $('#categoriaSelecionada').val();

        // Validação básica
        if (!nome || !marca || !descricao || isNaN(precoFabricante) || isNaN(precoMaoObra) || isNaN(quantidadeEstoque) || !categoria) {
            mostrarToast('Erro', 'Por favor, preencha todos os campos corretamente.', 'danger');
            return;
        }

        if (filmeId) {
            // É uma edição
            const filmeAtualizado = {
                nome,
                marca,
                descricao,
                precoFabricante,
                precoMaoObra,
                quantidadeEstoque,
                categoria
            };

            // Atualiza a película no banco de dados
            db.filmes.update(parseInt(filmeId), filmeAtualizado).then(() => {
                $('#modalCadastrarFilme').modal('hide'); // Fecha o modal de cadastro/edição
                listarCategoriasComContadores(); // Atualiza os contadores das categorias
                mostrarToast('Sucesso', 'Película atualizada com sucesso!', 'success');
            }).catch(err => {
                console.error(err);
                mostrarToast('Erro', 'Erro ao atualizar a película.', 'danger');
            });
        } else {
            // É uma adição
            const filme = {
                nome,
                marca,
                descricao,
                precoFabricante,
                precoMaoObra,
                quantidadeEstoque,
                categoria
            };

            // Adiciona a película ao banco de dados
            db.filmes.add(filme).then(() => {
                $('#modalCadastrarFilme').modal('hide'); // Fecha o modal
                listarCategoriasComContadores(); // Atualiza os contadores das categorias
                mostrarToast('Sucesso', 'Película cadastrada com sucesso!', 'success');
            }).catch(err => {
                console.error(err);
                mostrarToast('Erro', 'Erro ao cadastrar a película.', 'danger');
            });
        }
    }

    // Função para abrir o modal de lista de películas por categoria
    window.abrirModalListaFilmes = function(categoria) {
        $('#modalListaFilmesLabel').text(`Películas da Categoria - ${categoria}`); // Atualiza o título do modal

        // Recupera as películas da categoria selecionada
        db.filmes.where('categoria').equals(categoria).toArray().then(filmes => {
            const container = $('#listaFilmesCategoria');
            container.empty(); // Limpa a área antes de adicionar os cards

            if (filmes.length === 0) {
                container.append('<div class="col-12 text-center">Nenhuma película cadastrada nesta categoria.</div>');
            } else {
                filmes.forEach(filme => {
                    const card = `
                        <div class="col-md-4 col-sm-6 mb-3">
                            <div class="card">
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title">${filme.nome}</h5>
                                    <h6 class="card-subtitle mb-2 text-muted">${filme.marca}</h6>
                                    <p class="card-text">${filme.descricao}</p>
                                    <p class="card-text"><strong>Preço Fabricante:</strong> R$ ${filme.precoFabricante.toFixed(2)}</p>
                                    <p class="card-text"><strong>Preço Mão de Obra:</strong> R$ ${filme.precoMaoObra.toFixed(2)}</p>
                                    <p class="card-text"><strong>Quantidade em Estoque:</strong> ${filme.quantidadeEstoque.toFixed(2)} m</p>
                                    <div class="mt-auto btn-group">
                                        <button class="btn btn-info btn-sm mr-2 editar-filme" data-id="${filme.id}" data-categoria="${categoria}"><i class="fas fa-edit"></i> Editar</button>
                                        <button class="btn btn-danger btn-sm excluir-filme" data-id="${filme.id}" data-categoria="${categoria}"><i class="fas fa-trash-alt"></i> Excluir</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.append(card);
                });
            }

            $('#modalListaFilmes').modal('show'); // Exibe o modal com a lista de películas
        }).catch(err => {
            console.error(`Erro ao recuperar películas da categoria ${categoria}:`, err);
            mostrarToast('Erro', 'Erro ao carregar a lista de películas.', 'danger');
        });
    }

    // Função para excluir uma película
    window.excluirFilme = function(id, categoria) {
        if(confirm('Tem certeza que deseja excluir esta película?')) {
            db.filmes.delete(id).then(() => {
                listarCategoriasComContadores(); // Atualiza os contadores das categorias
                abrirModalListaFilmes(categoria); // Atualiza a lista no modal
                mostrarToast('Sucesso', 'Película excluída com sucesso!', 'success');
            }).catch(err => {
                console.error(err);
                mostrarToast('Erro', 'Erro ao excluir a película.', 'danger');
            });
        }
    }

    // Função para editar uma película
    window.editarFilme = function(id, categoria) {
        db.filmes.get(id).then(filme => {
            if(filme) {
                // Preencher os campos do formulário com os dados da película
                $('#filmeId').val(filme.id);
                $('#nomeFilme').val(filme.nome);
                $('#marcaFilme').val(filme.marca);
                $('#descricaoFilme').val(filme.descricao);
                $('#precoFabricante').val(filme.precoFabricante);
                $('#precoMaoObra').val(filme.precoMaoObra);
                $('#quantidadeEstoque').val(filme.quantidadeEstoque);
                $('#categoriaSelecionada').val(filme.categoria);

                // Atualizar o título do modal para "Editar Película"
                $('#modalCadastrarFilmeLabel').text(`Editar Película - ${categoria}`);

                // Alterar o comportamento do formulário para salvar a edição
                $('#formCadastrarFilme').off('submit').on('submit', function(event) {
                    event.preventDefault(); // Previne o comportamento padrão do formulário

                    // Coleta os dados atualizados do formulário
                    const filmeId = $('#filmeId').val();
                    const nome = $('#nomeFilme').val();
                    const marca = $('#marcaFilme').val();
                    const descricao = $('#descricaoFilme').val();
                    const precoFabricante = parseFloat($('#precoFabricante').val());
                    const precoMaoObra = parseFloat($('#precoMaoObra').val());
                    const quantidadeEstoque = parseFloat($('#quantidadeEstoque').val());
                    const categoriaAtualizada = $('#categoriaSelecionada').val();

                    // Validação básica
                    if (!nome || !marca || !descricao || isNaN(precoFabricante) || isNaN(precoMaoObra) || isNaN(quantidadeEstoque) || !categoriaAtualizada) {
                        mostrarToast('Erro', 'Por favor, preencha todos os campos corretamente.', 'danger');
                        return;
                    }

                    // Cria o objeto atualizado da película
                    const filmeAtualizado = {
                        nome,
                        marca,
                        descricao,
                        precoFabricante,
                        precoMaoObra,
                        quantidadeEstoque,
                        categoria: categoriaAtualizada
                    };

                    // Atualiza a película no banco de dados
                    db.filmes.update(parseInt(filmeId), filmeAtualizado).then(() => {
                        $('#modalCadastrarFilme').modal('hide'); // Fecha o modal de cadastro/edição
                        $('#modalListaFilmes').modal('hide'); // Fecha o modal de lista
                        listarCategoriasComContadores(); // Atualiza os contadores das categorias
                        mostrarToast('Sucesso', 'Película atualizada com sucesso!', 'success');
                        // Reconfigurar o formulário para adicionar novas películas
                        $('#formCadastrarFilme').off('submit').on('submit', salvarFilme);
                    }).catch(err => {
                        console.error(err);
                        mostrarToast('Erro', 'Erro ao atualizar a película.', 'danger');
                    });
                });

                // Fechar o modal de lista antes de abrir o modal de cadastro/edição
                $('#modalListaFilmes').modal('hide');

                // Abrir o modal de cadastro/edição
                $('#modalCadastrarFilme').modal('show');
            }
        }).catch(err => {
            console.error(err);
            mostrarToast('Erro', 'Erro ao recuperar os dados da película.', 'danger');
        });
    }

    // Eventos para botões Editar e Excluir dentro do modalListaFilmes
    $(document).on('click', '.editar-filme', function() {
        const id = $(this).data('id');
        const categoria = $(this).data('categoria');
        editarFilme(id, categoria);
    });

    $(document).on('click', '.excluir-filme', function() {
        const id = $(this).data('id');
        const categoria = $(this).data('categoria');
        excluirFilme(id, categoria);
    });

    // Inicialização ao carregar a página
    $(document).ready(function() {
        listarCategoriasComContadores();

        // Configurar o evento de submissão do formulário de cadastro de película
        $('#formCadastrarFilme').on('submit', salvarFilme);
    });

})();
