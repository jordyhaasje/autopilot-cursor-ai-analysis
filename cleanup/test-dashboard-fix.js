const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function testDashboardFix() {
  console.log('🧪 Testing Dashboard Fix...\n');

  try {
    // Test 1: Check if get_user_tenant_id function exists
    console.log('📋 Test 1: Checking get_user_tenant_id function...');
    try {
      const functionResponse = await axios.post(
        `${SUPABASE_URL}/rest/v1/rpc/get_user_tenant_id`,
        {},
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ get_user_tenant_id function exists and works');
    } catch (error) {
      console.log('❌ get_user_tenant_id function failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Check profiles table
    console.log('\n📋 Test 2: Checking profiles table...');
    try {
      const profilesResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/profiles?limit=5`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Profiles table accessible: ${profilesResponse.data.length} profiles found`);
      
      if (profilesResponse.data.length > 0) {
        console.log('📋 Sample profile:', JSON.stringify(profilesResponse.data[0], null, 2));
      }
    } catch (error) {
      console.log('❌ Profiles table failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Check if jordyhaass@gmail.com has a profile
    console.log('\n📋 Test 3: Checking jordyhaass@gmail.com profile...');
    try {
      const userResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/profiles?email=eq.jordyhaass@gmail.com`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ User profile check: ${userResponse.data.length} profiles found for jordyhaass@gmail.com`);
      
      if (userResponse.data.length > 0) {
        const profile = userResponse.data[0];
        console.log('📋 User profile:', JSON.stringify(profile, null, 2));
        console.log(`   User ID: ${profile.user_id}`);
        console.log(`   Tenant ID: ${profile.tenant_id}`);
        console.log(`   Role: ${profile.role}`);
      } else {
        console.log('⚠️ No profile found for jordyhaass@gmail.com');
      }
    } catch (error) {
      console.log('❌ User profile check failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Try to insert email filter with manual tenant_id
    console.log('\n📋 Test 4: Testing email filter insert...');
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
      console.log('❌ Email filter insert failed:', error.response?.data?.message || error.message);
      console.log('🔍 This explains why the dashboard is not working');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDashboardFix();
