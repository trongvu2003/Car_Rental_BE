const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Chưa xác thực (Unauthorized)" });
  }
  // Kiểm tra role
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message:
        "Truy cập bị từ chối. Chỉ Admin mới có quyền thực hiện hành động này!",
    });
  }
  next();
};

module.exports = isAdmin;
