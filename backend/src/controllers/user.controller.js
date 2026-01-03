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

    // check if user is already friends
    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }

    // check if a req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A friend request already exists between you and this user" });
    }

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

    // Delete any pending friend requests between them
    await FriendRequest.deleteMany({
      $or: [
        { sender: myId, recipient: friendId, status: "pending" },
        { sender: friendId, recipient: myId, status: "pending" },
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
    const filter = {
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends } },
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
