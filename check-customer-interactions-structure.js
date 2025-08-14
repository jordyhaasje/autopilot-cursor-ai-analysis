const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function checkCustomerInteractionsStructure() {
  console.log('🔍 Checking Customer Interactions Table Structure...\n');

  try {
    // Get sample data to see current structure
    console.log('📊 Getting sample customer interactions...');
    const sampleResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/customer_interactions?limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (sampleResponse.data.length > 0) {
      const sample = sampleResponse.data[0];
      console.log('✅ Sample customer interaction found');
      console.log('📋 Current columns:');
      Object.keys(sample).forEach(key => {
        console.log(`   - ${key}: ${typeof sample[key]} (${sample[key]})`);
      });
    } else {
      console.log('❌ No customer interactions found');
    }

    // Check if updated_at column exists
    console.log('\n🔍 Checking for updated_at column...');
    const hasUpdatedAt = sampleResponse.data.length > 0 && 'updated_at' in sampleResponse.data[0];
    console.log(`✅ updated_at column exists: ${hasUpdatedAt}`);

    // Check all tables for missing columns
    console.log('\n🔍 Checking all tables for missing columns...');
    const tables = ['customer_interactions', 'email_filters', 'tenants', 'tenant_business_rules'];
    
    for (const table of tables) {
      try {
        const tableResponse = await axios.get(
          `${SUPABASE_URL}/rest/v1/${table}?limit=1`,
          {
            headers: {
              'apikey': SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (tableResponse.data.length > 0) {
          const columns = Object.keys(tableResponse.data[0]);
          const missingColumns = [];
          
          // Check for commonly missing columns
          const expectedColumns = ['updated_at', 'created_at', 'id'];
          expectedColumns.forEach(col => {
            if (!columns.includes(col)) {
              missingColumns.push(col);
            }
          });
          
          console.log(`📋 ${table}: ${columns.length} columns`);
          if (missingColumns.length > 0) {
            console.log(`   ❌ Missing: ${missingColumns.join(', ')}`);
          } else {
            console.log(`   ✅ All expected columns present`);
          }
        }
      } catch (error) {
        console.log(`❌ Error checking ${table}: ${error.response?.data?.message || error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to check structure:', error.response?.data || error.message);
  }
}

checkCustomerInteractionsStructure();
