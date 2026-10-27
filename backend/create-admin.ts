import bcrypt from "bcrypt";
import { connectDB, getDB } from "./db";

async function createAdmin() {
  const name = "CareerPilot Admin";
  const email = "diyamistry245gsfc@gmail.com";

  // Set your desired admin password using a secure environment variable.
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error("ADMIN_PASSWORD is missing from the environment.");
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();

    const db = getDB();

    // Check if the admin account already exists.
    const existing = await db.collection("users").findOne({
      email: email.toLowerCase(),
    });

    if (existing) {
      console.log("Admin account already exists.");
      return;
    }

    // Hash the password.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin account.
    await db.collection("users").insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      created_at: new Date(),
    });

    console.log("Admin account created successfully!");
    console.log("Email:", email);
    console.log("Password is stored securely as a hash.");
  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exitCode = 1;
  }
}

createAdmin();
