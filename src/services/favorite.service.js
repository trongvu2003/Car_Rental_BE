const { sequelize } = require("../models");

const favoriteRepository = require("../repositories/favorite.repository");

const addFavoriteService = async (user_id, car_id) => {
  const t = await sequelize.transaction();

  try {
    const existing = await favoriteRepository.findOne(
      {
        user_id,
        car_id,
      },
      {
        transaction: t,
      }
    );

    if (existing) {
      throw new Error("Car already in favorites");
    }

    const favorite = await favoriteRepository.create(
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
    return await favoriteRepository.findAll(user_id);
  } catch (e) {
    throw e;
  }
};

const removeFavoriteService = async (user_id, car_id) => {
  const t = await sequelize.transaction();

  try {
    const favorite = await favoriteRepository.findOne(
      {
        user_id,
        car_id,
      },
      {
        transaction: t,
      }
    );

    if (!favorite) {
      throw new Error("Favorite not found");
    }

    await favoriteRepository.destroy(favorite, {
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
