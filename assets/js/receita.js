const bancoMedicamentosPadrao = [
    { nome: "Amoxicilina", concentracao: "500 mg", forma: "Cápsula" },
    { nome: "Amoxicilina", concentracao: "250 mg/5 mL", forma: "Suspensão Oral" },
    { nome: "Amoxicilina + Clavulanato de Potássio", concentracao: "500 mg + 125 mg", forma: "Comprimido Revestido" },
    { nome: "Azitromicina", concentracao: "500 mg", forma: "Comprimido Revestido" },
    { nome: "Cefalexina", concentracao: "500 mg", forma: "Cápsula" },
    { nome: "Ciprofloxacino", concentracao: "500 mg", forma: "Comprimido" },
    { nome: "Dipirona Sódica", concentracao: "500 mg", forma: "Comprimido" },
    { nome: "Dipirona Sódica", concentracao: "500 mg/mL", forma: "Solução Gotas" },
    { nome: "Paracetamol", concentracao: "500 mg", forma: "Comprimido" },
    { nome: "Paracetamol", concentracao: "200 mg/mL", forma: "Solução Gotas" },
    { nome: "Ibuprofeno", concentracao: "600 mg", forma: "Comprimido" },
    { nome: "Ibuprofeno", concentracao: "50 mg/mL", forma: "Solução Gotas" },
    { nome: "Losartana Potássica", concentracao: "50 mg", forma: "Comprimido" },
    { nome: "Enalapril Maleato", concentracao: "10 mg", forma: "Comprimido" },
    { nome: "Enalapril Maleato", concentracao: "20 mg", forma: "Comprimido" },
    { nome: "Hidroclorotiazida", concentracao: "25 mg", forma: "Comprimido" },
    { nome: "Anlodipino Besilato", concentracao: "5 mg", forma: "Comprimido" },
    { nome: "Atenolol", concentracao: "50 mg", forma: "Comprimido" },
    { nome: "Metformina Cloridrato", concentracao: "850 mg", forma: "Comprimido" },
    { nome: "Glibenclamida", concentracao: "5 mg", forma: "Comprimido" },
    { nome: "Sinvastatina", concentracao: "20 mg", forma: "Comprimido" },
    { nome: "Omeprazol", concentracao: "20 mg", forma: "Cápsula" },
    { nome: "Prednisona", concentracao: "20 mg", forma: "Comprimido" },
    { nome: "Prednisona", concentracao: "5 mg", forma: "Comprimido" },
    { nome: "Dexametasona", concentracao: "4 mg", forma: "Comprimido" },
    { nome: "Salbutamol Sulfato", concentracao: "100 mcg/dose", forma: "Aerossol / Spray" },
    { nome: "Loratadina", concentracao: "10 mg", forma: "Comprimido" },
    { nome: "Sais de Reidratação Oral (SRO)", concentracao: "Envelope", forma: "Pó para Solução Oral" }
];

let receitaAtual = [];
let modeloAtualSelecionado = null;

function obterMedicamentosCompletos() {
    let customizados = [];
    try {
        customizados = JSON.parse(localStorage.getItem('rx_custom_meds')) || [];
    } catch { customizados = []; }
    return [...bancoMedicamentosPadrao, ...customizados];
}

function salvarMedicamentoPessoal() {
    const inputNome = document.getElementById('med-nome');
    const inputConcentracao = document.getElementById('med-concentracao');
    const inputForma = document.getElementById('med-forma');

    const nome = inputNome.value.trim();
    const concentracao = inputConcentracao.value.trim() || 'Uso conforme posologia';
    const forma = inputForma.value.trim() || 'Comprimido';

    if (!nome) {
        alert('Digite o nome do medicamento antes de salvar na lista pessoal.');
        inputNome.focus();
        return;
    }

    let customizados = [];
    try {
        customizados = JSON.parse(localStorage.getItem('rx_custom_meds')) || [];
    } catch { customizados = []; }

    const jaExiste = customizados.some(m => m.nome.toLowerCase() === nome.toLowerCase() && m.concentracao.toLowerCase() === concentracao.toLowerCase());
    if (jaExiste) {
        alert('Este medicamento e dosagem já constam na sua lista pessoal.');
        return;
    }

    customizados.push({ nome, concentracao, forma });
    localStorage.setItem('rx_custom_meds', JSON.stringify(customizados));
    alert(`Medicamento "${nome} ${concentracao}" adicionado à sua lista com sucesso!`);
}

