import express from "express";
import { requireAdmin } from "../middleware/auth.middleware.js";
import { adminRateLimiter } from "../middleware/rateLimit.middleware.js";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllGroups,
  getGroupById,
  deleteGroup,
  getAnalytics,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Apply rate limiting to all admin routes
router.use(adminRateLimiter);

// Test route
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

// Statistics routes
router.get("/stats/dashboard", requireAdmin, getDashboardStats);
router.get("/stats/analytics", requireAdmin, getAnalytics);

// User management routes
router.get("/users", requireAdmin, getAllUsers);
router.get("/users/:id", requireAdmin, getUserById);
router.delete("/users/:id", requireAdmin, deleteUser);

// Group management routes
router.get("/groups", requireAdmin, getAllGroups);
router.get("/groups/:id", requireAdmin, getGroupById);
router.delete("/groups/:id", requireAdmin, deleteGroup);

export default router;
