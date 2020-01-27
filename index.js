const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const bearerToken = require("express-bearer-token");
const PORT = 2100;

// =============== Middleware =============== //
app.use(cors());
app.use(bearerToken());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// ================= Routes ================ //
const { moviesRouters, authRouters } = require("./routers");

// =========== Routes Middleware =========== //
app.use("/movies", moviesRouters);
app.use("/auth", authRouters);

app.get("/", (req, res) => {
  res.status(200).send("welcome to moviebox API");
});

app.listen(PORT, () => console.log("running on port " + PORT));
