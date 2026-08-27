const analisarContratacao = require("./analisarContratacao");

function filtrarEditais(contratacoes) {
  return contratacoes
    .map((contratacao) => ({
      contratacao,
      analise: analisarContratacao(contratacao),
    }))
    .filter(({ analise }) => analise.relevante)
    .sort((a, b) => b.analise.score - a.analise.score);
}

module.exports = filtrarEditais;