const axios = require('axios');

async function testServer() {
    try {
        console.log('Testing server connection...');
        const response = await axios.get('http://localhost:5001/api/health');
        console.log('Server is running!');
        console.log('Health check response:', response.data);
    } catch (error) {
        console.error('Server test failed:', {
            message: error.message,
            code: error.code,
            response: error.response?.data
        });
    }
}

testServer(); 