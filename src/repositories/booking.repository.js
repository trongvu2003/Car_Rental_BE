const { Booking, User, Car, CarImage, Payment } = require("../models");

const findUserById = async (userId, options = {}) => {
  return User.findByPk(userId, options);
};

const findCarById = async (carId, options = {}) => {
  return Car.findByPk(carId, options);
};

const findExistingBooking = async (carId, startDate, endDate, options = {}) => {
  return Booking.findOne({
    where: {
      car_id: carId,
      status: {
        [require("sequelize").Op.not]: "cancelled",
      },
      [require("sequelize").Op.or]: [
        {
          start_date: {
            [require("sequelize").Op.between]: [startDate, endDate],
          },
        },
        {
          end_date: {
            [require("sequelize").Op.between]: [startDate, endDate],
          },
        },
        {
          start_date: {
            [require("sequelize").Op.lte]: startDate,
          },
          end_date: {
            [require("sequelize").Op.gte]: endDate,
          },
        },
      ],
    },
    ...options,
  });
};

const create = async (bookingData, options = {}) => {
  return Booking.create(bookingData, options);
};

const findById = async (bookingId, options = {}) => {
  return Booking.findByPk(bookingId, options);
};

const findByIdWithDetails = async (bookingId, options = {}) => {
  return Booking.findByPk(bookingId, {
    include: [
      {
        model: Car,
        as: "car",
        include: [
          {
            model: CarImage,
            as: "images",
          },
        ],
      },
      {
        model: User,
        as: "user",
        attributes: {
          exclude: ["password"],
        },
      },
    ],
    ...options,
  });
};

const findAll = async () => {
  return Booking.findAll({
    include: [
      {
        model: Car,
        as: "car",
      },
      {
        model: User,
        as: "user",
        attributes: {
          exclude: ["password"],
        },
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const findMyBookings = async (userId) => {
  return Booking.findAll({
    where: {
      user_id: userId,
    },
    include: [
      {
        model: Car,
        as: "car",
        include: [
          {
            model: CarImage,
            as: "images",
            separate: true,
            limit: 1,
            order: [["id", "ASC"]],
          },
        ],
      },
      {
        model: Payment,
        as: "payment",
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const update = async (booking, data, options = {}) => {
  return booking.update(data, options);
};

const deleteById = async (booking, options = {}) => {
  return booking.destroy(options);
};

const deletePaymentByBookingId = async (bookingId, options = {}) => {
  return Payment.destroy({
    where: {
      booking_id: bookingId,
    },
    ...options,
  });
};

module.exports = {
  findUserById,
  findCarById,
  findExistingBooking,
  create,
  findById,
  findByIdWithDetails,
  findAll,
  findMyBookings,
  update,
  deleteById,
  deletePaymentByBookingId,
};
