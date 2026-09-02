const modalidades = [
  {
    codigo: 6,
    nome: "Pregão eletrônico",
  },
]

const calcDataInicial = () => {
  const data = new Date();
  data.setDate(data.getDate() - 30);
  return data.toISOString().split("T")[0].replace(/-/g, "");
}
const calcDataFinal = () => {
  const data = new Date();
  data.setDate(data.getDate() + 30);
  return data.toISOString().split("T")[0].replace(/-/g, "");
}
const TAMANHO_PAGINA = 50;
const DATA_INICIAL = calcDataInicial();
const DATA_FINAL = calcDataFinal();

module.exports = {
  modalidades,
  TAMANHO_PAGINA,
  DATA_INICIAL,
  DATA_FINAL,
};