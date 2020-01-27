const mysql = require("mysql");

// const db = mysql.createConnection({
//   host: "db4free.net",
//   user: "plattery",
//   password: "Doretaq123",
//   database: "plattery9969",
//   port: 3306,
//   multipleStatements: true
// });

const db = mysql.createConnection({
  host: "localhost",
  user: "kenang",
  password: "bahagia",
  database: "moviebox",
  port: 3306,
  multipleStatements: true
});

module.exports = db;
