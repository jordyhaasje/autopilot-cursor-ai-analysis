const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function checkTenantStructure() {
  console.log('🔍 Checking Tenant Structure...\n');

  try {
    // Get all tenants
    const tenantsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenants?select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`📊 Total tenants: ${tenantsResponse.data.length}`);
    
    if (tenantsResponse.data.length > 0) {
      console.log('📋 Sample tenant structure:', JSON.stringify(tenantsResponse.data[0], null, 2));
      
      // Find tenant with lvbendjong@gmail.com
      const targetTenant = tenantsResponse.data.find(t => 
        t.gmail_email === 'lvbendjong@gmail.com' || 
        t.tenant_id === 'af738ad1-9275-4f87-8fa6-fe2748771dc6'
      );
      
      if (targetTenant) {
        console.log('\n🎯 Target tenant found:');
        console.log(`   ID: ${targetTenant.tenant_id}`);
        console.log(`   Name: ${targetTenant.bedrijfsnaam}`);
        console.log(`   Gmail: ${targetTenant.gmail_email}`);
      } else {
        console.log('\n❌ Target tenant not found');
      }
    }

    // Check email_filters table structure
    console.log('\n📧 Email Filters Table Structure:');
    const filtersResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/email_filters?select=*&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (filtersResponse.data.length > 0) {
      console.log('📋 Sample email filter structure:', JSON.stringify(filtersResponse.data[0], null, 2));
    } else {
      console.log('⚠️ Email filters table is empty');
    }

  } catch (error) {
    console.error('❌ Check failed:', error.response?.data || error.message);
  }
}

checkTenantStructure();
