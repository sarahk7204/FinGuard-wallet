const Category = require("../models/Category");
const AuditLog = require("../models/AuditLog");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const mongoose = require("mongoose");

// GET /api/categories — public (any logged-in user)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return successResponse(res, 200, "Categories fetched", { categories });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// POST /api/admin/categories — admin only
const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name) return errorResponse(res, 400, "Category name is required");

    const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (existing) return errorResponse(res, 400, "Category already exists");

    const category = await Category.create({ name, type, createdBy: req.user._id });

    await AuditLog.create({
      adminId: req.user._id,
      action: "create_category",
      targetId: category._id,
      targetModel: "Category",
      details: `Created category: ${name}`,
    });

    return successResponse(res, 201, "Category created", { category });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// PUT /api/admin/categories/:id — admin only
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return errorResponse(res, 400, "Invalid ID");

    const { name, type } = req.body;
    const category = await Category.findByIdAndUpdate(
      id,
      { name, type },
      { new: true, runValidators: true }
    );
    if (!category) return errorResponse(res, 404, "Category not found");

    return successResponse(res, 200, "Category updated", { category });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// PATCH /api/admin/categories/:id/disable — admin only
const disableCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return errorResponse(res, 400, "Invalid ID");

    const category = await Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!category) return errorResponse(res, 404, "Category not found");

    await AuditLog.create({
      adminId: req.user._id,
      action: "disable_category",
      targetId: category._id,
      targetModel: "Category",
      details: `Disabled category: ${category.name}`,
    });

    return successResponse(res, 200, "Category disabled", { category });
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

module.exports = { getCategories, createCategory, updateCategory, disableCategory };
