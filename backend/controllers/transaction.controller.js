const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── GET /api/transactions ──────────────────────────────────────────────────
// Returns only transactions where user is sender OR receiver
const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, status, category, startDate, endDate, search, page = 1, limit = 10 } = req.query;

    const filter = {
      $or: [{ senderId: userId }, { receiverId: userId }],
    };

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = { $regex: category, $options: "i" };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      filter.$and = [
        { $or: [{ senderId: userId }, { receiverId: userId }] },
        {
          $or: [
            { transactionId: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        },
      ];
      delete filter.$or;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("senderId", "name email")
      .populate("receiverId", "name email");

    return successResponse(res, 200, "Transactions fetched", {
      transactions,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── GET /api/transactions/summary/monthly ──────────────────────────────────
const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const summary = await Transaction.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
          status: "successful",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            type: "$type",
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    return successResponse(res, 200, "Monthly summary fetched", { summary });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── GET /api/transactions/:id ──────────────────────────────────────────────
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid transaction ID format");
    }

    const transaction = await Transaction.findById(id)
      .populate("senderId", "name email")
      .populate("receiverId", "name email");

    if (!transaction) return errorResponse(res, 404, "Transaction not found");

    const userId = req.user._id.toString();
    const isOwner =
      transaction.senderId?._id?.toString() === userId ||
      transaction.receiverId?._id?.toString() === userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 403, "Access denied");
    }

    return successResponse(res, 200, "Transaction fetched", { transaction });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── GET /api/transactions/:id/receipt ─────────────────────────────────────
const getTransactionReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid transaction ID format");
    }

    const transaction = await Transaction.findById(id)
      .populate("senderId", "name email")
      .populate("receiverId", "name email");

    if (!transaction) return errorResponse(res, 404, "Transaction not found");

    const userId = req.user._id.toString();
    const isOwner =
      transaction.senderId?._id?.toString() === userId ||
      transaction.receiverId?._id?.toString() === userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 403, "Access denied");
    }

    const receipt = {
      transactionId: transaction.transactionId,
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
      category: transaction.category,
      description: transaction.description,
      sender: transaction.senderId
        ? { name: transaction.senderId.name, email: transaction.senderId.email }
        : null,
      receiver: transaction.receiverId
        ? { name: transaction.receiverId.name, email: transaction.receiverId.email }
        : null,
      suspiciousFlag: transaction.suspiciousFlag,
      suspiciousReasons: transaction.suspiciousReasons,
      date: transaction.createdAt,
    };

    return successResponse(res, 200, "Receipt fetched", { receipt });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

module.exports = {
  getTransactions,
  getMonthlySummary,
  getTransactionById,
  getTransactionReceipt,
};
