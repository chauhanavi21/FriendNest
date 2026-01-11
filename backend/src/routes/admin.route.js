import express from "express";
import { requireAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Simple test route to verify admin access works
router.get("/test", requireAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted!",
    user: {
      id: req.user._id,
      name: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;
