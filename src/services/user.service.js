const userRepository = require("../repositories/user.repository");

const createUser = async (userData) => {
  const newUser = await userRepository.create(userData);

  return newUser;
};

const getAllUsers = async () => {
  const users = await userRepository.getAllUsers();

  return users;
};

const getUserById = async (id) => {
  const user = await userRepository.getUserById(id);

  return user;
};

const updateUser = async (id, userData) => {
  const user = await userRepository.updateUser(id, userData);

  return user;
};

const deleteUser = async (id) => {
  const result = await userRepository.deleteUser(id);

  return result;
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
