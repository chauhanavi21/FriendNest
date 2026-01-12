import User from "../models/User.js";
import Group from "../models/Group.js";
import FriendRequest from "../models/FriendRequest.js";
import Notification from "../models/Notification.js";
import { streamClient } from "../lib/stream.js";

// ==================== STATISTICS ====================

// Get dashboard overview statistics
export async function getDashboardStats(req, res) {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // User statistics (exclude admins, include users without role field for backward compatibility)
    const userQuery = { role: { $ne: "admin" } }; // This matches "user" and undefined/null
    
    const totalUsers = await User.countDocuments(userQuery);
    const onboardedUsers = await User.countDocuments({
      ...userQuery,
      isOnboarded: true,
    });
    const usersCreatedToday = await User.countDocuments({
      ...userQuery,
      createdAt: { $gte: today },
    });
    const usersCreatedThisWeek = await User.countDocuments({
      ...userQuery,
      createdAt: { $gte: weekAgo },
    });
    const usersCreatedThisMonth = await User.countDocuments({
      ...userQuery,
      createdAt: { $gte: monthAgo },
    });

    // Group statistics
    const totalGroups = await Group.countDocuments();
    const groupsCreatedToday = await Group.countDocuments({ createdAt: { $gte: today } });
    const groupsCreatedThisWeek = await Group.countDocuments({ createdAt: { $gte: weekAgo } });
    const groupsCreatedThisMonth = await Group.countDocuments({ createdAt: { $gte: monthAgo } });

    // Groups by language
    const groupsByLanguage = await Group.aggregate([
      {
        $group: {
          _id: "$language",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const languageBreakdown = {};
    groupsByLanguage.forEach((item) => {
      languageBreakdown[item._id] = item.count;
    });

    // Total members across all groups
    const allGroups = await Group.find().select("members");
    const totalMembers = allGroups.reduce((sum, group) => sum + group.members.length, 0);

    // Event statistics
    const allGroupsWithEvents = await Group.find().select("events");
    let totalEvents = 0;
    let upcomingEvents = 0;
    let pastEvents = 0;

    allGroupsWithEvents.forEach((group) => {
      group.events.forEach((event) => {
        totalEvents++;
        if (event.date > now) {
          upcomingEvents++;
        } else {
          pastEvents++;
        }
      });
    });

    // Friend request statistics
    const totalFriendRequests = await FriendRequest.countDocuments();
    const pendingRequests = await FriendRequest.countDocuments({ status: "pending" });
    const acceptedRequests = await FriendRequest.countDocuments({ status: "accepted" });
    const removedRequests = await FriendRequest.countDocuments({ status: "removed" });

    // Notification statistics
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });

    // Friendship count (unique pairs)
    const allUsers = await User.find({ role: { $ne: "admin" } }).select("friends");
    let totalFriendships = 0;
    allUsers.forEach((user) => {
      totalFriendships += user.friends.length;
    });
    // Divide by 2 since each friendship is counted twice (user A has B, user B has A)
    totalFriendships = Math.floor(totalFriendships / 2);

    // Recent Activity - Get last 5 users, groups, and events
    const recentUsers = await User.find(userQuery)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentGroups = await Group.find()
      .populate("creator", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get recent events from all groups
    const allGroupsForEvents = await Group.find().select("events name").lean();
    const allEvents = [];
    allGroupsForEvents.forEach((group) => {
      if (group.events && group.events.length > 0) {
        group.events.forEach((event) => {
          allEvents.push({
            ...event,
            groupName: group.name,
            groupId: group._id,
          });
        });
      }
    });
    const recentEvents = allEvents
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, 5);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          onboarded: onboardedUsers,
          notOnboarded: totalUsers - onboardedUsers,
          createdToday: usersCreatedToday,
          createdThisWeek: usersCreatedThisWeek,
          createdThisMonth: usersCreatedThisMonth,
        },
        groups: {
          total: totalGroups,
          byLanguage: languageBreakdown,
          totalMembers: totalMembers,
          createdToday: groupsCreatedToday,
          createdThisWeek: groupsCreatedThisWeek,
          createdThisMonth: groupsCreatedThisMonth,
        },
        events: {
          total: totalEvents,
          upcoming: upcomingEvents,
          past: pastEvents,
        },
        friendRequests: {
          total: totalFriendRequests,
          pending: pendingRequests,
          accepted: acceptedRequests,
          removed: removedRequests,
        },
        notifications: {
          total: totalNotifications,
          unread: unreadNotifications,
        },
        friendships: totalFriendships,
        recentActivity: {
          users: recentUsers,
          groups: recentGroups,
          events: recentEvents,
        },
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ==================== USER MANAGEMENT ====================

// Get all users with pagination, search, and filters
export async function getAllUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;
    const onboarded = req.query.onboarded;

    const skip = (page - 1) * limit;

    // Build query (exclude admins, include users without role field for backward compatibility)
    let query = {
      $or: [{ role: "user" }, { role: { $exists: false } }],
    };

    if (search) {
      const searchConditions = {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
      query = { $and: [query, searchConditions] };
    }

    if (onboarded !== undefined) {
      query.isOnboarded = onboarded === "true";
    }

    // Get users
    const users = await User.find(query)
      .select("-password")
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit)
      .populate("friends", "fullName profilePic")
      .lean();

    // Get groups for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const groupsCount = await Group.countDocuments({ members: user._id });
        return {
          ...user,
          friendsCount: user.friends?.length || 0,
          groupsCount,
        };
      })
    );

    // Total count for pagination
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users: usersWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get user by ID with detailed info
export async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select("-password")
      .populate("friends", "fullName email profilePic")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get groups user is in
    const groups = await Group.find({ members: id })
      .select("name description language createdAt")
      .populate("creator", "fullName email")
      .lean();

    // Get friend requests sent
    const friendRequestsSent = await FriendRequest.find({ sender: id })
      .populate("recipient", "fullName email profilePic")
      .select("status createdAt")
      .lean();

    // Get friend requests received
    const friendRequestsReceived = await FriendRequest.find({ recipient: id })
      .populate("sender", "fullName email profilePic")
      .select("status createdAt")
      .lean();

    // Get notification count
    const notificationCount = await Notification.countDocuments({ user: id });
    const unreadNotificationCount = await Notification.countDocuments({
      user: id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      user: {
        ...user,
        groups,
        friendRequestsSent,
        friendRequestsReceived,
        notificationCount,
        unreadNotificationCount,
      },
    });
  } catch (error) {
    console.error("Error in getUserById:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Delete user (with cascade delete)
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Prevent deleting yourself
    if (id === adminId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting other admins
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete another admin user" });
    }

    // Remove user from all friends' friends lists
    await User.updateMany(
      { friends: id },
      { $pull: { friends: id } }
    );

    // Remove user from all groups
    await Group.updateMany(
      { members: id },
      { $pull: { members: id } }
    );

    // Delete friend requests involving this user
    await FriendRequest.deleteMany({
      $or: [{ sender: id }, { recipient: id }],
    });

    // Delete notifications for this user
    await Notification.deleteMany({ user: id });

    // Delete Stream user
    try {
      await streamClient.deleteUser(id.toString());
    } catch (streamError) {
      console.error("Error deleting Stream user:", streamError);
      // Continue even if Stream deletion fails
    }

    // Delete user from database
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteUser:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ==================== GROUP MANAGEMENT ====================

// Get all groups with pagination, search, and filters
export async function getAllGroups(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const language = req.query.language || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (language) {
      query.language = language;
    }

    // Get groups
    const groups = await Group.find(query)
      .populate("creator", "fullName email profilePic")
      .populate("members", "fullName profilePic")
      .sort({ [sort]: order })
      .skip(skip)
      .limit(limit)
      .lean();

    // Add counts
    const groupsWithCounts = groups.map((group) => ({
      ...group,
      memberCount: group.members?.length || 0,
      eventCount: group.events?.length || 0,
    }));

    // Total count for pagination
    const total = await Group.countDocuments(query);

    res.status(200).json({
      success: true,
      groups: groupsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllGroups:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get group by ID with detailed info
export async function getGroupById(req, res) {
  try {
    const { id } = req.params;

    const group = await Group.findById(id)
      .populate("creator", "fullName email profilePic")
      .populate("members", "fullName email profilePic")
      .lean();

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json({
      success: true,
      group: {
        ...group,
        memberCount: group.members?.length || 0,
        eventCount: group.events?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error in getGroupById:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Delete group (admin can delete any group)
export async function deleteGroup(req, res) {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Delete Stream channel if exists
    if (group.streamChannelId) {
      try {
        const channel = streamClient.channel("messaging", group.streamChannelId);
        await channel.delete();
      } catch (streamError) {
        console.error("Error deleting Stream channel:", streamError);
        // Continue even if Stream deletion fails
      }
    }

    // Delete group (events are automatically deleted as they're embedded)
    await Group.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Group deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteGroup:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
