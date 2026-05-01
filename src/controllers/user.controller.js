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

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    res.status(200).json(user);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Lỗi lấy thông tin người dùng", error: e.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const updatedUser = await userService.updateUser(id, {
      name,
      email,
      password,
    });
    res.status(200).json(updatedUser);
  } catch (e) {
    console.error(e);
    if (e.name === "SequelizeValidationError") {
      const errors = e.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    if (e.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Email đã tồn tại",
      });
    }

    res.status(500).json({
      message: "Lỗi server",
      error: e.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id);
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi xóa người dùng", error: e.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
