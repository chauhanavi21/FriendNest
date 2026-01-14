/**
 * Script to update existing Stream Chat users to remove the 'user' role
 * This allows them to use default permissions instead of restricted 'user' role
 * 
 * Run this script to fix existing users:
 * node backend/scripts/update-stream-users-remove-role.js
 */

import { StreamChat } from "stream-chat";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import User from "../src/models/User.js";
import mongoose from "mongoose";

// Load environment variables from backend/.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

// Also try loading from root .env if backend/.env doesn't exist
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
  console.error("MongoDB URI is missing. Please check your .env file for MONGO_URI or MONGODB_URI");
  process.exit(1);
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

async function updateStreamUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get all users from database with profile pics
    const users = await User.find({}).select("_id role fullName profilePic");
    console.log(`\n📋 Found ${users.length} users in database`);

    const updates = [];
    let adminCount = 0;
    let regularUserCount = 0;

    for (const user of users) {
      const userId = user._id.toString();
      
      if (user.role === "admin") {
        // Keep admin role for admin users
        updates.push({
          id: userId,
          name: user.fullName || "User",
          image: user.profilePic || "", // Include avatar
          role: "admin", // Keep admin role
        });
        adminCount++;
      } else {
        // Try to explicitly remove role by setting it to null/empty
        // Stream Chat might require explicit null to remove role
        updates.push({
          id: userId,
          name: user.fullName || "User",
          image: user.profilePic || "", // Include avatar
          role: null, // Explicitly set to null to try removing it
        });
        regularUserCount++;
      }
    }

    console.log(`\n🔄 Updating Stream Chat users:`);
    console.log(`   - Admin users: ${adminCount} (keeping admin role)`);
    console.log(`   - Regular users: ${regularUserCount} (removing role)`);

    // Update users in batches of 100 (Stream Chat limit)
    const batchSize = 100;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      await streamClient.upsertUsers(batch);
      console.log(`   ✅ Updated batch ${Math.floor(i / batchSize) + 1} (${batch.length} users)`);
    }

    console.log(`\n✅ Successfully updated ${updates.length} Stream Chat users!`);
    console.log(`\n💡 Regular users should now have default permissions.`);
    console.log(`   Admin users retain their admin role with elevated permissions.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error updating Stream users:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateStreamUsers();
