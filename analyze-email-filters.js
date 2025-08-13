const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function analyzeEmailFilters() {
  console.log('🔍 Analyzing Email Filters Database...\n');

  try {
    // Check email_filters table structure
    console.log('📋 Email Filters Table Structure:');
    const structureResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/email_filters?select=*&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Email filters table exists');
    
    // Get all email filters
    const filtersResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/email_filters?select=*`,
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
      console.log('📋 Sample email filter:', JSON.stringify(filtersResponse.data[0], null, 2));
    } else {
      console.log('⚠️ No email filters found - table is empty');
    }

    // Check tenant data for lvbendjong@gmail.com
    console.log('\n🏢 Checking Tenant Data...');
    const tenantResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenants?select=*&email=eq.lvbendjong@gmail.com`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (tenantResponse.data.length > 0) {
      const tenant = tenantResponse.data[0];
      console.log(`✅ Tenant found: ${tenant.bedrijfsnaam} (ID: ${tenant.tenant_id})`);
      console.log(`📧 Tenant email: ${tenant.email}`);
      console.log(`🔑 Tenant ID: ${tenant.tenant_id}`);
    } else {
      console.log('❌ Tenant not found for lvbendjong@gmail.com');
    }

    // Check if tenant has email filters
    if (tenantResponse.data.length > 0) {
      const tenantId = tenantResponse.data[0].tenant_id;
      const tenantFiltersResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/email_filters?select=*&tenant_id=eq.${tenantId}`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`📧 Tenant email filters: ${tenantFiltersResponse.data.length}`);
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error.response?.data || error.message);
  }
}

analyzeEmailFilters();
