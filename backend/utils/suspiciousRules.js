const Transaction = require("../models/Transaction");

/**
 * Evaluates whether a transaction is suspicious based on predefined rules.
 * Called before saving a transaction. Returns { isSuspicious, reasons }.
 *
 * Rules:
 *  1. Amount > 100,000 PKR (high-value single transaction)
 *  2. Deposit amount > 500,000 PKR (very large single deposit)
 *  3. More than 5 failed withdrawal/transfer attempts in the last 24 hours
 *  4. More than 5 transfers in the last 10 minutes (rapid-fire transfers)
 *  5. Repeated same amount transfers (3+ transfers of exact same amount in 24h)
 */
const evaluateSuspiciousRules = async ({ type, amount, senderId }) => {
  const reasons = [];

  // Rule 1: High-value single transaction (any type)
  if (amount > 100000) {
    reasons.push("High-value transaction exceeding PKR 100,000");
  }

  // Rule 2: Very large deposit
  if (type === "deposit" && amount > 500000) {
    reasons.push("Very large single deposit exceeding PKR 500,000");
  }

  if (senderId) {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last10min = new Date(now.getTime() - 10 * 60 * 1000);

    // Rule 3: Multiple failed attempts in last 24 hours
    const failedCount = await Transaction.countDocuments({
      senderId,
      status: "failed",
      type: { $in: ["withdrawal", "transfer"] },
      createdAt: { $gte: last24h },
    });
    if (failedCount >= 3) {
      reasons.push(`${failedCount} failed withdrawal/transfer attempts in last 24 hours`);
    }

    // Rule 4: More than 5 transfers in the last 10 minutes
    if (type === "transfer") {
      const rapidCount = await Transaction.countDocuments({
        senderId,
        type: "transfer",
        createdAt: { $gte: last10min },
      });
      if (rapidCount >= 5) {
        reasons.push(`${rapidCount} transfers within the last 10 minutes`);
      }
    }

    // Rule 5: Repeated same-amount transfers (3+ in last 24h)
    if (type === "transfer") {
      const sameAmountCount = await Transaction.countDocuments({
        senderId,
        type: "transfer",
        amount,
        createdAt: { $gte: last24h },
      });
      if (sameAmountCount >= 3) {
        reasons.push(`Repeated transfers of same amount (PKR ${amount}) ${sameAmountCount} times in 24 hours`);
      }
    }
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
  };
};

module.exports = { evaluateSuspiciousRules };