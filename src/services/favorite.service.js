const { Favorite, Car, sequelize } = require("../models");

const addFavoriteService = async (user_id, car_id) => {
  const t = await sequelize.transaction();

  try {
    const existing = await Favorite.findOne({
      where: {
        user_id,
        car_id,
      },
      transaction: t,
    });

    if (existing) {
      throw new Error("Car already in favorites");
    }

    const favorite = await Favorite.create(
      {
        user_id,
        car_id,
      },
      {
        transaction: t,
      }
    );

    await t.commit();

    return favorite;
  } catch (e) {
    await t.rollback();
    throw e;
  }
};

const getFavoritesService = async (user_id) => {
  try {
    return await Favorite.findAll({
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
  } catch (e) {
    throw e;
  }
};

const removeFavoriteService = async (user_id, car_id) => {
  const t = await sequelize.transaction();

  try {
    const favorite = await Favorite.findOne({
      where: {
        user_id,
        car_id,
      },
      transaction: t,
    });

    if (!favorite) {
      throw new Error("Favorite not found");
    }

    await favorite.destroy({
      transaction: t,
    });

    await t.commit();

    return {
      message: "Removed from favorites",
    };
  } catch (e) {
    await t.rollback();
    throw e;
  }
};

module.exports = {
  addFavoriteService,
  getFavoritesService,
  removeFavoriteService,
};
