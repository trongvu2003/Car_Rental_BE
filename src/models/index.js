const sequelize = require("../config/database");
const Car = require("./car.model");
const User = require("./user.model");
const Booking = require("./booking.model");
const CarImage = require("./carImage.model");
const Review = require("../models/review.model");
const Favorite = require("../models/favorite.model");

// quan hệ
Car.hasMany(CarImage, {
  foreignKey: "car_id",
  as: "images",
});

CarImage.belongsTo(Car, {
  foreignKey: "car_id",
});

User.hasMany(Booking, {
  foreignKey: "user_id",
  as: "bookings",
});

Booking.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Car.hasMany(Booking, {
  foreignKey: "car_id",
  as: "bookings",
});

Booking.belongsTo(Car, {
  foreignKey: "car_id",
  as: "car",
});

User.hasMany(Review, {
  foreignKey: "user_id",
  as: "Reviews",
});

Review.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Car.hasMany(Review, {
  foreignKey: "car_id",
  as: "reviews",
});

Review.belongsTo(Car, {
  foreignKey: "car_id",
  as: "car",
});

Favorite.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Favorite.belongsTo(Car, {
  foreignKey: "car_id",
  as: "car",
});

User.hasMany(Favorite, {
  foreignKey: "user_id",
  as: "favorites",
});

Car.hasMany(Favorite, {
  foreignKey: "car_id",
  as: "favorites",
});

module.exports = {
  sequelize,
  Car,
  CarImage,
  User,
  Booking,
  Review,
  Favorite,
};
