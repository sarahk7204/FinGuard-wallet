const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const AuditLog = require("../models/AuditLog");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const mongoose = require("mongoose");

// ─── GET /api/admin/dashboard ────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeUsers = await User.countDocuments({ role: "user", status: "active" });
    const blockedUsers = await User.countDocuments({ role: "user", status: "blocked" });

    const totalTransactions = await Transaction.countDocuments();
    const flaggedTransactions = await Transaction.countDocuments({ suspiciousFlag: true });

    // Total demo balance in system
    const balanceAgg = await Wallet.aggregate([
      { $group: { _id: null, totalBalance: { $sum: "$balance" } } },
    ]);
    const systemBalance = balanceAgg[0]?.totalBalance || 0;

    // Transaction volume (total successful amount)
    const volumeAgg = await Transaction.aggregate([
      { $match: { status: "successful" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const transactionVolume = volumeAgg[0]?.total || 0;

    return successResponse(res, 200, "Dashboard fetched", {
      totalUsers,
      activeUsers,
      blockedUsers,
      totalTransactions,
      flaggedTransactions,
      systemBalance,
      transactionVolume,
    });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── GET /api/admin/users ────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const filter = { role: "user" };

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return successResponse(res, 200, "Users fetched", {
      users,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── GET /api/admin/users/:id ────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid user ID");
    }

    const user = await User.findById(id).select("-password");
    if (!user) return errorResponse(res, 404, "User not found");

    const wallet = await Wallet.findOne({ userId: id });

    return successResponse(res, 200, "User fetched", { user, wallet });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── PATCH /api/admin/users/:id/block ───────────────────────────────────────
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid user ID");
    }

    const user = await User.findById(id);
    if (!user) return errorResponse(res, 404, "User not found");
    if (user.role === "admin") return errorResponse(res, 400, "Cannot block an admin");
    if (user.status === "blocked") return errorResponse(res, 400, "User is already blocked");

    user.status = "blocked";
    await user.save();

    // Log the admin action
    await AuditLog.create({
      adminId: req.user._id,
      action: "block_user",
      targetId: user._id,
      targetModel: "User",
      details: `Blocked user ${user.email}`,
    });

    return successResponse(res, 200, "User blocked successfully", { userId: user._id });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── PATCH /api/admin/users/:id/unblock ─────────────────────────────────────
const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid user ID");
    }

    const user = await User.findById(id);
    if (!user) return errorResponse(res, 404, "User not found");
    if (user.status === "active") return errorResponse(res, 400, "User is already active");

    user.status = "active";
    await user.save();

    await AuditLog.create({
      adminId: req.user._id,
      action: "unblock_user",
      targetId: user._id,
      targetModel: "User",
      details: `Unblocked user ${user.email}`,
    });

    return successResponse(res, 200, "User unblocked successfully", { userId: user._id });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── GET /api/admin/wallets ──────────────────────────────────────────────────
const getAllWallets = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Wallet.countDocuments();
    const wallets = await Wallet.find()
      .populate("userId", "name email status")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return successResponse(res, 200, "Wallets fetched", {
      wallets,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── GET /api/admin/transactions ────────────────────────────────────────────
const getAllTransactions = async (req, res) => {
  try {
    const { type, status, flagged, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (flagged === "true") filter.suspiciousFlag = true;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate("senderId", "name email")
      .populate("receiverId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return successResponse(res, 200, "Transactions fetched", {
      transactions,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── GET /api/admin/transactions/flagged ────────────────────────────────────
const getFlaggedTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Transaction.countDocuments({ suspiciousFlag: true });
    const transactions = await Transaction.find({ suspiciousFlag: true })
      .populate("senderId", "name email")
      .populate("receiverId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return successResponse(res, 200, "Flagged transactions fetched", {
      transactions,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── GET /api/admin/reports/transaction-volume ──────────────────────────────
const getTransactionVolume = async (req, res) => {
  try {
    const volume = await Transaction.aggregate([
      { $match: { status: "successful" } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, type: "$type" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);

    return successResponse(res, 200, "Transaction volume fetched", { volume });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── GET /api/admin/reports/system-balance ──────────────────────────────────
const getSystemBalance = async (req, res) => {
  try {
    const agg = await Wallet.aggregate([
      { $group: { _id: null, totalBalance: { $sum: "$balance" }, walletCount: { $sum: 1 } } },
    ]);

    return successResponse(res, 200, "System balance fetched", {
      totalBalance: agg[0]?.totalBalance || 0,
      walletCount: agg[0]?.walletCount || 0,
    });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  getUserById,
  blockUser,
  unblockUser,
  getAllWallets,
  getAllTransactions,
  getFlaggedTransactions,
  getTransactionVolume,
  getSystemBalance,
};
