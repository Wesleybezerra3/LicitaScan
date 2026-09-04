// const { buscarTodasContratacoes } = require("../integrations/pncp");
const filtrarEditais = require("../services/filtrarEditais");
// const formatarEditais = require("../services/formatarEditais");
// const exibirEdital = require("../services/exibirEdital");
const prisma = require("../../src/config/db");

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const filtrarEditaisPrazo = (editais) => {
  const hoje = new Date();
  const inicioDoDia = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate(),
  );

  return editais.filter((edital) => {
    const prazoDeEncerramento = new Date(
      edital.contratacao?.dataEncerramento,
    );

    return (
      !Number.isNaN(prazoDeEncerramento.getTime()) &&
      prazoDeEncerramento <= inicioDoDia
    );
  });
};

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
    const editaisPrazo = filtrarEditaisPrazo(editaisFiltrados);

    const total = editaisPrazo.length;

    
    
    console.log("Quantidade retornada:", editaisPrazo.length);
    console.log("Total de licitações:", total);

    const editaisPagina = editaisPrazo.slice(offset, offset + limit);

    if (editaisPrazo.length === 0) {
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
