const { sequelize } = require("../models");

const reviewRepository = require("../repositories/review.repository");

const createReviewService = async (reviewData) => {
  const t = await sequelize.transaction();

  try {
    const { user_id, car_id, rating, comment } = reviewData;

    const car = await reviewRepository.findCarById(car_id, {
      transaction: t,
    });

    if (!car) {
      throw new Error("car not found");
    }

    const review = await reviewRepository.create(
      {
        user_id,
        car_id,
        rating,
        comment,
      },
      {
        transaction: t,
      }
    );

    const result = await reviewRepository.findByIdWithDetails(review.id);

    await t.commit();

    return result;
  } catch (e) {
    await t.rollback();
    throw e;
  }
};

const getAllReviewsService = async () => {
  return await reviewRepository.findAll();
};

const getReviewsByCarService = async (carId) => {
  try {
    return await reviewRepository.findAllByCarId(carId);
  } catch (e) {
    throw e;
  }
};

const updateReviewService = async (id, updateData) => {
  const t = await sequelize.transaction();

  try {
    const review = await reviewRepository.findById(id, {
      transaction: t,
    });

    if (!review) {
      throw new Error("Review not found");
    }

    await reviewRepository.update(review, updateData, {
      transaction: t,
    });

    await t.commit();

    return review;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// DELETE REVIEW
const deleteReviewService = async (id) => {
  const t = await sequelize.transaction();

  try {
    const review = await reviewRepository.findById(id, {
      transaction: t,
    });

    if (!review) {
      throw new Error("Review not found");
    }

    await reviewRepository.destroy(review, {
      transaction: t,
    });

    await t.commit();

    return {
      message: "Review deleted successfully",
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  createReviewService,
  getAllReviewsService,
  getReviewsByCarService,
  updateReviewService,
  deleteReviewService,
};
