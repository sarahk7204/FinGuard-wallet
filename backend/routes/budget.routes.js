const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const {
  createBudget,
  getBudgets,
  getCurrentBudgets,
  updateBudget,
  deleteBudget,
} = require("../controllers/budget.controller");

router.use(protect);

router.post("/", createBudget);
router.get("/", getBudgets);
router.get("/current", getCurrentBudgets);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

module.exports = router;
