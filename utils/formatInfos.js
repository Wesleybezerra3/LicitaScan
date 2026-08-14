const getValue = async (locator) => {
  const texto = await locator.innerText();

  return texto
    .split("\n")
    .slice(1)
    .join(" ")
    .trim();
};

module.exports = { getValue };