import Notification from "../models/Notification.js";
import User from "../models/User.js";

export async function getNotifications(req, res) {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ user: userId })
      .populate("sender", "fullName profilePic")
      .sort({ createdAt: -1 })
      .limit(100);

    const unreadCount = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error in getNotifications controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function markNotificationAsRead(req, res) {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error in markNotificationAsRead controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function markAllNotificationsAsRead(req, res) {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function createMessageNotification(req, res) {
  try {
    const userId = req.user.id;
    const { senderId, channelId, messagePreview } = req.body;

    if (!senderId || !channelId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check user's notification settings
    const user = await User.findById(userId);
    if (!user?.settings?.notifications?.messages) {
      return res.status(200).json({ message: "Notifications disabled" });
    }

    // Check if notification already exists for this channel (to avoid duplicates)
    const existingNotification = await Notification.findOne({
      user: userId,
      type: "message",
      channelId: channelId,
      isRead: false,
    });

    if (existingNotification) {
      // Update existing notification with latest message preview
      existingNotification.message = messagePreview || "New message";
      existingNotification.metadata = { messagePreview: messagePreview || "New message" };
      await existingNotification.save();
      return res.status(200).json({ message: "Notification updated" });
    }

    // Get sender info
    const sender = await User.findById(senderId).select("fullName profilePic");
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    const notification = new Notification({
      user: userId,
      type: "message",
      message: `${sender.fullName} sent you a message`,
      sender: senderId,
      channelId: channelId,
      metadata: {
        messagePreview: messagePreview || "New message",
      },
    });

    await notification.save();
    res.status(201).json({ message: "Notification created", notification });
  } catch (error) {
    console.error("Error creating message notification:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

