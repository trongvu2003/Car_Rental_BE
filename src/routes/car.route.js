const express = require("express");
const router = express.Router();
const carController = require("../controllers/car.controller");
const { uploadCarImages } = require("../middleware/upload");

router.post("/", uploadCarImages.array("images", 10), carController.createCar);
router.get("/", carController.getAllCars);

module.exports = router;
