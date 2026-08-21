const authService = require("../services/auth.service");

const COOKIE_OPTIONS = {
  httpOnly: true, // JS phía frontend không đọc được — chống XSS đánh cắp token
  secure: process.env.NODE_ENV === "production", // bắt buộc HTTPS ở production
  sameSite: "lax", // dùng "none" nếu FE/BE khác domain hẳn (kèm secure: true bắt buộc)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày, khớp expiresIn của jwt.sign
};

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

    // Set cookie thay vì trả token trong JSON body
    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(200).json({ user });
  } catch (e) {
    console.error(e);
    res.status(400).json({ message: "Lỗi đăng nhập", error: e.message });
  }
};

const me = async (req, res) => {
  try {
    // req.user được authMiddleware gắn vào sau khi verify cookie
    const user = await authService.getById(req.user.id);
    res.status(200).json({ user });
  } catch (e) {
    console.error(e);
    res.status(404).json({ message: "Không tìm thấy người dùng" });
  }
};

const logout = async (_req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ message: "Đã đăng xuất" });
};

module.exports = {
  register,
  login,
  me,
  logout,
};
