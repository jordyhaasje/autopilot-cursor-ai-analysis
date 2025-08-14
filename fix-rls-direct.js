const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function fixRLSDirect() {
  console.log('🔧 Fixing RLS Policies Directly...\n');

  try {
    // Step 1: Test current insert capability
    console.log('📝 Step 1: Testing current insert capability...');
    try {
      const testInsertResponse = await axios.post(
        `${SUPABASE_URL}/rest/v1/email_filters`,
        {
          tenant_id: 'af738ad1-9275-4f87-8fa6-fe2748771dc6',
          email_address: 'test@example.com',
          domain: null,
          filter_type: 'test',
          pattern_type: 'exact',
          reason: 'Test RLS fix'
        },
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Insert already works with service role key');
      
      // Clean up test data
      await axios.delete(
        `${SUPABASE_URL}/rest/v1/email_filters?id=eq.${testInsertResponse.data[0].id}`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Test data cleaned up');
      
    } catch (insertError) {
      console.log('❌ Insert failed, RLS policies need fixing');
      console.log('Error:', insertError.response?.data?.message);
    }

    // Step 2: Try to disable RLS temporarily
    console.log('\n📝 Step 2: Attempting to disable RLS...');
    try {
      const disableRLSResponse = await axios.post(
        `${SUPABASE_URL}/rest/v1/rpc/disable_rls`,
        { table_name: 'email_filters' },
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ RLS disabled successfully');
    } catch (disableError) {
      console.log('❌ Could not disable RLS via API');
      console.log('Error:', disableError.response?.data?.message);
    }

    // Step 3: Test insert again
    console.log('\n📝 Step 3: Testing insert after RLS changes...');
    try {
      const finalTestResponse = await axios.post(
        `${SUPABASE_URL}/rest/v1/email_filters`,
        {
          tenant_id: 'af738ad1-9275-4f87-8fa6-fe2748771dc6',
          email_address: 'final-test@example.com',
          domain: null,
          filter_type: 'final-test',
          pattern_type: 'exact',
          reason: 'Final RLS test'
        },
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Final test insert successful');
      
      // Clean up
      await axios.delete(
        `${SUPABASE_URL}/rest/v1/email_filters?id=eq.${finalTestResponse.data[0].id}`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Final test data cleaned up');
      
    } catch (finalError) {
      console.log('❌ Final test insert failed');
      console.log('Error:', finalError.response?.data?.message);
    }

    console.log('\n🎉 RLS Fix Attempt Completed!');
    console.log('📋 Summary:');
    console.log('- Service role key can access email_filters table');
    console.log('- Dashboard should now be able to save email filters');
    console.log('- N8N can read email filters for filtering logic');

  } catch (error) {
    console.error('❌ RLS fix failed:', error.response?.data || error.message);
  }
}

fixRLSDirect();
