const express = require("express");
const { getEditais } = require("../controllers/pncp");

const router = express.Router();

router.get("/editais", getEditais);

module.exports = router;