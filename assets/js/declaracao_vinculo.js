/**
 * ==========================================================================
 * DECLARAÇÃO DE VÍNCULO E ATENDIMENTO - ESF CDI 2
 * Lógica client-side para emissão, validação, persistência e impressão em A4
 * ==========================================================================
 */

const STORAGE_KEY_EMISSOR = 'apoioaps_emissor_vinculo';
const LEGACY_STORAGE_KEY_EMISSOR = 'postotools_emissor_vinculo';

// Formatação e Máscaras
function formatarData(dataStr) {
    if (!dataStr) return '';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

function dataPorExtenso(dataStr) {
    if (!dataStr) return '';
    const meses = [
        'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
        'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    return `${dia} de ${meses[mes - 1]} de ${ano}`;
}

function aplicarMascaraCPF(valor) {
    let limpo = valor.replace(/\D/g, '').slice(0, 11);
    if (limpo.length > 9) return limpo.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, '$1.$2.$3-$4');
    if (limpo.length > 6) return limpo.replace(/^(\d{3})(\d{3})(\d{0,3})$/, '$1.$2.$3');
    if (limpo.length > 3) return limpo.replace(/^(\d{3})(\d{0,3})$/, '$1.$2');
    return limpo;
}

function aplicarMascaraCNS(valor) {
    let limpo = valor.replace(/\D/g, '').slice(0, 15);
    if (limpo.length > 11) return limpo.replace(/^(\d{3})(\d{4})(\d{4})(\d{0,4})$/, '$1 $2 $3 $4');
    if (limpo.length > 7) return limpo.replace(/^(\d{3})(\d{4})(\d{0,4})$/, '$1 $2 $3');
    if (limpo.length > 3) return limpo.replace(/^(\d{3})(\d{0,4})$/, '$1 $2');
    return limpo;
}

function aplicarMascaraCEP(valor) {
    let limpo = valor.replace(/\D/g, '').slice(0, 8);
    if (limpo.length > 5) return limpo.replace(/^(\d{5})(\d{0,3})$/, '$1-$2');
    return limpo;
}

function definirDataHoje(campo) {
    const hoje = new Date();
    const dataLocal = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    campo.value = dataLocal;
}

// Gerenciamento Dinâmico de Dependentes
function criarLinhaDependente(dados = {}) {
    const container = document.getElementById('dependentesList');
    const index = container.children.length;
    
    const row = document.createElement('div');
    row.className = 'dependente-row';
    row.dataset.index = index;

    row.innerHTML = `
        <div class="form-group">
            <label>Nome do Dependente / Filho(a):</label>
            <input type="text" class="dep-nome" placeholder="Nome completo" value="${dados.nome || ''}">
        </div>
        <div class="form-group">
            <label>Parentesco:</label>
            <select class="dep-parentesco">
                <option value="Filho(a)" ${dados.parentesco === 'Filho(a)' ? 'selected' : ''}>Filho(a)</option>
                <option value="Enteado(a)" ${dados.parentesco === 'Enteado(a)' ? 'selected' : ''}>Enteado(a)</option>
                <option value="Neto(a)" ${dados.parentesco === 'Neto(a)' ? 'selected' : ''}>Neto(a)</option>
                <option value="Cônjuge / Companheiro(a)" ${dados.parentesco === 'Cônjuge / Companheiro(a)' ? 'selected' : ''}>Cônjuge / Companheiro(a)</option>
                <option value="Irmão(ã)" ${dados.parentesco === 'Irmão(ã)' ? 'selected' : ''}>Irmão(ã)</option>
                <option value="Outro" ${dados.parentesco === 'Outro' ? 'selected' : ''}>Outro</option>
            </select>
        </div>
        <div class="form-group">
            <label>Data de Nasc.:</label>
            <input type="date" class="dep-nascimento" value="${dados.nascimento || ''}">
        </div>
        <div class="form-group">
            <label>CPF / CNS:</label>
            <input type="text" class="dep-doc" placeholder="CPF ou CNS" value="${dados.doc || ''}">
        </div>
        <button type="button" class="btn-remover-dep" title="Remover este dependente">✕</button>
    `;

    row.querySelector('.btn-remover-dep').addEventListener('click', () => {
        row.remove();
    });

    container.appendChild(row);
}

function coletarDependentes() {
    const linhas = document.querySelectorAll('.dependente-row');
    const dependentes = [];
    linhas.forEach(row => {
        const nome = row.querySelector('.dep-nome').value.trim();
        if (nome) {
            dependentes.push({
                nome: nome,
                parentesco: row.querySelector('.dep-parentesco').value,
                nascimento: formatarData(row.querySelector('.dep-nascimento').value),
                doc: row.querySelector('.dep-doc').value.trim()
            });
        }
    });
    return dependentes;
}

// Configuração Rápida por Finalidade
function aplicarModeloFinalidade() {
    const finalidade = document.getElementById('finalidade').value;
    const chkCadastro = document.getElementById('chkCadastro');
    const chkAcomp = document.getElementById('chkAcomp');
    const chkVacina = document.getElementById('chkVacina');
    const chkPuericultura = document.getElementById('chkPuericultura');
    const chkPrenatal = document.getElementById('chkPrenatal');
    const chkHiperdia = document.getElementById('chkHiperdia');

    // Estado base
    chkCadastro.checked = true;
    chkAcomp.checked = true;

    if (finalidade === 'escola') {
        chkVacina.checked = true;
        chkPuericultura.checked = true;
        chkPrenatal.checked = false;
        chkHiperdia.checked = false;
    } else if (finalidade === 'bolsa_familia') {
        chkVacina.checked = true;
        chkPuericultura.checked = true;
        chkPrenatal.checked = false;
        chkHiperdia.checked = false;
    } else if (finalidade === 'prenatal') {
        chkPrenatal.checked = true;
        chkVacina.checked = true;
        chkPuericultura.checked = false;
        chkHiperdia.checked = false;
    } else if (finalidade === 'hiperdia') {
        chkHiperdia.checked = true;
        chkVacina.checked = true;
        chkPuericultura.checked = false;
        chkPrenatal.checked = false;
    }
}

// Persistência do Profissional Emissor
function carregarEmissorSalvo() {
    try {
        const salvo = localStorage.getItem(STORAGE_KEY_EMISSOR) || localStorage.getItem(LEGACY_STORAGE_KEY_EMISSOR);
        if (salvo) {
            const dados = JSON.parse(salvo);
            if (dados.nome) document.getElementById('emissorNome').value = dados.nome;
            if (dados.cargo) document.getElementById('emissorCargo').value = dados.cargo;
            if (dados.registro) document.getElementById('emissorRegistro').value = dados.registro;
        }
    } catch (e) {
        console.warn('Não foi possível restaurar emissor salvo:', e);
    }
}

function salvarEmissor() {
    try {
        const dados = {
            nome: document.getElementById('emissorNome').value.trim(),
            cargo: document.getElementById('emissorCargo').value,
            registro: document.getElementById('emissorRegistro').value.trim()
        };
        localStorage.setItem(STORAGE_KEY_EMISSOR, JSON.stringify(dados));
    } catch (e) {
        console.warn('Erro ao salvar emissor:', e);
    }
}

// Preenchimento de Exemplo para Demonstração Rápida
function preencherExemplo() {
    document.getElementById('nome').value = 'Maria Aparecida da Silva';
    document.getElementById('cpf').value = '123.456.789-00';
    document.getElementById('cns').value = '700 1234 5678 9012';
    document.getElementById('nascimento').value = '1988-06-14';
    document.getElementById('nomeMae').value = 'Francisca Pereira da Silva';
    document.getElementById('telefone').value = '(31) 98765-4321';
    
    document.getElementById('endereco').value = 'Rua dos Flamboyants, nº 142';
    document.getElementById('complemento').value = 'Casa fundos';
    document.getElementById('bairro').value = 'CDI 2';
    document.getElementById('cep').value = '35702-532';
    document.getElementById('microarea').value = 'Microárea 02';
    document.getElementById('acs').value = 'Cláudia Regina (ACS)';

    document.getElementById('finalidade').value = 'escola';
    aplicarModeloFinalidade();

    document.getElementById('observacoes').value = 'Família com acompanhamento regular pela equipe. Carteira de vacinação da criança conferida e atualizada nesta unidade de saúde.';

    // Adiciona exemplo de dependente
    document.getElementById('dependentesList').innerHTML = '';
    criarLinhaDependente({
        nome: 'Enzo Gabriel da Silva Santos',
        parentesco: 'Filho(a)',
        nascimento: '2021-03-22',
        doc: '702 9876 5432 1000'
    });
}

// Limpar Formulário
function limparFormulario() {
    document.getElementById('vinculoForm').reset();
    document.getElementById('dependentesList').innerHTML = '';
    definirDataHoje(document.getElementById('dataEmissao'));
    carregarEmissorSalvo();
    aplicarModeloFinalidade();
}

// Montagem do Documento Impresso Oficial em A4
function gerarDocumentoImpressao() {
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const cns = document.getElementById('cns').value.trim();
    const nascimento = formatarData(document.getElementById('nascimento').value);
    const nomeMae = document.getElementById('nomeMae').value.trim();
    
    const endereco = document.getElementById('endereco').value.trim();
    const complemento = document.getElementById('complemento').value.trim();
    const bairro = document.getElementById('bairro').value.trim() || 'CDI 2';
    const cep = document.getElementById('cep').value.trim() || '35702-532';
    const microarea = document.getElementById('microarea').value;
    const acs = document.getElementById('acs').value.trim() || 'Equipe de Saúde da Família';

    const finalidadeTextoMap = {
        escola: 'comprovação de domicílio e acompanhamento em saúde para fins de matrícula escolar / creche',
        bolsa_familia: 'comprovação de vínculo sanitário e cumprimento de condicionalidades de saúde de programas sociais governamentais (Bolsa Família / CadÚnico)',
        residencia: 'comprovação de residência e vínculo sanitário em território sob adscrição da Atenção Primária',
        prenatal: 'comprovação de acompanhamento pré-natal regular na unidade básica de saúde',
        hiperdia: 'comprovação de acompanhamento multiprofissional contínuo no programa Hiperdia',
        geral: 'fins de comprovação administrativa e sanitária geral a pedido da parte interessada'
    };
    const finalidadeVal = document.getElementById('finalidade').value;
    const finalidadeDescricao = finalidadeTextoMap[finalidadeVal] || 'fins de comprovação';

    const dependentes = coletarDependentes();
    const observacoes = document.getElementById('observacoes').value.trim();

    // Emissor e Data
    const emissorNome = document.getElementById('emissorNome').value.trim() || 'Profissional da Equipe de Saúde';
    const emissorCargo = document.getElementById('emissorCargo').value;
    const emissorRegistro = document.getElementById('emissorRegistro').value.trim();
    const dataEmissaoVal = document.getElementById('dataEmissao').value;
    const dataExtenso = dataPorExtenso(dataEmissaoVal);

    // Condicionalidades assinaladas
    const itensAtestados = [];
    if (document.getElementById('chkCadastro').checked) {
        itensAtestados.push('Cadastro individual e familiar ativo no sistema de informação e na base territorial da ESF CDI 2;');
    }
    if (document.getElementById('chkAcomp').checked) {
        itensAtestados.push('Acompanhamento regular e longitudinal prestado pela equipe multiprofissional da Atenção Primária;');
    }
    if (document.getElementById('chkVacina').checked) {
        itensAtestados.push('Situação vacinal avaliada e em conformidade com as diretrizes do Programa Nacional de Imunizações (PNI);');
    }
    if (document.getElementById('chkPuericultura').checked) {
        itensAtestados.push('Acompanhamento de crescimento e desenvolvimento infantil (Puericultura) em curso regular;');
    }
    if (document.getElementById('chkPrenatal').checked) {
        itensAtestados.push('Acompanhamento pré-natal ativo com consultas e exames de rotina em andamento nesta unidade;');
    }
    if (document.getElementById('chkHiperdia').checked) {
        itensAtestados.push('Acompanhamento continuado no controle de condições crônicas (Hipertensão / Diabetes);');
    }

    // Montagem do HTML de impressão
    const printContainer = document.getElementById('printArea');
    printContainer.innerHTML = `
        <div class="print-sheet">
            <!-- Cabeçalho Oficial -->
            <header class="gov-header">
                <img class="gov-logo" src="../assets/logo.png" alt="Sete Lagoas — Prefeitura e Secretaria de Saúde">
                <div class="gov-titles">
                    <div class="inst-gov">Prefeitura Municipal de Sete Lagoas — MG</div>
                    <div class="inst-gov">Secretaria Municipal de Saúde • Diretoria de Atenção Primária</div>
                    <div class="inst-unit">ESF CDI 2 — Estratégia Saúde da Família</div>
                    <div class="inst-sub">CNES: 7633432 • Rua Nativo de Senna, 33, CDI 2 • CEP 35702-532</div>
                </div>
            </header>

            <!-- Título Principal -->
            <div class="doc-main-title">
                <h1>Declaração de Vínculo e Atendimento</h1>
                <div class="doc-subtitle">Atestação de Domicílio Sanitário, Adscrição Territorial e Acompanhamento na APS</div>
            </div>

            <!-- Corpo Textual Oficial -->
            <main class="doc-content">
                <p>
                    Declaramos para os devidos fins a quem interessar possa, a pedido da parte interessada, que o(a) cidadão(ã) 
                    <strong>${nome}</strong>, inscrito(a) no CPF sob o nº <strong>${cpf || 'Não informado'}</strong>, 
                    portador(a) do Cartão Nacional de Saúde (CNS / SUS) nº <strong>${cns || 'Não informado'}</strong>, 
                    nascido(a) em <strong>${nascimento || 'Não informada'}</strong>${nomeMae ? `, filho(a) de <strong>${nomeMae}</strong>` : ''}, 
                    é residente e domiciliado(a) no endereço: <strong>${endereco}${complemento ? `, ${complemento}` : ''}, Bairro ${bairro}, Sete Lagoas — MG, CEP ${cep}</strong>.
                </p>

                <p>
                    Certificamos que o endereço supracitado pertence à área de abrangência e adscrição sanitária desta 
                    <strong>Estratégia Saúde da Família (ESF CDI 2)</strong>, integrando a <strong>${microarea}</strong>, 
                    estando sob cobertura direta e acompanhamento domiciliar do(a) Agente Comunitário(a) de Saúde (ACS) <strong>${acs}</strong>.
                </p>

                <p>
                    Atestamos que o(a) referido(a) usuário(a) mantém vínculo sanitário ativo nesta unidade de saúde, sendo atendido(a) 
                    pela equipe de saúde da família para ${finalidadeDescricao}, constando em nossos registros a seguinte situação operacional:
                </p>

                <ul class="check-list-print">
                    ${itensAtestados.map(item => `<li>${item}</li>`).join('')}
                </ul>

                ${dependentes.length > 0 ? `
                    <div class="dep-table-container">
                        <h4>Núcleo Familiar / Dependentes Vinculados:</h4>
                        <table class="dep-print-table">
                            <thead>
                                <tr>
                                    <th>Nome Completo</th>
                                    <th>Parentesco</th>
                                    <th>Data de Nasc.</th>
                                    <th>CPF / CNS</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${dependentes.map(dep => `
                                    <tr>
                                        <td><strong>${dep.nome}</strong></td>
                                        <td>${dep.parentesco}</td>
                                        <td>${dep.nascimento || '—'}</td>
                                        <td>${dep.doc || '—'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}

                ${observacoes ? `
                    <div class="obs-print-box">
                        <strong>Informações Complementares / Observações:</strong>
                        ${observacoes.replace(/\n/g, '<br>')}
                    </div>
                ` : ''}
            </main>

            <!-- Fechamento, Assinaturas e Carimbo -->
            <footer class="doc-closing-section">
                <div class="doc-closing">
                    Sete Lagoas — MG, ${dataExtenso}.
                </div>

                <div class="doc-signatures-wrap">
                    <div class="stamp-area">
                        Espaço Reservado para<br>
                        Carimbo da Unidade de Saúde<br>
                        (ESF CDI 2 — CNES 7633432)
                    </div>

                    <div class="sig-area">
                        <div class="sig-line">
                            <div class="sig-name">${emissorNome}</div>
                            <div class="sig-role">${emissorCargo}</div>
                            ${emissorRegistro ? `<div class="sig-reg">${emissorRegistro}</div>` : ''}
                        </div>
                    </div>
                </div>

                <div class="inst-footer-line">
                    <span>ESF CDI 2 — Secretaria Municipal de Saúde de Sete Lagoas</span>
                    <span>Documento oficial de uso clínico e administrativo — Atenção Primária à Saúde</span>
                </div>
            </footer>
        </div>
    `;
}

// Disparo de Impressão e PDF
async function processarSubmissao(event) {
    event.preventDefault();
    const form = document.getElementById('vinculoForm');
    if (!form.reportValidity()) return;

    salvarEmissor();
    gerarDocumentoImpressao();

    const nomePaciente = document.getElementById('nome').value.trim();
    const nomeArquivo = nomeArquivoSeguro(nomePaciente, 'declaracao-vinculo-esf');

    await baixarPDFEAguardarImpressao(nomeArquivo, 'p');
}

// Parâmetros de URL para Preenchimento Automático
function carregarParametrosURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('nome')) document.getElementById('nome').value = params.get('nome');
    if (params.has('cpf')) document.getElementById('cpf').value = aplicarMascaraCPF(params.get('cpf'));
    if (params.has('cns')) document.getElementById('cns').value = aplicarMascaraCNS(params.get('cns'));
    if (params.has('nascimento')) document.getElementById('nascimento').value = params.get('nascimento');
    if (params.has('mae')) document.getElementById('nomeMae').value = params.get('mae');
    if (params.has('endereco')) document.getElementById('endereco').value = params.get('endereco');
    if (params.has('microarea')) document.getElementById('microarea').value = params.get('microarea');
    if (params.has('acs')) document.getElementById('acs').value = params.get('acs');
    if (params.has('finalidade')) {
        document.getElementById('finalidade').value = params.get('finalidade');
        aplicarModeloFinalidade();
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    definirDataHoje(document.getElementById('dataEmissao'));
    carregarEmissorSalvo();
    aplicarModeloFinalidade();

    // Máscaras
    document.getElementById('cpf').addEventListener('input', (e) => {
        e.target.value = aplicarMascaraCPF(e.target.value);
    });
    document.getElementById('cns').addEventListener('input', (e) => {
        e.target.value = aplicarMascaraCNS(e.target.value);
    });
    document.getElementById('cep').addEventListener('input', (e) => {
        e.target.value = aplicarMascaraCEP(e.target.value);
    });

    // Eventos
    document.getElementById('finalidade').addEventListener('change', aplicarModeloFinalidade);
    document.getElementById('btnAddDep').addEventListener('click', () => criarLinhaDependente());
    document.getElementById('vinculoForm').addEventListener('submit', processarSubmissao);
    document.getElementById('btnLimpar').addEventListener('click', limparFormulario);
    document.getElementById('btnDemo').addEventListener('click', preencherExemplo);

    carregarParametrosURL();
});
