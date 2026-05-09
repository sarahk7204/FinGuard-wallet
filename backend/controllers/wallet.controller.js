const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const generateTransactionId = require("../utils/generateTransactionId");
const { evaluateSuspiciousRules } = require("../utils/suspiciousRules");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const LOW_BALANCE_THRESHOLD = 500; // PKR

// ─── GET /api/wallet ────────────────────────────────────────────────────────
const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) return errorResponse(res, 404, "Wallet not found");
    return successResponse(res, 200, "Wallet fetched", { wallet });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── GET /api/wallet/summary ────────────────────────────────────────────────
const getWalletSummary = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) return errorResponse(res, 404, "Wallet not found");

    const summary = {
      balance: wallet.balance,
      currency: wallet.currency,
      status: wallet.status,
      totalDeposits: wallet.totalDeposits,
      totalWithdrawals: wallet.totalWithdrawals,
      totalTransfersIn: wallet.totalTransfersIn,
      totalTransfersOut: wallet.totalTransfersOut,
      isLowBalance: wallet.balance < LOW_BALANCE_THRESHOLD,
    };

    return successResponse(res, 200, "Wallet summary fetched", { summary });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── POST /api/wallet/deposit ───────────────────────────────────────────────
const deposit = async (req, res) => {
  try {
    const { amount, description, category } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return errorResponse(res, 400, "Amount must be a positive number");
    }

    const depositAmount = Number(amount);

    // Check user is not blocked (auth middleware should handle this but double-check)
    const user = await User.findById(req.user._id);
    if (user.status === "blocked") {
      return errorResponse(res, 403, "Your account is blocked. Contact support.");
    }

    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) return errorResponse(res, 404, "Wallet not found");
    if (wallet.status === "frozen") {
      return errorResponse(res, 403, "Your wallet is frozen");
    }

    const txnId = await generateTransactionId();

    // Evaluate suspicious rules before completing
    const { isSuspicious, reasons } = await evaluateSuspiciousRules({
      type: "deposit",
      amount: depositAmount,
      senderId: req.user._id,
    });

    const txnStatus = isSuspicious ? "flagged" : "successful";

    // Update wallet balance
    wallet.balance += depositAmount;
    wallet.totalDeposits += depositAmount;
    await wallet.save();

    // Create transaction record
    const transaction = await Transaction.create({
      transactionId: txnId,
      receiverId: req.user._id,
      amount: depositAmount,
      type: "deposit",
      status: txnStatus,
      category: category || "General",
      description: description || "Deposit",
      suspiciousFlag: isSuspicious,
      suspiciousReasons: reasons,
    });

    // Create low-balance notification if needed (import Notification model if you have it)
    // This is a hook point — Member 4 (notifications) can wire this up
    // await createNotification(req.user._id, "deposit", transaction);

    return successResponse(res, 200, "Deposit successful", {
      transaction,
      newBalance: wallet.balance,
    });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── POST /api/wallet/withdraw ──────────────────────────────────────────────
const withdraw = async (req, res) => {
  try {
    const { amount, description, category } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return errorResponse(res, 400, "Amount must be a positive number");
    }

    const withdrawAmount = Number(amount);

    const user = await User.findById(req.user._id);
    if (user.status === "blocked") {
      return errorResponse(res, 403, "Your account is blocked. Contact support.");
    }

    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) return errorResponse(res, 404, "Wallet not found");
    if (wallet.status === "frozen") {
      return errorResponse(res, 403, "Your wallet is frozen");
    }

    // Insufficient balance — record a failed transaction for suspicious monitoring
    if (wallet.balance < withdrawAmount) {
      const txnId = await generateTransactionId();
      await Transaction.create({
        transactionId: txnId,
        senderId: req.user._id,
        amount: withdrawAmount,
        type: "withdrawal",
        status: "failed",
        category: category || "General",
        description: description || "Withdrawal",
        failureReason: "Insufficient balance",
      });
      return errorResponse(res, 400, "Insufficient balance");
    }

    const txnId = await generateTransactionId();

    const { isSuspicious, reasons } = await evaluateSuspiciousRules({
      type: "withdrawal",
      amount: withdrawAmount,
      senderId: req.user._id,
    });

    const txnStatus = isSuspicious ? "flagged" : "successful";

    wallet.balance -= withdrawAmount;
    wallet.totalWithdrawals += withdrawAmount;
    await wallet.save();

    const transaction = await Transaction.create({
      transactionId: txnId,
      senderId: req.user._id,
      amount: withdrawAmount,
      type: "withdrawal",
      status: txnStatus,
      category: category || "General",
      description: description || "Withdrawal",
      suspiciousFlag: isSuspicious,
      suspiciousReasons: reasons,
    });

    return successResponse(res, 200, "Withdrawal successful", {
      transaction,
      newBalance: wallet.balance,
    });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// ─── POST /api/wallet/transfer ──────────────────────────────────────────────
