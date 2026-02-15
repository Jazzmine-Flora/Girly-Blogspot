const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ageCheck = require("../middleware/age-check");

const router = express.Router();

// Sign Up Route
router.post("/signup", async (req, res) => {
  const { username, password, bio, age } = req.body;
  const normalizedUsername = username?.trim();

  try {
    if (!normalizedUsername || !password || !age) {
      return res.status(400).json({ message: "Username, password, and age are required." });
    }

    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(409).json({ message: "Username is already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username: normalizedUsername, password: hashedPassword, bio, age }); // include age
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Username is already taken." });
    }
    res.status(500).json({ message: "Error creating user" });
  }
});

// Sign In Route
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, age: user.age, isAdmin: !!user.isAdmin },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, userId: user._id.toString() });
  } catch (error) {
    res.status(500).json({ message: "Error signing in", error });
  }
});

module.exports = router;
