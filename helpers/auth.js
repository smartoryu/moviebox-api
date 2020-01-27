const jwt = require("jsonwebtoken");

module.exports = {
  auth: (req, res, next) => {
    if (req.method !== "OPTIONS") {
      jwt.verify(req.token, "tokensecret", (error, decoded) => {
        if (error) {
          return res.status(401).json({ message: "User not authorized.", error: "User not authorized." });
        }

        req.user = decoded;
        next();
      });
    } else {
      next();
    }
  }
};
