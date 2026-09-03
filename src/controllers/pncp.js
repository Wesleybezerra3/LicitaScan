// const { buscarTodasContratacoes } = require("../integrations/pncp");
const filtrarEditais = require("../services/filtrarEditais");
// const formatarEditais = require("../services/formatarEditais");
// const exibirEdital = require("../services/exibirEdital");
const prisma = require("../../src/config/db");

const getAllEditais = async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = 10;
    const offset = (page - 1) * limit;
    console.log(
      `Buscando editais na página ${page} com limite de ${limit} e offset de ${offset}`,
    );
    
    const todosEditais = await prisma.licitacao.findMany({
      orderBy: {
        dataPublicacao: "desc",
      },
    });
    
    const editaisFiltrados = filtrarEditais(todosEditais);
    const total = editaisFiltrados.length;
    
    console.log("Quantidade retornada:", editaisFiltrados.length);
    console.log("Total de licitações:", total);

    const editaisPagina = editaisFiltrados.slice(offset, offset + limit);

    if (editaisFiltrados.length === 0) {
      return res.status(404).json({
        message: "Nenhum edital encontrado.",
      });
    }
    if (editaisPagina.length === 0) {
      return res.status(404).json({
        message: "Nenhum edital encontrado nesta página.",
      });
    }

    return res.status(200).json({ editais: editaisPagina, total, page, limit });
  } catch (err) {
    console.error("Erro ao buscar editais no banco de dados:", err);
    return res
      .status(500)
      .json({ erro: "Não foi possível consultar o banco de dados" });
  }
};

module.exports = { getAllEditais };
