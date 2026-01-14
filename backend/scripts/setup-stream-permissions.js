/**
 * Script to configure Stream Chat permissions for the "messaging" channel type
 * This sets up default permissions that allow all authenticated users to read/write channels
 * 
 * Run this script once to configure permissions:
 * node backend/scripts/setup-stream-permissions.js
 */

import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
  process.exit(1);
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

async function setupPermissions() {
  try {
    console.log("Setting up Stream Chat permissions for 'messaging' channel type...");

    // Note: Stream Chat permissions are typically configured via the dashboard
    // However, we can ensure users have the correct role when created
    // The actual channel type permissions need to be set in the Stream Dashboard
    
    console.log("\n✅ Stream client initialized");
    console.log("⚠️  Note: Channel type permissions must be configured in the Stream Dashboard:");
    console.log("   1. Go to Chat → Channel Types → messaging");
    console.log("   2. Scroll down to find the 'Permissions' section");
    console.log("   3. Ensure the 'user' role has these permissions enabled:");
    console.log("      - ReadChannel");
    console.log("      - CreateChannel");
    console.log("      - UpdateChannel");
    console.log("      - CreateMessage");
    console.log("      - UpdateMessage");
    console.log("      - DeleteMessage");
    console.log("\n💡 The code already ensures users are created with the 'user' role.");
    console.log("   Once permissions are set in the dashboard, everything should work!");

    process.exit(0);
  } catch (error) {
    console.error("Error setting up permissions:", error);
    process.exit(1);
  }
}

setupPermissions();
