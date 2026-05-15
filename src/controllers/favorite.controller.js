const FavoriteService = require("../services/favorite.service");

const addFavorite = async (req, res) => {
  try {
    const { user_id, car_id } = req.body;

    const favorite = await FavoriteService.addFavoriteService(user_id, car_id);

    return res.status(201).json({
      message: "Added to favorites",
      data: favorite,
    });
  } catch (e) {
    return res.status(400).json({
      message: e.message,
    });
  }
};

const getFavorites = async (req, res) => {
  try {
    const favorites = await FavoriteService.getFavoritesService(
      req.params.userId
    );

    return res.status(200).json(favorites);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { userId, carId } = req.params;

    const result = await FavoriteService.removeFavoriteService(userId, carId);

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    });
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite,
};
