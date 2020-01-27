const jwt = require("jsonwebtoken");

module.exports = {
  createJWTToken(payload) {
    return jwt.sign(payload, "tokensecret", { expiresIn: "12h" });
  }
};
