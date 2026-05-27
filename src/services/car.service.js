const { Car, CarImage, sequelize } = require("../models");
const cloudinary = require("../config/cloudinary");

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
    const newCar = await Car.create(
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

      await CarImage.bulkCreate(imageData, { transaction: t });
    }

    // lấy lại kèm ảnh
    const result = await Car.findByPk(newCar.id, {
      include: {
        model: CarImage,
        as: "images",
      },
      transaction: t,
    });

    await t.commit();
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
    const { rows, count } = await Car.findAndCountAll({
      where,
      include: [
        {
          model: CarImage,
          as: "images",
        },
      ],

      limit: pageSize,
      offset,

      order: [["createdAt", "DESC"]],
    });

    return {
      data: rows,
      total: count,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  } catch (error) {
    throw error;
  }
};

const getCarByIdService = async (carId) => {
  try {
    const car = await Car.findByPk(carId, {
      include: [
        {
          model: CarImage,
          as: "images",
        },
      ],
    });
    return car;
  } catch (error) {
    throw error;
  }
};

const updateCarService = async (id, updateData, files) => {
  const t = await sequelize.transaction();
  try {
    const car = await Car.findByPk(id, {
      include: [
        {
          model: CarImage,
          as: "images",
        },
      ],
      transaction: t,
    });

    if (!car) {
      throw new Error("Car not found");
    }
    await car.update(updateData, {
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
      await CarImage.destroy({
        where: {
          car_id: id,
        },
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
      await CarImage.bulkCreate(imageData, {
        transaction: t,
      });
    }

    // lấy dữ liệu mới nhất
    const updatedCar = await Car.findByPk(id, {
      include: [
        {
          model: CarImage,
          as: "images",
        },
      ],
      transaction: t,
    });

    await t.commit();

    return updatedCar;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const deleteCarService = async (id) => {
  const t = await sequelize.transaction();
  try {
    const car = await Car.findByPk(id, {
      include: [
        {
          model: CarImage,
          as: "images",
        },
      ],
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
    await CarImage.destroy({
      where: {
        car_id: id,
      },
      transaction: t,
    });

    // xóa xe
    await Car.destroy({
      where: {
        id,
      },
      transaction: t,
    });

    await t.commit();
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
