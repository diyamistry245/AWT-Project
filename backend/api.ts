/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { randomBytes, randomInt } from "crypto";
import { connectDB } from "./db";
import { registerUser } from "./auth";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const RESET_COLLECTION = "password_reset_requests";
const FEATURE_COLLECTION = "student_feature_data";
const SESSION_COLLECTION = "student_sessions";

type ResetStatus = "pending" | "approved" | "rejected" | "completed" | "expired";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

function validObjectId(value: unknown): value is string {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
}

function toObjectId(value: string): ObjectId {
  return new ObjectId(value);
}

function safeStudent(student: Record<string, any>) {
  const { password, reset_token, reset_token_expiry, ...safe } = student;

  return {
    ...safe,
    id: student._id.toString(),
  };
}

async function authenticateAdmin(email: unknown, password: unknown) {
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return null;
  }

  const db = await connectDB();

  const admin = await db.collection("users").findOne({
    email: email.trim().toLowerCase(),
    role: "admin",
  });

  if (
    !admin ||
    typeof admin.password !== "string" ||
    !(await bcrypt.compare(password, admin.password))
  ) {
    return null;
  }

  return admin;
}

async function getResetRequest(requestId: unknown) {
  const id = Number(requestId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  const db = await connectDB();

  return db.collection(RESET_COLLECTION).findOne({
    request_id: id,
  });
}

async function expireRequestIfNeeded(request: any) {
  if (
    request.status === "pending" &&
    request.expires_at &&
    new Date(request.expires_at).getTime() <= Date.now()
  ) {
    const db = await connectDB();

    await db.collection(RESET_COLLECTION).updateOne(
      {
        request_id: request.request_id,
        status: "pending",
      },
      {
        $set: {
          status: "expired",
          updated_at: new Date(),
        },
      },
    );

    request.status = "expired";
  }
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "CareerPilot AI MongoDB API is running",
  });
});

/* =========================================================
   REGISTRATION
========================================================= */

app.post("/register", async (req, res) => {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Registration failed.",
    });
  }
});

/* =========================================================
   STUDENT LOGIN
========================================================= */

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user || typeof user.password !== "string") {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Please use Admin Login.",
      });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    await users.updateOne({ _id: user._id }, { $set: { last_login: new Date() } });

    const latestRequest = await db
      .collection(RESET_COLLECTION)
      .findOne({ user_id: user._id }, { sort: { created_at: -1 } });

    let resetNotice: string | null = null;

    if (latestRequest?.status === "approved") {
      resetNotice = "Your password-reset request was approved. You can now set a new password.";
    } else if (latestRequest?.status === "rejected") {
      resetNotice = "Your password-reset request was rejected. You may submit another request.";
    } else if (latestRequest?.status === "completed") {
      resetNotice = "Your password was successfully reset.";
    }

    return res.json({
      success: true,
      message: "Login successful",
      resetNotice,
      user: {
        id: user._id.toString(),
        name: user.name ?? "",
        email: user.email,
        college: user.college ?? "",
        semester: user.semester ?? "",
        branch: user.branch ?? "",
        role: user.role ?? "student",
      },
    });
  } catch (error) {
    console.error("Student login error:", error);

    return res.status(500).json({
      success: false,
      message: "Student login failed.",
    });
  }
});

/* =========================================================
   ADMIN LOGIN
========================================================= */

app.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await authenticateAdmin(email, password);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    const db = await connectDB();

    await db
      .collection("users")
      .updateOne({ _id: admin._id }, { $set: { last_login: new Date() } });

    return res.json({
      success: true,
      message: "Admin login successful",
      user: {
        id: admin._id.toString(),
        name: admin.name ?? "Admin",
        email: admin.email,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed.",
    });
  }
});

/* =========================================================
   GET STUDENT PROFILE
   GET /student/:id
========================================================= */

app.get("/student/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!validObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const db = await connectDB();

    const student = await db.collection("users").findOne({
      _id: toObjectId(id),
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    return res.json({
      success: true,
      student: {
        ...safeStudent(student),
        cgpa: student.cgpa ?? 0,
        semester: student.semester ?? 0,
        skills: student.skills ?? [],
        interests: student.interests ?? [],
      },
    });
  } catch (error) {
    console.error("Get student profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load student profile.",
    });
  }
});

