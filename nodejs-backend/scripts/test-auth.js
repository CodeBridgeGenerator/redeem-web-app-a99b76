const axios = require('axios');

const BASE_URL = 'http://localhost:3030';

async function testAuthentication() {
  try {
    console.log('Testing authentication for khalidah.t4@gmail.com...');
    
    // Test login
    const loginResponse = await axios.post(`${BASE_URL}/authentication`, {
      strategy: 'local',
      email: 'khalidah.t4@gmail.com',
      password: 'password123' // You'll need to use the actual password
    });
    
    console.log('Login successful:', {
      user: loginResponse.data.user.email,
      accessToken: loginResponse.data.accessToken ? 'Present' : 'Missing'
    });
    
    // Test emailRoles service
    const token = loginResponse.data.accessToken;
    const emailRolesResponse = await axios.get(`${BASE_URL}/emailRoles`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        email: 'khalidah.t4@gmail.com',
        isActive: true
      }
    });
    
    console.log('Email roles found:', emailRolesResponse.data);
    
  } catch (error) {
    console.error('Authentication test failed:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status
    });
  }
}

testAuthentication(); 