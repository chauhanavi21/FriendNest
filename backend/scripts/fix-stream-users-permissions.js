/**
 * Script to fix Stream Chat user permissions
 * This will try to remove the 'user' role from all Stream Chat users
 * 
 * Run: node backend/scripts/fix-stream-users-permissions.js
 */

import { StreamChat } from "stream-chat";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import User from "../src/models/User.js";
import mongoose from "mongoose";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
  const rootEnvPath = resolve(__dirname, "../../.env");
  dotenv.config({ path: rootEnvPath });
}

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
  process.exit(1);
}

if (!MONGO_URI) {
  console.error("MongoDB URI is missing");
  process.exit(1);
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

async function fixStreamUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all users from database
    const users = await User.find({}).select("_id fullName profilePic");
    console.log(`📋 Found ${users.length} users in database\n`);

    console.log("🔄 Updating Stream Chat users to remove 'user' role...\n");

    // Update users one by one to ensure we're not setting any role
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const userId = user._id.toString();

      try {
        // Use partialUpdateUser to explicitly set role to null (remove role)
        await streamClient.partialUpdateUser({
          id: userId,
          set: { role: null }, // Explicitly remove the role
        });

        console.log(`   ✅ Removed role from: ${user.fullName || userId}`);
      } catch (error) {
        console.error(`   ❌ Error updating ${user.fullName || userId}:`, error.message);
      }
    }

    console.log(`\n✅ Updated ${users.length} Stream Chat users!`);
    console.log(`\n💡 Users should now have default permissions (no role restriction).`);
    console.log(`   If errors persist, permissions need to be configured in Stream Dashboard.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixStreamUsers();
