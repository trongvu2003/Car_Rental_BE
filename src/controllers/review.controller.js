const ReviewService = require("../services/review.service");

const createReviewController = async (req, res) => {
  try {
    const reviewData = req.body;
    const review = await ReviewService.createReviewService(reviewData);
    return res.status(201).json(reviewData);
  } catch (e) {
    console.log("Error" + e);
    return res.status(500).json({
      message: e.message,
    });
  }
};

const getReviewsByCar = async (req, res) => {
  try {
    const review = await ReviewService.getReviewsByCarService(req.params.carId);
    return res.status(200).json(review);
  } catch (e) {
    console.error("ERROR:", e);
    throw res.status(500).json({
      message: e.message,
    });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await ReviewService.updateReviewService(
      req.params.id,
      req.body
    );

    return res.status(200).json(review);
  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE
const deleteReview = async (req, res) => {
  try {
    const result = await ReviewService.deleteReviewService(req.params.id);

    return res.status(200).json(result);
  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createReviewController,
  getReviewsByCar,
  updateReview,
  deleteReview,
};
