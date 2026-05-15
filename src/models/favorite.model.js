const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Favorite = sequelize.define(
  "Favorite",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    car_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "favorites",
    timestamps: true,
  }
);

module.exports = Favorite;
