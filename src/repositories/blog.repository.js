const { Blog, BlogImage } = require("../models");

const create = async (data, options = {}) => {
  return Blog.create(data, options);
};

const createImages = async (imageData, options = {}) => {
  return BlogImage.bulkCreate(imageData, options);
};

const findById = async (id, options = {}) => {
  return Blog.findByPk(id, {
    include: [
      {
        model: BlogImage,
        as: "images",
      },
    ],
    transaction: options.transaction,
  });
};

const findAndCountAll = async ({ where, limit, offset }) => {
  return Blog.findAndCountAll({
    where,
    include: [
      {
        model: BlogImage,
        as: "images",
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });
};

const updateById = async (blog, updateData, options = {}) => {
  return blog.update(updateData, options);
};

const incrementView = async (blog) => {
  return blog.increment("viewCount");
};

const deleteImagesByBlogId = async (id, options = {}) => {
  return BlogImage.destroy({
    where: { blog_id: id },
    ...options,
  });
};

const deleteById = async (id, options = {}) => {
  return Blog.destroy({
    where: { id },
    ...options,
  });
};

module.exports = {
  create,
  createImages,
  findById,
  findAndCountAll,
  updateById,
  incrementView,
  deleteImagesByBlogId,
  deleteById,
};
