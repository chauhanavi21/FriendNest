import express from "express";
import {
  createGroup,
  getGroups,
  getMyGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  updateGroup,
  deleteGroup,
  createEvent,
  joinEvent,
  leaveEvent,
  deleteEvent,
} from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Group routes
router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.get("/my-groups", protectRoute, getMyGroups);
router.get("/:id", protectRoute, getGroupById);
router.put("/:id", protectRoute, updateGroup);
router.delete("/:id", protectRoute, deleteGroup);
router.post("/:id/join", protectRoute, joinGroup);
router.post("/:id/leave", protectRoute, leaveGroup);

// Event routes
router.post("/:id/events", protectRoute, createEvent);
router.post("/:id/events/:eventId/join", protectRoute, joinEvent);
router.post("/:id/events/:eventId/leave", protectRoute, leaveEvent);
router.delete("/:id/events/:eventId", protectRoute, deleteEvent);

export default router;

