const { Payment, Booking } = require("../models");

const findBookingById = async (booking_id, options = {}) => {
  return Booking.findByPk(booking_id, options);
};

const create = async (data, options = {}) => {
  return Payment.create(data, options);
};

const findById = async (id, options = {}) => {
  return Payment.findByPk(id, options);
};

const findByIdWithBooking = async (id, options = {}) => {
  return Payment.findByPk(id, {
    include: [{ model: Booking, as: "booking" }],
    ...options,
  });
};

const update = async (payment, data, options = {}) => {
  return payment.update(data, options);
};

const updateBooking = async (booking_id, data, options = {}) => {
  return Booking.update(data, {
    where: {
      id: booking_id,
    },
    ...options,
  });
};

module.exports = {
  findBookingById,
  create,
  findById,
  findByIdWithBooking,
  update,
  updateBooking,
};
