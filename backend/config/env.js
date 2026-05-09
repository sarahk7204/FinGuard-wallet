require("dotenv").config();

const required = ["MONGO_URI", "JWT_SECRET"];

required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

module.exports = {
  PORT:         process.env.PORT || 5000,
  MONGO_URI:    process.env.MONGO_URI,
  JWT_SECRET:   process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  NODE_ENV:     process.env.NODE_ENV || "development",
};
