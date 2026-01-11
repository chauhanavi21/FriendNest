import express from "express";
import { requireAdmin } from "../middleware/auth.middleware.js";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllGroups,
  getGroupById,
  deleteGroup,
} from "../controllers/admin.controller.js";

const router = express.Router();

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

// User management routes
router.get("/users", requireAdmin, getAllUsers);
router.get("/users/:id", requireAdmin, getUserById);
router.delete("/users/:id", requireAdmin, deleteUser);

// Group management routes
router.get("/groups", requireAdmin, getAllGroups);
router.get("/groups/:id", requireAdmin, getGroupById);
router.delete("/groups/:id", requireAdmin, deleteGroup);

export default router;
