const BookingService = require("../services/booking.service");

const createBookingController = async (req, res) => {
  try {
    const bookingData = req.body;
    const newBooking = await BookingService.createBookingService(bookingData);
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllBookingsController = async (req, res) => {
  try {
    const bookings = await BookingService.getAllBookingsService();
    return res.status(200).json(bookings);
  } catch (error) {
    console.error("ERROR:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

const getBookingByIdController = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await BookingService.getBookingByIdService(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.status(200).json(booking);
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

const updateBookingStatusController = async (req, res) => {
  try {
    const booking = await BookingService.updateBookingStatusService(
      req.params.id,
      req.body.status
    );

    return res.json(booking);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const deleteBookingController = async (req, res) => {
  try {
    const result = await BookingService.deleteBookingService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
module.exports = {
  createBookingController,
  getAllBookingsController,
  getBookingByIdController,
  updateBookingStatusController,
  deleteBookingController,
};
