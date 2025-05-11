const mongoose = require('mongoose');
const User = require('./src/models/User');
const Group = require('./src/models/Group');

async function updateUnitManagerPassword() {
    await mongoose.connect('mongodb://127.0.0.1:27017/invoiceDB');
    console.log('Connected to MongoDB');

    const username = 'unitmanager2';
    const newPassword = 'UnitManager@Secure2024!';

    const user = await User.findOne({ username });
    if (!user) {
        console.log('Unit Manager not found');
        await mongoose.disconnect();
        return;
    }

    user.password = newPassword; // Let pre-save middleware hash it
    await user.save();
    console.log('Unit Manager password updated successfully!');
    await mongoose.disconnect();
}

updateUnitManagerPassword().catch(err => {
    console.error('Error updating unit manager password:', err);
    mongoose.disconnect();
}); 