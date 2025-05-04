const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { roleMiddleware } = require("../middlewares/roleMiddleware");

router.post("/create", authMiddleware, roleMiddleware("ADMIN"), userController.createUser);
router.get("/", authMiddleware, userController.getUsers);
router.put("/:userId", authMiddleware, roleMiddleware("ADMIN"), userController.updateUser);
router.delete("/:userId", authMiddleware, roleMiddleware("ADMIN"), userController.deleteUser);

module.exports = router;
