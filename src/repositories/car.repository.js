const { Car, CarImage } = require("../models");

const create = async (data, options = {}) => {
  return Car.create(data, options);
};

const createImages = async (imageData, options = {}) => {
  return CarImage.bulkCreate(imageData, options);
};

const findById = async (id, options = {}) => {
  return Car.findByPk(id, {
    include: [
      {
        model: CarImage,
        as: "images",
      },
    ],
    transaction: options.transaction,
  });
};

const findAndCountAll = async ({ where, limit, offset }) => {
  return Car.findAndCountAll({
    where,
    include: [
      {
        model: CarImage,
        as: "images",
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};

const update = async (car, updateData, options = {}) => {
  return car.update(updateData, options);
};

const deleteImagesByCarId = async (id, options = {}) => {
  return CarImage.destroy({
    where: {
      car_id: id,
    },
    ...options,
  });
};

const deleteById = async (id, options = {}) => {
  return Car.destroy({
    where: {
      id,
    },
    ...options,
  });
};

module.exports = {
  create,
  createImages,
  findById,
  findAndCountAll,
  update,
  deleteImagesByCarId,
  deleteById,
};
