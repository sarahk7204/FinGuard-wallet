/**
 * Calculates budget status based on spent vs limit
 * @param {number} spent - Amount spent so far
 * @param {number} limit - Budget limit
 * @returns {string} - "safe" | "near-limit" | "exceeded"
 */
const calculateBudgetStatus = (spent, limit) => {
  if (spent >= limit) return "exceeded";
  const usagePercent = (spent / limit) * 100;
  if (usagePercent >= 80) return "near-limit";
  return "safe";
};

/**
 * Returns percentage of budget used
 * @param {number} spent
 * @param {number} limit
 * @returns {number} - percentage (0-100+)
 */
const getBudgetUsagePercent = (spent, limit) => {
  if (!limit || limit === 0) return 0;
  return Math.round((spent / limit) * 100);
};

module.exports = { calculateBudgetStatus, getBudgetUsagePercent };