/* =========================================================
   UPDATE STUDENT PROFILE
   PUT /student/:id
========================================================= */

app.put("/student/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!validObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const db = await connectDB();
    const userId = toObjectId(id);

    const student = await db.collection("users").findOne({
      _id: userId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found.",
      });
    }

    const allowedFields = [
      "name",
      "college",
      "branch",
      "semester",
      "cgpa",
      "career_id",
      "dream_company_id",
      "skills",
      "interests",
      "daily_hours",
      "learning_style",
      "projects_done",
      "github_repos",
      "internships",
      "communication",
      "portfolio",
      "interview_prep",
      "level",
    ];

    const numericFields = [
      "semester",
      "cgpa",
      "daily_hours",
      "projects_done",
      "github_repos",
      "internships",
      "communication",
      "portfolio",
      "interview_prep",
    ];

    const textFields = [
      "name",
      "college",
      "branch",
      "career_id",
      "dream_company_id",
      "learning_style",
      "level",
    ];

    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (!Object.prototype.hasOwnProperty.call(req.body, field)) {
        continue;
      }

      let value = req.body[field];

      if (numericFields.includes(field)) {
        if (value === "" || value === null) {
          value = null;
        } else if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
          return res.status(400).json({
            success: false,
            message: `${field} must be a non-negative number or null.`,
          });
        }
      }

      if (field === "cgpa" && value !== null && value > 10) {
        return res.status(400).json({
          success: false,
          message: "CGPA must be between 0 and 10.",
        });
      }

      if (field === "semester" && value !== null && (!Number.isInteger(value) || value > 12)) {
        return res.status(400).json({
          success: false,
          message: "Semester must be a whole number between 0 and 12.",
        });
      }

      if (textFields.includes(field) && typeof value !== "string") {
        return res.status(400).json({
          success: false,
          message: `${field} must be text.`,
        });
      }

      if (["skills", "interests"].includes(field)) {
        if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
          return res.status(400).json({
            success: false,
            message: `${field} must be an array of strings.`,
          });
        }
      }

      updates[field] = value;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid profile fields were provided.",
      });
    }

    await db.collection("users").updateOne(
      { _id: userId, role: "student" },
      {
        $set: {
          ...updates,
          updated_at: new Date(),
        },
      },
    );

    const updatedStudent = await db.collection("users").findOne({
      _id: userId,
      role: "student",
    });

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found after update.",
      });
    }

    return res.json({
      success: true,
      message: "Student profile updated successfully.",
      student: safeStudent(updatedStudent),
    });
  } catch (error) {
    console.error("Update student profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update student profile.",
    });
  }
});

/* =========================================================
   FORGOT PASSWORD
========================================================= */

app.post("/forgot-password", async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Enter your registered email.",
      });
    }

    const db = await connectDB();

    const user = await db.collection("users").findOne({
      email,
      role: { $ne: "admin" },
    });

    if (!user) {
      return res.json({
        success: true,
        message: "If this email is registered, your request can be submitted for review.",
      });
    }

    const now = new Date();
    const requestId = Date.now() * 1000 + randomInt(100, 999);
    const requestSecret = randomBytes(32).toString("hex");

    await db.collection(RESET_COLLECTION).insertOne({
      request_id: requestId,
      user_id: user._id,
      request_secret_hash: await bcrypt.hash(requestSecret, 10),
      status: "pending" satisfies ResetStatus,
      created_at: now,
      updated_at: now,
      expires_at: new Date(now.getTime() + 30 * 60 * 1000),
    });

    return res.status(201).json({
      success: true,
      requestId,
      requestSecret,
      message: "Your request has been submitted. Waiting for administrator approval.",
    });
  } catch (error) {
    console.error("Forgot-password request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your request.",
    });
  }
});

/* =========================================================
   CHECK PASSWORD-RESET STATUS
========================================================= */

