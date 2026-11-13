// Gerenciamento de Abas
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.calc-card').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabId = btn.dataset.tab;
        document.getElementById(tabId).classList.add('active');
    });
});

// 1. CALCULADORA OBSTÉTRICA (DUM / DPP / IG)
function calcularObstetrica() {
    const dumStr = document.getElementById('dumInput').value;
    if (!dumStr) {
        alert('Por favor, informe a Data da Última Menstruação (DUM).');
        return;
    }

    const [ano, mes, dia] = dumStr.split('-').map(Number);
    const dataDUM = new Date(ano, mes - 1, dia);
    const dataRef = document.getElementById('dataRefObstetrica').value
        ? new Date(...document.getElementById('dataRefObstetrica').value.split('-').map((v, i) => i === 1 ? v - 1 : +v))
        : new Date();

    if (dataDUM > dataRef) {
        alert('A DUM não pode ser posterior à data de referência/hoje.');
        return;
    }

    // Regra de Naegele: DUM + 7 dias, mês + 9 (ou mês - 3), ano + 1 se necessário
    const dpp = new Date(dataDUM.getFullYear(), dataDUM.getMonth(), dataDUM.getDate() + 7);
    dpp.setMonth(dpp.getMonth() + 9);

    // Cálculo da Idade Gestacional (em dias corridos)
    const diffMs = dataRef.getTime() - dataDUM.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const semanas = Math.floor(diffDias / 7);
    const diasRestantes = diffDias % 7;

    // Determinação do Trimestre
    let trimestre = '1º Trimestre (0 a 13 semanas)';
    if (semanas >= 28) {
        trimestre = '3º Trimestre (28 a 40+ semanas)';
    } else if (semanas >= 14) {
        trimestre = '2º Trimestre (14 a 27 semanas)';
    }

    const formatar = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    document.getElementById('igResultado').textContent = `${semanas} semanas e ${diasRestantes} dias`;
    document.getElementById('dppResultado').textContent = formatar(dpp);
    document.getElementById('trimestreResultado').textContent = trimestre;
    document.getElementById('diasResultado').textContent = `${diffDias} dias decorridos`;

    let infoExames = '';
    if (semanas < 14) {
        infoExames = '📌 <strong>Conduta recomendada no 1º Trimestre:</strong> Tipagem sanguínea + Rh, Hemograma, Glicemia de jejum, VDRL/Sífilis, HIV, Hepatite B (HBsAg), Toxoplasmose (IgM/IgG), Urina rotina + Urocultura, Ultrassom de 1º trimestre (11 a 14 semanas). Prescrever Ácido Fólico.';
    } else if (semanas < 28) {
        infoExames = '📌 <strong>Conduta recomendada no 2º Trimestre:</strong> Ultrassom Morfológico (20 a 24 semanas), Teste de Tolerância Oral à Glicose (TOTG 75g entre 24 e 28 semanas), Suplementação de Sulfato Ferroso (a partir da 20ª sem). Vacinação dTpa a partir da 20ª semana.';
    } else {
        infoExames = '📌 <strong>Conduta recomendada no 3º Trimestre:</strong> Repetir Hemograma, Glicemia, VDRL, HIV, Hepatite B, Toxoplasmose. Rastreio de Streptococcus do Grupo B (35 a 37 semanas). Avaliar apresentação fetal e plano de parto.';
    }

    const interpEl = document.getElementById('interpObstetrica');
    interpEl.innerHTML = infoExames;
    interpEl.className = 'result-interpretation badge-normal';

    document.getElementById('resObstetrica').classList.add('show');
}

// 2. CALCULADORA DE IMC (ADULTO E IDOSO)
function calcularIMC() {
    const peso = parseFloat(document.getElementById('pesoInput').value);
    const alturaCm = parseFloat(document.getElementById('alturaInput').value);
    const idade = parseInt(document.getElementById('idadeInput').value, 10) || 30;
    const ehIdoso = idade >= 60 || document.getElementById('chkIdoso').checked;

    if (!peso || !alturaCm || peso <= 0 || alturaCm <= 0) {
        alert('Informe peso e altura válidos.');
        return;
    }

    const alturaM = alturaCm > 3 ? alturaCm / 100 : alturaCm;
    const imc = peso / (alturaM * alturaM);

    let classificacao = '';
    let badgeClass = 'badge-normal';
    let faixaIdeal = '';

    if (ehIdoso) {
        // Critério de Lipschitz para Idosos (≥ 60 anos)
        faixaIdeal = `${(22 * alturaM * alturaM).toFixed(1)} kg a ${(27 * alturaM * alturaM).toFixed(1)} kg (IMC 22 - 27)`;
        if (imc < 22) {
            classificacao = 'Baixo Peso / Desnutrição (Critério de Lipschitz)';
            badgeClass = 'badge-perigo';
        } else if (imc <= 27) {
            classificacao = 'Eutrofia / Peso Adequado para Idoso';
            badgeClass = 'badge-normal';
        } else {
            classificacao = 'Sobrepeso / Obesidade para Idoso';
            badgeClass = 'badge-alerta';
        }
    } else {
        // Critério OMS para Adultos
        faixaIdeal = `${(18.5 * alturaM * alturaM).toFixed(1)} kg a ${(24.9 * alturaM * alturaM).toFixed(1)} kg (IMC 18.5 - 24.9)`;
        if (imc < 18.5) {
            classificacao = 'Abaixo do Peso';
            badgeClass = 'badge-alerta';
        } else if (imc < 25) {
            classificacao = 'Eutrofia (Peso Normal)';
            badgeClass = 'badge-normal';
        } else if (imc < 30) {
            classificacao = 'Sobrepeso (Pré-obesidade)';
            badgeClass = 'badge-alerta';
        } else if (imc < 35) {
            classificacao = 'Obesidade Grau I';
            badgeClass = 'badge-perigo';
        } else if (imc < 40) {
            classificacao = 'Obesidade Grau II';
            badgeClass = 'badge-perigo';
        } else {
            classificacao = 'Obesidade Grau III (Mórbida)';
            badgeClass = 'badge-perigo';
        }
    }

    document.getElementById('imcResultado').textContent = imc.toFixed(2) + ' kg/m²';
    document.getElementById('classifResultado').textContent = classificacao;
    document.getElementById('pesoIdealResultado').textContent = faixaIdeal;

    const interpEl = document.getElementById('interpIMC');
    interpEl.className = `result-interpretation ${badgeClass}`;
    interpEl.innerHTML = `<strong>Avaliação:</strong> Paciente classificado como <strong>${classificacao}</strong>. Avaliar hábitos alimentares, atividade física e fatores de risco associados (PA, Glicemia, Perfil Lipídico).`;

    document.getElementById('resIMC').classList.add('show');
}

document.addEventListener('DOMContentLoaded', () => {
    // Definir data padrão de referência para a gestante como hoje
    const hoje = new Date();
    const dataLocal = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const dataRefEl = document.getElementById('dataRefObstetrica');
    if (dataRefEl) dataRefEl.value = dataLocal;

    document.getElementById('btnCalcObstetrica').addEventListener('click', calcularObstetrica);
    document.getElementById('btnCalcIMC').addEventListener('click', calcularIMC);
});
