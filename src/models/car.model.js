const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Car = sequelize.define(
  "Car",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Tên xe không được để trống" },
      },
    },

    brand: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Hãng xe không được để trống" },
      },
    },

    price_per_day: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        isFloat: { msg: "Giá thuê phải là số" },
        min: {
          args: [0],
          msg: "Giá thuê phải >= 0",
        },
      },
    },

    status: {
      type: DataTypes.ENUM("available", "rented", "maintenance"),
      defaultValue: "available",
    },

    description: {
      type: DataTypes.TEXT,
    },

    year: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1900,
        max: new Date().getFullYear(),
      },
    },

    seats: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
      },
    },

    fuel_type: {
      type: DataTypes.ENUM("gasoline", "diesel", "electric"),
    },

    transmission: {
      type: DataTypes.ENUM("manual", "automatic"),
    },
  },
  {
    tableName: "cars",
    timestamps: true,
  }
);

module.exports = Car;
