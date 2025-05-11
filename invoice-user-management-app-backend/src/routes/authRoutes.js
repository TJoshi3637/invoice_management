const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const User = require("../models/User");

router.post("/login", login);

// Add new endpoint to get current user data
router.get("/current-user", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return user data without sensitive information
        res.json({
            id: user.userId,
            name: user.name,
            email: user.email,
            role: user.role,
            groupId: user.groupId,
            timezone: user.timezone
        });
    } catch (error) {
        console.error('Error getting user data:', error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
