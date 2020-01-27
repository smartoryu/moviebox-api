const fs = require("fs");
const moment = require("moment");
const { mysqldb } = require("./../database");
const { uploader } = require("./../helpers/uploader");

module.exports = {
  getMovies: (req, res) => {
    let sql = `SELECT * FROM movies`;
    mysqldb.query(sql, (err, result) => {
      if (err) {
        console.log(err.message);
        return res
          .status(500)
          .json({ message: "There's an error on the server. Please contact the administrator.", error: err.message });
      }
      // console.log(result);
      res.status(200).send(result);
    });
  },
  getMoviesGenre: (req, res) => {
    let movieId = req.params.id;
    let sql = `SELECT * FROM genre WHERE movieid = ${movieId}`;
    mysqldb.query(sql, (err, result) => {
      if (err) {
        console.log(err.message);
        res
          .status(500)
          .json({ message: "There's an error on the server. Please contact the administrator.", error: err.message });
      }
      console.log(result);
      res.status(200).send(result);
    });
  },
  getMoviesSchedule: (req, res) => {
    let movieId = req.params.id;
    let sql = `SELECT * FROM schedule WHERE movieid = '${movieId}'`;
    mysqldb.query(sql, (err, result) => {
      if (err) {
        console.log(err.message);
        res
          .status(500)
          .json({ message: "There's an error on the server. Please contact the administrator.", error: err.message });
      }
      console.log(result);
      res.status(200).send(result);
    });
  },
  addMovie: (req, res) => {
    const path = "/movies/images";
    const upload = uploader(path, "POSTER").fields([{ name: "image" }]);

    upload(req, res, err => {
      if (err) res.status(500).json({ message: "Upload picture failed!", error: err.message });

      // images uploaded
      const { image } = req.files;
      const imagePath = image ? path + "/" + image[0].filename : null;

      // GET data from body
      let data = JSON.parse(req.body.data);

      if (imagePath) data.pathimage = imagePath;
      data.uploadtime = moment().format("YYYY-MM-DD HH:mm:ss");

      try {
        let sql = "INSERT INTO movies SET ?";
        mysqldb.query(sql, data, (err, result) => {
          // bila gagal, file image dihapus dari API lalu send error
          if (err) {
            console.log(err.message);
            if (imagePath) {
              fs.unlinkSync("./public" + imagePath);
            }
            return res
              .status(500)
              .json({ message: "There's an error on the server. Please contact the administrator." });
          }

          // setelah berhasil ==> getMovies
          sql = "SELECT * FROM movies";
          mysqldb.query(sql, (err, result2) => {
            if (err)
              res.status(500).json({ message: "There's an error on the server. Please contact the administrator." });

            return res.status(200).send({ result2 });
          });
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "There's an error on the server. Please contact the administrator." });
      }
    });
  },
  updateMovie: (req, res) => {
    const movieId = req.params.id;
    var sql = `SELECT * FROM movies WHERE id=${movieId}`;
    // var sql = `SELECT * FROM movies WHERE id=${movieId}`;
    mysqldb.query(sql, (err2, res2) => {
      if (err2) throw err2;

      if (res2.length) {
        const path = "/movies/images"; // path filesave
        const upload = uploader(path, "POSTER").fields([{ name: "image" }]);

        upload(req, res, errUpload => {
          if (errUpload) res.status(500).json({ message: "Upload poster failed!", error: errUpload.message });

          let { image } = req.files;
          let imagePath = image ? path + "/" + image[0].filename : null;
          let data = JSON.parse(req.body.data);
          data.uploadtime = moment().format("YYYY-MM-DD HH:mm:ss");
          // console.log(data);

          try {
            if (imagePath) {
              data.pathimage = imagePath;
            }
            // console.log("imagePath", imagePath);

            sql = `UPDATE movies SET ? WHERE id=${movieId}`;
            mysqldb.query(sql, data, (err3, res3) => {
              if (err3) {
                if (imagePath) {
                  fs.unlinkSync("./public" + imagePath);
                }
                return res.status(500).json({
                  message: "There's an error on the server. Please contact the administrator.",
                  error: err3.message
                });
              }

              // hapus foto lama
              if (imagePath) {
                if (res2[0].image) {
                  fs.unlinkSync("./public" + res2[0].poster);
                }
              }

              mysqldb.query("SELECT * FROM movies", (err4, res4) => {
                if (err4) res.status(500).send(err);
                return res.status(200).send(res4);
              });
            });
          } catch (err) {
            console.log(err.message);
            return res.status(500).json({
              message: "There's an errpr on the server. Please contact the administrator.",
              error: err.message
            });
          }
        });
      }
    });
  }
};
