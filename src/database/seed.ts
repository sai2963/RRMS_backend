import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { connectDatabase, disconnectDatabase } from "../config/database";
import { User } from "../models/user.model";
import { Table } from "../models/table.model";
import { USER_ROLES, SALT_ROUNDS } from "../constants";

const TABLES_SEED = [
  { tableNumber: 1, seatingCapacity: 2 },
  { tableNumber: 2, seatingCapacity: 2 },
  { tableNumber: 3, seatingCapacity: 4 },
  { tableNumber: 4, seatingCapacity: 4 },
  { tableNumber: 5, seatingCapacity: 4 },
  { tableNumber: 6, seatingCapacity: 6 },
  { tableNumber: 7, seatingCapacity: 6 },
  { tableNumber: 8, seatingCapacity: 8 },
  { tableNumber: 9, seatingCapacity: 8 },
  { tableNumber: 10, seatingCapacity: 10 },
];

const ADMIN_SEED = {
  name: "Restaurant Admin",
  email: "admin@restaurant.com",
  password: "Admin@123",
  role: USER_ROLES.ADMIN,
};

const CUSTOMER_SEED = {
  name: "John Doe",
  email: "customer@restaurant.com",
  password: "Customer@123",
  role: USER_ROLES.CUSTOMER,
};

const seed = async (): Promise<void> => {
  await connectDatabase();

  console.log("🌱 Starting database seeding...");

  // Seed Tables
  const existingTables = await Table.countDocuments();
  if (existingTables === 0) {
    await Table.insertMany(TABLES_SEED);
    console.log(`✅ Seeded ${TABLES_SEED.length} tables`);
  } else {
    console.log(
      `ℹ️  Tables already seeded (${existingTables} found). Skipping.`,
    );
  }

  // Seed Admin User (Delete existing first to ensure password hash is clean and not double-hashed)
  await User.deleteOne({ email: ADMIN_SEED.email });
  await User.create(ADMIN_SEED);
  console.log(
    `✅ Admin user created: ${ADMIN_SEED.email} / ${ADMIN_SEED.password}`,
  );

  // Seed Customer User (Delete existing first to ensure password hash is clean)
  await User.deleteOne({ email: CUSTOMER_SEED.email });
  await User.create(CUSTOMER_SEED);
  console.log(
    `✅ Customer user created: ${CUSTOMER_SEED.email} / ${CUSTOMER_SEED.password}`,
  );

  console.log("✅ Seeding complete!");
  await disconnectDatabase();
  process.exit(0);
};

seed().catch((err: unknown) => {
  console.error("❌ Seeding failed:", err);
  void disconnectDatabase();
  process.exit(1);
});
