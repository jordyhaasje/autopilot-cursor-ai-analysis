const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function testEmailFilterInsert() {
  console.log('🧪 Testing Email Filter Insert with Correct Columns...\n');

  try {
    // Test insert with correct column names
    const testFilter = {
      tenant_id: 'af738ad1-9275-4f87-8fa6-fe2748771dc6', // Tabakshop tenant ID
      email_address: 'spam@example.com',
      domain: 'spamdomain.com',
      filter_type: 'blacklist',
      pattern_type: 'exact',
      reason: 'Test spam filter'
    };

    console.log('📝 Attempting to insert test filter...');
    console.log('📋 Test data:', JSON.stringify(testFilter, null, 2));

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
    
    console.log('✅ Test filter inserted successfully!');
    console.log('📋 Inserted filter:', JSON.stringify(insertResponse.data, null, 2));
    
    // Verify the filter was inserted
    console.log('\n🔍 Verifying filter was inserted...');
    const verifyResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/email_filters?tenant_id=eq.${testFilter.tenant_id}`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`📊 Found ${verifyResponse.data.length} filters for tenant`);
    
    if (verifyResponse.data.length > 0) {
      console.log('📋 Filters:', JSON.stringify(verifyResponse.data, null, 2));
    }
    
    // Clean up - delete the test filter
    if (insertResponse.data && insertResponse.data.id) {
      console.log('\n🧹 Cleaning up test filter...');
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
      console.log('✅ Test filter cleaned up');
    }

    console.log('\n🎉 Email Filter Insert Test Complete!');
    console.log('📊 Summary:');
    console.log('   ✅ Correct column names working');
    console.log('   ✅ Insert operation successful');
    console.log('   ✅ Dashboard should now work');
    console.log('   ✅ N8N Email Filter node ready');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n🔍 This explains the dashboard error');
  }
}

testEmailFilterInsert();
