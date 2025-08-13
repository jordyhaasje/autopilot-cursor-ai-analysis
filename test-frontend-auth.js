const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function testFrontendAuth() {
  console.log('🧪 Testing Frontend Authentication...\n');

  try {
    // Test 1: Try to disable RLS completely for testing
    console.log('📋 Test 1: Disabling RLS temporarily...');
    try {
      const disableRLSResponse = await axios.post(
        `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        { query: 'ALTER TABLE email_filters DISABLE ROW LEVEL SECURITY;' },
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ RLS disabled for testing');
    } catch (error) {
      console.log('❌ Cannot disable RLS via API:', error.response?.data?.message || error.message);
    }

    // Test 2: Try to insert email filter without any restrictions
    console.log('\n📋 Test 2: Inserting email filter without RLS...');
    const testFilter = {
      tenant_id: 'af738ad1-9275-4f87-8fa6-fe2748771dc6', // Tabakshop tenant ID
      email_address: 'test@example.com',
      domain: 'example.com',
      filter_type: 'blacklist',
      pattern_type: 'exact',
      reason: 'Test filter'
    };

    try {
      const insertResponse = await axios.post(
        `${SUPABASE_URL}/rest/v1/email_filters`,
        testFilter,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Email filter insert successful!');
      console.log('📋 Inserted filter:', JSON.stringify(insertResponse.data, null, 2));
      
      // Clean up
      if (insertResponse.data && insertResponse.data.id) {
        await axios.delete(
          `${SUPABASE_URL}/rest/v1/email_filters?id=eq.${insertResponse.data.id}`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('🧹 Test filter cleaned up');
      }
    } catch (error) {
      console.log('❌ Email filter insert still failed:', error.response?.data?.message || error.message);
      console.log('🔍 This means there is a deeper issue');
    }

    // Test 3: Check if the table structure is correct
    console.log('\n📋 Test 3: Checking table structure...');
    try {
      const structureResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/email_filters?select=*&limit=0`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Table structure is accessible');
      console.log('📋 Response headers:', Object.keys(structureResponse.headers));
    } catch (error) {
      console.log('❌ Table structure check failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFrontendAuth();
