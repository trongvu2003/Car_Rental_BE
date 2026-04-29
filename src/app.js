const express = require("express");
const userRoutes = require("./routes/user.route.js");
const app = express();

// app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Car Rental API is running...");
});

app.use("/api/users", userRoutes);

module.exports = app;
