const Budget = require("../models/Budget");
const Expense = require("../models/Expense");
const { calculateBudgetStatus, getBudgetUsagePercent } = require("../utils/calculateBudgetStatus");

// ─── Create Budget ────────────────────────────────────────────────────────────
const createBudget = async (req, res) => {
  try {
    const { category, limit, month, year } = req.body;

    const now = new Date();
    const m = month || now.getMonth() + 1;
    const y = year || now.getFullYear();

    // Check duplicate
    const existing = await Budget.findOne({ user: req.user._id, category, month: m, year: y });
    if (existing) {
      return res.status(400).json({ success: false, message: `Budget for ${category} in ${m}/${y} already exists` });
    }

    // Calculate already-spent amount for this category/month
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const spentAgg = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          category,
          type: "expense",
          date: { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const spent = spentAgg[0]?.total || 0;
    const status = calculateBudgetStatus(spent, limit);

    const budget = await Budget.create({
      user: req.user._id,
      category,
      limit,
      month: m,
      year: y,
      spent,
      status,
    });

    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Budget already exists for this category and month" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Budgets ──────────────────────────────────────────────────────────
const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = { user: req.user._id };
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const budgets = await Budget.find(filter).sort({ createdAt: -1 });

    const enriched = budgets.map((b) => ({
      ...b.toObject(),
      usagePercent: getBudgetUsagePercent(b.spent, b.limit),
      remaining: Math.max(0, b.limit - b.spent),
    }));

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Current Month Budgets ────────────────────────────────────────────────
const getCurrentBudgets = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month, year });

    const enriched = budgets.map((b) => ({
      ...b.toObject(),
      usagePercent: getBudgetUsagePercent(b.spent, b.limit),
      remaining: Math.max(0, b.limit - b.spent),
    }));

    res.json({ success: true, data: enriched, month, year });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Budget ────────────────────────────────────────────────────────────
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ success: false, message: "Budget not found" });

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (req.body.limit) {
      req.body.status = calculateBudgetStatus(budget.spent, req.body.limit);
    }

    const updated = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Budget ────────────────────────────────────────────────────────────
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ success: false, message: "Budget not found" });

    if (budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await budget.deleteOne();
    res.json({ success: true, message: "Budget deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBudget, getBudgets, getCurrentBudgets, updateBudget, deleteBudget };
