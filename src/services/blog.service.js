const { sequelize } = require("../models");
const cloudinary = require("../config/cloudinary");
const { Op } = require("sequelize");

const blogRepository = require("../repositories/blog.repository");
const { redisClient } = require("../config/redis");
const clearBlogListCache = async () => {
  const keys = await redisClient.keys("blogs:page=*");

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};
const createBlogService = async (blogData) => {
  const { title, excerpt, content, isPublished, publishedAt, images } =
    blogData;

  const t = await sequelize.transaction();

  try {
    const newBlog = await blogRepository.create(
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

      await blogRepository.createImages(imageData, {
        transaction: t,
      });
    }

    const result = await blogRepository.findById(newBlog.id, {
      transaction: t,
    });

    await t.commit();
    await clearBlogListCache();
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

    const cacheKey = `blogs:page=${pageNumber}:limit=${pageSize}:isPublished=${
      isPublished ?? "all"
    }:search=${search || "all"}`;

    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log("Get blogs from Redis");
      return JSON.parse(cachedData);
    }

    console.log("Get blogs from Database");
    const { rows, count } = await blogRepository.findAndCountAll({
      where,
      limit: pageSize,
      offset,
    });

    const result = {
      data: rows,
      total: count,
      page: pageNumber,
      limit: pageSize,
      totalPages: Math.ceil(count / pageSize),
    };

    await redisClient.set(cacheKey, JSON.stringify(result), {
      EX: 300,
    });

    return result;
  } catch (error) {
    throw error;
  }
};

const getBlogByIdService = async (id, options = {}) => {
  try {
    const blog = await blogRepository.findById(id);

    if (blog && options.increaseView) {
      await blogRepository.incrementView(blog);
    }

    return blog;
  } catch (error) {
    throw error;
  }
};

const updateBlogService = async (id, updateData, files) => {
  const t = await sequelize.transaction();

  try {
    const blog = await blogRepository.findById(id, {
      transaction: t,
    });

    if (!blog) {
      throw new Error("Blog not found");
    }

    await blogRepository.updateById(blog, updateData, {
      transaction: t,
    });

    if (files && files.length > 0) {
      for (const image of blog.images) {
        if (image.public_id) {
          const result = await cloudinary.uploader.destroy(image.public_id);

          console.log("CLOUDINARY DELETE RESULT:", result);
        } else {
          console.log("NO PUBLIC ID FOUND");
        }
      }

      await blogRepository.deleteImagesByBlogId(id, {
        transaction: t,
      });

      const imageData = files.map((file, index) => ({
        blog_id: id,
        image_url: file.path,
        public_id: file.filename,
        is_main: index === 0,
      }));

      await blogRepository.createImages(imageData, {
        transaction: t,
      });
    }

    const updatedBlog = await blogRepository.findById(id, {
      transaction: t,
    });

    await t.commit();
    await clearBlogListCache();
    return updatedBlog;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const deleteBlogService = async (id) => {
  const t = await sequelize.transaction();

  try {
    const blog = await blogRepository.findById(id, {
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

    await blogRepository.deleteImagesByBlogId(id, {
      transaction: t,
    });

    await blogRepository.deleteById(id, {
      transaction: t,
    });

    await t.commit();
    await clearBlogListCache();
    return {
      message: "Xóa bài viết thành công",
    };
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
