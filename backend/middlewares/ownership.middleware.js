// Verifies that the authenticated user owns the resource (by userId field)
// Usage: router.put("/:id", authMiddleware, ownershipMiddleware(Model), handler)
const ownershipMiddleware = (Model, userField = "user") => {
  return async (req, res, next) => {
    try {
      const doc = await Model.findById(req.params.id);
      if (!doc) {
        return res.status(404).json({ success: false, message: "Resource not found" });
      }

      const ownerId = doc[userField]?.toString();
      const requesterId = req.user._id.toString();

      if (ownerId !== requesterId && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      req.resource = doc;
      next();
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };
};

export default ownershipMiddleware;
