const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  const { name, email, password, role, createdBy, groupId, timezone } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ msg: "User already exists" });
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    userId: `${role[0]}${Math.floor(Math.random() * 1000)}`,
    name,
    email,
    password: hashedPassword,
    role,
    createdBy,
    groupId,
    timezone,
  });

  const savedUser = await newUser.save();
  res.status(201).json(savedUser);
};

exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true });
  res.json(updatedUser);
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  await User.findByIdAndDelete(userId);
  res.status(204).json({ msg: "User deleted" });
};
