const { sequelize } = require("../models");
const cloudinary = require("../config/cloudinary");

const carRepository = require("../repositories/car.repository");
const { redisClient } = require("../config/redis");
//Xóa catche
const clearCarListCache = async () => {
  const keys = await redisClient.keys("cars:page=*");

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};
const createCarService = async (carData) => {
  const {
    name,
    brand,
    price_per_day,
    status,
    description,
    year,
    seats,
    fuel_type,
    transmission,
    images,
  } = carData;

  const t = await sequelize.transaction();

  try {
    const newCar = await carRepository.create(
      {
        name,
        brand,
        price_per_day,
        status,
        description,
        year,
        seats,
        fuel_type,
        transmission,
      },
      { transaction: t }
    );

    if (images && images.length > 0) {
      const imageData = images.map((img) => ({
        car_id: newCar.id,
        image_url: img.image_url,
        public_id: img.public_id,
        is_main: img.is_main,
      }));

      await carRepository.createImages(imageData, {
        transaction: t,
      });
    }

    // lấy lại kèm ảnh
    const result = await carRepository.findById(newCar.id, {
      transaction: t,
    });

    await t.commit();
    await clearCarListCache();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getAllCarsService = async (query) => {
  try {
    const { limit, page, status } = query;
    const where = {};

    // filter status
    if (status) {
      where.status = status;
    }

    // pagination
    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;

    const offset = (pageNumber - 1) * pageSize;
    // Tạo key riêng cho từng query
    const cacheKey = `cars:page=${pageNumber}:limit=${pageSize}:status=${
      status || "all"
    }`;
    // 1. Kiểm tra Redis
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Get cars from Redis");
      return JSON.parse(cachedData);
    }
    console.log(" Get cars from Database");
    // 2. Không có cache → query Database
    const { rows, count } = await carRepository.findAndCountAll({
      where,
      limit: pageSize,
      offset,
    });

    const result = {
      data: rows,
      total: count,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(count / pageSize),
    };

    // 3. Lưu vào Redis trong 5 phút
    await redisClient.set(cacheKey, JSON.stringify(result), {
      EX: 300,
    });
    return result;
  } catch (error) {
    throw error;
  }
};

const getCarByIdService = async (carId) => {
  try {
    const car = await carRepository.findById(carId);

    return car;
  } catch (error) {
    throw error;
  }
};

const updateCarService = async (id, updateData, files) => {
  const t = await sequelize.transaction();

  try {
    const car = await carRepository.findById(id, {
      transaction: t,
    });

    if (!car) {
      throw new Error("Car not found");
    }

    await carRepository.update(car, updateData, {
      transaction: t,
    });

    // nếu có upload ảnh mới
    if (files && files.length > 0) {
      for (const image of car.images) {
        console.log("IMAGE DB:", image.toJSON());
        console.log("PUBLIC ID:", image.public_id);

        if (image.public_id) {
          const result = await cloudinary.uploader.destroy(image.public_id);

          console.log("CLOUDINARY DELETE RESULT:", result);
        } else {
          console.log("NO PUBLIC ID FOUND");
        }
      }

      // xóa ảnh cũ DB
      await carRepository.deleteImagesByCarId(id, {
        transaction: t,
      });

      // tạo ảnh mới
      const imageData = files.map((file, index) => {
        console.log("NEW FILE:", file);

        return {
          car_id: id,
          image_url: file.path,
          public_id: file.filename,
          is_main: index === 0,
        };
      });

      // lưu DB
      await carRepository.createImages(imageData, {
        transaction: t,
      });
    }

    // lấy dữ liệu mới nhất
    const updatedCar = await carRepository.findById(id, {
      transaction: t,
    });

    await t.commit();
    await clearCarListCache();
    return updatedCar;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const deleteCarService = async (id) => {
  const t = await sequelize.transaction();

  try {
    const car = await carRepository.findById(id, {
      transaction: t,
    });

    if (!car) {
      throw new Error("Car not found");
    }

    // xóa ảnh trên cloudinary
    for (const image of car.images) {
      if (image.public_id) {
        const result = await cloudinary.uploader.destroy(image.public_id);

        console.log("CLOUDINARY DELETE RESULT:", result);
      }
    }

    // xóa ảnh DB
    await carRepository.deleteImagesByCarId(id, {
      transaction: t,
    });

    // xóa xe
    await carRepository.deleteById(id, {
      transaction: t,
    });

    await t.commit();
    await clearCarListCache();
    return {
      message: "Car deleted successfully",
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  createCarService,
  getAllCarsService,
  getCarByIdService,
  updateCarService,
  deleteCarService,
};
