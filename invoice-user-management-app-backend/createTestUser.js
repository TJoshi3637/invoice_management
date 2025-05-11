const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function createTestUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/invoiceDB');
        console.log('Connected to MongoDB');

        // Create test user
        const testUser = new User({
            userId: 'U001',
            name: 'Test User',
            email: 'test@example.com',
            password: 'test123',
            role: 'USER',
            timezone: 'UTC'
        });

        // Save the user
        await testUser.save();
        console.log('Test user created successfully:', {
            userId: testUser.userId,
            email: testUser.email,
            role: testUser.role
        });

    } catch (error) {
        console.error('Error creating test user:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createTestUser(); 