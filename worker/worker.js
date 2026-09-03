const pncp = require("../portals/pncp");

const coletarPNCP = async () => {
    console.log("Iniciando coleta do PNCP...");

    // Aqui entra sua função que consulta a API
    // const editais = await buscarPNCP();
   await pncp();

    console.log("Coleta finalizada.");
};

const iniciarWorker = async () => {

    console.log("Worker iniciado.");

    while (true) {

        try {
            await coletarPNCP();
        } catch (error) {
            console.error("Erro na coleta:", error);
        }

        console.log("Aguardando próxima execução...");

        // 10 minuto
        await new Promise(resolve =>
            setTimeout(resolve, 30 * 60 * 1000)
        );
    }
};

module.exports = {
    iniciarWorker,
};