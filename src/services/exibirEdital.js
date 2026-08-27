function exibirEdital(contratacao, analise) {
  console.log("\n======================================");
  console.log("EDITAL ENCONTRADO");
  console.log(`Score: ${analise.score}`);
  console.log(
    `Palavras: ${analise.palavrasEncontradas
      .map((item) => item.palavra)
      .join(", ")}`
  );
  console.log(`Processo: ${contratacao.processo || "Não informado"}`);
  console.log(`Objeto: ${contratacao.objetoCompra || "Não informado"}`);
  console.log(`Data: ${contratacao.dataPublicacaoPncp || "Não informado"}`);
  console.log(`Modalidade: ${contratacao.modalidadeNome || "Não informado"}`);
  console.log(
    `Órgão: ${
      contratacao.unidadeOrgao?.nome ||
      contratacao.orgaoEntidade?.razaoSocial ||
      contratacao.orgaoEntidade?.nome ||
      "Não informado"
    }`
  );
  console.log("======================================\n");
}

module.exports = exibirEdital;