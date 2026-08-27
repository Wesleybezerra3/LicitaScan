const axios = require("axios");
const { TAMANHO_PAGINA } = require("../config/pncp");

const BASE_URL = "https://pncp.gov.br/api/consulta";
const MAX_TENTATIVAS = 4;
const ATRASO_INICIAL_MS = 2000;
const ATRASO_MAXIMO_MS = 30000;

const esperar = (tempo) =>
  new Promise((resolve) => setTimeout(resolve, tempo));

function obterAtraso(error, tentativa) {
  const retryAfter = error.response?.headers?.["retry-after"];

  if (retryAfter) {
    const segundos = Number(retryAfter);

    if (Number.isFinite(segundos)) {
      return Math.min(segundos * 1000, ATRASO_MAXIMO_MS);
    }

    const dataRetry = Date.parse(retryAfter);

    if (!Number.isNaN(dataRetry)) {
      return Math.min(
        Math.max(dataRetry - Date.now(), ATRASO_INICIAL_MS),
        ATRASO_MAXIMO_MS
      );
    }
  }

  return Math.min(
    ATRASO_INICIAL_MS * 2 ** tentativa,
    ATRASO_MAXIMO_MS
  );
}

function deveTentarNovamente(error) {
  const status = error.response?.status;

  return (
    !status ||
    status === 408 ||
    status === 429 ||
    status >= 500
  );
}

async function buscarPagina(
  dataInicial,
  dataFinal,
  codigoModalidadeContratacao,
  pagina
) {
  for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa += 1) {
    try {
      const response = await axios.get(`${BASE_URL}/v1/contratacoes/publicacao`, {
        params: {
          dataInicial,
          dataFinal,
          codigoModalidadeContratacao,
          pagina,
          tamanhoPagina: TAMANHO_PAGINA,
        },
        timeout: 15000,
      });

      return response.data;
    } catch (error) {
      const ultimaTentativa = tentativa === MAX_TENTATIVAS - 1;

      if (ultimaTentativa || !deveTentarNovamente(error)) {
        console.error("\nErro ao consultar PNCP:");
        console.error(error.response?.data || error.message);
        return null;
      }

      const atraso = obterAtraso(error, tentativa);
      console.warn(
        `PNCP indisponível (tentativa ${tentativa + 1}/${MAX_TENTATIVAS}). ` +
          `Nova tentativa em ${atraso / 1000}s...`
      );
      await esperar(atraso);
    }
  }
}

async function buscarContratacoes(dataInicial, dataFinal, modalidade) {
  let pagina = 1;
  const resultados = [];

  while (true) {
    console.log(`Consultando ${modalidade.nome} - página ${pagina}...`);

    const resposta = await buscarPagina(
      dataInicial,
      dataFinal,
      modalidade.codigo,
      pagina
    );

    if (!resposta) break;

    const dados = resposta.data || [];
    if (dados.length === 0) break;

    resultados.push(...dados);
    console.log(`  ${dados.length} registros encontrados`);

    if (dados.length < TAMANHO_PAGINA) break;
    pagina += 1;
  }

  return resultados;
}

async function buscarTodasContratacoes(dataInicial, dataFinal, modalidades) {
  const resultados = [];

  for (const modalidade of modalidades) {
    const contratacoes = await buscarContratacoes(
      dataInicial,
      dataFinal,
      modalidade
    );
    resultados.push(...contratacoes);
  }

  return resultados;
}

module.exports = {
  buscarPagina,
  buscarContratacoes,
  buscarTodasContratacoes,
};