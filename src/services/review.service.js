const { User, Car, Review, sequelize } = require("../models");

const createReviewService = async (reviewData) => {
  const t = await sequelize.transaction();
  try {
    const { user_id, car_id, rating, comment } = reviewData;
    const car = await Car.findByPk(car_id, { transaction: t });
    if (!car) {
      throw new Error("car not found");
    }

    const review = await Review.create(
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

    const result = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Car,
          as: "car",
        },
      ],
    });

    await t.commit();
    return result;
  } catch (e) {
    await t.rollback();
    throw error(e);
  }
};
const getAllReviewsService = async () => {
  return await Review.findAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
      {
        model: Car,
        as: "car",
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};
const getReviewsByCarService = async (carId) => {
  try {
    return await Review.findAll({
      where: {
        car_id: carId,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  } catch (e) {
    throw e;
  }
};

const updateReviewService = async (id, updateData) => {
  const t = await sequelize.transaction();

  try {
    const review = await Review.findByPk(id, {
      transaction: t,
    });

    if (!review) {
      throw new Error("Review not found");
    }

    await review.update(updateData, {
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
    const review = await Review.findByPk(id, {
      transaction: t,
    });

    if (!review) {
      throw new Error("Review not found");
    }

    await review.destroy({
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
