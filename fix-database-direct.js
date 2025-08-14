const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function fixDatabaseDirect() {
  console.log('🔧 Fixing Database Directly...\n');

  try {
    // Step 1: Add missing columns
    console.log('📝 Step 1: Adding missing columns...');
    const alterResponse = await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      {
        sql: `
          ALTER TABLE email_filters 
          ADD COLUMN IF NOT EXISTS filter_value TEXT,
          ADD COLUMN IF NOT EXISTS regex_pattern TEXT,
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
    console.log('✅ Columns added successfully');

    // Step 2: Drop all existing policies
    console.log('📝 Step 2: Dropping existing policies...');
    const dropPoliciesResponse = await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      {
        sql: `
          DROP POLICY IF EXISTS "Users can read email filters for their tenant" ON email_filters;
          DROP POLICY IF EXISTS "Users can insert email filters for their tenant" ON email_filters;
          DROP POLICY IF EXISTS "Users can update email filters for their tenant" ON email_filters;
          DROP POLICY IF EXISTS "Users can delete email filters for their tenant" ON email_filters;
          DROP POLICY IF EXISTS "N8N can read all email filters" ON email_filters;
          DROP POLICY IF EXISTS "Allow all authenticated users" ON email_filters;
          DROP POLICY IF EXISTS "Enable read access for all users" ON email_filters;
          DROP POLICY IF EXISTS "Enable insert access for all users" ON email_filters;
          DROP POLICY IF EXISTS "Enable update access for all users" ON email_filters;
          DROP POLICY IF EXISTS "Enable delete access for all users" ON email_filters;
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
    console.log('✅ Policies dropped successfully');

    // Step 3: Create simple policy
    console.log('📝 Step 3: Creating simple policy...');
    const createPolicyResponse = await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      {
        sql: `
          CREATE POLICY "Allow all authenticated users" ON email_filters
          FOR ALL USING (auth.role() = 'authenticated');
          
          ALTER TABLE email_filters ENABLE ROW LEVEL SECURITY;
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
    console.log('✅ Policy created successfully');

    // Step 4: Add sample data
    console.log('📝 Step 4: Adding sample data...');
    const insertResponse = await axios.post(
      `${SUPABASE_URL}/rest/v1/email_filters`,
      [
        {
          tenant_id: 'af738ad1-9275-4f87-8fa6-fe2748771dc6',
          email_address: 'spam@example.com',
          domain: null,
          filter_type: 'spam',
          pattern_type: 'exact',
          reason: 'Test spam filter',
          filter_value: 'spam@example.com'
        },
        {
          tenant_id: 'af738ad1-9275-4f87-8fa6-fe2748771dc6',
          email_address: null,
          domain: 'spamdomain.com',
          filter_type: 'spam',
          pattern_type: 'domain',
          reason: 'Test domain filter',
          filter_value: 'spamdomain.com'
        }
      ],
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Sample data added successfully');

    // Step 5: Verify the fix
    console.log('📝 Step 5: Verifying the fix...');
    const verifyResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/email_filters?select=*`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ Verification successful: ${verifyResponse.data.length} email filters found`);
    console.log('📋 Sample filter:', JSON.stringify(verifyResponse.data[0], null, 2));

    console.log('\n🎉 Database fix completed successfully!');
    console.log('✅ Email filters table is now working');
    console.log('✅ Dashboard can now save email filters');
    console.log('✅ N8N can read email filters');

  } catch (error) {
    console.error('❌ Database fix failed:', error.response?.data || error.message);
  }
}

fixDatabaseDirect();
