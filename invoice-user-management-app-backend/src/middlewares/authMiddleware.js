const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");

      // Get user from database
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ msg: "User not found" });
      }

      // Set user in request
      req.user = user;
      next();
    } catch (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({ msg: "Token is not valid" });
    }
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = authMiddleware;
