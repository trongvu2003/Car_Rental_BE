const Parser = require("rss-parser");
const newsConfig = require("../config/news.config");

const parser = new Parser();

const getCarNewsService = async () => {
  try {
    const feed = await parser.parseURL(newsConfig.rssUrl);

    if (!feed || !feed.items) {
      throw new Error("Không thể lấy dữ liệu từ RSS Feed");
    }

    const formattedNews = feed.items
      .slice(0, newsConfig.limit)
      .map((item, index) => {
        let imageUrl = "";
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        const match = imgRegex.exec(item.content || item.description);
        if (match && match[1]) {
          imageUrl = match[1];
        }

        let cleanExcerpt = item.snippet || item.contentSnippet || "";
        cleanExcerpt = cleanExcerpt.replace(/<\/?[^>]+(>|$)/g, "").trim();

        return {
          id: `vnexpress-${index}`,
          title: item.title,
          excerpt:
            cleanExcerpt ||
            "Cập nhật tin tức mới nhất về ô tô, xe máy và thị trường xe.",
          url: item.link,
          imageUrl:
            imageUrl ||
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
          publishedAt: item.isoDate || new Date().toISOString(),
          source: "VnExpress",
        };
      });

    return formattedNews;
  } catch (error) {
    console.error("Error parsing RSS Feed:", error.message);
    throw new Error("Thất bại khi đồng bộ tin tức ô tô - xe máy từ báo VN.");
  }
};

module.exports = {
  getCarNewsService,
};