function salvarConfiguracoes() {
    const config = {
        medico: document.getElementById('cfg-medico').value,
        esp: document.getElementById('cfg-esp').value,
        crm: document.getElementById('cfg-crm').value
    };
    localStorage.setItem('rx_config', JSON.stringify(config));
    alert('Configurações profissionais salvas com sucesso!');
}

function carregarConfiguracoes() {
    const configSalva = localStorage.getItem('rx_config');
    if (!configSalva) return;
    try {
        const config = JSON.parse(configSalva);
        document.getElementById('cfg-medico').value = config.medico || '';
        document.getElementById('cfg-esp').value = config.esp || '';
        document.getElementById('cfg-crm').value = config.crm || '';
    } catch { alert('Configurações locais inválidas.'); }
}

function obterModelosSalvos() {
    try { return JSON.parse(localStorage.getItem('rx_templates')) || {}; }
    catch { return {}; }
}

function configurarAutocomplete() {
    const inputNome = document.getElementById('med-nome');
    const inputConcentracao = document.getElementById('med-concentracao');
    const inputForma = document.getElementById('med-forma');
    const inputQuantidade = document.getElementById('med-quantidade');
    const lista = document.getElementById('autocomplete-list');

    if (!inputNome || !lista) return;

    inputNome.addEventListener('input', function () {
        const termo = this.value.toLowerCase().trim();
        lista.replaceChildren();
        modeloAtualSelecionado = null;
        if (!termo) { lista.style.display = 'none'; return; }

        const todosMedicamentos = obterMedicamentosCompletos();
        const filtrados = todosMedicamentos.filter(m => 
            m.nome.toLowerCase().includes(termo) || (m.concentracao && m.concentracao.toLowerCase().includes(termo))
        );
        if (!filtrados.length) { lista.style.display = 'none'; return; }

        lista.style.display = 'block';
        filtrados.slice(0, 15).forEach(med => {
            const li = document.createElement('li');
            const strong = document.createElement('strong');
            const small = document.createElement('small');
            strong.textContent = med.nome;
            small.textContent = `${med.concentracao || ''} | ${med.forma || ''}`;
            li.append(strong, small);
            li.addEventListener('click', () => {
                inputNome.value = med.nome;
                if (inputConcentracao) inputConcentracao.value = med.concentracao || '';
                if (inputForma) inputForma.value = med.forma || '';
                lista.style.display = 'none';
                if (inputQuantidade) inputQuantidade.focus();
            });
            lista.appendChild(li);
        });
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('.autocomplete-wrapper')) lista.style.display = 'none';
    });
}

function adicionarMedicamento() {
    const inputNome = document.getElementById('med-nome');
    const inputConcentracao = document.getElementById('med-concentracao');
    const inputForma = document.getElementById('med-forma');
    const inputQuantidade = document.getElementById('med-quantidade');
    const inputModo = document.getElementById('med-modo');
    const inputPosologia = document.getElementById('med-posologia');

    const nome = inputNome ? inputNome.value.trim() : '';
    const concentracao = inputConcentracao ? inputConcentracao.value.trim() : '';
    const forma = inputForma ? inputForma.value.trim() : '';
    const quantidade = inputQuantidade ? inputQuantidade.value.trim() : '';
    const modo = inputModo ? inputModo.value.trim() : '';
    const posologia = inputPosologia ? inputPosologia.value.trim() : '';

    if (!nome || !posologia) {
        alert('Por favor, preencha ao menos o Nome do Medicamento e a Posologia.');
        if (!nome && inputNome) inputNome.focus();
        else if (inputPosologia) inputPosologia.focus();
        return;
    }

    receitaAtual.push({
        nome: nome,
        concentracao: concentracao,
        forma: forma,
        quantidade: quantidade,
        modo: modo,
        pos: posologia
    });

    limparCamposMedicamento();
    if (inputNome) inputNome.focus();
    renderizarListaReceita();
}

