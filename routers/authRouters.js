const router = require("express").Router();
const { authController } = require("../controllers");

router.get("/hashpassword", authController.hashpassword);
router.get("/login", authController.login);
router.post("/register", authController.register);
router.get("/sendmail", authController.sendmail);

module.exports = router;
