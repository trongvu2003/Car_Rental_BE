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
      allowNull: false,
      validate: {
        notEmpty: { msg: "Tên không được để trống" },
        notNull: {
          msg: "Name không được để trống",
        },
        isString(value) {
          if (typeof value !== "string") {
            throw new Error("Name phải là string");
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Email không được để trống" },
        isEmail: { msg: "Email không hợp lệ" },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Mật khẩu không được để trống" },
        len: {
          args: [6, 100],
          msg: "Mật khẩu phải có độ dài từ 6 ký tự trở lên",
        },
      },
    },
  }
  //   {
  //     tableName: "users", // Tên bảng trong Database
  //     timestamps: true, // Tự động thêm 2 cột: createdAt và updatedAt
  //   }
);

module.exports = User;
