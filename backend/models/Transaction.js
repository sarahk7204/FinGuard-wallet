const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ["deposit", "withdrawal", "transfer"],
      required: true,
    },

    status: {
      type: String,
      enum: ["successful", "failed", "flagged"],
      default: "successful",
    },

    category: {
      type: String,
      default: "General",
    },

    description: {
      type: String,
      default: "",
    },

    failureReason: {
      type: String,
      default: null,
    },

    suspiciousFlag: {
      type: Boolean,
      default: false,
    },

    suspiciousReasons: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

transactionSchema.index({ senderId: 1, createdAt: -1 });
transactionSchema.index({ receiverId: 1, createdAt: -1 });
transactionSchema.index({ suspiciousFlag: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
