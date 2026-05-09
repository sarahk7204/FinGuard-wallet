const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
  getCategorySummary,
} = require("../controllers/expense.controller");

router.use(protect);

router.post("/", createExpense);
router.get("/", getExpenses);
router.get("/summary/monthly", getMonthlySummary);
router.get("/summary/categories", getCategorySummary);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;
