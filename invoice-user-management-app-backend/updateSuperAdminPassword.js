const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function updateSuperAdminPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/invoiceDB');
        console.log('Connected to MongoDB');

        // Find the superadmin user
        const superAdmin = await User.findOne({ email: 'superadmin@example.com' });

        if (!superAdmin) {
            console.log('Superadmin user not found');
            return;
        }

        // Set the new password (plain text, let the model's pre-save middleware hash it)
        const newPassword = 'SuperAdmin@Secure2024';
        superAdmin.password = newPassword;
        await superAdmin.save();

        console.log('Superadmin password updated successfully');
        console.log('New password:', newPassword);

    } catch (error) {
        console.error('Error updating superadmin password:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the function
updateSuperAdminPassword(); 