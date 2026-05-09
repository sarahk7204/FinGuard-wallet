const Transaction = require("../models/Transaction");

const generateTransactionId = async () => {
  const now = new Date();

  // Example: 20260508
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");

  // Start and end of current day
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const endOfDay = new Date(
    startOfDay.getTime() + 24 * 60 * 60 * 1000
  );

  // Count today's transactions
  const count = await Transaction.countDocuments({
    createdAt: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  });

  // Sequence number
  const seq = String(count + 1).padStart(4, "0");

  // Final ID example: TXN-20260508-0001
  return `TXN-${datePart}-${seq}`;
};

module.exports = generateTransactionId;