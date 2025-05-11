const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'ADMIN', 'UNIT_MANAGER', 'USER'],
        required: true
    },
    groups: [{
        type: String
    }],
    createdBy: {
        type: String,
        default: 'SYSTEM'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

// Create Super Admin
async function createSuperAdmin() {
    try {
        // Check if Super Admin already exists
        const existingSuperAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
        if (existingSuperAdmin) {
            console.log('Super Admin already exists');
            process.exit(0);
        }

        // Create new Super Admin
        const superAdmin = new User({
            username: 'superadmin',
            email: 'superadmin@example.com',
            password: await bcrypt.hash('SuperAdmin@123', 10), // Default password
            role: 'SUPER_ADMIN',
            groups: ['SUPER_ADMIN_GROUP'],
            createdBy: 'SYSTEM'
        });

        await superAdmin.save();
        console.log('Super Admin created successfully');
        console.log('Username:', superAdmin.username);
        console.log('Email:', superAdmin.email);
        console.log('Password: SuperAdmin@123');
        console.log('Please change the password after first login');

    } catch (error) {
        console.error('Error creating Super Admin:', error);
    } finally {
        mongoose.connection.close();
    }
}

createSuperAdmin(); 