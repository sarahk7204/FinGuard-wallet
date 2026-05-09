const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  changePassword,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const { validateRegister, validateLogin } = require("../validations/auth.validation");

// Public routes
router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);

// Protected routes
router.post("/logout", authMiddleware, logoutUser);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;