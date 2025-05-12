const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

const createSuperAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/invoice_management', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({ email: 'superadmin@example.com' });
        if (existingSuperAdmin) {
            console.log('Super admin already exists');
            process.exit(0);
        }

        // Create super admin user
        const hashedPassword = await bcrypt.hash('pass', 10);
        const superAdmin = new User({
            userId: 'SA1',
            username: 'superadmin',
            name: 'Super Admin',
            email: 'superadmin@example.com',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            timezone: 'UTC'
        });

        await superAdmin.save();
        console.log('Super admin created successfully:', {
            userId: superAdmin.userId,
            email: superAdmin.email,
            role: superAdmin.role
        });

    } catch (error) {
        console.error('Error creating super admin:', error);
    } finally {
        await mongoose.disconnect();
    }
};

createSuperAdmin(); 