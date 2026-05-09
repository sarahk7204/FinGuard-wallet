const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const { getBudgetUsagePercent } = require("../utils/calculateBudgetStatus");

// ─── User Dashboard Summary ───────────────────────────────────────────────────
const getUserDashboard = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Current month totals
    const monthlyAgg = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]);

    let totalExpense = 0, totalIncome = 0;
    monthlyAgg.forEach((a) => {
      if (a._id === "expense") totalExpense = a.total;
      if (a._id === "income") totalIncome = a.total;
    });

    // Category breakdown
    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: req.user._id, type: "expense", date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Budget statuses
    const budgets = await Budget.find({ user: req.user._id, month, year });
    const budgetSummary = budgets.map((b) => ({
      category: b.category,
      limit: b.limit,
      spent: b.spent,
      status: b.status,
      usagePercent: getBudgetUsagePercent(b.spent, b.limit),
    }));

    res.json({
      success: true,
      data: {
        month,
        year,
        totalExpense,
        totalIncome,
        netBalance: totalIncome - totalExpense,
        categoryBreakdown,
        budgetSummary,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Income vs Expense (last 6 months) ───────────────────────────────────────
const getIncomeExpenseReport = async (req, res) => {
  try {
    const months = 6;
    const now = new Date();

    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59);

      const agg = await Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        { $group: { _id: "$type", total: { $sum: "$amount" } } },
      ]);

      let expense = 0, income = 0;
      agg.forEach((a) => {
        if (a._id === "expense") expense = a.total;
        if (a._id === "income") income = a.total;
      });

      result.push({ month: m, year: y, label: `${date.toLocaleString("default", { month: "short" })} ${y}`, expense, income });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Budget Usage Report ──────────────────────────────────────────────────────
const getBudgetUsageReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = Number(month) || now.getMonth() + 1;
    const y = Number(year) || now.getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month: m, year: y });

    const report = budgets.map((b) => ({
      category: b.category,
      limit: b.limit,
      spent: b.spent,
      remaining: Math.max(0, b.limit - b.spent),
      usagePercent: getBudgetUsagePercent(b.spent, b.limit),
      status: b.status,
    }));

    res.json({ success: true, data: report, month: m, year: y });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserDashboard, getIncomeExpenseReport, getBudgetUsageReport };
