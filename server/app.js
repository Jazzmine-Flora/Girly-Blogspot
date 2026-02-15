require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const authMiddleware = require("./middleware/auth");
const ageCheckMiddleware = require("./middleware/age-check");
const jwt = require("jsonwebtoken");
const Post = require("./models/Post");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const defaultOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://girly-blogspot.vercel.app",
  "https://girly-blogspot-jazzmine-floras-projects.vercel.app",
];
const envOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [...defaultOrigins, ...envOrigins];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Make io available to routes
app.set("io", io);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", service: "girly-blogspot-api" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, ageCheckMiddleware, userRoutes);
// Legacy/alternate base paths (no /api prefix)
app.use("/auth", authRoutes);
app.use("/users", authMiddleware, ageCheckMiddleware, userRoutes);

// Feed route MUST be before posts router so /feed is not matched as /:id
// Supports pagination: ?limit=20&skip=0
app.get(
  "/api/posts/feed",
  authMiddleware,
  ageCheckMiddleware,
  async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
      const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
      const posts = await Post.find()
        .populate("author", "username profilePicture isAdmin")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      res.status(200).json(Array.isArray(posts) ? posts : []);
    } catch (error) {
      res.status(500).json({ message: "Error fetching feed", error: error.message });
    }
  }
);

// User posts route - must be before posts router so /user/:userId is not matched as /:id
app.get(
  "/api/posts/user/:userId",
  authMiddleware,
  ageCheckMiddleware,
  async (req, res) => {
    try {
      const rawUserId = req.params.userId?.trim();
      if (!rawUserId || !mongoose.Types.ObjectId.isValid(rawUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
      const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
      
      const authorId = new mongoose.Types.ObjectId(rawUserId);
      const posts = await Post.find({ author: authorId })
        .populate("author", "username profilePicture isAdmin")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      res.status(200).json(Array.isArray(posts) ? posts : []);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Error fetching user posts", error: error.message });
    }
  }
);

app.use("/api/posts", authMiddleware, ageCheckMiddleware, postRoutes);
app.get(
  "/posts/feed",
  authMiddleware,
  ageCheckMiddleware,
  async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
      const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
      const posts = await Post.find()
        .populate("author", "username profilePicture isAdmin")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      res.status(200).json(Array.isArray(posts) ? posts : []);
    } catch (error) {
      res.status(500).json({ message: "Error fetching feed", error: error.message });
    }
  }
);
app.get(
  "/posts/user/:userId",
  authMiddleware,
  ageCheckMiddleware,
  async (req, res) => {
    try {
      const rawUserId = req.params.userId?.trim();
      if (!rawUserId || !mongoose.Types.ObjectId.isValid(rawUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
      const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);

      const authorId = new mongoose.Types.ObjectId(rawUserId);
      const posts = await Post.find({ author: authorId })
        .populate("author", "username profilePicture isAdmin")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      res.status(200).json(Array.isArray(posts) ? posts : []);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      res.status(500).json({ message: "Error fetching user posts", error: error.message });
    }
  }
);
app.use("/posts", authMiddleware, ageCheckMiddleware, postRoutes);

// Socket.IO auth & connection
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://unisoftmw:Qwer123$@cluster0.mah6yam.mongodb.net/";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
