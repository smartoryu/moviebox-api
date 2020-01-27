const crypto = require("crypto");

module.exports = password => {
  return crypto
    .createHmac("sha256", "mamamialezatos")
    .update(password)
    .digest("hex");
};
