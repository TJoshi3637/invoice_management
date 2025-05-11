// src/controllers/authController.js

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Add bcrypt for direct comparison if needed

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", { username, passwordLength: password?.length });

    // Input validation
    if (!username || !password) {
      console.log("Missing credentials:", { username: !!username, password: !!password });
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: username },
        { userId: username }
      ]
    });

    if (!user) {
      console.log("User not found:", username);
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    console.log("Found user:", {
      userId: user.userId,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password
    });

    // Try both comparison methods
    let isMatch = false;
    try {
      // First try the model's method
      isMatch = await user.comparePassword(password);
      console.log("Password match using model method:", isMatch);

      // If that fails, try direct bcrypt comparison
      if (!isMatch) {
        isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match using direct bcrypt:", isMatch);
      }
    } catch (error) {
      console.error("Password comparison error:", error);
      return res.status(500).json({
        message: "Error validating password"
      });
    }

    if (!isMatch) {
      console.log("Password validation failed for user:", user.userId);
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // Create token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        userId: user.userId
      },
      process.env.JWT_SECRET || "secretKey",
      { expiresIn: "1d" }
    );

    console.log("Login successful for user:", user.userId);

    // Return complete user data structure
    res.json({
      token,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        adminGroup: user.adminGroup,
        unitManagerGroup: user.unitManagerGroup,
        createdBy: user.createdBy,
        timezone: user.timezone
      }
    });
  } catch (err) {
    console.error("Login error:", err);

    // Handle specific error cases
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: "Invalid input data"
      });
    }

    res.status(500).json({
      message: "An error occurred during login. Please try again."
    });
  }
};

module.exports = { login };
