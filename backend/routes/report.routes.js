const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { getUserDashboard, getIncomeExpenseReport, getBudgetUsageReport } = require("../controllers/report.controller");

router.use(protect);
router.get("/user-dashboard", getUserDashboard);
router.get("/income-expense", getIncomeExpenseReport);
router.get("/budget-usage", getBudgetUsageReport);

module.exports = router;
