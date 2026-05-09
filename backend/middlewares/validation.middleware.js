const mongoose = require("mongoose");

// Validates that req.params.id is a valid MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: "Invalid ID format" });
  }
  next();
};

module.exports = { validateObjectId };
