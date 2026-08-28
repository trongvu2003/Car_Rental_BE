const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const authMiddleware = require("../middleware/auth.middleware");
router.get("/my-bookings", authMiddleware, bookingController.getMyBookings);
router.post("/", bookingController.createBookingController);
router.get("/", bookingController.getAllBookingsController);
router.get("/:id", bookingController.getBookingByIdController);
router.put("/:id/status", bookingController.updateBookingStatusController);
router.delete("/:id", bookingController.deleteBookingController);

module.exports = router;
