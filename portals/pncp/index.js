const axios = require("axios");

const pncp = async () => {
  const palavrasChave = [
    "livro",
    "Didátic",
    "Litera",
    "pedagógic",
    "Biblio",
    "Leit",
    "Acervo",
    "Book",
    "Educaciona",
    "Portug",
    "Matemática",
    "SAEB",
    "Publicação nacional",
    "Publicações nacionais",
    "Material informacional",
    "Recurso Informacional",
    "Material para formação   ",
    "Referenciais Teóricos",
    "Aluno",
    "Kit Escolar",
    "Kits Escolares",
    "Kit Aluno",
    "Kit Professor",
    "Material Escolar",
  ];

  const BASE_URL = "https://pncp.gov.br/api/consulta";

  async function buscarContratacoes(dataInicial, dataFinal) {
    const response = await axios.get(`${BASE_URL}/v1/contratacoes/publicacao`, {
      params: {
        dataInicial,
        dataFinal,
        codigoModalidadeContratacao: 1,
        pagina: 1,
        tamanhoPagina: 10,
      },
    });

    return response.data;
  }

  const resultado = await buscarContratacoes(
    "20260819", //Data no formato "YYYYMMDD"
    "20260819",
  );

  const palavraChaves = (contratacao) => {
    const texto = normalizarTexto(`
    ${contratacao.objetoCompra || ""}
    ${contratacao.informacaoComplementar || ""}
  `);

    return palavrasChave.filter((palavra) =>
      texto.includes(normalizarTexto(palavra)),
    );
  };

  // console.log(`Foram encontrados ${resultado.data.length} resultados.`);

  for (const contratacao of resultado.data) {
    const palavrasEncontradas = encontrarPalavrasChave(contratacao);

    if (palavrasEncontradas.length === 0) {
      continue;
    }

    console.log("EDITAL ENCONTRADO");
    console.log(`Palavras: ${palavrasEncontradas.join(", ")}`);
    console.log(`Processo: ${contratacao.processo}`);
    console.log(`Objeto: ${contratacao.objetoCompra}`);
    console.log(`Data: ${contratacao.dataPublicacaoPncp}`);
    console.log(`Órgão: ${contratacao.unidadeOrgao?.nome}`);
    console.log(`Modalidade: ${contratacao.modalidadeNome}`);

    console.log("-----------------------------");
  }
};
module.exports = pncp;
