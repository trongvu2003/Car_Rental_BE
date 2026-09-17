const { Booking } = require("../models");
const { Op } = require("sequelize");

const bookingRepository = require("../repositories/booking.repository");

const createBookingService = async (bookingData) => {
  const t = await Booking.sequelize.transaction();

  try {
    const { user_id, car_id, start_date, end_date } = bookingData;

    const user = await bookingRepository.findUserById(user_id, {
      transaction: t,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const car = await bookingRepository.findCarById(car_id, {
      transaction: t,
    });

    if (!car) {
      throw new Error("Car not found");
    }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new Error("Start date must be before end date");
    }

    // kiểm tra xe đã được đặt chưa
    const existingBooking = await bookingRepository.findExistingBooking(
      car_id,
      start_date,
      end_date,
      {
        transaction: t,
      }
    );

    if (existingBooking) {
      throw new Error("Car already booked");
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const totalDays =
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const total_price = totalDays * car.price_per_day;

    const booking = await bookingRepository.create(
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

    const result = await bookingRepository.findByIdWithDetails(booking.id, {
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
    return await bookingRepository.findAll();
  } catch (error) {
    throw error;
  }
};

const getBookingByIdService = async (bookingId) => {
  try {
    const booking = await bookingRepository.findByIdWithDetails(bookingId);

    return booking;
  } catch (error) {
    throw error;
  }
};

const updateBookingStatusService = async (bookingId, status) => {
  const t = await Booking.sequelize.transaction();

  try {
    const booking = await bookingRepository.findById(bookingId, {
      transaction: t,
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // const validStatus = ["pending", "confirmed", "completed", "cancelled"];

    // if (!validStatus.includes(status)) {
    //   throw new Error("Invalid booking status");
    // }

    await bookingRepository.update(
      booking,
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
    const booking = await bookingRepository.findById(bookingId, {
      transaction: t,
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    await bookingRepository.deletePaymentByBookingId(bookingId, {
      transaction: t,
    });

    await bookingRepository.deleteById(booking, {
      transaction: t,
    });

    await t.commit();

    return {
      message: "Booking deleted successfully",
    };
  } catch (error) {
    if (t) {
      await t.rollback();
    }

    throw error;
  }
};

const getMyBookingsService = async (userId) => {
  const bookings = await bookingRepository.findMyBookings(userId);

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
