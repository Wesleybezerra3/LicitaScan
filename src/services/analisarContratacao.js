const palavrasChave = require("../config/palavras_chaves");

function normalizarTexto(texto = "") {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const analisarContratacao = (contratacao) => {
  const objeto = contratacao.objetoCompra || contratacao.objeto || "";

  const informacaoComplementar =
    contratacao.informacaoComplementar || contratacao.descricao || "";

  const texto = normalizarTexto(`
    ${objeto}
    ${informacaoComplementar}
  `);

  let score = 0;
  let totalPeso = 0;

  const palavrasEncontradas = [];

  for (const { termo, peso } of palavrasChave) {
    totalPeso += peso;

    if (texto.includes(termo)) {
      score += peso;

      palavrasEncontradas.push({
        palavra: termo,
        peso,
      });
    }
  }

 const porcentagemRelevancia =
  totalPeso > 0
    ? Math.min(
        100,
        Number(((score / totalPeso) * 1000).toFixed(2))
      )
    : 0;
  return {
    relevante: score >= 8,
    score,
    porcentagemRelevancia,
    palavrasEncontradas,
  };
};
module.exports = analisarContratacao;
