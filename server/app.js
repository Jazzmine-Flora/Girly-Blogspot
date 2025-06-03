const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users");
const authMiddleware = require("./middleware/auth");
const ageCheckMiddleware = require("./middleware/age-check");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Middleware
app.use(express.json());

// Public routes (no auth/age check)
app.use("/api/auth", authRoutes);

// Protected routes (with auth/age check)
app.use("/api/users", authMiddleware, ageCheckMiddleware, userRoutes);
app.use("/api/posts", authMiddleware, ageCheckMiddleware, postRoutes);

// Database connection
mongoose
  .connect("mongodb://localhost:27017/girly-blog", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
