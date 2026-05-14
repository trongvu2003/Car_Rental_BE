const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");

router.post("/", reviewController.createReviewController);
router.get("/car/:carId", reviewController.getReviewsByCar);
router.patch("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);
module.exports = router;
