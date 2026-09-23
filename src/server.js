require("dotenv").config();

const app = require("./app");
const sequelize = require("./config/database");
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectRedis();
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("DB error:", err);
  }
})();
