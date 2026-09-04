const express = require('express');
const cors = require('cors');
const pncpRouter = require("./src/routers/pncp");
const userRouter = require("./src/routers/user");
const { iniciarWorker } = require("./worker/worker");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/pncp", pncpRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.json({ status: "ok", servico: "LicitaScan" });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor LicitaScan executando em http://localhost:${PORT}`);
    // iniciarWorker();
  });
}

module.exports = app;
