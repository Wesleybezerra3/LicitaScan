const readline = require("readline");

const bbmnet = require("./portals/bbmnet");
const portalComprasNet = require("./portals/portalComprasNet");


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Qual portal deseja acessar? 1 - bbmnet / 2 - portalComprasNet: ", async (answer) => {
  if (answer === "1") {
    await bbmnet();
  } else if (answer === "2") {
    await portalComprasNet();
  } else {
    console.log("Opção inválida.");
  }
  rl.close();
});
