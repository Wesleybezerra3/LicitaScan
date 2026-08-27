const { salvarEditais } = require("../../utils/saveFile");
const { DATA_INICIAL, DATA_FINAL, modalidades } = require("../config/pncp");
const { buscarTodasContratacoes } = require("../integrations/pncp");
const filtrarEditais = require("../services/filtrarEditais");
const formatarEditais = require("../services/formatarEditais");
const exibirEdital = require("../services/exibirEdital");

const getEditais = async (req, res) => {
  try {
    const dataInicial = req.query.dataInicial || DATA_INICIAL;
    const dataFinal = req.query.dataFinal || DATA_FINAL;

    console.log("\n======================================");
    console.log("      BUSCA AUTOMÁTICA - PNCP");
    console.log("======================================");
    console.log(`Período: ${dataInicial} até ${dataFinal}`);
    console.log(`Modalidades: ${modalidades.length}`);
    console.log("======================================\n");

    const contratacoes = await buscarTodasContratacoes(
      dataInicial,
      dataFinal,
      modalidades
    );
    const editaisEncontrados = filtrarEditais(contratacoes);
    const editais = formatarEditais(editaisEncontrados);

    editaisEncontrados.forEach(({ contratacao, analise }) => {
      exibirEdital(contratacao, analise);
    });

    salvarEditais(editais.length ? editais : "Nenhum edital encontrado", "pncp");

    return res.status(200).json({
      totalConsultadas: contratacoes.length,
      totalEncontradas: editais.length,
      editais,
    });
  } catch (err) {
    console.error("Erro ao buscar editais do PNCP:", err);
    return res.status(500).json({ erro: "Não foi possível consultar o PNCP" });
  }
};

module.exports = { getEditais };
