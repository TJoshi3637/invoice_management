const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function createUnitManager() {
    await mongoose.connect('mongodb://127.0.0.1:27017/invoiceDB');
    console.log('Connected to MongoDB');

    const username = 'unitmanager1';
    const name = 'Unit Manager One';
    const email = 'unitmanager1@example.com';
    const password = 'UnitManager@Secure2024!';
    const role = 'UNIT_MANAGER';
    const timezone = 'Asia/Kolkata';

    // Check if user already exists
    const existing = await User.findOne({
        $or: [
            { email: username },
            { userId: username },
            { username: username }
        ]
    });
    if (existing) {
        console.log('Unit Manager already exists:', existing);
        await mongoose.disconnect();
        return;
    }

    // Generate userId
    const count = await User.countDocuments({ role });
    const userId = `UM${count + 1}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        userId,
        username,
        name,
        email,
        password: hashedPassword,
        role,
        timezone
    });

    await user.save();
    console.log('Unit Manager created:', {
        userId,
        username,
        name,
        email,
        role,
        timezone
    });
    await mongoose.disconnect();
}

createUnitManager().catch(err => {
    console.error('Error creating unit manager:', err);
    mongoose.disconnect();
}); 