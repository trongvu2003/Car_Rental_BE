const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const { uploadBlogImages } = require("../middleware/upload");
const authMiddleware = require("../middleware/auth.middleware");
const isAdmin = require("../middleware/admin.middleware");

router.post(
  "/",
  authMiddleware,
  isAdmin,
  uploadBlogImages.array("images", 10),
  blogController.createBlog
);

router.get("/", blogController.getAllBlogs);

router.get("/:id", blogController.getBlogById);

router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  uploadBlogImages.array("images", 10),
  blogController.updateBlog
);

router.delete("/:id", authMiddleware, isAdmin, blogController.deleteBlog);

module.exports = router;
