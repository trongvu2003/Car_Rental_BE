const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
  }
  //   {
  //     tableName: "users", // Tên bảng trong Database
  //     timestamps: true, // Tự động thêm 2 cột: createdAt và updatedAt
  //   }
);

module.exports = User;
