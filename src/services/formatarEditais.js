const { verificarTerminoProposta } = require("../../utils/verificarTerminoProposta");

function formatarEditais(editaisEncontrados) {
  return editaisEncontrados.map(({ contratacao }) => {
    const prazo = verificarTerminoProposta(
      contratacao.dataEncerramentoProposta || ""
    );

    return {
      portal:'PNCP',
      nomeOrgao:
        contratacao.unidadeOrgao?.nome ||
        contratacao.orgaoEntidade?.razaoSocial ||
        contratacao.orgaoEntidade?.nome ||
        "Não informado",
      dataPublicacao: contratacao.dataPublicacaoPncp || "Não informado",
      modalidade: contratacao.modalidadeNome || "Não informado",
      terminoPropostas: prazo.data || "Não informado",
      prazoVencido: prazo.vencido,
      objeto: contratacao.objetoCompra || "Não informado",
      edital: contratacao.processo || "Não informado",
      situacao: "",
      link: contratacao.linkProcessoEletronico,
    };
  });
}

module.exports = formatarEditais;