const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth header:", req.headers.authorization);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    // Optionally fetch user from DB:
    // const user = await User.findById(decoded.id);
    // if (!user) return res.status(404).json({ message: 'User not found.' });
    // req.user = user;
    req.user = decoded; // Just the decoded payload (id)
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid." });
  }
};

module.exports = authMiddleware;
