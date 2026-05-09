const Transaction = require("../models/Transaction");
const generateTransactionId = async () => {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // "20260508"

  // Count how many transactions exist for today to build the sequence
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const count = await Transaction.countDocuments({
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  });

  const seq = String(count + 1).padStart(4, "0");
  return `TXN-${datePart}-${seq}`;
};

module.exports = generateTransactionId;
