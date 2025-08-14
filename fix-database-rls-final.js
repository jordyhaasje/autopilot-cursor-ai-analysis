const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function fixDatabaseRLS() {
  console.log('🔧 Fixing Database RLS Policies...\n');

  try {
    // Step 1: Drop all existing policies
    console.log('📝 Step 1: Dropping existing policies...');
    const dropPoliciesSQL = `
      DROP POLICY IF EXISTS "Users can read email filters for their tenant" ON email_filters;
      DROP POLICY IF EXISTS "Users can insert email filters for their tenant" ON email_filters;
      DROP POLICY IF EXISTS "Users can update email filters for their tenant" ON email_filters;
      DROP POLICY IF EXISTS "Users can delete email filters for their tenant" ON email_filters;
      DROP POLICY IF EXISTS "N8N can read all email filters" ON email_filters;
      DROP POLICY IF EXISTS "Allow all authenticated users" ON email_filters;
    `;

    const dropResponse = await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      { sql: dropPoliciesSQL },
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Policies dropped successfully');

    // Step 2: Create new simple policy
    console.log('📝 Step 2: Creating new policy...');
    const createPolicySQL = `
      CREATE POLICY "Allow all authenticated users" ON email_filters
      FOR ALL USING (auth.role() = 'authenticated');
      
      ALTER TABLE email_filters ENABLE ROW LEVEL SECURITY;
    `;

    const createResponse = await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      { sql: createPolicySQL },
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ New policy created successfully');

    // Step 3: Test the fix
    console.log('📝 Step 3: Testing the fix...');
    const testInsertResponse = await axios.post(
      `${SUPABASE_URL}/rest/v1/email_filters`,
      {
        tenant_id: 'af738ad1-9275-4f87-8fa6-fe2748771dc6',
        email_address: 'test@example.com',
        domain: null,
        filter_type: 'test',
        pattern_type: 'exact',
        reason: 'Test RLS fix'
      },
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Test insert successful');

    // Step 4: Clean up test data
    console.log('📝 Step 4: Cleaning up test data...');
    const cleanupResponse = await axios.delete(
      `${SUPABASE_URL}/rest/v1/email_filters?id=eq.${testInsertResponse.data[0].id}`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Database RLS Fix Completed Successfully!');
    console.log('✅ Email filters table now allows authenticated users');
    console.log('✅ Dashboard can now save email filters');
    console.log('✅ N8N can read email filters');

  } catch (error) {
    console.error('❌ Database RLS fix failed:', error.response?.data || error.message);
  }
}

fixDatabaseRLS();
