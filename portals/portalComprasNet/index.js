const { chromium } = require("playwright");

const comprasNet = async()=> {
  const browser = await chromium.launch({ headless: false });

  const page = await browser.newPage();

  await page.goto("https://comprasnet.gov.br/ConsultaLicitacoes/ConsLicitacao_Filtro.asp");

  console.log("Portal aberto!");

  const check =  await page.locator('input[name="chkTodos"]').check();

  await page.waitForTimeout(5000);

  await browser.close();
}

module.exports = comprasNet;

