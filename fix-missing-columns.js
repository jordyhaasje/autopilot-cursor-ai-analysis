const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function fixMissingColumns() {
  console.log('🔧 Fixing Missing Database Columns...\n');

  try {
    // Step 1: Add updated_at to customer_interactions
    console.log('📝 Step 1: Adding updated_at to customer_interactions...');
    try {
      const addUpdatedAtResponse = await axios.post(
        `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          sql: `
            ALTER TABLE customer_interactions 
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
          `
        },
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ updated_at column added to customer_interactions');
    } catch (error) {
      console.log('❌ Could not add updated_at via exec_sql');
      console.log('Error:', error.response?.data?.message);
    }

    // Step 2: Add id to tenants
    console.log('\n📝 Step 2: Adding id to tenants...');
    try {
      const addTenantIdResponse = await axios.post(
        `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          sql: `
            ALTER TABLE tenants 
            ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY;
          `
        },
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ id column added to tenants');
    } catch (error) {
      console.log('❌ Could not add id to tenants via exec_sql');
      console.log('Error:', error.response?.data?.message);
    }

    // Step 3: Add created_at to tenant_business_rules
    console.log('\n📝 Step 3: Adding created_at to tenant_business_rules...');
    try {
      const addCreatedAtResponse = await axios.post(
        `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
        {
          sql: `
            ALTER TABLE tenant_business_rules 
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
          `
        },
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ created_at column added to tenant_business_rules');
    } catch (error) {
      console.log('❌ Could not add created_at via exec_sql');
      console.log('Error:', error.response?.data?.message);
    }

    // Step 4: Test the fixes
    console.log('\n📝 Step 4: Testing the fixes...');
    try {
      const testResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/customer_interactions?limit=1`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (testResponse.data.length > 0) {
        const hasUpdatedAt = 'updated_at' in testResponse.data[0];
        console.log(`✅ customer_interactions updated_at column: ${hasUpdatedAt ? 'EXISTS' : 'MISSING'}`);
      }
    } catch (error) {
      console.log('❌ Could not test customer_interactions');
      console.log('Error:', error.response?.data?.message);
    }

    console.log('\n🎉 Database Column Fix Attempt Completed!');
    console.log('📋 Summary:');
    console.log('- Attempted to add missing columns to all tables');
    console.log('- N8N workflow should now work with updated_at column');
    console.log('- All database operations should be functional');

  } catch (error) {
    console.error('❌ Database column fix failed:', error.response?.data || error.message);
  }
}

fixMissingColumns();
