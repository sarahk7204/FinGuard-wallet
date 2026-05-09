const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["budget-warning", "budget-exceeded", "expense-added", "general"],
      default: "general",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedBudget: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
