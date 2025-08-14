const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function checkEmailFiltersData() {
  console.log('🔍 Checking Email Filters Data...\n');

  try {
    // Check email_filters table structure and data
    console.log('📧 Email Filters Table Analysis:');
    
    // Get all email filters
    const filtersResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/email_filters`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`📊 Total email filters in database: ${filtersResponse.data.length}`);
    
    if (filtersResponse.data.length > 0) {
      console.log('📋 Email filters found:');
      filtersResponse.data.forEach((filter, i) => {
        console.log(`   ${i+1}. ID: ${filter.id}`);
        console.log(`      Tenant ID: ${filter.tenant_id}`);
        console.log(`      Filter Type: ${filter.filter_type}`);
        console.log(`      Filter Value: ${filter.filter_value}`);
        console.log(`      Created: ${filter.created_at}`);
        console.log('');
      });
    } else {
      console.log('⚠️ No email filters found in database');
    }

    // Check table structure by trying to insert a test record
    console.log('🧪 Testing Email Filters Table Structure...');
    
    const testFilter = {
      tenant_id: 'af738ad1-9275-4f87-8fa6-fe2748771dc6', // Tabakshop tenant ID
      filter_type: 'blacklist',
      filter_value: 'test@example.com',
      reason: 'Test filter',
      created_at: new Date().toISOString()
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
      
      console.log('✅ Test filter inserted successfully');
      console.log('📋 Inserted filter:', JSON.stringify(insertResponse.data, null, 2));
      
      // Clean up - delete the test filter
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
      
    } catch (insertError) {
      console.log('❌ Failed to insert test filter:', insertError.response?.data || insertError.message);
      console.log('🔍 This explains why the dashboard save is failing');
    }

    // Check if there are any constraints or validation issues
    console.log('\n🔍 Checking for potential issues:');
    console.log('   - RLS policies might be blocking inserts');
    console.log('   - Missing required columns');
    console.log('   - Foreign key constraints');
    console.log('   - Validation rules');

  } catch (error) {
    console.error('❌ Email filters check failed:', error.response?.data || error.message);
  }
}

checkEmailFiltersData();
