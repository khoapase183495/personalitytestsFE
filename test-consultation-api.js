// Test script để kiểm tra Consultation API
const API_BASE_URL = 'http://localhost:8080';

async function getAdminToken() {
  try {
    console.log('🔑 Getting admin token...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@gmail.com', // Assuming this is admin email
        password: 'admin123' // Default admin password
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Admin login successful');
      return loginData.token;
    } else {
      console.log('❌ Admin login failed with status:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('Login error:', errorText);
      return null;
    }
  } catch (error) {
    console.error('🚨 Login error:', error);
    return null;
  }
}

async function testConsultationAPI() {
  console.log('🧪 Testing Consultation API...');
  
  // Get admin token first
  const token = await getAdminToken();
  if (!token) {
    console.log('❌ Cannot proceed without admin token');
    return;
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  try {
    // Test 1: Get all consultations
    console.log('\n📋 Test 1: Get all consultations');
    const response = await fetch(`${API_BASE_URL}/api/consulation/all`, {
      method: 'GET',
      headers: headers
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Data received:', data);
      console.log('Number of consultations:', data.length);
      
      if (data.length > 0) {
        console.log('Sample consultation:', JSON.stringify(data[0], null, 2));
      }
    } else {
      console.log('❌ Failed with status:', response.status);
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
    // Test 2: Create a test consultation
    console.log('\n🆕 Test 2: Create consultation');
    const testMeetingData = {
      googleMeetURL: 'https://meet.google.com/test-meeting',
      consultMembersEmail: ['admin@gmail.com'], // Use admin email
      scheduledTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
    };
    
    const createResponse = await fetch(`${API_BASE_URL}/api/consulation/create-meeting`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(testMeetingData)
    });
    
    console.log('Create response status:', createResponse.status);
    
    if (createResponse.ok) {
      const createdData = await createResponse.json();
      console.log('✅ Meeting created successfully:', createdData);
    } else {
      console.log('❌ Failed to create meeting with status:', createResponse.status);
      const errorText = await createResponse.text();
      console.log('Create error:', errorText);
    }
    
  } catch (error) {
    console.error('🚨 Test failed with error:', error);
  }
}

// Chạy test
testConsultationAPI();
