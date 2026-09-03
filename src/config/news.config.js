module.exports = {
  rssUrl:
    process.env.NEWS_RSS_URL || "https://vnexpress.net/rss/oto-xe-may.rss",
  limit: Number(process.env.NEWS_LIMIT) || 8,
};
