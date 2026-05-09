const { body, validationResult } = require("express-validator");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const validateExpense = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 100 }),
  body("amount").isFloat({ min: 0.01 }).withMessage("Amount must be greater than 0"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["Food","Transport","Shopping","Health","Education","Entertainment","Utilities","Rent","Travel","Other"])
    .withMessage("Invalid category"),
  body("date").optional().isISO8601().withMessage("Invalid date format"),
  body("type").optional().isIn(["expense", "income"]).withMessage("Type must be expense or income"),
  handleValidation,
];

const validateBudget = [
  body("category").notEmpty().withMessage("Category is required"),
  body("limit").isFloat({ min: 1 }).withMessage("Budget limit must be at least 1"),
  body("month").optional().isInt({ min: 1, max: 12 }).withMessage("Month must be 1-12"),
  body("year").optional().isInt({ min: 2020 }).withMessage("Invalid year"),
  handleValidation,
];

module.exports = { validateExpense, validateBudget };
