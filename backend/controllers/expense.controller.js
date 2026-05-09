const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const Notification = require("../models/Notification");
const { calculateBudgetStatus } = require("../utils/calculateBudgetStatus");

// ─── Create Expense ───────────────────────────────────────────────────────────
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, description, date, type } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      description,
      date: date || Date.now(),
      type: type || "expense",
    });

    // Update budget spent amount if it's an expense (not income)
    if (type !== "income") {
      const now = new Date(date || Date.now());
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const budget = await Budget.findOne({
        user: req.user._id,
        category,
        month,
        year,
      });

      if (budget) {
        budget.spent += amount;
        budget.status = calculateBudgetStatus(budget.spent, budget.limit);
        await budget.save();

        // Generate notification if near-limit or exceeded
        if (budget.status === "near-limit") {
          await Notification.create({
            user: req.user._id,
            title: "Budget Near Limit",
            message: `Your ${category} budget for ${month}/${year} is 80% used. (PKR ${budget.spent} of PKR ${budget.limit})`,
            type: "budget-warning",
            relatedBudget: budget._id,
          });
        } else if (budget.status === "exceeded") {
          await Notification.create({
            user: req.user._id,
            title: "Budget Exceeded!",
            message: `You have exceeded your ${category} budget for ${month}/${year}. (PKR ${budget.spent} spent of PKR ${budget.limit} limit)`,
            type: "budget-exceeded",
            relatedBudget: budget._id,
          });
        }
      }
    }

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Expenses ─────────────────────────────────────────────────────────
const getExpenses = async (req, res) => {
  try {
    const { category, type, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = { user: req.user._id };
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const total = await Expense.countDocuments(filter);
    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Expense ───────────────────────────────────────────────────────────
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

    // Ownership check
    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to update this expense" });
    }

    const oldAmount = expense.amount;
    const oldCategory = expense.category;

    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Adjust budget if amount or category changed
    if (expense.type !== "income") {
      const now = new Date(expense.date);
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      // Revert old budget
      if (oldCategory) {
        const oldBudget = await Budget.findOne({ user: req.user._id, category: oldCategory, month, year });
        if (oldBudget) {
          oldBudget.spent = Math.max(0, oldBudget.spent - oldAmount);
          oldBudget.status = calculateBudgetStatus(oldBudget.spent, oldBudget.limit);
          await oldBudget.save();
        }
      }

      // Apply to new budget
      const newCategory = req.body.category || oldCategory;
      const newAmount = req.body.amount || oldAmount;
      const newBudget = await Budget.findOne({ user: req.user._id, category: newCategory, month, year });
      if (newBudget) {
        newBudget.spent += newAmount;
        newBudget.status = calculateBudgetStatus(newBudget.spent, newBudget.limit);
        await newBudget.save();
      }
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Expense ───────────────────────────────────────────────────────────
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });

    if (expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this expense" });
    }

    // Revert budget
    if (expense.type !== "income") {
      const now = new Date(expense.date);
      const budget = await Budget.findOne({
        user: req.user._id,
        category: expense.category,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      if (budget) {
        budget.spent = Math.max(0, budget.spent - expense.amount);
        budget.status = calculateBudgetStatus(budget.spent, budget.limit);
        await budget.save();
      }
    }

    await expense.deleteOne();
    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Monthly Summary ──────────────────────────────────────────────────────────
const getMonthlySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = Number(month) || now.getMonth() + 1;
    const y = Number(year) || now.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const summary = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const result = { totalExpense: 0, totalIncome: 0, count: 0 };
    summary.forEach((s) => {
      if (s._id === "expense") { result.totalExpense = s.total; result.count += s.count; }
      if (s._id === "income") { result.totalIncome = s.total; result.count += s.count; }
    });
    result.netBalance = result.totalIncome - result.totalExpense;

    res.json({ success: true, data: result, month: m, year: y });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Category Summary ─────────────────────────────────────────────────────────
const getCategorySummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = Number(month) || now.getMonth() + 1;
    const y = Number(year) || now.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const summary = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "expense",
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, data: summary, month: m, year: y });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getMonthlySummary,
  getCategorySummary,
};