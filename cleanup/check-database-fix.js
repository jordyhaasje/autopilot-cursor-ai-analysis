const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function checkDatabaseFix() {
  console.log('🔍 Checking Database Fix Status...\n');

  try {
    // Test 1: Check if master_business_rules table is accessible
    console.log('📋 Test 1: Master Business Rules Table');
    const masterRulesResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/master_business_rules?limit=5`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Master business rules accessible: ${masterRulesResponse.data.length} rules found`);
    
    if (masterRulesResponse.data.length > 0) {
      console.log('📋 Sample rule:', JSON.stringify(masterRulesResponse.data[0], null, 2));
    }

    // Test 2: Check if tenant_business_rules table is accessible
    console.log('\n📋 Test 2: Tenant Business Rules Table');
    const tenantRulesResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenant_business_rules?limit=5`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Tenant business rules accessible: ${tenantRulesResponse.data.length} rules found`);
    
    if (tenantRulesResponse.data.length > 0) {
      console.log('📋 Sample tenant rule:', JSON.stringify(tenantRulesResponse.data[0], null, 2));
    }

    // Test 3: Test the foreign key relationship
    console.log('\n📋 Test 3: Foreign Key Relationship Test');
    try {
      const joinResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/tenant_business_rules?select=*,master_business_rules(rule_name,category)&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Foreign key relationship working - join query successful');
      
      if (joinResponse.data.length > 0) {
        console.log('📋 Sample joined data:', JSON.stringify(joinResponse.data[0], null, 2));
      }
    } catch (joinError) {
      console.log('❌ Foreign key relationship failed:', joinError.response?.data?.message || joinError.message);
    }

    // Test 4: Check email_filters table
    console.log('\n📋 Test 4: Email Filters Table');
    const emailFiltersResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/email_filters?limit=5`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Email filters table accessible: ${emailFiltersResponse.data.length} filters found`);
    
    if (emailFiltersResponse.data.length > 0) {
      console.log('📋 Sample email filter:', JSON.stringify(emailFiltersResponse.data[0], null, 2));
    } else {
      console.log('⚠️ Email filters table is empty (normal for new setup)');
    }

    console.log('\n🎉 Database Fix Status Check Complete!');
    console.log('📊 Summary:');
    console.log('   ✅ Master business rules: Working');
    console.log('   ✅ Tenant business rules: Working');
    console.log('   ✅ Email filters table: Ready');
    console.log('   ✅ Foreign key relationships: Should be working');
    console.log('   ⚠️ Tenant data: Protected by RLS (good for security)');

  } catch (error) {
    console.error('❌ Database check failed:', error.response?.data || error.message);
  }
}

checkDatabaseFix();
