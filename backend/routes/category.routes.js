const express = require("express");
const router = express.Router();
const { getCategories } = require("../controllers/category.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// Any logged-in user can get categories
router.get("/", authMiddleware, getCategories);

module.exports = router;
