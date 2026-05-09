const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/admin.controller");

const {
  getCategories,
  createCategory,
  updateCategory,
  disableCategory,
} = require("../controllers/category.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// All admin routes require login + admin role
router.use(authMiddleware);
router.use(roleMiddleware("admin"));

router.get("/dashboard", getDashboard);

router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);

router.get("/wallets", getAllWallets);

router.get("/transactions", getAllTransactions);
router.get("/transactions/flagged", getFlaggedTransactions);

router.get("/reports/transaction-volume", getTransactionVolume);
router.get("/reports/system-balance", getSystemBalance);

// Category management (admin)
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.patch("/categories/:id/disable", disableCategory);

module.exports = router;
