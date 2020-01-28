const fs = require("fs");
const moment = require("moment");
const { mysqldb } = require("./../database");
const encrypt = require("./../helpers/encrypt");
const transporter = require("./../helpers/mailer");
// const { createJWTToken } = require('./../helpers/jwt')

module.exports = {
  hashpassword: (req, res) => {
    let hashpassword = encrypt(req.query.password);

    console.log(req.query);
    res.send(hashpassword);
  },
  register: (req, res) => {
    let { name, username, email, password1, password2 } = req.body;

    let sql = `SELECT * FROM user WHERE username='${username}'`;
    mysqldb.query(sql, (err, resUser) => {
      if (err) res.status(500).send(res);

      // ===== ALL INPUT MUST BE FILLED
      if (!name || !username || !email || !password1 || !password2) {
        return res.status(200).send({ message: "All input must be filled!", status: "WRONG_FORM" });
      }

      // ===== IF USERNAME ALREADY REGISTERED
      if (resUser.length > 0) {
        return res.status(200).send({ message: "Username not available", status: "WRONG_USER" });
      }

      // ===== IF PASSWORD LESS THAN 4 CHARACTER
      if (password1.length < 4) {
        return res.status(200).send({ message: "Password must be more than 4 characters!", status: "WRONG_PASS" });
      }

      // ===== IF PASSWORD DOESN'T MATCH
      if (password1 !== password2) {
        return res.status(200).send({ message: "Password doesn't match!", status: "WRONG_PASS" });
      }

      // ===== USERNAME PASSWORD ARE GOOD TO GO!
      let newUser = {
        name,
        username,
        email,
        password: encrypt(password2),
        roleid: 3,
        suspend: 0,
        verified: 0,
        lastlogin: moment().format("YYYY-MM-DD HH:mm:ss")
      };
      sql = `INSERT INTO user SET ?`;
      mysqldb.query(sql, newUser, (err, resNewUser) => {
        if (err) res.status(500).send(res);

        let verifyLink = `kepo`;
        let mailOptions = {
          from: "kurir <prikenang.tech@gmail.com>",
          to: email,
          subject: "Verify your account",
          html: `Please verify your account by clicking on this <a href=${verifyLink}>link</a>`
        };

        transporter.sendMail(mailOptions, (err, resMail) => {
          if (err) res.status(500).send(res);

          return res.status(200).send({ username, email, status: "REG_SUCCESS" });
        });
      });
    });
  },
  sendmail: (req, res) => {
    let htmlFile = fs.readFileSync("./html/culturetrip.html", "utf8");
    let mailOptions = {
      from: "kurir <prikenang.tech@gmail.com>",
      to: "prikenang@gmail.com",
      subject: "Test send mail",
      html: htmlFile
    };

    transporter.sendMail(mailOptions, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send({ message: err });
      } else {
        console.log(result);
        res.status(200).send({ message: "Sent!", result });
      }
    });
  },
  login: (req, res, next) => {
    let { username, password, dummy } = req.query;
    let sql = `SELECT * FROM user WHERE username='${username}'`;
    mysqldb.query(sql, (err, resUser) => {
      if (err) res.status(500).send(res);
      // ===== IF USERNAME NOT REGISTERED
      if (resUser[0] === undefined) {
        return res.status(200).send({ message: "Username not found!", status: "WRONG_USER" });
      }

      sql = `SELECT * FROM user WHERE username='${username}' AND suspend=0`;
      mysqldb.query(sql, (err, resSuspend) => {
        if (err) res.status(500).send(err);
        // ===== IF USER SUSPENDED
        if (resSuspend[0] === undefined) {
          return res.status(200).send({ message: "Your account is suspended!", status: "SUSPENDED" });
        }

        password = encrypt(password);
        sql = `SELECT u.*, r.rolename as role FROM user u LEFT JOIN role r ON u.roleid = r.id WHERE username='${username}' AND password='${password}' AND u.suspend = 0;`;
        mysqldb.query(sql, (err, resAccount) => {
          if (err) res.status(500).send(err);
          // ===== IF PASSWORD WRONG
          if (resAccount[0] === undefined) {
            res.status(200).send({ message: "Wrong password!", status: "WRONG_PASS" });
          } else {
            res.status(200).send(resAccount);
          }
        });
      });
    });
  }
};
