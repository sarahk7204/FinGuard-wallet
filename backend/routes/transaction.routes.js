const express = require("express");
const router = express.Router();
const {
  getTransactions,
  getMonthlySummary,
  getTransactionById,
  getTransactionReceipt,
} = require("../controllers/transaction.controller");
const { protect } = require("../middlewares/auth.middleware");

// All transaction routes require authentication
router.use(protect);

// IMPORTANT: specific routes must come before :id routes
router.get("/summary/monthly", getMonthlySummary);
router.get("/", getTransactions);
router.get("/:id", getTransactionById);
router.get("/:id/receipt", getTransactionReceipt);

module.exports = router;
