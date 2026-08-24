const axios = require("axios");

const BASE_URL = "https://pncp.gov.br/api/consulta";

// ============================================================
// CONFIGURAÇÕES
// ============================================================

const palavrasChave = {
  // Alta relevância
  livro: 10,
  livros: 10,
  "livro didático": 15,
  "livros didáticos": 15,
  "material didático": 12,
  "materiais didáticos": 12,


  "livro paradidático": 15,
  "livros paradidáticos": 15,
  paradidático: 12,
  paradidáticos: 12,

  "material escolar": 10,
  "materiais escolares": 10,

  "kit escolar": 10,
  "kits escolares": 10,
  "kit aluno": 8,
  "kits aluno": 8,
  "kit professor": 8,
  "kits professor": 8,

  "material pedagógico": 10,
  "materiais pedagógicos": 10,

  literatura: 10,
  literário: 10,
  literários: 10,
  "obra literária": 12,
  "obras literárias": 12,

  "material informacional": 8,
  "recurso informacional": 8,

  "publicação nacional": 8,
  "publicações nacionais": 8,

  "referenciais teóricos": 8,

  saeb: 8,

  // Menor relevância
  biblioteca: 3,
  acervo: 2,
};

// Modalidades que queremos consultar.
//
// IMPORTANTE:
// Os códigos abaixo devem ser conferidos na tabela de domínio
// de modalidades do PNCP antes de colocar em produção.
//
// Deixe aqui somente as modalidades que fazem sentido para
// aquisição de livros/material escolar.
const modalidades = [
  {
    codigo: 6,
    nome: "Pregão eletronico",
  },

  // Adicione aqui as demais modalidades depois de confirmar
  // os códigos na API do PNCP.
];

// Quantidade de registros por página
const TAMANHO_PAGINA = 50;

// Data utilizada na busca
const DATA_INICIAL = "20260820";

const DATA_FINAL = "20260821";


// ============================================================
// NORMALIZAÇÃO
// ============================================================

