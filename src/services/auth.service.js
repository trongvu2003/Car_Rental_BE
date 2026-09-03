const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const sanitizeUser = (user) => {
  const plain = user.toJSON ? user.toJSON() : user;
  const { password, ...safeUser } = plain;
  return safeUser;
};

const register = async (userData) => {
  const { name, email, password, role } = userData;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("Email đã tồn tại");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // BẢO MẬT: Nếu gọi từ API đăng ký công khai (auth/register), luôn ép role là "user"
  // Việc tạo "admin" nên được thực hiện ở API riêng hoặc sửa trực tiếp DB ban đầu.
  const assignedRole = role === "admin" ? "user" : role || "user";

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: assignedRole, // Lưu role vào DB
  });

  return sanitizeUser(newUser);
};

const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("Email không tồn tại");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error("Mật khẩu không đúng");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role, // Giúp middleware đọc được quyền mà không cần gọi DB
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token, user: sanitizeUser(user) };
};

const getById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }
  return sanitizeUser(user);
};

module.exports = {
  register,
  login,
  getById,
};
