const { Booking, User, Car, CarImage, Payment } = require("../models");
const { Op } = require("sequelize");

const createBookingService = async (bookingData) => {
  const t = await Booking.sequelize.transaction();
  try {
    const { user_id, car_id, start_date, end_date } = bookingData;

    const user = await User.findByPk(user_id, { transaction: t });
    if (!user) {
      throw new Error("User not found");
    }
    const car = await Car.findByPk(car_id, { transaction: t });
    if (!car) {
      throw new Error("Car not found");
    }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new Error("Start date must be before end date");
    }
    // kiểm tra xe đã được đặt chưa
    const existingBooking = await Booking.findOne({
      where: {
        car_id,
        status: {
          [Op.not]: "cancelled",
        },
        [Op.or]: [
          {
            start_date: {
              [Op.between]: [start_date, end_date],
            },
          },
          {
            end_date: {
              [Op.between]: [start_date, end_date],
            },
          },
          {
            start_date: {
              [Op.lte]: start_date,
            },
            end_date: {
              [Op.gte]: end_date,
            },
          },
        ],
      },
      transaction: t,
    });

    if (existingBooking) {
      throw new Error("Car already booked");
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const totalDays =
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const total_price = totalDays * car.price_per_day;

    const booking = await Booking.create(
      {
        user_id,
        car_id,
        start_date,
        end_date,
        total_price,
      },
      {
        transaction: t,
      }
    );
    const result = await Booking.findByPk(booking.id, {
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
      transaction: t,
    });

    await t.commit();

    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// GET ALL BOOKINGS
const getAllBookingsService = async () => {
  try {
    return await Booking.findAll({
      include: [
        {
          model: Car,
          as: "car",
        },
        {
          model: User,
          as: "user",
          attributes: {
            exclude: ["password"], // loại bỏ trường password khi trả về thông tin user
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  } catch (error) {
    throw error;
  }
};

const getBookingByIdService = async (bookingId) => {
  try {
    const booking = await Booking.findByPk(bookingId, {
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
    });
    return booking;
  } catch (error) {
    throw error;
  }
};

const updateBookingStatusService = async (bookingId, status) => {
  const t = await Booking.sequelize.transaction();

  try {
    const booking = await Booking.findByPk(bookingId, {
      transaction: t,
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // const validStatus = ["pending", "confirmed", "completed", "cancelled"];

    // if (!validStatus.includes(status)) {
    //   throw new Error("Invalid booking status");
    // }

    await booking.update(
      {
        status,
      },
      {
        transaction: t,
      }
    );

    await t.commit();

    return booking;
  } catch (error) {
    if (t) {
      await t.rollback();
    }

    throw error;
  }
};

const deleteBookingService = async (bookingId) => {
  const t = await Booking.sequelize.transaction();
  try {
    const booking = await Booking.findByPk(bookingId, {
      transaction: t,
    });
    if (!booking) {
      throw new Error("Booking not found");
    }
    await Payment.destroy({
      where: { booking_id: bookingId },
      transaction: t,
    });
    await booking.destroy({
      transaction: t,
    });
    await t.commit();
    return { message: "Booking deleted successfully" };
  } catch (error) {
    if (t) {
      await t.rollback();
    }
    throw error;
  }
};

const getMyBookingsService = async (userId) => {
  const bookings = await Booking.findAll({
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

  return bookings;
};

module.exports = {
  createBookingService,
  getAllBookingsService,
  getBookingByIdService,
  updateBookingStatusService,
  deleteBookingService,
  getMyBookingsService,
};
