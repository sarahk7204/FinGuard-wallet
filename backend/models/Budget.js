const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Food",
        "Transport",
        "Shopping",
        "Health",
        "Education",
        "Entertainment",
        "Utilities",
        "Rent",
        "Travel",
        "Other",
        "Total",
      ],
    },
    limit: {
      type: Number,
      required: [true, "Budget limit is required"],
      min: [1, "Budget limit must be at least 1"],
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    spent: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["safe", "near-limit", "exceeded"],
      default: "safe",
    },
  },
  { timestamps: true }
);

// Unique budget per user per category per month/year
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);