const express = require("express");
const router = express.Router();
const carController = require("../controllers/car.controller");
const { uploadCarImages } = require("../middleware/upload");

router.post("/", uploadCarImages.array("images", 10), carController.createCar);
router.get("/", carController.getAllCars);
router.get("/:id", carController.getCarById);
router.put(
  "/:id",
  uploadCarImages.array("images", 10),
  carController.updateCar
);

router.delete("/:id", carController.deleteCar);

module.exports = router;
