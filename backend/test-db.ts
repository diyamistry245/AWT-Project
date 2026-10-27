import { connectToDatabase, closeDatabase } from "./db";

async function testDatabase() {
  try {
    const db = await connectToDatabase();

    const result = await db.command({ ping: 1 });

    console.log("MongoDB connected successfully!");
    console.log("Ping result:", result);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await closeDatabase();
  }
}

testDatabase();
