const NewsService = require("../services/news.service");

const getCarNews = async (req, res) => {
  try {
    const newsData = await NewsService.getCarNewsService();
    return res.status(200).json({
      success: true,
      data: newsData,
      message: "Lấy tin tức xe thành công",
    });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCarNews,
};