const transfer = async (req, res) => {
  try {
    const { receiverEmail, amount, description, category } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return errorResponse(res, 400, "Amount must be a positive number");
    }
    if (!receiverEmail) {
      return errorResponse(res, 400, "Receiver email is required");
    }

    const transferAmount = Number(amount);

    // Sender checks
    const sender = await User.findById(req.user._id);
    if (sender.status === "blocked") {
      return errorResponse(res, 403, "Your account is blocked. Contact support.");
    }

    // Prevent self-transfer
    if (sender.email.toLowerCase() === receiverEmail.toLowerCase()) {
      return errorResponse(res, 400, "You cannot transfer to yourself");
    }

    // Receiver checks
    const receiver = await User.findOne({ email: receiverEmail.toLowerCase() });
    if (!receiver) {
      return errorResponse(res, 404, "Receiver not found");
    }
    if (receiver.status === "blocked") {
      return errorResponse(res, 400, "Receiver account is blocked");
    }

    // Wallet checks
    const senderWallet = await Wallet.findOne({ userId: sender._id });
    const receiverWallet = await Wallet.findOne({ userId: receiver._id });

    if (!senderWallet) return errorResponse(res, 404, "Your wallet not found");
    if (!receiverWallet) return errorResponse(res, 404, "Receiver wallet not found");
    if (senderWallet.status === "frozen") {
      return errorResponse(res, 403, "Your wallet is frozen");
    }

    // Balance check
    if (senderWallet.balance < transferAmount) {
      const txnId = await generateTransactionId();
      await Transaction.create({
        transactionId: txnId,
        senderId: sender._id,
        receiverId: receiver._id,
        amount: transferAmount,
        type: "transfer",
        status: "failed",
        category: category || "General",
        description: description || "Transfer",
        failureReason: "Insufficient balance",
      });
      return errorResponse(res, 400, "Insufficient balance");
    }

    const txnId = await generateTransactionId();

    const { isSuspicious, reasons } = await evaluateSuspiciousRules({
      type: "transfer",
      amount: transferAmount,
      senderId: sender._id,
      receiverId: receiver._id,
    });

    const txnStatus = isSuspicious ? "flagged" : "successful";

    // Update both wallets atomically
    senderWallet.balance -= transferAmount;
    senderWallet.totalTransfersOut += transferAmount;
    await senderWallet.save();

    receiverWallet.balance += transferAmount;
    receiverWallet.totalTransfersIn += transferAmount;
    await receiverWallet.save();

    const transaction = await Transaction.create({
      transactionId: txnId,
      senderId: sender._id,
      receiverId: receiver._id,
      amount: transferAmount,
      type: "transfer",
      status: txnStatus,
      category: category || "General",
      description: description || `Transfer to ${receiver.email}`,
      suspiciousFlag: isSuspicious,
      suspiciousReasons: reasons,
    });

    return successResponse(res, 200, "Transfer successful", {
      transaction,
      newBalance: senderWallet.balance,
    });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

module.exports = { getWallet, getWalletSummary, deposit, withdraw, transfer };
