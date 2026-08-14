const { chromium } = require("playwright");
const { getValue } = require("../../utils/formatInfos");
const {
  verificarTerminoProposta,
} = require("../../utils/verificarTerminoProposta");
const bbmNet = async () => {
  const palavrasChave = [
    "livro",
    // "Didátic",
    // "Litera",
    // "pedagógic",
    // "Biblio",
    // "Leit",
    // "Acervo",
    // "Book",
    // "Educaciona",
    // "Portug",
    // "Matemática",
    // "SAEB",
    // "Publicação nacional",
    // "Publicações nacionais",
    // "Material informacional",
    // "Recurso Informacional",
    // "Material para formação   ",
    // "Referenciais Teóricos",
    // "Aluno",
    // "Kit Escolar",
    // "Kits Escolares",
    // "Kit Aluno",
    // "Kit Professor",
    // "Material Escolar",
  ];
  let infosData = [];

  const browser = await chromium.launch({ headless: false });

  const page = await browser.newPage();

  await page.goto("https://jornaldolicitante.com.br");

  console.log("Portal aberto!");

  await page.getByRole("button").filter({ hasText: /^$/ }).click();
  await page.getByRole("textbox", { name: "Buscar" }).click();

  for (const palavra of palavrasChave) {
    const campoBusca = page.getByRole("textbox", {
      name: "Buscar",
    });

    await campoBusca.fill(palavra);
    await page
      .getByRole("button", {
        name: "Filtrar",
      })
      .click();

    await page.waitForTimeout(2000);

    while (true) {
      const infos = page.locator(".info");
      const quantidade = await infos.count();

      console.log(`Palavra: "${palavra}"`);
      console.log(`Elementos: ${quantidade}`);

      for (let i = 0; i < quantidade; i += 6) {
        const termino = await getValue(infos.nth(i + 2));

        const prazo = verificarTerminoProposta(termino);

        infosData.push({
          dataPublicacao: await getValue(infos.nth(i)),
          modalidade: await getValue(infos.nth(i + 1)),
          terminoPropostas: prazo.data,
          prazoVencido: prazo.vencido,
          objeto: await getValue(infos.nth(i + 3)),
          edital: await getValue(infos.nth(i + 4)),
          situacao: await getValue(infos.nth(i + 5)),
        });
      }

      let infosDataFiltradas = infosData.filter(
        (info) => info.terminoPropostas !== null,
      );
      // verificar próxima página aqui
      console.log(`Editais encontrados: `, infosDataFiltradas);

         break; // Remover este break quando implementar a verificação da próxima página
      console.log("Verificando próxima página...");
    //   const proximo = page.getByRole("button").filter({ hasText: /^$/ }).nth(1);

    //   if ((await proximo.count()) === 0 || !(await proximo.isEnabled())) {
    //     console.log("Última página.");
    //     break;
    //   }

    //   await proximo.click();

    //   await page.waitForTimeout(1000);
    }
  }

  //   await page.waitForTimeout(50000);

  await browser.close();
};

module.exports = bbmNet;
