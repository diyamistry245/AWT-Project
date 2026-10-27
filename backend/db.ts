import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), "backend", ".env"),
});

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || "CareerPilotCluster";

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (database) {
    return database;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Please check backend/.env");
  }

  try {
    const mongoClient = new MongoClient(MONGODB_URI);

    await mongoClient.connect();

    const db = mongoClient.db(DATABASE_NAME);

    await db.command({ ping: 1 });

    client = mongoClient;
    database = db;

    console.log(`Connected to MongoDB Atlas! Database: ${DATABASE_NAME}`);

    return database;
  } catch (error) {
    console.error("MongoDB connection failed:", error);

    if (client) {
      await client.close().catch(() => undefined);
      client = null;
    }

    database = null;
    throw error;
  }
}

export function getDB(): Db {
  if (!database) {
    throw new Error("Database is not connected. Call connectDB() first.");
  }

  return database;
}
