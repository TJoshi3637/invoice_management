const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

async function insertTestUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/invoiceDB');
        console.log('Connected to MongoDB');

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('test123', salt);

        // Create test user
        const testUser = new User({
            userId: 'A001',
            name: 'Test Admin',
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'ADMIN',
            createdBy: 'SYSTEM',
            groupId: 'G001',
            timezone: 'UTC'
        });

        // Save the user
        await testUser.save();
        console.log('Test user created successfully!');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
    }
}

insertTestUser(); 