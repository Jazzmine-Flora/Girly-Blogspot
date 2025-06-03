const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ageCheck = require("../middleware/age-check");

const router = express.Router();

// Sign Up Route
router.post("/signup", async (req, res) => {
  console.log("Signup body:", req.body);
  const { username, password, bio, age } = req.body; // include age

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, bio, age }); // include age
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user", error });
  }
});

// Sign In Route
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  console.log("Signin attempt:", { username, password });

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found:", username);
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password for:", username);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // In your signin route, include age in the token:
    const token = jwt.sign(
      { id: user._id, age: user.age }, // include age
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "1h" }
    );
    console.log("Signin successful for:", username);
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Error signing in", error });
  }
});

module.exports = router;
