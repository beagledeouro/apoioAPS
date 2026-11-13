# ApoioAPS (ESF CDI 2)
**Portal Clínico de Produtividade, Apoio Diagnóstico e Emissão de Documentos da Atenção Primária à Saúde**  
*Secretaria Municipal de Saúde de Sete Lagoas — MG | Estratégia Saúde da Família (ESF CDI 2)*

---

## 📌 De Onde Surgiu (Origem do Projeto)

O **ApoioAPS** nasceu de uma demanda real e pontual identificada na rotina de atendimentos e visitas domiciliares da Atenção Primária à Saúde (APS): a necessidade de agilizar, estruturar e padronizar o encaminhamento de usuários para o serviço de Psicologia. 

Diante de processos manuais repetitivos, morosos e da ausência de modelos pré-formatados, desenvolveu-se inicialmente uma ferramenta leve para viabilizar e padronizar o preenchimento dessas guias com rapidez. Ao ser apresentada à equipe multiprofissional da unidade **ESF CDI 2**, a excelente receptividade e o impacto positivo imediato motivaram a expansão do escopo: transformar aquela solução pontual em um ecossistema abrangente de apoio operacional, centralizando ferramentas essenciais e facilitando a rotina de trabalho de toda a equipe.

---

## 🛠️ Ferramentas e Módulos Disponíveis

### 1. Emissão de Documentos Clínicos e Administrativos
* **Receituário Clínico Inteligente (2 Vias):** Emissão em folha A4 paisagem de receitas comuns e de controle especial (Portaria 344/98), com prescrição farmacológica estruturada em 6 campos, autocompletar integrado à REMUME de Sete Lagoas e identificação civil (CPF ou Passaporte).
* **Guias de Encaminhamento e Pedidos de Exames:** Formulários padronizados em duas vias com preenchimento assistido para a rede especializada do SUS.
* **Atestados Legais e Declarações de Comparecimento:** Modelos automatizados com justificativas legais, cálculo dinâmico de datas de retorno e campo para CID-10.
* **Declaração de Vínculo e Atendimento ESF:** Documento oficial timbrado para comprovação de domicílio sanitário, território adscrito, microárea, ACS responsável, núcleo familiar/dependentes e acompanhamento na APS (matrículas escolares/creches, Bolsa Família, previdência e comprovação de residência).
* **Relatório Multiprofissional:** Elaboração de pareceres clínicos e relatórios técnicos em papel timbrado oficial da unidade.
* **Capas Físicas de Prontuário:** Visualização e geração de capas padronizadas (geral e gestante/SISPRENATAL).
* **Operação em Contingência:** Totalmente funcional para profissionais com perfis restritos nos sistemas informatizados ou em momentos de indisponibilidade de conexão (queda de internet).

### 2. Apoio Clínico e Decisão Diagnóstica
* **Calculadora Obstétrica:** Cálculo automatizado da Idade Gestacional (IG) e Data Provável do Parto (DPP) pela Regra de Naegele, acompanhado de condutas e exames recomendados por trimestre.
* **Avaliação Nutricional:** Cálculo instantâneo de IMC Adulto (OMS) e classificação geriátrica pelo Critério de Lipschitz.
* **Calendário Vacinal & Puericultura:** Consulta dinâmica às diretrizes do Programa Nacional de Imunizações (PNI) e cronograma estruturado de consultas de puericultura (Ministério da Saúde / SBP).

### 3. Hub de Acesso Rápido a Sistemas e Informações
* **Central de Atalhos Institucionais:** Acesso rápido em um clique aos sistemas centrais da rede (G-MUS municipal e CADSUS Web federal com script de destravamento).
* **Repositório Operacional:** Links organizados para planilhas de acompanhamento territorial, pastas de documentos técnicos e normativas da Secretaria de Saúde.
* **Notificação via WhatsApp:** Gerador de cartões informativos visuais (Canvas 2D) e mensagens estruturadas de lembrete de consultas para pacientes.

### 4. Extensão de Navegador (WebExtensions - Manifest V3)
* Integração ativa entre o sistema municipal **G-MUS** e o ApoioAPS, raspando dados da tela do paciente para preencher formulários e gerar capas de prontuário em PDF com vetorização local via `pdf-lib`.

---

## 💻 Tecnologias e Metodologia de Desenvolvimento

* **Arquitetura Client-Side (*Zero-Setup & Offline-First*):** Desenvolvido com padrões nativos da web (**HTML5**, **CSS3** moderno com Grid/Flexbox e **Vanilla JavaScript ES6**). Executa diretamente em qualquer navegador moderno nas estações do posto, sem necessidade de servidores, instalação ou dependências externas, garantindo funcionamento ininterrupto mesmo sem internet.
* **Design de Interface (UI/UX no Figma):** Interface projetada e prototipada no **Figma**, priorizando ergonomia para o profissional de saúde, contraste adequado e alinhamento visual à identidade do SUS e da Prefeitura Municipal de Sete Lagoas.
* **Desenvolvimento Assistido por Inteligência Artificial:** Uso direcionado de ferramentas avançadas de Inteligência Artificial para refatoração de código, aceleração de novas funcionalidades e estruturação modular da aplicação.
* **Segurança da Informação e LGPD:** Em estrita conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Todos os dados processados permanecem estritamente na memória e no `localStorage` do computador da unidade, sem trânsito ou armazenamento em servidores externos.

---

## 👥 Uso no Cotidiano e Validação Prática

As ferramentas foram integradas à rotina diária dos profissionais da unidade **ESF CDI 2** (médicos, enfermeiros, cirurgiões-dentistas, técnicos e agentes comunitários de saúde). Esse convívio prático no fluxo de atendimento gerou um ciclo ágil de *feedback contínuo*, essencial para o refinamento da experiência do usuário, aprimoramento dos formatos de impressão e identificação imediata de melhorias.

---

## 🚀 Como Utilizar

1. **Execução Direta do Portal:**
   - Abra o arquivo `index.html` em qualquer navegador web moderno (Google Chrome, Microsoft Edge, Brave, Firefox).
   - Não requer compilação, `npm` ou servidor local para as ferramentas clínicas e administrativas.

2. **Instalação da Extensão G-MUS:**
   - No Chrome ou navegador baseado em Chromium, acesse `chrome://extensions/`.
   - Ative o **Modo do desenvolvedor** (canto superior direito).
   - Clique em **Carregar sem compactação** e selecione a pasta `Extensão/`.

---

*Projeto desenvolvido e mantido para aprimorar o cuidado continuado e a eficiência da Estratégia Saúde da Família (ESF CDI 2).*