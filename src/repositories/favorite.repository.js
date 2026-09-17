const { Favorite, Car } = require("../models");

const findOne = async (where, options = {}) => {
  return Favorite.findOne({
    where,
    ...options,
  });
};

const create = async (data, options = {}) => {
  return Favorite.create(data, options);
};

const findAll = async (user_id) => {
  return Favorite.findAll({
    where: {
      user_id,
    },
    include: [
      {
        model: Car,
        as: "car",
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const destroy = async (favorite, options = {}) => {
  return favorite.destroy(options);
};

module.exports = {
  findOne,
  create,
  findAll,
  destroy,
};
