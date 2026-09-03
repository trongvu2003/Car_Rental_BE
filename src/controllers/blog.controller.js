const BlogService = require("../services/blog.service");

const createBlog = async (req, res) => {
  try {
    const bodyData = req.body;
    const files = req.files;

    if (typeof bodyData.isPublished === "string") {
      bodyData.isPublished =
        bodyData.isPublished === "true" || bodyData.isPublished === "1";
    }

    let imagesData = [];
    if (files && files.length > 0) {
      imagesData = files.map((file, index) => ({
        image_url: file.path,
        public_id: file.filename,
        is_main: index === 0,
      }));
    }

    const blogDataToSave = {
      ...bodyData,
      images: imagesData,
    };

    const newBlog = await BlogService.createBlogService(blogDataToSave);
    res.status(201).json({ success: true, data: newBlog });
  } catch (error) {
    console.error("ERROR:", error);

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await BlogService.getAllBlogsService(req.query);
    return res.status(200).json({ success: true, ...blogs });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const increaseView = req.query.increaseView !== "false";

    const blog = await BlogService.getBlogByIdService(blogId, {
      increaseView,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }
    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    if (typeof req.body.isPublished === "string") {
      req.body.isPublished =
        req.body.isPublished === "true" || req.body.isPublished === "1";
    }

    const updatedBlog = await BlogService.updateBlogService(
      req.params.id,
      req.body,
      req.files
    );

    return res.status(200).json({ success: true, data: updatedBlog });
  } catch (error) {
    console.error("ERROR:", error);

    if (error.message === "Blog not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const result = await BlogService.deleteBlogService(req.params.id);
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("ERROR:", error);
    if (error.message === "Blog not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
