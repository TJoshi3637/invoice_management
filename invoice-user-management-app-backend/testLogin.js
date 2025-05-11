const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login with test user...');

        // Test with email
        console.log('\n1. Testing login with email...');
        const emailResponse = await axios.post('http://localhost:5001/api/auth/login', {
            username: 'admin@test.com',
            password: 'test123'
        });

        console.log('Email login successful!');
        console.log('Response:', {
            hasToken: !!emailResponse.data.token,
            hasUser: !!emailResponse.data.user,
            userData: emailResponse.data.user
        });

        // Test with userId
        console.log('\n2. Testing login with userId...');
        const userIdResponse = await axios.post('http://localhost:5001/api/auth/login', {
            username: 'A001',
            password: 'test123'
        });

        console.log('UserId login successful!');
        console.log('Response:', {
            hasToken: !!userIdResponse.data.token,
            hasUser: !!userIdResponse.data.user,
            userData: userIdResponse.data.user
        });

        // Test with superadmin
        console.log('\n3. Testing login with superadmin...');
        const superadminResponse = await axios.post('http://localhost:5001/api/auth/login', {
            username: 'superadmin@example.com',
            password: 'test1234'
        });

        console.log('Superadmin login successful!');
        console.log('Response:', {
            hasToken: !!superadminResponse.data.token,
            hasUser: !!superadminResponse.data.user,
            userData: superadminResponse.data.user
        });

    } catch (error) {
        console.error('Login failed:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            requestData: error.config?.data
        });
    }
}

// Run the test
testLogin(); 