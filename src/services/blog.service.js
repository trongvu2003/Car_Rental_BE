const { Blog, BlogImage, sequelize } = require("../models");
const cloudinary = require("../config/cloudinary");
const { Op } = require("sequelize");

const createBlogService = async (blogData) => {
  const { title, excerpt, content, isPublished, publishedAt, images } =
    blogData;

  const t = await sequelize.transaction();

  try {
    const newBlog = await Blog.create(
      {
        title,
        excerpt,
        content,
        isPublished,
        publishedAt,
      },
      { transaction: t }
    );

    if (images && images.length > 0) {
      const imageData = images.map((img, index) => ({
        blog_id: newBlog.id,
        image_url: img.image_url,
        public_id: img.public_id,
        is_main: index === 0,
      }));

      await BlogImage.bulkCreate(imageData, { transaction: t });
    }

    const result = await Blog.findByPk(newBlog.id, {
      include: {
        model: BlogImage,
        as: "images",
      },
      transaction: t,
    });

    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getAllBlogsService = async (query) => {
  try {
    const { limit, page, isPublished, search } = query;
    const where = {};

    if (isPublished !== undefined) {
      where.isPublished = isPublished === "true" || isPublished === true;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 10;
    const offset = (pageNumber - 1) * pageSize;

    const { rows, count } = await Blog.findAndCountAll({
      where,
      include: [
        {
          model: BlogImage,
          as: "images",
        },
      ],
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      data: rows,
      total: count,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  } catch (error) {
    throw error;
  }
};

const getBlogByIdService = async (id, options = {}) => {
  try {
    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: BlogImage,
          as: "images",
        },
      ],
    });

    if (blog && options.increaseView) {
      await blog.increment("viewCount");
    }

    return blog;
  } catch (error) {
    throw error;
  }
};

const updateBlogService = async (id, updateData, files) => {
  const t = await sequelize.transaction();
  try {
    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: BlogImage,
          as: "images",
        },
      ],
      transaction: t,
    });

    if (!blog) {
      throw new Error("Blog not found");
    }

    await blog.update(updateData, { transaction: t });

    if (files && files.length > 0) {
      for (const image of blog.images) {
        if (image.public_id) {
          const result = await cloudinary.uploader.destroy(image.public_id);
          console.log("CLOUDINARY DELETE RESULT:", result);
        } else {
          console.log("NO PUBLIC ID FOUND");
        }
      }

      await BlogImage.destroy({
        where: { blog_id: id },
        transaction: t,
      });

      const imageData = files.map((file, index) => ({
        blog_id: id,
        image_url: file.path,
        public_id: file.filename,
        is_main: index === 0,
      }));

      await BlogImage.bulkCreate(imageData, { transaction: t });
    }

    const updatedBlog = await Blog.findByPk(id, {
      include: [
        {
          model: BlogImage,
          as: "images",
        },
      ],
      transaction: t,
    });

    await t.commit();
    return updatedBlog;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const deleteBlogService = async (id) => {
  const t = await sequelize.transaction();
  try {
    const blog = await Blog.findByPk(id, {
      include: [
        {
          model: BlogImage,
          as: "images",
        },
      ],
      transaction: t,
    });

    if (!blog) {
      throw new Error("Blog not found");
    }

    for (const image of blog.images) {
      if (image.public_id) {
        const result = await cloudinary.uploader.destroy(image.public_id);
        console.log("CLOUDINARY DELETE RESULT:", result);
      }
    }

    await BlogImage.destroy({
      where: { blog_id: id },
      transaction: t,
    });

    await Blog.destroy({
      where: { id },
      transaction: t,
    });

    await t.commit();
    return { message: "Xóa bài viết thành công" };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = {
  createBlogService,
  getAllBlogsService,
  getBlogByIdService,
  updateBlogService,
  deleteBlogService,
};
