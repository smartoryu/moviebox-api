const { mysqldb } = require("../database");
const { createJWTToken } = require("./../helpers/jwt");

module.exports = {
  getDataUser: (req, res) => {
    mysqldb.query("SELECT * FROM users", (err, result) => {
      if (err) {
        console.log(err.message);
        return res
          .status(500)
          .json({ message: "There's an error on the server. Please contact the administrator.", error: err.message });
      }
      console.log(result);
      res.status(200).send(result);
    });
  },
  login: (req, res) => {
    let { username, password } = req.query;
    // let hashpassword = hashcrypt(password)
    let sql = `SELECT u.* FROM users u WHERE u.username='${username}' AND u.password='${password}'`;
    mysqldb.query(sql, (err1, res1) => {
      if (err1) return res.status(500).send({ status: "error", err1 });

      if (res1.length === 0) {
        return res.status(200).send({ status: "error", error: "username/password incorrect!" });
      }

      const user = {
        id: res1[0].id,
        username: res1[0].username,
        role: res1[0].role
      };

      let data = { lastLogin: new Date() };
      const token = createJWTToken({ ...user });
      let sql = `UPDATE users SET ? WHERE username='${username}' AND password='${password}'`;
      mysqldb.query(sql, data, (err2, res2) => {
        if (err2) return res.status(500).send({ status: "error", err2 });
        return res.status(200).send({ data: res1, token });
      });
    });
  }
};
