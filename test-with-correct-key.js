const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function testWithCorrectKey() {
  console.log('🔑 Testing with Correct Supabase Key...\n');

  try {
    // Test connection
    console.log('📡 Testing Supabase connection...');
    const testResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenants?limit=1`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Connection successful');
    console.log('📊 Response status:', testResponse.status);
    console.log('📊 Response headers:', Object.keys(testResponse.headers));
    console.log('📊 Data length:', testResponse.data?.length || 0);
    
    if (testResponse.data && testResponse.data.length > 0) {
      console.log('📋 Sample data:', JSON.stringify(testResponse.data[0], null, 2));
    }

    // Try different approach
    console.log('\n🔄 Trying different query approach...');
    const allResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenants`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      }
    );
    
    console.log('📊 All tenants response:', allResponse.data?.length || 0);
    
    if (allResponse.data && allResponse.data.length > 0) {
      console.log('📋 First tenant:', JSON.stringify(allResponse.data[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testWithCorrectKey();
