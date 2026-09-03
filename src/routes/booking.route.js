const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const authMiddleware = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");

router.get("/my-bookings", authMiddleware, bookingController.getMyBookings);
router.post("/", authMiddleware, bookingController.createBookingController);
router.get(
  "/",
  authMiddleware,
  isAdmin,
  bookingController.getAllBookingsController
);
router.get("/:id", authMiddleware, bookingController.getBookingByIdController);
router.put(
  "/:id/status",
  authMiddleware,
  isAdmin,
  bookingController.updateBookingStatusController
);
router.delete(
  "/:id",
  authMiddleware,
  isAdmin,
  bookingController.deleteBookingController
);

module.exports = router;
