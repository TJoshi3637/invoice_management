const User = require('../models/User');

/**
 * Generate a unique user ID based on role
 * Format: [Role Prefix][Number]
 * Examples: SA1, A1, UM1, U1
 */
exports.generateUserId = async (role) => {
    try {
        // Get the prefix based on role
        let prefix;
        switch (role) {
            case 'SUPER_ADMIN':
                prefix = 'SA';
                break;
            case 'ADMIN':
                prefix = 'A';
                break;
            case 'UNIT_MANAGER':
                prefix = 'UM';
                break;
            case 'USER':
                prefix = 'U';
                break;
            default:
                throw new Error('Invalid role for user ID generation');
        }

        // Find the latest user with this role prefix
        const latestUser = await User.findOne(
            { userId: new RegExp(`^${prefix}`) },
            { userId: 1 },
            { sort: { userId: -1 } }
        );

        // Generate new number
        let number = 1;
        if (latestUser) {
            const currentNumber = parseInt(latestUser.userId.substring(prefix.length));
            number = currentNumber + 1;
        }

        // Return new user ID
        return `${prefix}${number}`;
    } catch (err) {
        console.error('Error generating user ID:', err);
        throw err;
    }
}; 