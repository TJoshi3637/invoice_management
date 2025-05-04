const axios = require('axios');

async function testUserCreation() {
    try {
        console.log('1. Attempting to login...');
        // First, login to get a token
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: "admin@test.com",
            password: "test123"
        });

        const token = loginResponse.data.token;
        console.log('2. Login successful, token received:', token);

        console.log('3. Attempting to create user...');
        const userData = {
            name: "Test User",
            email: "test@example.com",
            password: "test123",
            role: "USER",
            createdBy: "SYSTEM",
            groupId: "G001",
            timezone: "UTC"
        };
        console.log('4. User data to be sent:', userData);

        // Now create a new user with the token
        const createResponse = await axios.post('http://localhost:5000/api/users/create', userData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('5. User created successfully:', createResponse.data);
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
        });
    }
}

testUserCreation(); 