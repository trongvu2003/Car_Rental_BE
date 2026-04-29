const User = require("../models/user.model");

const createUser = async (userData) => {
  const newUser = await User.create(userData);
  return newUser;
};

const getAllUsers = async () => {
  const users = await User.findAll();
  return users;
};

module.exports = {
  createUser,
  getAllUsers,
};
