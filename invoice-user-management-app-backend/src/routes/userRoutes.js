const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

// Apply auth middleware to all routes
router.use(authMiddleware);

// User routes
router.post("/", userController.createUser);
router.get("/", userController.getUsers);
router.get("/:userId", userController.getUserById);
router.put("/:userId", userController.updateUser);
router.delete("/:userId", userController.deleteUser);
router.get("/groups", userController.getUserGroups);

module.exports = router;
