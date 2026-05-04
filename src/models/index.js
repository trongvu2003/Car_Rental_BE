const sequelize = require("../config/database");
const Car = require("./car.model");
const CarImage = require("./carImage.model");

// quan hệ
Car.hasMany(CarImage, {
  foreignKey: "car_id",
  as: "images",
});

CarImage.belongsTo(Car, {
  foreignKey: "car_id",
});

module.exports = {
  sequelize,
  Car,
  CarImage,
};
