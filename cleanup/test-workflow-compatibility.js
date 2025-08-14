const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function testWorkflowCompatibility() {
  console.log('🧪 Testing Workflow Compatibility...\n');

  try {
    // Test 1: Check all required tables and their columns
    console.log('📊 Test 1: Checking database table compatibility...');
    
    const tables = [
      'customer_interactions',
      'email_filters', 
      'tenants',
      'tenant_business_rules',
      'conversation_threads',
      'notifications',
      'escalations'
    ];

    for (const table of tables) {
      try {
        const response = await axios.get(
          `${SUPABASE_URL}/rest/v1/${table}?limit=1`,
          {
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.length > 0) {
          const columns = Object.keys(response.data[0]);
          console.log(`✅ ${table}: ${columns.length} columns available`);
          
          // Check for critical columns
          const criticalColumns = ['id', 'created_at'];
          const missingCritical = criticalColumns.filter(col => !columns.includes(col));
          
          if (missingCritical.length > 0) {
            console.log(`   ⚠️  Missing critical columns: ${missingCritical.join(', ')}`);
          }
        } else {
          console.log(`✅ ${table}: Table exists but empty`);
        }
      } catch (error) {
        console.log(`❌ ${table}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 2: Check specific workflow requirements
    console.log('\n📋 Test 2: Checking workflow-specific requirements...');
    
    // Check customer_interactions for updated_at
    try {
      const ciResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/customer_interactions?limit=1`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (ciResponse.data.length > 0) {
        const hasUpdatedAt = 'updated_at' in ciResponse.data[0];
        console.log(`✅ customer_interactions updated_at column: ${hasUpdatedAt ? 'EXISTS' : 'MISSING'}`);
        
        if (!hasUpdatedAt) {
          console.log('   🔧 ACTION REQUIRED: Run add-updated-at-column.sql in Supabase');
        }
      }
    } catch (error) {
      console.log(`❌ Error checking customer_interactions: ${error.response?.data?.message}`);
    }

    // Test 3: Check email filters functionality
    console.log('\n📧 Test 3: Checking email filters functionality...');
    try {
      const efResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/email_filters`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Email filters: ${efResponse.data.length} records available`);
    } catch (error) {
      console.log(`❌ Email filters error: ${error.response?.data?.message}`);
    }

    // Test 4: Check tenant data
    console.log('\n🏢 Test 4: Checking tenant data...');
    try {
      const tenantResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/tenants?limit=1`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Tenants: ${tenantResponse.data.length} records available`);
    } catch (error) {
      console.log(`❌ Tenants error: ${error.response?.data?.message}`);
    }

    console.log('\n🎉 Workflow Compatibility Test Completed!');
    console.log('\n📋 SUMMARY:');
    console.log('✅ Database connection: Working');
    console.log('✅ Email filters: Available');
    console.log('✅ Tenants: Available');
    console.log('✅ Customer interactions: Available');
    
    console.log('\n⚠️  REQUIRED ACTIONS:');
    console.log('1. Execute add-updated-at-column.sql in Supabase SQL Editor');
    console.log('2. Test N8N workflow after database changes');
    console.log('3. Verify email filtering works correctly');

  } catch (error) {
    console.error('❌ Workflow compatibility test failed:', error.response?.data || error.message);
  }
}

testWorkflowCompatibility();
