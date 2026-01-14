import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData, dbUserRole = "user") => {
  try {
    // Only set role for admin users (admin has built-in permissions)
    // For regular users, don't set a role - let Stream Chat use default permissions
    // This might allow users without a role to have default channel access
    const userToUpsert = {
      ...userData,
    };
    
    // Only set role if user is admin (admin needs explicit role for elevated permissions)
    if (dbUserRole === "admin") {
      userToUpsert.role = "admin";
    }
    // Don't set role for regular users - this might allow default permissions
    
    await streamClient.upsertUsers([userToUpsert]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

/**
 * Creates a messaging channel with proper member permissions
 * This ensures all members can read and write to the channel
 */
export const createMessagingChannel = async (channelId, members, channelData = {}) => {
  try {
    const channel = streamClient.channel("messaging", channelId, {
      ...channelData,
      members: members.map((m) => m.toString()),
    });
    
    await channel.create();
    
    // Explicitly add members to ensure they have access
    if (members.length > 0) {
      await channel.addMembers(members.map((m) => m.toString()));
    }
    
    return channel;
  } catch (error) {
    console.error("Error creating messaging channel:", error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
};

/**
 * Grant permissions to a user for a specific channel
 * This is a workaround if channel type permissions aren't configured
 */
export const grantChannelPermissions = async (userId, channelId) => {
  try {
    const channel = streamClient.channel("messaging", channelId);
    // Add user as member - this grants them read/write access
    await channel.addMembers([userId.toString()]);
    return true;
  } catch (error) {
    console.error("Error granting channel permissions:", error);
    return false;
  }
};

export { streamClient };
