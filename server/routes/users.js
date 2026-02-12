const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// Get user profile by ID
router.get("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile
router.put("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Validate that the user is updating their own profile
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }
    
    const updateData = {};
    if (req.body.username !== undefined) updateData.username = req.body.username;
    if (req.body.bio !== undefined) updateData.bio = req.body.bio;
    if (req.body.profilePicture !== undefined) updateData.profilePicture = req.body.profilePicture;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Error updating user", error: err.message });
  }
});

// Delete user account
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User account deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
