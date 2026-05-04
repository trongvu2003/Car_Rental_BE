const CarService = require("../services/car.service");

const createCar = async (req, res) => {
  try {
    const bodyData = req.body;
    const files = req.files; // Bắt mảng file từ middleware uploadCarImages
    console.log("Data files:", req.files);
    // Biến mảng files thành mảng object đúng chuẩn model CarImage
    let imagesData = [];
    if (files && files.length > 0) {
      imagesData = files.map((file, index) => ({
        image_url: file.path,
        is_main: index === 0,
      }));
    }

    //Gộp text data và mảng ảnh lại
    const carDataToSave = {
      ...bodyData,
      images: imagesData,
    };
    const newCar = await CarService.createCarService(carDataToSave);
    res.status(201).json(newCar);
  } catch (error) {
    console.error("ERROR:", error);
    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllCars = async (req, res) => {
  try {
    const cars = await CarService.getAllCarsService();
    return res.status(200).json({
      success: true,
      data: cars,
    });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCar,
  getAllCars,
};
