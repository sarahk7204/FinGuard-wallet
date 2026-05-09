const { errorResponse } = require("../utils/apiResponse");

const validateWalletAction = (req, res, next) => {
  const { amount } = req.body;

  if (amount === undefined || amount === null || amount === "") {
    return errorResponse(res, 400, "Amount is required");
  }

  const parsed = Number(amount);

  if (isNaN(parsed)) {
    return errorResponse(res, 400, "Amount must be a valid number");
  }

  if (parsed <= 0) {
    return errorResponse(res, 400, "Amount must be greater than zero");
  }

  if (!Number.isFinite(parsed)) {
    return errorResponse(res, 400, "Amount is not a valid finite number");
  }

  // Attach the parsed number to the body so controllers don't re-parse
  req.body.amount = parsed;

  next();
};

module.exports = { validateWalletAction };
