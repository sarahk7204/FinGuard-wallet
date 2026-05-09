const express = require("express");
const router = express.Router();
const {
  getWallet,
  getWalletSummary,
  deposit,
  withdraw,
  transfer,
} = require("../controllers/wallet.controller");
const { protect, requireActive } = require("../middlewares/auth.middleware");
const { validateWalletAction } = require("../validations/wallet.validation");

// All wallet routes require a valid JWT and an active (non-blocked) user
router.use(protect);
router.use(requireActive);

router.get("/", getWallet);
router.get("/summary", getWalletSummary);
router.post("/deposit", validateWalletAction, deposit);
router.post("/withdraw", validateWalletAction, withdraw);
router.post("/transfer", transfer); // transfer has its own inline checks

module.exports = router;
