const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/invoiceDB');
        console.log('Connected to MongoDB');

        // Create superadmin user
        const superAdmin = new User({
            userId: 'SA001',
            name: 'Super Admin',
            email: 'superadmin@example.com',
            password: 'test1234',
            role: 'SUPER_ADMIN',
            timezone: 'UTC'
        });

        // Save the user
        await superAdmin.save();
        console.log('Superadmin created successfully:', {
            userId: superAdmin.userId,
            email: superAdmin.email,
            role: superAdmin.role
        });

    } catch (error) {
        console.error('Error creating superadmin:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Run the script
createSuperAdmin(); 