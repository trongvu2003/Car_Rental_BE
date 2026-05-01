const authService = require("../services/auth.service");

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Lỗi đăng ký", error: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.login(email, password);
    res.status(200).json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Lỗi đăng nhập", error: e.message });
  }
};

module.exports = {
  register,
  login,
};
