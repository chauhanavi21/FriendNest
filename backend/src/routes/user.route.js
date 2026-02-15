import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  deleteAccount,
  getFriendRequests,
  getIncomingFriendReqs,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  removeFriend,
  searchUsers,
  sendFriendRequest,
  updateEmail,
  updatePassword,
  updateProfile,
  updateSettings,
} from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.get("/search", searchUsers);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);
router.get("/incoming-friend-requests", getIncomingFriendReqs);

router.put("/profile", updateProfile);
router.delete("/friends/:id", removeFriend);

router.put("/settings/email", updateEmail);
router.put("/settings/password", updatePassword);
router.put("/settings", updateSettings);
router.delete("/account", deleteAccount);

export default router;
