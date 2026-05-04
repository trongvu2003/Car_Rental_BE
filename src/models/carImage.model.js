const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CarImage = sequelize.define(
  "CarImage",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    car_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_main: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "car_images",
    timestamps: true,
  }
);

module.exports = CarImage;
