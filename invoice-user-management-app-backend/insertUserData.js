const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

async function insertUserData() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/invoiceDB');
        console.log('Connected to MongoDB');

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create user data
        const userData = {
            userId: 'A001',
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'ADMIN',
            createdBy: 'SYSTEM',
            groupId: 'G001',
            timezone: 'UTC'
        };

        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            console.log('User already exists:', existingUser.email);
            return;
        }

        // Create and save the user
        const newUser = new User(userData);
        const savedUser = await newUser.save();
        console.log('User created successfully:', {
            id: savedUser.userId,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role
        });

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
    }
}

insertUserData(); 