function limparCamposMedicamento() {
    ['med-nome', 'med-concentracao', 'med-forma', 'med-quantidade', 'med-modo', 'med-posologia'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function removerMedicamento(index) {
    receitaAtual.splice(index, 1);
    renderizarListaReceita();
}

function renderizarListaReceita() {
    const listaEl = document.getElementById('lista-receita');
    const msgEl = document.getElementById('empty-msg');
    listaEl.replaceChildren();
    msgEl.style.display = receitaAtual.length ? 'none' : 'block';

    receitaAtual.forEach((item, index) => {
        const li = document.createElement('li');
        const info = document.createElement('div');
        const nomeEl = document.createElement('strong');
        const metaEl = document.createElement('div');
        const posologiaEl = document.createElement('span');
        const remover = document.createElement('button');

        li.className = 'med-item';
        info.className = 'med-item-info';

        const nome = item.nome || item.med || 'Medicamento';
        const concentracao = item.concentracao ? ` ${item.concentracao}` : '';
        const forma = item.forma ? ` (${item.forma})` : '';
        nomeEl.textContent = `${index + 1}. ${nome}${concentracao}${forma}`;

        const partesMeta = [];
        if (item.quantidade) partesMeta.push(`Quantidade: ${item.quantidade}`);
        if (item.modo) partesMeta.push(`Modo de Uso: ${item.modo}`);
        metaEl.className = 'med-meta';
        metaEl.textContent = partesMeta.join(' | ');

        posologiaEl.textContent = `Posologia: ${item.pos}`;

        remover.type = 'button';
        remover.className = 'danger remove-med';
        remover.textContent = 'Remover';
        remover.setAttribute('aria-label', `Remover ${nome}`);
        remover.addEventListener('click', () => removerMedicamento(index));

        info.append(nomeEl);
        if (partesMeta.length) info.append(metaEl);
        info.append(posologiaEl);

        li.append(info, remover);
        listaEl.appendChild(li);
    });
}

function atualizarDropdownModelos() {
    const select = document.getElementById('select-template');
    select.replaceChildren(new Option('-- Selecione um modelo salvo --', ''));
    Object.keys(obterModelosSalvos()).forEach(nome => {
        const opt = document.createElement('option');
        opt.value = nome;
        opt.textContent = nome;
        select.appendChild(opt);
    });
}

function salvarModelo() {
    if (!receitaAtual.length) {
        alert('Adicione ao menos um medicamento antes de salvar um modelo.');
        return;
    }
    const nomeModelo = document.getElementById('nome-modelo').value.trim();
    if (!nomeModelo) {
        alert('Digite um nome para o modelo (ex: Hipertensão Inicial, Otite Pediátrica).');
        return;
    }
    const modelos = obterModelosSalvos();
    modelos[nomeModelo] = receitaAtual;
    localStorage.setItem('rx_templates', JSON.stringify(modelos));
    document.getElementById('nome-modelo').value = '';
    alert(`Modelo "${nomeModelo}" salvo com sucesso!`);
    atualizarDropdownModelos();
}

function carregarModelo() {
    const nomeSelecionado = document.getElementById('select-template').value;
    const modelos = obterModelosSalvos();
    if (nomeSelecionado && modelos[nomeSelecionado]) {
        receitaAtual = [...modelos[nomeSelecionado]];
        renderizarListaReceita();
    }
}

function excluirModelo() {
    const nomeSelecionado = document.getElementById('select-template').value;
    if (!nomeSelecionado) { alert('Selecione um modelo para excluir.'); return; }
    if (!confirm(`Tem certeza que deseja excluir o modelo "${nomeSelecionado}"?`)) return;
    const modelos = obterModelosSalvos();
    delete modelos[nomeSelecionado];
    localStorage.setItem('rx_templates', JSON.stringify(modelos));
    atualizarDropdownModelos();
}

function elemento(tag, texto, classe) {
    const node = document.createElement(tag);
    if (texto !== undefined && texto !== null) node.textContent = texto;
    if (classe) node.className = classe;
    return node;
}

function gerarConteudoVia(numeroVia, isControleEspecial) {
    const via = elemento('div', null, 'via');
    const cabecalho = elemento('div', null, 'print-header');
    const marca = elemento('div', null, 'print-branding');
    const logo = document.createElement('img');
    logo.src = '../assets/logo.png';
    logo.alt = 'Sete Lagoas Prefeitura e Secretaria Municipal da Saúde';

    const tituloReceita = isControleEspecial ? 'Receituário de Controle Especial' : 'Receituário Médico';

    // Cabeçalho institucional exigido: ESF CDI 2, CNES: 7633432, Rua Nativo de Senna 33, CDI 2, MG
    const unidadeMarca = elemento('div', null, 'print-branding-unit');
    const nomeUnidadeEl = elemento('strong', 'ESF CDI 2 — CNES: 7633432');
    const endUnidadeEl = elemento('div', 'Rua Nativo de Senna 33, CDI 2, MG', 'unit-address');
    const docTituloEl = elemento('div', tituloReceita, 'doc-title-badge');

    unidadeMarca.append(nomeUnidadeEl, endUnidadeEl, docTituloEl);
    marca.append(logo, unidadeMarca);
    cabecalho.append(marca);

    // Identificação do Paciente (incluindo CPF ou Passaporte)
    const paciente = elemento('div', null, 'print-patient');
    const nome = document.getElementById('pac-nome').value || '_______________________________________';
    
    const docTipo = document.getElementById('pac-doc-tipo') ? document.getElementById('pac-doc-tipo').value : 'CPF';
    const docNum = document.getElementById('pac-doc-num') ? document.getElementById('pac-doc-num').value.trim() : '';
    const documentoRotulo = docTipo === 'Passaporte' ? 'Passaporte:' : 'CPF:';

    const dadosPaciente = [
        ['Paciente:', nome],
        [documentoRotulo, docNum],
        ['Idade / Nasc:', document.getElementById('pac-idade').value],
        ['Endereço:', document.getElementById('pac-end').value]
    ];

    dadosPaciente.forEach(([rotulo, valor]) => {
        if (rotulo !== 'Paciente:' && !valor) return;
        const p = document.createElement('p');
        const strong = elemento('strong', rotulo);
        p.append(strong, document.createTextNode(` ${valor}`));
        paciente.appendChild(p);
    });

    // Itens Prescritos (com Nome, Concentração, Forma Farmacêutica, Quantidade, Modo de Uso e Posologia)
    const meds = elemento('div', null, 'print-meds');
    if (receitaAtual.length) {
        receitaAtual.forEach((item, index) => {
            const bloco = elemento('div', null, 'print-med-item');

            const head = elemento('div', null, 'print-med-head');
            const nomeMed = item.nome || item.med || '';
            const concentracao = item.concentracao ? ` ${item.concentracao}` : '';
            const forma = item.forma ? `, ${item.forma}` : '';
            const tituloCompleto = `${index + 1}. ${nomeMed}${concentracao}${forma}`;
            
            const h3 = elemento('h3', tituloCompleto);
            head.appendChild(h3);

            if (item.quantidade) {
                const qtdSpan = elemento('span', `Qtd: ${item.quantidade}`, 'print-med-qtd');
                head.appendChild(qtdSpan);
            }
            bloco.appendChild(head);

            if (item.modo) {
                const pModo = elemento('p', null, 'print-med-modo');
                pModo.append(elemento('strong', 'Modo de uso: '), document.createTextNode(item.modo));
                bloco.appendChild(pModo);
            }

            if (item.pos) {
                const pPos = elemento('p', null, 'print-med-pos');
                pPos.append(elemento('strong', 'Posologia: '), document.createTextNode(item.pos));
                bloco.appendChild(pPos);
            }

            meds.appendChild(bloco);
        });
    } else {
        meds.appendChild(elemento('p', '[ Nenhuma prescrição adicionada ]', 'print-empty'));
    }

    // Rodapé Profissional
    const rodape = elemento('div', null, 'print-footer');
    const data = new Date();
    const dataFormatada = `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
    rodape.appendChild(elemento('div', `Sete Lagoas - MG, ${dataFormatada}`, 'print-date'));
    rodape.appendChild(elemento('div', null, 'signature-line'));
    rodape.appendChild(elemento('p', document.getElementById('cfg-medico').value || 'Nome do Profissional Responsável'));

    const esp = document.getElementById('cfg-esp').value;
    const crm = document.getElementById('cfg-crm').value;
    if (esp && crm) {
        rodape.appendChild(elemento('p', `${esp} — ${crm}`));
    } else if (crm) {
        rodape.appendChild(elemento('p', crm));
    }

    // Se for Controle Especial, anexa os campos legais da Portaria 344/98
    if (isControleEspecial) {
        const boxes = elemento('div', null, 'special-control-boxes');
        
        const boxComprador = elemento('div', null, 'special-box');
        boxComprador.appendChild(elemento('h4', 'Identificação do Comprador'));
        boxComprador.appendChild(elemento('p', 'Nome: ____________________________________'));
        boxComprador.appendChild(elemento('p', 'RG / Órgão: ______________ CPF: ____________'));
        boxComprador.appendChild(elemento('p', 'Endereço: _________________________________'));
        boxComprador.appendChild(elemento('p', 'Cidade / UF: Sete Lagoas/MG Tel: ____________'));

        const boxFornecedor = elemento('div', null, 'special-box');
        boxFornecedor.appendChild(elemento('h4', 'Identificação do Fornecedor'));
        boxFornecedor.appendChild(elemento('p', 'Data do Aviamento: ____ / ____ / ________'));
        boxFornecedor.appendChild(elemento('p', 'Assinatura Farmacêutico(a): ________________'));
        boxFornecedor.appendChild(elemento('p', 'Lote do Medicamento: ______________________'));
        boxFornecedor.appendChild(elemento('p', 'Quantidade Aviada: _______________________'));

        boxes.append(boxComprador, boxFornecedor);
        rodape.appendChild(boxes);
    }

    via.append(cabecalho, paciente, meds, rodape);
    return via;
}

function regrasDeImpressaoParaMedicao() {
    const regras = [];
    function coletar(lista) {
        for (const regra of lista) {
            if (regra.type === CSSRule.MEDIA_RULE) {
                if (regra.conditionText.includes('print')) coletar(regra.cssRules);
            } else if (regra.type !== CSSRule.PAGE_RULE && regra.cssText) regras.push(regra.cssText);
        }
    }
    for (const folha of document.styleSheets) {
        try { coletar(folha.cssRules); } catch { /* ignore */ }
    }
    return regras.join('\n');
}

function proximoQuadro() { return new Promise(resolve => requestAnimationFrame(resolve)); }

function imagensProntas(container) {
    return Promise.all([...container.querySelectorAll('img')].map(imagem => {
        if (imagem.complete) return Promise.resolve();
        return new Promise(resolve => {
            imagem.addEventListener('load', resolve, { once: true });
            imagem.addEventListener('error', resolve, { once: true });
        });
    }));
}

async function prepararImpressao() {
    const isControleEspecial = document.getElementById('tipo-receita').value === 'especial';
    const area = document.getElementById('print-area');
    const vias = [gerarConteudoVia(1, isControleEspecial), gerarConteudoVia(2, isControleEspecial)];
    vias[0].classList.add('via-1');
    vias[1].classList.add('via-2');
    const corte = elemento('div', null, 'cut-line');
    area.replaceChildren(vias[0], corte, vias[1]);
    await imagensProntas(area);

    const medicao = document.createElement('style');
    medicao.dataset.printMeasurement = 'true';
    medicao.textContent = regrasDeImpressaoParaMedicao();
    document.head.appendChild(medicao);
    document.body.classList.add('print-preview');
    await proximoQuadro();
    await proximoQuadro();

    const excedeu = [...area.querySelectorAll('.via')].some(via => {
        if (via.scrollHeight > via.clientHeight + 2 || via.scrollWidth > via.clientWidth + 2) return true;
        return [...via.querySelectorAll('*')].some(child => child.clientHeight > 0 && (
            child.scrollHeight > child.clientHeight + 2 || child.scrollWidth > child.clientWidth + 2
        ));
    });
    medicao.remove();
    document.body.classList.remove('print-preview');

    if (excedeu) {
        alert('O conteúdo da receita excede o espaço de uma via na folha. Reduza a quantidade de medicamentos ou simplifique as posologias para evitar cortes.');
        return;
    }

    const tipoDocNome = isControleEspecial ? 'receita-controle-especial' : 'receita';
    await baixarPDFEAguardarImpressao(nomeArquivoSeguro(document.getElementById('pac-nome').value, tipoDocNome), 'l');
}

function atualizarMascaraDocumento() {
    const selectTipo = document.getElementById('pac-doc-tipo');
    const inputNum = document.getElementById('pac-doc-num');
    const labelDoc = document.getElementById('pac-doc-label');
    if (!selectTipo || !inputNum) return;

    if (selectTipo.value === 'Passaporte') {
        if (labelDoc) labelDoc.textContent = 'Número do Passaporte';
        inputNum.placeholder = 'Ex: AB123456';
    } else {
        if (labelDoc) labelDoc.textContent = 'Número do CPF';
        inputNum.placeholder = 'Ex: 000.000.000-00';
    }
}

function carregarParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('nome')) document.getElementById('pac-nome').value = params.get('nome');
    if (params.has('idade')) document.getElementById('pac-idade').value = params.get('idade');
    if (params.has('endereco')) document.getElementById('pac-end').value = params.get('endereco');
    if (params.has('tipo')) document.getElementById('tipo-receita').value = params.get('tipo');

    // Suporte aos parâmetros de CPF ou Passaporte
    const selectTipo = document.getElementById('pac-doc-tipo');
    const inputNum = document.getElementById('pac-doc-num');
    if (selectTipo && inputNum) {
        if (params.has('cpf')) {
            selectTipo.value = 'CPF';
            inputNum.value = params.get('cpf');
        } else if (params.has('passaporte')) {
            selectTipo.value = 'Passaporte';
            inputNum.value = params.get('passaporte');
        } else if (params.has('documento') || params.has('doc')) {
            inputNum.value = params.get('documento') || params.get('doc');
        }
        atualizarMascaraDocumento();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarConfiguracoes();
    atualizarDropdownModelos();
    configurarAutocomplete();
    carregarParametrosURL();

    const selectTipoDoc = document.getElementById('pac-doc-tipo');
    if (selectTipoDoc) {
        selectTipoDoc.addEventListener('change', atualizarMascaraDocumento);
    }

    const btnLimparMed = document.getElementById('btn-limpar-campos-med');
    if (btnLimparMed) {
        btnLimparMed.addEventListener('click', limparCamposMedicamento);
    }

    document.querySelector('[data-action="salvar-configuracoes"]').addEventListener('click', salvarConfiguracoes);
    document.querySelector('[data-action="carregar-modelo"]').addEventListener('click', carregarModelo);
    document.querySelector('[data-action="excluir-modelo"]').addEventListener('click', excluirModelo);
    document.querySelector('[data-action="adicionar-medicamento"]').addEventListener('click', adicionarMedicamento);
    document.querySelector('[data-action="salvar-modelo"]').addEventListener('click', salvarModelo);
    document.querySelector('[data-action="imprimir"]').addEventListener('click', prepararImpressao);
    document.getElementById('btn-salvar-novo-med').addEventListener('click', salvarMedicamentoPessoal);
});
