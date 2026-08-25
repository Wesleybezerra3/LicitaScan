const fs = require("fs");
const path = require("path");

const salvarEditais = (editais) => {
   const dataAtual = new Date();
  const dataFormatada = dataAtual.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-");

  const pasta = path.join(__dirname, "../data");

  // Cria a pasta caso ela não exista
  if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
  }

  const arquivo = path.join(pasta, `editais_${dataFormatada}.json`);

  fs.writeFileSync(
    arquivo,
    JSON.stringify(editais, null, 2),
    "utf-8"
  );

  console.log(`Editais salvos em: ${arquivo}`);
};

module.exports = {
  salvarEditais
};