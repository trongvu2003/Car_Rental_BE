const userService = require("../services/user.service");

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = await userService.createUser({ name, email, password });
    res.status(201).json(newUser);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Lỗi tạo người dùng", error: e.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Lỗi lấy danh sách người dùng", error: e.message });
  }
};

module.exports = { createUser, getAllUsers };
