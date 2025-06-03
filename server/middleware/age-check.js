const User = require("../models/User");
module.exports = async function (req, res, next) {
  console.log("req.user in age-check:", req.user);

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.age < 13) {
      return res
        .status(403)
        .json({ message: "You must be at least 13 years old." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
};
