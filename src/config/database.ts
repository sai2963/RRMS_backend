import mongoose from "mongoose";
import { env } from "./env";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export const connectDatabase = async (): Promise<void> => {
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (error) {
      attempts++;
      console.error(
        `❌ MongoDB connection attempt ${attempts}/${MAX_RETRIES} failed`,
      );
      console.error(error);

      if (attempts >= MAX_RETRIES) {
        console.error("💥 Max retries reached. Exiting...");
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log("🔌 MongoDB disconnected");
};
