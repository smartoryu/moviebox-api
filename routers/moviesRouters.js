const express = require("express");
const router = express.Router();
const { moviesController } = require("../controllers");

// ============ ROUTER =============

router.get("/", moviesController.getMovies);
router.get("/:id/genre", moviesController.getMoviesGenre);
router.get("/:id/schedule", moviesController.getMoviesSchedule);
router.put("/:id/update", moviesController.updateMovie);
router.post("/add_new", moviesController.addMovie);

// ________________________________

module.exports = router;
