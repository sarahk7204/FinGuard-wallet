console.log("🟢 server.js starting");

const mongoose = require("mongoose");
require("dotenv").config();
const app = require("./app");

console.log("🟢 modules loaded");
console.log("🟢 PORT =", process.env.PORT);
console.log("🟢 MONGO_URI starts with:", process.env.MONGO_URI?.substring(0, 20));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

console.log("🟢 about to call mongoose.connect");

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled rejection:", err);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught exception:", err);
  process.exit(1);
});