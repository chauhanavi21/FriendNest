import Group from "../models/Group.js";
import { StreamChat } from "stream-chat";
import "dotenv/config";

const streamClient = StreamChat.getInstance(
  process.env.STEAM_API_KEY,
  process.env.STEAM_API_SECRET
);

// Helper: ensure a Stream channel exists for a group
async function ensureGroupStreamChannel(group) {
  if (!streamClient) return group;

  try {
    if (group.streamChannelId) {
      return group;
    }

    const memberIds = group.members.map((m) => m.toString());
    const channelId = `group-${group._id}`;
    const channel = streamClient.channel("messaging", channelId, {
      name: group.name,
      members: memberIds,
    });

    await channel.create();
    if (memberIds.length > 0) {
      await channel.addMembers(memberIds);
    }

    group.streamChannelId = channelId;
    await group.save();

    return group;
  } catch (error) {
    console.error("Error ensuring Stream channel for group:", error);
    return group;
  }
}

// Create a new group
export async function createGroup(req, res) {
  try {
    const userId = req.user.id;
    const { name, description, language, coverImage } = req.body;

    if (!name || !language) {
      return res.status(400).json({ message: "Name and language are required" });
    }

    // Create group in MongoDB
    const group = new Group({
      name: name.trim(),
      description: description?.trim() || "",
      language,
      coverImage: coverImage || "",
      creator: userId,
      members: [userId], // Creator is automatically a member
    });

    await group.save();

    // Create Stream channel for group chat
    try {
      const channelId = `group-${group._id}`;
      const channel = streamClient.channel("messaging", channelId, {
        name: group.name,
        members: [userId],
      });

      await channel.create();
      await channel.addMembers([userId]);

      group.streamChannelId = channelId;
      await group.save();
    } catch (streamError) {
      console.error("Error creating Stream channel:", streamError);
      // Continue even if Stream channel creation fails
    }

    // Populate creator and members
    await group.populate("creator", "fullName profilePic");
    await group.populate("members", "fullName profilePic");

    res.status(201).json(group);
  } catch (error) {
    console.error("Error in createGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get all groups (with optional filtering)
export async function getGroups(req, res) {
  try {
    const { language, search } = req.query;
    const userId = req.user.id;

    let query = {};

    // Filter by language if provided
    if (language) {
      query.language = language;
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const groups = await Group.find(query)
      .populate("creator", "fullName profilePic")
      .populate("members", "fullName profilePic")
      .sort({ createdAt: -1 });

    // Add isMember flag to each group
    const groupsWithMembership = groups.map((group) => {
      const groupObj = group.toObject();
      groupObj.isMember = group.members.some(
        (member) => member._id.toString() === userId
      );
      groupObj.memberCount = group.members.length;
      return groupObj;
    });

    res.status(200).json(groupsWithMembership);
  } catch (error) {
    console.error("Error in getGroups controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get groups user is a member of
export async function getMyGroups(req, res) {
  try {
    const userId = req.user.id;

    const groups = await Group.find({ members: userId })
      .populate("creator", "fullName profilePic")
      .populate("members", "fullName profilePic")
      .sort({ updatedAt: -1 });

    const groupsWithCounts = groups.map((group) => {
      const groupObj = group.toObject();
      groupObj.memberCount = group.members.length;
      return groupObj;
    });

    res.status(200).json(groupsWithCounts);
  } catch (error) {
    console.error("Error in getMyGroups controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Get a single group by ID
export async function getGroupById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let group = await Group.findById(id)
      .populate("creator", "fullName profilePic email")
      .populate("members", "fullName profilePic")
      .populate("events.organizer", "fullName profilePic")
      .populate("events.attendees", "fullName profilePic");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Ensure Stream channel exists (for older groups that were created before chat integration)
    group = await ensureGroupStreamChannel(group);

    const groupObj = group.toObject();
    groupObj.isMember = group.members.some(
      (member) => member._id.toString() === userId
    );
    groupObj.isCreator = group.creator._id.toString() === userId;
    groupObj.memberCount = group.members.length;

    res.status(200).json(groupObj);
  } catch (error) {
    console.error("Error in getGroupById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Join a group
export async function joinGroup(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "You are already a member of this group" });
    }

    group.members.push(userId);
    await group.save();

    // Add user to Stream channel
    if (group.streamChannelId) {
      try {
        const channel = streamClient.channel("messaging", group.streamChannelId);
        await channel.addMembers([userId]);
      } catch (streamError) {
        console.error("Error adding user to Stream channel:", streamError);
      }
    }

    await group.populate("members", "fullName profilePic");

    res.status(200).json({
      message: "Successfully joined group",
      group: {
        ...group.toObject(),
        memberCount: group.members.length,
      },
    });
  } catch (error) {
    console.error("Error in joinGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Leave a group
export async function leaveGroup(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.creator.toString() === userId) {
      return res.status(400).json({ message: "Group creator cannot leave the group. Delete the group instead." });
    }

    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId
    );
    await group.save();

    // Remove user from Stream channel
    if (group.streamChannelId) {
      try {
        const channel = streamClient.channel("messaging", group.streamChannelId);
        await channel.removeMembers([userId]);
      } catch (streamError) {
        console.error("Error removing user from Stream channel:", streamError);
      }
    }

    res.status(200).json({ message: "Successfully left group" });
  } catch (error) {
    console.error("Error in leaveGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Update group (only creator can update)
export async function updateGroup(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, language, coverImage } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.creator.toString() !== userId) {
      return res.status(403).json({ message: "Only the group creator can update the group" });
    }

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();
    if (language) group.language = language;
    if (coverImage !== undefined) group.coverImage = coverImage;

    await group.save();

    // Update Stream channel name if name changed
    if (name && group.streamChannelId) {
      try {
        const channel = streamClient.channel("messaging", group.streamChannelId);
        await channel.updatePartial({ set: { name: group.name } });
      } catch (streamError) {
        console.error("Error updating Stream channel:", streamError);
      }
    }

    await group.populate("creator", "fullName profilePic");
    await group.populate("members", "fullName profilePic");

    res.status(200).json(group);
  } catch (error) {
    console.error("Error in updateGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Delete group (only creator can delete)
export async function deleteGroup(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.creator.toString() !== userId) {
      return res.status(403).json({ message: "Only the group creator can delete the group" });
    }

    // Delete Stream channel
    if (group.streamChannelId) {
      try {
        const channel = streamClient.channel("messaging", group.streamChannelId);
        await channel.delete();
      } catch (streamError) {
        console.error("Error deleting Stream channel:", streamError);
      }
    }

    await Group.findByIdAndDelete(id);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Create an event in a group
export async function createEvent(req, res) {
  try {
    const userId = req.user.id;
    const { id: groupId } = req.params;
    const { title, description, date, location } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      return res.status(403).json({ message: "You must be a member of the group to create events" });
    }

    const event = {
      title: title.trim(),
      description: description?.trim() || "",
      date: new Date(date),
      location: location?.trim() || "",
      organizer: userId,
      attendees: [userId], // Organizer is automatically an attendee
    };

    group.events.push(event);
    await group.save();

    await group.populate("events.organizer", "fullName profilePic");
    await group.populate("events.attendees", "fullName profilePic");

    const createdEvent = group.events[group.events.length - 1];

    res.status(201).json(createdEvent);
  } catch (error) {
    console.error("Error in createEvent controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Join an event (RSVP)
export async function joinEvent(req, res) {
  try {
    const userId = req.user.id;
    const { id: groupId, eventId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const event = group.events.id(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: "You are already attending this event" });
    }

    event.attendees.push(userId);
    await group.save();

    await event.populate("attendees", "fullName profilePic");

    res.status(200).json({
      message: "Successfully joined event",
      event,
    });
  } catch (error) {
    console.error("Error in joinEvent controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Leave an event (cancel RSVP)
export async function leaveEvent(req, res) {
  try {
    const userId = req.user.id;
    const { id: groupId, eventId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const event = group.events.id(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.attendees.includes(userId)) {
      return res.status(400).json({ message: "You are not attending this event" });
    }

    event.attendees = event.attendees.filter(
      (attendeeId) => attendeeId.toString() !== userId
    );
    await group.save();

    res.status(200).json({ message: "Successfully left event" });
  } catch (error) {
    console.error("Error in leaveEvent controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Delete an event (only organizer can delete)
export async function deleteEvent(req, res) {
  try {
    const userId = req.user.id;
    const { id: groupId, eventId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const event = group.events.id(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.organizer.toString() !== userId) {
      return res.status(403).json({ message: "Only the event organizer can delete the event" });
    }

    group.events.pull(eventId);
    await group.save();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error in deleteEvent controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

