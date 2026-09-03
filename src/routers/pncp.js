const express = require("express");
const { getAllEditais } = require("../controllers/pncp");

const router = express.Router();

router.get("/editais", getAllEditais);

module.exports = router;