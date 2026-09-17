const { Review, User, Car } = require("../models");

const findCarById = async (carId, options = {}) => {
  return Car.findByPk(carId, options);
};

const create = async (data, options = {}) => {
  return Review.create(data, options);
};

const findById = async (id, options = {}) => {
  return Review.findByPk(id, options);
};

const findByIdWithDetails = async (id, options = {}) => {
  return Review.findByPk(id, {
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
    ...options,
  });
};

const findAll = async () => {
  return Review.findAll({
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

const findAllByCarId = async (carId) => {
  return Review.findAll({
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
};

const update = async (review, updateData, options = {}) => {
  return review.update(updateData, options);
};

const destroy = async (review, options = {}) => {
  return review.destroy(options);
};

module.exports = {
  findCarById,
  create,
  findById,
  findByIdWithDetails,
  findAll,
  findAllByCarId,
  update,
  destroy,
};