app.post("/password-reset-status", async (req, res) => {
  try {
    const request = await getResetRequest(req.body.requestId);
    const secret = req.body.requestSecret;

    if (!request || typeof secret !== "string") {
      return res.status(404).json({
        success: false,
        message: "Password-reset request not found.",
      });
    }

    if (
      typeof request.request_secret_hash !== "string" ||
      !(await bcrypt.compare(secret, request.request_secret_hash))
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid request verification details.",
      });
    }

    await expireRequestIfNeeded(request);

    return res.json({
      success: true,
      status: request.status,
      message:
        request.status === "approved"
          ? "Your request was approved. You can now set a new password."
          : request.status === "rejected"
            ? "Your request was rejected. You may submit another request."
            : request.status === "completed"
              ? "Your password has been changed successfully."
              : request.status === "expired"
                ? "Your request expired. Please submit a new request."
                : "Your request is waiting for administrator approval.",
    });
  } catch (error) {
    console.error("Password-reset status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check request status.",
    });
  }
});

/* =========================================================
   ADMIN LISTS PASSWORD-RESET REQUESTS
========================================================= */

app.get("/admin/password-reset-requests", async (req, res) => {
  try {
    const email = String(req.headers["x-admin-email"] ?? "");
    const password = String(req.headers["x-admin-password"] ?? "");

    const admin = await authenticateAdmin(email, password);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
      });
    }

    const db = await connectDB();

    const requests = await db
      .collection(RESET_COLLECTION)
      .aggregate([
        { $sort: { created_at: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "student",
          },
        },
        { $unwind: "$student" },
        {
          $project: {
            _id: 0,
            requestId: "$request_id",
            userId: "$user_id",
            name: "$student.name",
            email: "$student.email",
            college: "$student.college",
            branch: "$student.branch",
            semester: "$student.semester",
            status: 1,
            createdAt: "$created_at",
            expiresAt: "$expires_at",
          },
        },
      ])
      .toArray();

    return res.json({ success: true, requests });
  } catch (error) {
    console.error("Admin reset-request list error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load password-reset requests.",
    });
  }
});

/* =========================================================
   ADMIN APPROVES OR REJECTS PASSWORD RESET
========================================================= */

app.post("/admin/password-reset-requests/:requestId/decision", async (req, res) => {
  try {
    const { adminEmail, adminPassword, decision } = req.body;

    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be approve or reject.",
      });
    }

    const admin = await authenticateAdmin(adminEmail, adminPassword);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
      });
    }

    const request = await getResetRequest(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found.",
      });
    }

    await expireRequestIfNeeded(request);

    if (request.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: `This request is already ${request.status}.`,
      });
    }

    const db = await connectDB();

    const newStatus: ResetStatus = decision === "approve" ? "approved" : "rejected";

    const result = await db.collection(RESET_COLLECTION).updateOne(
      {
        request_id: request.request_id,
        status: "pending",
      },
      {
        $set: {
          status: newStatus,
          decided_at: new Date(),
          decided_by: admin._id,
          updated_at: new Date(),
        },
      },
    );

    if (!result.modifiedCount) {
      return res.status(409).json({
        success: false,
        message: "The request has already been processed.",
      });
    }

    return res.json({
      success: true,
      status: newStatus,
      message: `Password-reset request ${newStatus}.`,
    });
  } catch (error) {
    console.error("Admin reset decision error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update this request.",
    });
  }
});

/* =========================================================
   STUDENT SETS A NEW PASSWORD AFTER APPROVAL
========================================================= */

app.post("/reset-password", async (req, res) => {
  try {
    const { requestId, requestSecret, newPassword, confirmPassword } = req.body;

    if (
      typeof requestSecret !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete all required fields.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    const request = await getResetRequest(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Password-reset request not found.",
      });
    }

    if (
      typeof request.request_secret_hash !== "string" ||
      !(await bcrypt.compare(requestSecret, request.request_secret_hash))
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid request verification details.",
      });
    }

    await expireRequestIfNeeded(request);

    if (request.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: `Your request must be approved first. Current status: ${request.status}.`,
      });
    }

    const db = await connectDB();

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    const updateResult = await db.collection("users").updateOne(
      {
        _id: request.user_id,
        role: { $ne: "admin" },
      },
      {
        $set: { password: hashedPassword },
      },
    );

    if (!updateResult.matchedCount) {
      return res.status(404).json({
        success: false,
        message: "Student account not found.",
      });
    }

    const completion = await db.collection(RESET_COLLECTION).updateOne(
      {
        request_id: request.request_id,
        status: "approved",
      },
      {
        $set: {
          status: "completed",
          completed_at: new Date(),
          updated_at: new Date(),
        },
      },
    );

    if (!completion.modifiedCount) {
      return res.status(409).json({
        success: false,
        message: "The reset request has already been processed.",
      });
    }

    return res.json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset-password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset your password.",
    });
  }
});

