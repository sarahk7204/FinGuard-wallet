const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true, // e.g. "block_user", "unblock_user", "create_category"
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // the user/resource affected
    },

    targetModel: {
      type: String,
      default: null, // "User", "Category", etc.
    },

    details: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
