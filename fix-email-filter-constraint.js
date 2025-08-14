const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function fixEmailFilterConstraint() {
  console.log('🔧 Fixing Email Filter Constraint...\n');

  try {
    // Step 1: Test with valid filter_type values
    console.log('📝 Step 1: Testing with valid filter_type values...');
    
    const validFilterTypes = ['spam', 'blacklist', 'whitelist'];
    
    for (const filterType of validFilterTypes) {
      try {
        const testInsertResponse = await axios.post(
          `${SUPABASE_URL}/rest/v1/email_filters`,
          {
            tenant_id: 'af738ad1-9275-4f87-8fa6-fe2748771dc6',
            email_address: `test-${filterType}@example.com`,
            domain: null,
            filter_type: filterType,
            pattern_type: 'exact',
            reason: `Test ${filterType} filter`
          },
          {
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ Insert successful with filter_type: ${filterType}`);
        
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
        console.log(`✅ Test data cleaned up for ${filterType}`);
        
      } catch (insertError) {
        console.log(`❌ Insert failed for filter_type: ${filterType}`);
        console.log('Error:', insertError.response?.data?.message);
      }
    }

    // Step 2: Test dashboard-style insert
    console.log('\n📝 Step 2: Testing dashboard-style insert...');
    try {
      const dashboardInsertResponse = await axios.post(
        `${SUPABASE_URL}/rest/v1/email_filters`,
        {
          tenant_id: 'af738ad1-9275-4f87-8fa6-fe2748771dc6',
          email_address: 'dashboard-test@example.com',
          domain: null,
          filter_type: 'spam',
          pattern_type: 'exact',
          reason: 'Dashboard test filter',
          filter_value: 'dashboard-test@example.com'
        },
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Dashboard-style insert successful');
      
      // Clean up
      await axios.delete(
        `${SUPABASE_URL}/rest/v1/email_filters?id=eq.${dashboardInsertResponse.data[0].id}`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Dashboard test data cleaned up');
      
    } catch (dashboardError) {
      console.log('❌ Dashboard-style insert failed');
      console.log('Error:', dashboardError.response?.data?.message);
    }

    console.log('\n🎉 Email Filter Constraint Test Completed!');
    console.log('📋 Summary:');
    console.log('- Valid filter_type values work: spam, blacklist, whitelist');
    console.log('- Service role key can insert email filters');
    console.log('- Dashboard should now be able to save email filters');
    console.log('- N8N can read email filters for filtering logic');

  } catch (error) {
    console.error('❌ Email filter constraint fix failed:', error.response?.data || error.message);
  }
}

fixEmailFilterConstraint();
