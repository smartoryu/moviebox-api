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
    let { name, username, password, email } = req.body;
    let sql = `SELECT username FROM user WHERE username = '${username}'`;
    mysqldb.query(sql, (err1, res1) => {
      if (err1) res.status(500).send({ status: "error", err1 });

      if (res1.length > 0) {
        return res.status(200).send({ status: "error", message: "Username not available!" });
      } else {
        let hashpassword = encrypt(password);
        let data = {
          name,
          username,
          password: hashpassword,
          email,
          roleid: 3,
          suspend: 0,
          verified: 0,
          lastlogin: moment().format("YYYY-MM-DD HH:mm:ss")
        };

        sql = "INSERT INTO user SET ?";
        mysqldb.query(sql, data, (err2, res2) => {
          if (err2) res.status(500).send({ status: "error", err2 });

          let VerifyLink = `http://localhost:3000/verified?username=${username}&password=${hashpassword}`;
          let mailOptions = {
            from: "kurir <prikenang.tech@gmail.com>",
            to: email,
            subject: "Verify your account",
            html: `Please verify your account by clicking on this <a href=${VerifyLink}>link</a>`
          };
          transporter.sendMail(mailOptions, (err3, res3) => {
            if (err3) res.status(500).send({ status: "Error", err3 });

            console.log("Registered!");
            return res.status(200).send({ username, email, status: "unverified" });
          });
        });
      }
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
  login: (req, res) => {
    const { username, password, dummy } = req.query;
    let sql = `SELECT * FROM user WHERE username='${username}'`;
    mysqldb.query(sql, (err, resUser) => {
      console.log("user", resUser);

      if (err) res.status(500).send(res);
      if (resUser[0] === undefined) {
        return res.status(200).send({ message: "Username not found!", status: "WRONG_USER" });
      }

      sql = `SELECT * FROM user WHERE username='${username}' AND suspend=0`;
      mysqldb.query(sql, (err, resSuspend) => {
        // console.log("suspend", resSuspend);

        if (err) res.status(500).send(err);
        if (resSuspend[0] === undefined) {
          return res.status(200).send({ message: "Your account is suspended!", status: "SUSPENDED" });
        }

        sql = `SELECT u.*, r.rolename as role FROM user u LEFT JOIN role r ON u.roleid = r.id WHERE username='${username}' AND password='${password}' AND u.suspend = 0;`;
        mysqldb.query(sql, (err, resAccount) => {
          console.log("account", resAccount);

          if (err) res.status(500).send(err);
          if (resAccount[0] === undefined) {
            res.status(200).send({ message: "Wrong password!", status: "WRONG_PASS" });
          }

          // res.status(200).send(resAccount);
        });
      });
    });
  }
};

// sql = `SELECT u.*, r.rolename FROM user u LEFT JOIN role r ON u.roleid = r.id WHERE username='${username}' AND (password='${password}' OR dummy='${password}') AND u.suspend = 0;`;
