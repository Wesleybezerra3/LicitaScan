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
};
module.exports = analisarContratacao;
