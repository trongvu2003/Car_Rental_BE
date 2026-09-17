const User = require("../models/user.model");

const findByEmail = async (email) => {
  return User.findOne({ where: { email } });
};

const findById = async (id) => {
  return User.findByPk(id);
};

const create = async (data) => {
  return User.create(data);
};

const getAllUsers = async () => {
  return User.findAll();
};

const getUserById = async (id) => {
  return User.findByPk(id);
};

const updateUser = async (id, userData) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error("User not found");
  }

  await user.update(userData);

  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error("User not found");
  }

  await user.destroy();

  return {
    message: "User deleted successfully",
  };
};

module.exports = {
  findByEmail,
  findById,
  create,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
