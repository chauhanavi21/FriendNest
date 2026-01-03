import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, //exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnboarded: true },
      ],
    });
    res.status(200).json(recommendedUsers);
  } catch (error) {
    console.error("Error in getRecommendedUsers controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getMyFriends controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    // prevent sending req to yourself
    if (myId === recipientId) {
      return res.status(400).json({ message: "You can't send friend request to yourself" });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Get current user to check friends array
    const currentUser = await User.findById(myId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // check if users are already friends (check both arrays for safety)
    if (currentUser.friends.includes(recipientId) || recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    // Check recipient's privacy settings for friend requests
    const recipientPrivacy = recipient.settings?.privacy?.whoCanSendFriendRequests || "everyone";
    if (recipientPrivacy === "nobody") {
      return res.status(403).json({ message: "This user does not accept friend requests" });
    }
    if (recipientPrivacy === "friendsOfFriends") {
      // Check if sender is a friend of any of recipient's friends
      const recipientFriends = await User.findById(recipientId).select("friends").populate("friends");
      const recipientFriendsIds = recipientFriends.friends.map((f) => f._id.toString());
      const senderFriends = await User.findById(myId).select("friends");
      const senderFriendsIds = senderFriends.friends.map((f) => f.toString());
      
      const hasMutualFriend = recipientFriendsIds.some((friendId) => senderFriendsIds.includes(friendId));
      if (!hasMutualFriend) {
        return res.status(403).json({ message: "This user only accepts friend requests from friends of friends" });
      }
    }

    // check if a req already exists (only pending or accepted, not removed)
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId, status: { $in: ["pending", "accepted"] } },
        { sender: recipientId, recipient: myId, status: { $in: ["pending", "accepted"] } },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return res.status(400).json({ message: "A friend request already exists between you and this user" });
      }
      if (existingRequest.status === "accepted") {
        return res.status(400).json({ message: "You are already friends with this user" });
      }
    }

    // Clean up any old "removed" status requests before creating a new one
    // This prevents database clutter when users re-request after removal
    await FriendRequest.deleteMany({
      $or: [
        { sender: myId, recipient: recipientId, status: "removed" },
        { sender: recipientId, recipient: myId, status: "removed" },
      ],
    });

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    // $addToSet: adds elements to an array only if they do not already exist.
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log("Error in acceptFriendRequest controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getFriendRequests(req, res) {
  try {
    const currentUserId = req.user.id;

    // Get incoming pending requests
    const incomingReqs = await FriendRequest.find({
      recipient: currentUserId,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    // Get accepted requests where current user is the sender (they sent the request)
    const acceptedReqsAsSender = await FriendRequest.find({
      sender: currentUserId,
      status: "accepted",
    })
      .populate("recipient", "fullName profilePic")
      .sort({ updatedAt: -1 })
      .limit(10);

    // Get accepted requests where current user is the recipient (they accepted the request)
    const acceptedReqsAsRecipient = await FriendRequest.find({
      recipient: currentUserId,
      status: "accepted",
    })
      .populate("sender", "fullName profilePic")
      .sort({ updatedAt: -1 })
      .limit(10);

    // Get removed notifications where current user was removed (they are the recipient)
    const removedReqs = await FriendRequest.find({
      recipient: currentUserId,
      status: "removed",
    })
      .populate("sender", "fullName profilePic")
      .sort({ updatedAt: -1 })
      .limit(10);

    // Combine and format accepted requests with role information
    const acceptedReqs = [
      ...acceptedReqsAsSender.map((req) => ({
        ...req.toObject(),
        otherUser: req.recipient,
        role: "sender", // Current user sent the request
      })),
      ...acceptedReqsAsRecipient.map((req) => ({
        ...req.toObject(),
        otherUser: req.sender,
        role: "recipient", // Current user accepted the request
      })),
    ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.status(200).json({ incomingReqs, acceptedReqs, removedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { fullName, bio, nativeLanguage, learningLanguage, location, profilePic } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (nativeLanguage) updateData.nativeLanguage = nativeLanguage;
    if (learningLanguage) updateData.learningLanguage = learningLanguage;
    if (location !== undefined) updateData.location = location;
    if (profilePic) updateData.profilePic = profilePic;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update Stream user if profile pic or name changed
    try {
      const { upsertStreamUser } = await import("../lib/stream.js");
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("Error updating Stream user:", streamError.message);
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error in updateProfile controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function removeFriend(req, res) {
  try {
    const myId = req.user.id;
    const { id: friendId } = req.params;

    // Prevent removing yourself
    if (myId === friendId) {
      return res.status(400).json({ message: "You can't remove yourself as a friend" });
    }

    // Check if the friend exists
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    // Get current user
    const currentUser = await User.findById(myId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if they are actually friends
    if (!currentUser.friends.includes(friendId)) {
      return res.status(400).json({ message: "You are not friends with this user" });
    }

    // Remove friend from both users' friends arrays
    await User.findByIdAndUpdate(myId, {
      $pull: { friends: friendId },
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: myId },
    });

    // Delete ALL existing friend requests between them (pending, accepted, removed)
    // This ensures a clean slate when removing a friend
    await FriendRequest.deleteMany({
      $or: [
        { sender: myId, recipient: friendId },
        { sender: friendId, recipient: myId },
      ],
    });

    // Create a notification for the removed friend
    // This creates a FriendRequest entry with status "removed" to notify the friend
    await FriendRequest.create({
      sender: myId,
      recipient: friendId,
      status: "removed",
    });

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Error in removeFriend controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function searchUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;
    const {
      query: searchQuery = "",
      nativeLanguage = "",
      learningLanguage = "",
      location = "",
      sortBy = "recentlyActive",
    } = req.query;

    // Build the search filter
    // Include all users except current user (including friends)
    const filter = {
      $and: [
        { _id: { $ne: currentUserId } },
        { isOnboarded: true },
      ],
    };

    // Add search query filter (name, location)
    if (searchQuery) {
      filter.$and.push({
        $or: [
          { fullName: { $regex: searchQuery, $options: "i" } },
          { location: { $regex: searchQuery, $options: "i" } },
          { bio: { $regex: searchQuery, $options: "i" } },
        ],
      });
    }

    // Add language filters
    if (nativeLanguage) {
      filter.$and.push({
        nativeLanguage: { $regex: nativeLanguage, $options: "i" },
      });
    }

    if (learningLanguage) {
      filter.$and.push({
        learningLanguage: { $regex: learningLanguage, $options: "i" },
      });
    }

    // Add location filter
    if (location) {
      filter.$and.push({
        location: { $regex: location, $options: "i" },
      });
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case "recentlyActive":
        sortOptions = { updatedAt: -1 };
        break;
      case "newUsers":
        sortOptions = { createdAt: -1 };
        break;
      case "location":
        sortOptions = { location: 1 };
        break;
      case "name":
        sortOptions = { fullName: 1 };
        break;
      default:
        sortOptions = { updatedAt: -1 };
    }

    const users = await User.find(filter)
      .select("-password")
      .sort(sortOptions)
      .limit(50);

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateEmail(req, res) {
  try {
    const userId = req.user.id;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: "Email already exists" });
    }

    user.email = email;
    await user.save();

    res.status(200).json({ success: true, message: "Email updated successfully", user });
  } catch (error) {
    console.error("Error in updateEmail controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updatePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await user.matchPassword(currentPassword);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in updatePassword controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateSettings(req, res) {
  try {
    const userId = req.user.id;
    const { privacy, notifications, language } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (privacy) {
      user.settings = user.settings || {};
      user.settings.privacy = { ...user.settings.privacy, ...privacy };
    }
    if (notifications) {
      user.settings = user.settings || {};
      user.settings.notifications = { ...user.settings.notifications, ...notifications };
    }
    if (language) {
      user.settings = user.settings || {};
      user.settings.language = { ...user.settings.language, ...language };
    }

    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    res.status(200).json({ success: true, message: "Settings updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error in updateSettings controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    await User.findByIdAndDelete(userId);

    res.clearCookie("jwt");

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAccount controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
