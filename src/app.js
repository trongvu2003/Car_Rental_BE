const express = require("express");
const userRoutes = require("./routes/user.route.js");
const authRoutes = require("./routes/auth.route.js");
const carsRoutes = require("./routes/car.route.js");
const bookingRoutes = require("./routes/booking.route.js");
const reviewRoutes = require("./routes/review.route.js");
const favoriteRoutes = require("./routes/favorite.routes.js");
const paymentRoutes = require("../src/routes/payment.routes.js");
const blogRoutes = require("./routes/blog.route.js");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

// - credentials: true để trình duyệt được phép gửi/nhận cookie cross-origin
// - origin PHẢI là domain cụ thể (không được để mặc định "*") khi dùng credentials
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Car Rental API is running...");
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cars", carsRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/blogs", blogRoutes);
module.exports = app;
