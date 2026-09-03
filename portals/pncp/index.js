const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { salvarEditais } = require("../../utils/saveFile");
const palavrasChave = require("../../src/config/palavras_chaves");
const {modalidades, TAMANHO_PAGINA, DATA_INICIAL, DATA_FINAL} = require("../../src/config/pncp");
const analisarContratacao = require("../../src/services/analisarContratacao");
const filtrarEditais = require("../../src/services/filtrarEditais");
const { orgao } = require("../../src/config/db");

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });
const BASE_URL = "https://pncp.gov.br/api/consulta";

// ============================================================
// CONFIGURAÇÕES
// ============================================================

// Modalidades que queremos consultar.
//
// IMPORTANTE:
// Os códigos abaixo devem ser conferidos na tabela de domínio
// de modalidades do PNCP antes de colocar em produção.
//
// Deixe aqui somente as modalidades que fazem sentido para
// aquisição de livros/material escolar.
// const modalidades = [
//   {
//     codigo: 6,
//     nome: "Pregão eletronico",
//   },

//   // Adicione aqui as demais modalidades depois de confirmar
//   // os códigos na API do PNCP.
// ];

// // Quantidade de registros por página
// const TAMANHO_PAGINA = 50;

// // Data utilizada na busca
// const DATA_INICIAL = "20260801";

// const DATA_FINAL = "20260902";


// ============================================================
// NORMALIZAÇÃO
// ============================================================

// function normalizarTexto(texto = "") {
//   return String(texto)
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .toLowerCase()
//     .replace(/\s+/g, " ")
//     .trim();
// }


// ============================================================
// ANÁLISE DO EDITAL
// ============================================================

// function analisarContratacao(contratacao) {

//   const objeto = contratacao.objetoCompra || "";

//   const informacaoComplementar =
//     contratacao.informacaoComplementar || "";

//   const texto = normalizarTexto(`
//     ${objeto}
//     ${informacaoComplementar}
//   `);

//   let score = 0;

//   const palavrasEncontradas = [];

//   for (const [palavra, peso] of Object.entries(palavrasChave)) {

//     const palavraNormalizada = normalizarTexto(palavra);

//     if (texto.includes(palavraNormalizada)) {

//       score += peso;

//       palavrasEncontradas.push({
//         palavra,
//         peso,
//       });
//     }
//   }

//   return {
//     relevante: score >= 8,
//     score,
//     palavrasEncontradas,
//   };
// }


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

function extrairNumeroValor(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  const valorNormalizado = String(valor)
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const numero = Number(valorNormalizado);
  return Number.isFinite(numero) ? numero : null;
}

function extrairData(valor) {
  if (!valor) {
    return null;
  }

  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}



