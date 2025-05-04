const axios = require('axios');

async function testInvoiceCreation() {
    try {
        console.log('1. Attempting to login...');
        // First, login to get a token
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: "admin@test.com",
            password: "test123"
        });

        const token = loginResponse.data.token;
        console.log('2. Login successful, token received');

        console.log('3. Attempting to create invoice...');
        const invoiceData = {
            invoiceNumber: 1001,
            invoiceDate: new Date().toISOString(),
            invoiceAmount: 1000.00,
            financialYear: "2024-2025"
        };
        console.log('4. Invoice data to be sent:', invoiceData);

        const createResponse = await axios.post('http://localhost:5000/api/invoices', invoiceData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('5. Invoice created successfully:', createResponse.data);
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method
        });
    }
}

testInvoiceCreation(); 