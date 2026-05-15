const express = require("express");
const router = express.Router();
const FavoriteController = require("../controllers/favorite.controller");

router.post("/", FavoriteController.addFavorite);
router.get("/:userId", FavoriteController.getFavorites);
router.delete("/:userId/:carId", FavoriteController.removeFavorite);

module.exports = router;