/* =========================================================
   ADMIN: REGISTERED STUDENTS
========================================================= */

app.get("/admin/users", async (_req, res) => {
  try {
    const db = await connectDB();

    const users = await db
      .collection("users")
      .find({ role: { $ne: "admin" } })
      .project({
        password: 0,
        reset_token: 0,
        reset_token_expiry: 0,
      })
      .sort({ _id: -1 })
      .toArray();

    return res.json({
      success: true,
      users: users.map((user) => safeStudent(user)),
    });
  } catch (error) {
    console.error("Admin users error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
});

/* =========================================================
   STUDENT FEATURE DATA
========================================================= */

const allowedFeatures = new Set([
  "roadmap",
  "roadmap-progress",
  "weekly-goals",
  "journal",
  "readiness-reports",
  "feedback",
  "projects",
  "resources",
  "skills",
  "career-comparisons",
  "ai-mentor",
]);

app.get("/api/student-data/:userId/:feature", async (req, res) => {
  try {
    const { userId: id, feature } = req.params;

    if (!validObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    if (!allowedFeatures.has(feature)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported feature.",
      });
    }

    const userId = toObjectId(id);
    const db = await connectDB();

    const student = await db.collection("users").findOne({
      _id: userId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const records = await db
      .collection(FEATURE_COLLECTION)
      .find({ user_id: userId, feature })
      .sort({ updated_at: -1 })
      .toArray();

    return res.json({
      success: true,
      feature,
      data: records.map((record) => ({
        id: record._id.toString(),
        data: record.data,
        created_at: record.created_at,
        updated_at: record.updated_at,
      })),
    });
  } catch (error) {
    console.error("Fetch student feature data error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch feature data.",
    });
  }
});

app.put("/api/student-data/:userId/:feature", async (req, res) => {
  try {
    const { userId: id, feature } = req.params;
    const data = req.body.data;

    if (!validObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    if (!allowedFeatures.has(feature)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported feature.",
      });
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: "Data must be a JSON object.",
      });
    }

    const userId = toObjectId(id);
    const db = await connectDB();

    const student = await db.collection("users").findOne({
      _id: userId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const now = new Date();

    const result = await db.collection(FEATURE_COLLECTION).insertOne({
      user_id: userId,
      feature,
      data,
      created_at: now,
      updated_at: now,
    });

    return res.status(201).json({
      success: true,
      message: "Feature data saved successfully.",
      id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Save student feature data error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save feature data.",
    });
  }
});

/* =========================================================
   ADMIN DASHBOARD STATISTICS
========================================================= */

app.get("/admin/stats", async (_req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const [
      totalStudents,
      totalAdmins,
      activeStudents,
      careerCount,
      skillCount,
      companyCount,
      projectCount,
      resourceCount,
      totalGoals,
      totalFeedback,
      totalSessions,
    ] = await Promise.all([
      users.countDocuments({ role: "student" }),
      users.countDocuments({ role: "admin" }),
      users.countDocuments({ role: "student", active: true }),
      db.collection("careers").countDocuments(),
      db.collection("skills").countDocuments(),
      db.collection("companies").countDocuments(),
      db.collection("projects").countDocuments(),
      db.collection("resources").countDocuments(),
      db.collection(FEATURE_COLLECTION).countDocuments({
        feature: "weekly-goals",
      }),
      db.collection(FEATURE_COLLECTION).countDocuments({
        feature: "feedback",
      }),
      db.collection(SESSION_COLLECTION).countDocuments(),
    ]);

    return res.json({
      success: true,
      stats: {
        totalStudents,
        totalAdmins,
        activeStudents,
        careerCount,
        skillCount,
        companyCount,
        projectCount,
        resourceCount,
        totalGoals,
        totalFeedback,
        totalSessions,
      },
    });
  } catch (error) {
    console.error("Admin statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics.",
    });
  }
});

/* =========================================================
   ADMIN STUDENT LOGIN ACTIVITY
========================================================= */

