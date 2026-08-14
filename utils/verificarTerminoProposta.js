const verificarTerminoProposta = (terminoPropostas) => {
  const regex = /\d{2}\/\d{2}\/\d{4}/;

  const match = terminoPropostas.match(regex);

  if (!match) {
    return {
      data: null,
      vencido: null
    };
  }

  const data = match[0];

  const [dia, mes, ano] = data.split("/");

  const dataFinal = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  );

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return {
    data,
    vencido: dataFinal < hoje
  };
};

module.exports = {verificarTerminoProposta};