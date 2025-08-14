const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function checkDatabase() {
  console.log('🔍 Checking Database Structure...\n');

  try {
    // Get all tenants without specifying columns
    console.log('📋 Getting all tenants...');
    const tenantsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenants`,
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
      console.log('📋 First tenant:', JSON.stringify(tenantsResponse.data[0], null, 2));
      
      // Find tenant with lvbendjong@gmail.com or specific ID
      const targetTenant = tenantsResponse.data.find(t => 
        (t.gmail_email && t.gmail_email === 'lvbendjong@gmail.com') || 
        t.tenant_id === 'af738ad1-9275-4f87-8fa6-fe2748771dc6'
      );
      
      if (targetTenant) {
        console.log('\n🎯 Target tenant found:');
        console.log(`   ID: ${targetTenant.tenant_id}`);
        console.log(`   Name: ${targetTenant.bedrijfsnaam}`);
        console.log(`   Gmail: ${targetTenant.gmail_email}`);
      } else {
        console.log('\n❌ Target tenant not found');
        console.log('Available tenants:');
        tenantsResponse.data.forEach((t, i) => {
          console.log(`   ${i+1}. ${t.bedrijfsnaam} (${t.tenant_id})`);
        });
      }
    }

    // Check email_filters table
    console.log('\n📧 Email Filters Table:');
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
    
    console.log(`📊 Total email filters: ${filtersResponse.data.length}`);
    
    if (filtersResponse.data.length > 0) {
      console.log('📋 First email filter:', JSON.stringify(filtersResponse.data[0], null, 2));
    } else {
      console.log('⚠️ Email filters table is empty');
    }

  } catch (error) {
    console.error('❌ Check failed:', error.response?.data || error.message);
  }
}

checkDatabase();