app.get("/admin/activity", async (_req, res) => {
  try {
    const db = await connectDB();

    const sessions = await db
      .collection(SESSION_COLLECTION)
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "student",
          },
        },
        {
          $unwind: {
            path: "$student",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $sort: { login_time: -1 } },
        { $limit: 100 },
      ])
      .toArray();

    const activity = sessions.map((session) => {
      const logoutTime = session.logout_time ?? null;
      const loginTime = session.login_time ? new Date(session.login_time) : null;

      return {
        id: session._id.toString(),
        session_id: session._id.toString(),
        userId: session.user_id?.toString() ?? "",
        user_id: session.user_id?.toString() ?? "",
        name: session.student?.name ?? "Unknown student",
        email: session.student?.email ?? "",
        login_time: session.login_time ?? null,
        logout_time: logoutTime,
        duration_minutes:
          loginTime && logoutTime
            ? Math.max(
                0,
                Math.round((new Date(logoutTime).getTime() - loginTime.getTime()) / 60000),
              )
            : null,
        status: logoutTime ? "Completed" : "Active",
        session_status: logoutTime ? "Completed" : "Active",
      };
    });

    return res.json({
      success: true,
      activity,
      activities: activity,
      sessions: activity,
    });
  } catch (error) {
    console.error("Admin activity error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load student activity.",
    });
  }
});

/* =========================================================
   START STUDENT SESSION
========================================================= */

app.post("/student/session/start", async (req, res) => {
  try {
    if (!validObjectId(req.body.userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const userId = toObjectId(req.body.userId);
    const db = await connectDB();

    const student = await db.collection("users").findOne({
      _id: userId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const result = await db.collection(SESSION_COLLECTION).insertOne({
      user_id: userId,
      login_time: new Date(),
      logout_time: null,
    });

    return res.status(201).json({
      success: true,
      sessionId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Start student session error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to record login activity.",
    });
  }
});

/* =========================================================
   END STUDENT SESSION
========================================================= */

app.post("/student/session/end", async (req, res) => {
  try {
    if (!validObjectId(req.body.sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID.",
      });
    }

    const db = await connectDB();

    const result = await db.collection(SESSION_COLLECTION).updateOne(
      {
        _id: toObjectId(req.body.sessionId),
        logout_time: null,
      },
      {
        $set: { logout_time: new Date() },
      },
    );

    if (!result.matchedCount) {
      return res.status(404).json({
        success: false,
        message: "Active session not found.",
      });
    }

    return res.json({
      success: true,
      message: "Logout activity recorded.",
    });
  } catch (error) {
    console.error("End student session error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to record logout activity.",
    });
  }
});

/* =========================================================
   BACKWARD-COMPATIBLE LOGOUT
========================================================= */

app.post("/logout", async (req, res) => {
  try {
    if (!validObjectId(req.body.userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID.",
      });
    }

    const db = await connectDB();

    const result = await db.collection(SESSION_COLLECTION).updateOne(
      {
        user_id: toObjectId(req.body.userId),
        logout_time: null,
      },
      {
        $set: { logout_time: new Date() },
      },
      {
        sort: { login_time: -1 },
      } as any,
    );

    return res.json({
      success: true,
      message: result.modifiedCount ? "Logout activity recorded." : "No active session found.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to record logout activity.",
    });
  }
});

/* =========================================================
   ENSURE ADMIN ACCOUNT EXISTS
========================================================= */

async function ensureAdminAccount() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME?.trim() || "CareerPilot Admin";

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured in backend/.env");
  }

  const db = await connectDB();
  const users = db.collection("users");

  const existing = await users.findOne({
    email: adminEmail,
  });

  if (existing) {
    if (existing.role !== "admin") {
      throw new Error(`Configured admin email ${adminEmail} belongs to a non-admin account.`);
    }

    console.log(`Admin account already exists: ${adminEmail}`);
    return;
  }

  await users.insertOne({
    name: adminName,
    email: adminEmail,
    password: await bcrypt.hash(adminPassword, 12),
    role: "admin",
    active: true,
    created_at: new Date(),
    last_login: null,
  });

  console.log(`Created admin account: ${adminEmail}`);
}

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    await connectDB();
    await ensureAdminAccount();

    app.listen(PORT, () => {
      console.log(`CareerPilot AI API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start API:", error);
    process.exit(1);
  }
}

void startServer();
