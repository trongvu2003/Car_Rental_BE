const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");

router.post("/", userController.createUser);
router.get("/", authMiddleware, isAdmin, userController.getAllUsers);
router.get("/:id", authMiddleware, userController.getUserById);
router.put("/:id", authMiddleware, isAdmin, userController.updateUser);
router.delete("/:id", authMiddleware, isAdmin, userController.deleteUser);
module.exports = router;
