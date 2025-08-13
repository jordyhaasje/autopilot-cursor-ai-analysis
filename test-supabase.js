const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function testSupabase() {
  console.log('🔍 Testing Supabase Connection...\n');

  try {
    // Test basic connection
    console.log('📡 Testing basic connection...');
    const testResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Basic connection successful');

    // List all tables
    console.log('\n📋 Listing available tables...');
    const tablesResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenants?select=count`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Tenants table accessible');

    // Try to get actual data
    console.log('\n📊 Getting actual tenant data...');
    const dataResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenants?limit=5`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`📊 Found ${dataResponse.data.length} tenants`);
    
    if (dataResponse.data.length > 0) {
      console.log('📋 Sample tenant:', JSON.stringify(dataResponse.data[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Supabase test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testSupabase();
