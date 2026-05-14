const express = require("express");
const userRoutes = require("./routes/user.route.js");
const authRoutes = require("./routes/auth.route.js");
const carsRoutes = require("./routes/car.route.js");
const bookingRoutes = require("./routes/booking.route.js");
const reviewRoutes = require("./routes/review.route.js");
const app = express();

// app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Car Rental API is running...");
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cars", carsRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
module.exports = app;
