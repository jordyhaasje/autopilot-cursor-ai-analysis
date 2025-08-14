const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function testSupabaseServiceRole() {
  console.log('🔍 Testing Supabase Connection with Service Role...\n');

  try {
    // Test basic connection
    console.log('📡 Testing basic connection...');
    const testResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Basic connection successful');

    // Test all major tables
    const tables = [
      'tenants',
      'master_business_rules', 
      'tenant_business_rules',
      'conversation_threads',
      'customer_interactions',
      'notifications',
      'escalations',
      'email_filters',
      'profiles'
    ];

    console.log('\n📋 Testing all tables with service role...');
    
    for (const table of tables) {
      try {
        const response = await axios.get(
          `${SUPABASE_URL}/rest/v1/${table}?limit=5`,
          {
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✅ ${table}: ${response.data.length} records`);
        
        if (response.data.length > 0) {
          console.log(`   Sample: ${JSON.stringify(response.data[0], null, 2).substring(0, 200)}...`);
        }
      } catch (error) {
        console.log(`❌ ${table}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test specific queries
    console.log('\n🔍 Testing specific queries...');
    
    // Test tenant data with business rules
    try {
      const tenantQuery = await axios.get(
        `${SUPABASE_URL}/rest/v1/tenants?select=*,tenant_business_rules(*)&limit=3`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Tenant with business rules: ${tenantQuery.data.length} records`);
    } catch (error) {
      console.log(`❌ Tenant query failed: ${error.response?.data?.message || error.message}`);
    }

    // Test conversation threads with interactions
    try {
      const threadQuery = await axios.get(
        `${SUPABASE_URL}/rest/v1/conversation_threads?select=*,customer_interactions(*)&limit=3`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Threads with interactions: ${threadQuery.data.length} records`);
    } catch (error) {
      console.log(`❌ Thread query failed: ${error.response?.data?.message || error.message}`);
    }

  } catch (error) {
    console.error('❌ Supabase test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testSupabaseServiceRole();
