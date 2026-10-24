import bcrypt from "bcrypt";
import { connectDB } from "./db";

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  college?: string;
  semester?: string | number;
  branch?: string;
}

export async function registerUser(data: RegisterUserData) {
  const name = data.name?.trim();
  const email = data.email?.trim().toLowerCase();
  const password = data.password;

  const college = data.college?.trim() ?? "";
  const branch = data.branch?.trim() ?? "";
  const semester = data.semester ?? "";

  // Validate required fields
  if (!name || !email || !password) {
    throw new Error("Name, email and password are required");
  }

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please enter a valid email address");
  }

  // Validate password
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  // Connect to MongoDB
  const database = await connectDB();
  const users = database.collection("users");

  // Prevent duplicate accounts
  const existingUser = await users.findOne({ email });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create student account
  const result = await users.insertOne({
    name,
    email,
    password: hashedPassword,
    college,
    semester,
    branch,
    role: "student",
    active: true,
    created_at: new Date(),
    last_login: null,

    // Default profile fields
    cgpa: 0,
    career_id: "",
    dream_company_id: "",
    skills: [],
    interests: [],
    daily_hours: 0,
    learning_style: "Visual",
    projects_done: 0,
    github_repos: 0,
    internships: 0,
    communication: 0,
    portfolio: 0,
    interview_prep: 0,
  });

  return {
    success: true,
    message: "Account created successfully",
    userId: result.insertedId.toString(),
  };
}
