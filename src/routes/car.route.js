const express = require("express");
const router = express.Router();
const carController = require("../controllers/car.controller");
const { uploadCarImages } = require("../middleware/upload");
const authMiddleware = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");

router.post(
  "/",
  authMiddleware,
  isAdmin,
  uploadCarImages.array("images", 10),
  carController.createCar
);
router.get("/", carController.getAllCars);
router.get("/:id", carController.getCarById);
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  uploadCarImages.array("images", 10),
  carController.updateCar
);

router.delete("/:id", authMiddleware, isAdmin, carController.deleteCar);

module.exports = router;
