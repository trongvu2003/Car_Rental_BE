const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const { uploadBlogImages } = require("../middleware/upload");

router.post(
  "/",
  uploadBlogImages.array("images", 10),
  blogController.createBlog
);

router.get("/", blogController.getAllBlogs);

router.get("/:id", blogController.getBlogById);

router.put(
  "/:id",
  uploadBlogImages.array("images", 10),
  blogController.updateBlog
);

router.delete("/:id", blogController.deleteBlog);

module.exports = router;
