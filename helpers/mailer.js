const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "prikenang.tech@gmail.com",
    pass: "wsgmiwvpowozgqjn"
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;