function normalizarTexto(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


// ============================================================
// ANÁLISE DO EDITAL
// ============================================================

function analisarContratacao(contratacao) {

  const objeto = contratacao.objetoCompra || "";

  const informacaoComplementar =
    contratacao.informacaoComplementar || "";

  const texto = normalizarTexto(`
    ${objeto}
    ${informacaoComplementar}
  `);

  let score = 0;

  const palavrasEncontradas = [];

  for (const [palavra, peso] of Object.entries(palavrasChave)) {

    const palavraNormalizada = normalizarTexto(palavra);

    if (texto.includes(palavraNormalizada)) {

      score += peso;

      palavrasEncontradas.push({
        palavra,
        peso,
      });
    }
  }

  return {
    relevante: score >= 8,
    score,
    palavrasEncontradas,
  };
}


// ============================================================
// BUSCAR UMA PÁGINA
// ============================================================

async function buscarPagina(
  dataInicial,
  dataFinal,
  codigoModalidadeContratacao,
  pagina
) {

  try {

    const response = await axios.get(
      `${BASE_URL}/v1/contratacoes/publicacao`,
      {
        params: {
          dataInicial,
          dataFinal,
          codigoModalidadeContratacao,
          pagina,
          tamanhoPagina: TAMANHO_PAGINA,
        },

        timeout: 15000,
      }
    );

    return response.data;

  } catch (error) {

    console.error(
      "\nErro ao consultar PNCP:"
    );

    console.error(
      error.response?.data || error.message
    );

    return null;
  }
}


// ============================================================
// BUSCAR TODAS AS PÁGINAS
// ============================================================

async function buscarContratacoes(
  dataInicial,
  dataFinal,
  modalidade
) {

  let pagina = 1;

  const resultados = [];

  while (true) {

    console.log(
      `Consultando ${modalidade.nome} - página ${pagina}...`
    );

    const resposta = await buscarPagina(
      dataInicial,
      dataFinal,
      modalidade.codigo,
      pagina
    );

    if (!resposta) {
      break;
    }

    const dados = resposta.data || [];

    if (dados.length === 0) {
      break;
    }

    resultados.push(...dados);

    console.log(
      `  ${dados.length} registros encontrados`
    );

    // Se retornou menos que o tamanho máximo,
    // provavelmente chegamos à última página.
    if (dados.length < TAMANHO_PAGINA) {
      break;
    }

    pagina++;
  }

  return resultados;
}


// ============================================================
// EXIBIR EDITAL
// ============================================================

function exibirEdital(contratacao, analise) {

  console.log("\n======================================");

  console.log("EDITAL ENCONTRADO");

  console.log(
    `Score: ${analise.score}`
  );

  console.log(
    `Palavras: ${analise.palavrasEncontradas
      .map((item) => item.palavra)
      .join(", ")}`
  );

  console.log(
    `Processo: ${contratacao.processo || "Não informado"}`
  );

  console.log(
    `Objeto: ${contratacao.objetoCompra || "Não informado"}`
  );

  console.log(
    `Data: ${
      contratacao.dataPublicacaoPncp ||
      "Não informado"
    }`
  );

  console.log(
    `Modalidade: ${
      contratacao.modalidadeNome ||
      "Não informado"
    }`
  );

  // A API pode apresentar os dados da unidade
  // em estruturas diferentes dependendo do registro.
  console.log(
    `Órgão: ${
      contratacao.unidadeOrgao?.nome ||
      contratacao.orgaoEntidade?.razaoSocial ||
      contratacao.orgaoEntidade?.nome ||
      "Não informado"
    }`
  );

  console.log(
    `CNPJ: ${
      contratacao.orgaoEntidade?.cnpj ||
      contratacao.cnpjOrgao ||
      "Não informado"
    }`
  );

  console.log(
    `UF: ${
      contratacao.unidadeOrgao?.ufSigla ||
      contratacao.unidadeOrgao?.uf ||
      "Não informado"
    }`
  );

  console.log(
    `Município: ${
      contratacao.unidadeOrgao?.municipioNome ||
      contratacao.unidadeOrgao?.municipio ||
      "Não informado"
    }`
  );

  console.log(
    `ID PNCP: ${
      contratacao.numeroControlePNCP ||
      "Não informado"
    }`
  );

  console.log(
    "======================================\n"
  );
}


// ============================================================
// FUNÇÃO PRINCIPAL
// ============================================================

async function pncp(
  dataInicial = DATA_INICIAL,
  dataFinal = DATA_FINAL
) {

  console.log("\n======================================");

  console.log("      BUSCA AUTOMÁTICA - PNCP");

  console.log("======================================");

  console.log(
    `Período: ${dataInicial} até ${dataFinal}`
  );

  console.log(
    `Palavras-chave: ${Object.keys(palavrasChave).length}`
  );

  console.log(
    `Modalidades: ${modalidades.length}`
  );

  console.log(
    "======================================\n"
  );


  const todosResultados = [];


  // ==========================================================
  // CONSULTAR CADA MODALIDADE
  // ==========================================================

  for (const modalidade of modalidades) {

    const resultados = await buscarContratacoes(
      dataInicial,
      dataFinal,
      modalidade
    );

    todosResultados.push(...resultados);
  }


  console.log("\n======================================");

  console.log(
    `Total de contratações consultadas: ${todosResultados.length}`
  );

  console.log("======================================");


  // ==========================================================
  // FILTRAR
  // ==========================================================

  const editaisEncontrados = [];


  for (const contratacao of todosResultados) {

    const analise = analisarContratacao(
      contratacao
    );

    if (!analise.relevante) {
      continue;
    }

    editaisEncontrados.push({
      contratacao,
      analise,
    });
  }


  // ==========================================================
  // ORDENAR POR RELEVÂNCIA
  // ==========================================================

  editaisEncontrados.sort(
    (a, b) =>
      b.analise.score -
      a.analise.score
  );


  console.log("\n======================================");

  console.log(
    `EDITAIS RELEVANTES: ${editaisEncontrados.length}`
  );

  console.log("======================================");


  // ==========================================================
  // EXIBIR
  // ==========================================================

  for (const edital of editaisEncontrados) {

    exibirEdital(
      edital.contratacao,
      edital.analise
    );
  }


  return editaisEncontrados;
}


// ============================================================
// EXECUÇÃO
// ============================================================

// pncp();


// ============================================================
// EXPORT
// ============================================================

module.exports = pncp;