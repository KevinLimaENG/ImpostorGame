document.addEventListener('DOMContentLoaded', () => {

    // --- VARIÁVEIS GLOBAIS ---
    let jogadores = [];
    let votos = {};
    let indiceVotanteAtual = 0;

    // --- SELEÇÃO DE ELEMENTOS ---
    const telas = document.querySelectorAll('.tela');
    const btnIniciarJogo = document.getElementById('btnIniciarJogo');
    const btnIrParaVotacao = document.getElementById('btnIrParaVotacao');
    const btnConfirmarVoto = document.getElementById('btnConfirmarVoto');
    const btnMostrarVotacao = document.getElementById('btnMostrarVotacao'); // BOTÃO DA NOVA TELA
    const btnJogarNovamente = document.getElementById('btnJogarNovamente');
    const btnVotarNovamente = document.getElementById('btnVotarNovamente');

    const containerBaloes = document.getElementById('containerBaloes');
    const containerVotacao = document.getElementById('containerVotacao');
    const tituloVotacao = document.getElementById('tituloVotacao');
    const resultadoFinalDiv = document.getElementById('resultadoFinal');
    const impostoresReveladosDiv = document.getElementById('impostoresRevelados');


    // --- FUNÇÕES DE NAVEGAÇÃO ---
    function mudarTela(idTela) {
        telas.forEach(tela => tela.classList.remove('ativa'));
        document.getElementById(idTela).classList.add('ativa');
    }

    // --- LÓGICA DO JOGO ---
    function iniciarJogo() {
        const nomesInput = document.getElementById('nomesJogadores').value.trim().split('\n');
        const palavra = document.getElementById('palavraEscolhida').value;
        const numImpostores = parseInt(document.getElementById('numImpostores').value);
        const nomesFiltrados = nomesInput.filter(nome => nome.trim() !== '');

        if (nomesFiltrados.length < 3 || numImpostores >= nomesFiltrados.length || palavra.trim() === '' || numImpostores < 1) {
            alert('Configurações inválidas! Verifique o número de jogadores (mínimo 3), impostores e a palavra secreta.');
            return;
        }

        const papeis = [];
        for (let i = 0; i < numImpostores; i++) papeis.push('Impostor');
        for (let i = 0; i < (nomesFiltrados.length - numImpostores); i++) papeis.push(palavra);
        
        for (let i = papeis.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [papeis[i], papeis[j]] = [papeis[j], papeis[i]];
        }
        
        jogadores = [];
        votos = {};
        nomesFiltrados.forEach((nome, index) => {
            const nomeTrimmed = nome.trim();
            jogadores.push({ nome: nomeTrimmed, papel: papeis[index] });
            votos[nomeTrimmed] = 0;
        });

        containerBaloes.innerHTML = '';
        jogadores.forEach(jogador => criarBalao(jogador));
        mudarTela('telaJogo');
    }

    function criarBalao(jogador) {
        const balao = document.createElement('div');
        balao.classList.add('balao');

        const nomeJogador = document.createElement('div');
        nomeJogador.classList.add('nome-jogador-balao');
        nomeJogador.textContent = jogador.nome;

        const conteudo = document.createElement('div');
        conteudo.classList.add('conteudo-balao');
        conteudo.textContent = jogador.papel;

        balao.appendChild(nomeJogador);
        balao.appendChild(conteudo);

        balao.addEventListener('click', () => {
            balao.classList.toggle('revelado');
        });

        containerBaloes.appendChild(balao);
    }
    
    // --- LÓGICA DE VOTAÇÃO ---
    function iniciarRodadaDeVotacao() {
        indiceVotanteAtual = 0;
        apresentarTelaDeVoto();
        mudarTela('telaVotacao');
    }

    function apresentarTelaDeVoto() {
        const votanteAtual = jogadores[indiceVotanteAtual];
        tituloVotacao.innerHTML = `Vez de <span class="votante-atual">${votanteAtual.nome}</span> votar!`;
        containerVotacao.innerHTML = '';

        const alvos = jogadores.filter(j => j.nome !== votanteAtual.nome);

        alvos.forEach(alvo => {
            const opcaoVoto = document.createElement('div');
            opcaoVoto.classList.add('opcao-voto');
            opcaoVoto.textContent = alvo.nome;
            opcaoVoto.dataset.nome = alvo.nome;

            opcaoVoto.addEventListener('click', () => {
                document.querySelectorAll('.opcao-voto').forEach(opt => opt.classList.remove('selecionado'));
                opcaoVoto.classList.add('selecionado');
            });
            containerVotacao.appendChild(opcaoVoto);
        });
    }

    function processarVoto() {
        const votoSelecionado = containerVotacao.querySelector('.opcao-voto.selecionado');
        if (!votoSelecionado) {
            alert('Por favor, selecione um jogador para votar.');
            return;
        }

        const nomeVotado = votoSelecionado.dataset.nome;
        votos[nomeVotado]++;
        
        indiceVotanteAtual++;

        if (indiceVotanteAtual < jogadores.length) {
            apresentarTelaDeVoto();
        } else {
            // Todos votaram, então mostra a tela de suspense
            mudarTela('telaPreResultado');
        }
    }

    function mostrarResultados() {
        resultadoFinalDiv.innerHTML = '';
        impostoresReveladosDiv.innerHTML = '';

        const ranking = Object.entries(votos).sort(([,a],[,b]) => b - a);

        ranking.forEach(([nome, contagem]) => {
            resultadoFinalDiv.innerHTML += `<p><strong>${nome}:</strong> ${contagem} voto(s)</p>`;
        });

        const impostores = jogadores.filter(j => j.papel === 'Impostor');
        impostores.forEach(impostor => {
            impostoresReveladosDiv.innerHTML += `<p>${impostor.nome}</p>`;
        });

        mudarTela('telaResultado');
    }

    function revotar() {
        Object.keys(votos).forEach(nome => {
            votos[nome] = 0;
        });
        iniciarRodadaDeVotacao();
    }
    
    function resetarJogo() {
        document.getElementById('palavraEscolhida').value = 'Cinema';
        document.getElementById('numImpostores').value = 1;
        document.getElementById('nomesJogadores').value = '';
        mudarTela('telaSetup');
    }

    // --- EVENT LISTENERS ---
    btnIniciarJogo.addEventListener('click', iniciarJogo);
    btnIrParaVotacao.addEventListener('click', iniciarRodadaDeVotacao);
    btnConfirmarVoto.addEventListener('click', processarVoto);
    btnMostrarVotacao.addEventListener('click', mostrarResultados); // NOVO EVENTO
    btnJogarNovamente.addEventListener('click', resetarJogo);
    btnVotarNovamente.addEventListener('click', revotar);
});
