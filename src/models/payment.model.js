const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    booking_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    payment_method: {
      type: DataTypes.ENUM("cash", "vnpay", "momo"),
      allowNull: false,
    },

    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
    },

    transaction_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

module.exports = Payment;
