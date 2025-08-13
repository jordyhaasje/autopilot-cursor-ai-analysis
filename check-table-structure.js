const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function checkTableStructure() {
  console.log('🔍 Checking Email Filters Table Structure...\n');

  try {
    // Try to get table info by attempting different column names
    console.log('📋 Testing different column combinations...');
    
    const testColumns = [
      'id',
      'tenant_id', 
      'email_address',
      'domain',
      'filter_type',
      'pattern_type',
      'reason',
      'regex_pattern',
      'created_at',
      'updated_at'
    ];

    for (const column of testColumns) {
      try {
        const response = await axios.get(
          `${SUPABASE_URL}/rest/v1/email_filters?select=${column}&limit=1`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ Column '${column}' exists`);
      } catch (error) {
        console.log(`❌ Column '${column}' does not exist`);
      }
    }

    // Try to get all columns
    console.log('\n📋 Getting all available columns...');
    try {
      const allColumnsResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/email_filters?select=*&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (allColumnsResponse.data.length > 0) {
        console.log('📋 Available columns:', Object.keys(allColumnsResponse.data[0]));
      } else {
        console.log('⚠️ Table exists but is empty');
      }
    } catch (error) {
      console.log('❌ Cannot get table structure:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Structure check failed:', error.response?.data || error.message);
  }
}

checkTableStructure();
