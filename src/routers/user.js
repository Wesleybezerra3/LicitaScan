const express = require("express");
const  controllerUser  = require("../controllers/user");

const router = express.Router();

router.post("/register", controllerUser.createUser);
router.post("/login", controllerUser.loginUser);

module.exports = router;