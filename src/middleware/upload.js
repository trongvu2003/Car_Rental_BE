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

// Tạo middleware multer tương ứng
const uploadCarImages = multer({ storage: carStorage });

module.exports = {
  uploadCarImages,
};
