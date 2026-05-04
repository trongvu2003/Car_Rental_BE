const { Car, CarImage, sequelize } = require("../models");

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

const getAllCarsService = async () => {
  try {
    const cars = await Car.findAll({
      include: [
        {
          model: CarImage,
          as: "images",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return cars;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  createCarService,
  getAllCarsService,
};
