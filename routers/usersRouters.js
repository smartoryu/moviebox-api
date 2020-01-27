const express = require("express");
const router = express.Router();
const { usersController } = require("./../controllers");

router.get("/", usersController.getDataUser);
router.post("/login", usersController.login); // LOGIN PAGE
// router.post("/register", usersController.register); // REGISTER PAGE

module.exports = router;
