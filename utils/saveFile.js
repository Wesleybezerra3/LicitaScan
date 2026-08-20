const fs = require("fs");
const path = require("path");

const salvarEditais = (editais) => {
  const pasta = path.join(__dirname, "../data");

  // Cria a pasta caso ela não exista
  if (!fs.existsSync(pasta)) {
    fs.mkdirSync(pasta, { recursive: true });
  }

  const arquivo = path.join(pasta, `editais_${Date.now()}.json`);

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