const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Định nghĩa storage dành riêng cho upload ảnh xe
const carStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "car_rental_images",
    allowedFormats: ["jpeg", "png", "jpg", "webp"],
  },
});
// Định nghĩa storage dành riêng cho upload ảnh blog
const blogStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog_images",
    allowedFormats: ["jpeg", "png", "jpg", "webp"],
  },
});

// Tạo middleware multer tương ứng
const uploadCarImages = multer({ storage: carStorage });
const uploadBlogImages = multer({ storage: blogStorage });

module.exports = {
  uploadCarImages,
  uploadBlogImages,
};
