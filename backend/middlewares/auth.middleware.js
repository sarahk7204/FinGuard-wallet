const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Main auth middleware — verifies JWT and attaches req.user
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized — no token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Alias used by wallet.routes.js
const protect = authMiddleware;

// Middleware that blocks requests from blocked users
// (used after protect in wallet/financial routes)
const requireActive = (req, res, next) => {
  if (req.user.status === "blocked") {
    return res.status(403).json({
      success: false,
      message: "Your account has been blocked. Contact support.",
    });
  }
  next();
};

module.exports = authMiddleware;
module.exports.protect = protect;
module.exports.requireActive = requireActive;