async function salvarEditaisNoBanco(editaisEncontrados) {
  if (!Array.isArray(editaisEncontrados) || editaisEncontrados.length === 0) {
    return [];
  }

  const portal = await prisma.portal.upsert({
    where: { codigo: "pncp" },
    update: {},
    create: {
      nome: "PNCP",
      codigo: "pncp",
      url: "https://pncp.gov.br",
    },
  });

  const registrosSalvos = [];

  for (const [index, { contratacao }] of editaisEncontrados.entries()) {
    const codigoExterno = String(
      contratacao.numeroControlePNCP ||
        contratacao.processo ||
        contratacao.numeroCompra ||
        contratacao.codigo ||
        `${portal.codigo}-${index + 1}`
    );

    const valorEstimado = extrairNumeroValor(
      contratacao.valorEstimado ||
        contratacao.valorTotalEstimado ||
        contratacao.valorGlobal ||
        contratacao.valorTotal ||
        contratacao.valor ||
        contratacao.valorEstimadoCompra
    );

    const registro = {
      unidadeOrgao: contratacao.unidadeOrgao
        ? JSON.stringify(contratacao.unidadeOrgao)
        : null,
      orgaoEntidade: contratacao.orgaoEntidade
        ? JSON.stringify(contratacao.orgaoEntidade)
        : null,
      portalId: portal.id,
      codigoExterno,
      numero: contratacao.numeroCompra || contratacao.processo || contratacao.numero || null,
      ano: Number(contratacao.anoCompra || contratacao.ano) || null,
      objeto: contratacao.objetoCompra || contratacao.objeto || "Não informado",
      descricao:
        contratacao.informacaoComplementar ||
        contratacao.descricao ||
        null,
      status:
        contratacao.situacaoCompraNome ||
        contratacao.situacao ||
        contratacao.status ||
        null,
      valorEstimado,
      valorHomologado: extrairNumeroValor(
        contratacao.valorTotalHomologado || contratacao.valorHomologado
      ),
      dataPublicacao: extrairData(contratacao.dataPublicacaoPncp),
      dataAbertura: extrairData(
        contratacao.dataAberturaProposta || contratacao.dataAbertura
      ),
      dataEncerramento: extrairData(
        contratacao.dataEncerramentoProposta ||
          contratacao.dataEncerramento
      ),
      dataAtualizacaoPortal: extrairData(
        contratacao.dataAtualizacaoPortal ||
          contratacao.dataAtualizacao
      ),
      url:
        contratacao.linkProcessoEletronico ||
        contratacao.linkSistemaOrigem ||
        contratacao.url ||
        null,
      urlEdital:
        contratacao.linkProcessoEletronico ||
        contratacao.linkSistemaOrigem ||
        contratacao.urlEdital ||
        contratacao.url ||
        null,
    };

    const licitacaoSalva = await prisma.licitacao.upsert({
      where: {
        portalId_codigoExterno: {
          portalId: portal.id,
          codigoExterno,
        },
      },
      update: registro,
      create: registro,
    });

    registrosSalvos.push(licitacaoSalva);
  }

  return registrosSalvos;
}

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
    `Processo: ${
      contratacao.numeroCompra ||
      contratacao.processo ||
      "Não informado"
    }`
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
      contratacao.unidadeOrgao?.nomeUnidade ||
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
     console.log(contratacao)
    // const editais = contratacao //filtrarEditais([contratacao]);

    // if (!editais || editais.length === 0) {
    //   continue;
    // }

    editaisEncontrados.push({
      contratacao,
      analise: analisarContratacao(contratacao),
    });
  }


  // ==========================================================
  // ORDENAR POR RELEVÂNCIA
  // ==========================================================
 
  // editaisEncontrados.sort(
  //   (a, b) =>
  //     b.analise.score -
  //     a.analise.score
  // );


  console.log("\n======================================");

  console.log(
    `EDITAIS RELEVANTES: ${editaisEncontrados.length}`
  );

  console.log("======================================");


  // ==========================================================
  // EXIBIR
  // ==========================================================
  const editais = []
  const portal = await prisma.portal.upsert({
    where: { codigo: "pncp" },
    update: {},
    create: {
      nome: "PNCP",
      codigo: "pncp",
      url: "https://pncp.gov.br",
    },
  });

  for (const edital of editaisEncontrados) {
    const contratacao = edital.contratacao;
    const codigoExterno = String(
      contratacao.numeroControlePNCP ||
        contratacao.processo ||
        contratacao.numeroCompra ||
        contratacao.codigo ||
        `${portal.codigo}-${editais.length + 1}`
    );

    editais.push({
      unidadeOrgao: contratacao.unidadeOrgao || null,
      orgaoEntidade: contratacao.orgaoEntidade || null,
      portalId: portal.id,
      codigoExterno,
      numero: contratacao.numeroCompra || contratacao.processo || contratacao.numero || null,
      ano: Number(contratacao.anoCompra || contratacao.ano) || null,
      objeto: contratacao.objetoCompra || contratacao.objeto || "Não informado",
      descricao:
        contratacao.informacaoComplementar ||
        contratacao.descricao ||
        null,
      status: contratacao.situacao || contratacao.status || null,
      valorEstimado: extrairNumeroValor(
        contratacao.valorEstimado ||
          contratacao.valorTotalEstimado ||
          contratacao.valorGlobal ||
          contratacao.valorTotal ||
          contratacao.valor ||
          contratacao.valorEstimadoCompra
      ),
      valorHomologado: extrairNumeroValor(
        contratacao.valorTotalHomologado || contratacao.valorHomologado
      ),
      dataPublicacao: extrairData(contratacao.dataPublicacaoPncp),
      dataAbertura: extrairData(
        contratacao.dataAberturaProposta || contratacao.dataAbertura
      ),
      dataEncerramento: extrairData(
        contratacao.dataEncerramentoProposta ||
          contratacao.dataEncerramento
      ),
      dataAtualizacaoPortal: extrairData(
        contratacao.dataAtualizacaoPortal ||
          contratacao.dataAtualizacao
      ),
      url:
        contratacao.linkProcessoEletronico ||
        contratacao.linkSistemaOrigem ||
        contratacao.url ||
        null,
      urlEdital:
        contratacao.linkProcessoEletronico ||
        contratacao.linkSistemaOrigem ||
        contratacao.urlEdital ||
        contratacao.url ||
        null,
    });

    exibirEdital(
      edital.contratacao,
      edital.analise
    )

  }

  salvarEditais(!editais.length ? 'Nenhum edital encontrado' : editais, 'pncp');

  try {
    await salvarEditaisNoBanco(editaisEncontrados);
    console.log(
      `Editais salvos no banco: ${editaisEncontrados.length}`
    );
  } catch (error) {
    console.error("Erro ao salvar editais no banco de dados:", error);
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