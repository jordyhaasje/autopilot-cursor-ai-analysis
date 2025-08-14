const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS Policies for Email Filters...\n');

  try {
    // First, let's check if we can access the RLS policies via SQL
    console.log('📋 Checking current RLS policies...');
    
    // Try to get current policies (this might not work due to RLS)
    try {
      const policiesResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/email_filters?select=*&limit=1`,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Can read email_filters table');
    } catch (error) {
      console.log('❌ Cannot read email_filters table due to RLS:', error.response?.data?.message || error.message);
    }

    // Create the SQL commands to fix RLS policies
    console.log('\n📝 Creating RLS Policy Fix SQL...');
    
    const rlsFixSQL = `
-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON email_filters;
DROP POLICY IF EXISTS "Enable insert access for all users" ON email_filters;
DROP POLICY IF EXISTS "Enable update access for all users" ON email_filters;
DROP POLICY IF EXISTS "Enable delete access for all users" ON email_filters;

-- Create new policies for email_filters table

-- Policy 1: Allow authenticated users to read email filters for their own tenant
CREATE POLICY "Users can read email filters for their tenant" ON email_filters
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM tenants 
    WHERE gmail_email = auth.jwt() ->> 'email'
  )
);

-- Policy 2: Allow authenticated users to insert email filters for their own tenant
CREATE POLICY "Users can insert email filters for their tenant" ON email_filters
FOR INSERT WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM tenants 
    WHERE gmail_email = auth.jwt() ->> 'email'
  )
);

-- Policy 3: Allow authenticated users to update email filters for their own tenant
CREATE POLICY "Users can update email filters for their tenant" ON email_filters
FOR UPDATE USING (
  tenant_id IN (
    SELECT tenant_id FROM tenants 
    WHERE gmail_email = auth.jwt() ->> 'email'
  )
) WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM tenants 
    WHERE gmail_email = auth.jwt() ->> 'email'
  )
);

-- Policy 4: Allow authenticated users to delete email filters for their own tenant
CREATE POLICY "Users can delete email filters for their tenant" ON email_filters
FOR DELETE USING (
  tenant_id IN (
    SELECT tenant_id FROM tenants 
    WHERE gmail_email = auth.jwt() ->> 'email'
  )
);

-- Policy 5: Allow N8N service to read all email filters (for filtering logic)
CREATE POLICY "N8N can read all email filters" ON email_filters
FOR SELECT USING (true);

-- Enable RLS on email_filters table if not already enabled
ALTER TABLE email_filters ENABLE ROW LEVEL SECURITY;
`;

    console.log('📋 RLS Fix SQL created:');
    console.log(rlsFixSQL);

    // Save the SQL to a file for manual execution
    const fs = require('fs');
    fs.writeFileSync('fix-email-filters-rls.sql', rlsFixSQL);
    console.log('\n💾 SQL saved to: fix-email-filters-rls.sql');

    console.log('\n🎯 Next Steps:');
    console.log('1. Open Supabase Dashboard');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste the SQL from fix-email-filters-rls.sql');
    console.log('4. Execute the SQL');
    console.log('5. Test the dashboard email filter creation');

    // Test if we can now insert after the policy fix
    console.log('\n🧪 Testing insert after policy fix...');
    console.log('⚠️ This will fail until you execute the SQL above');
    
    const testFilter = {
      tenant_id: 'af738ad1-9275-4f87-8fa6-fe2748771dc6',
      email_address: 'test@example.com',
      domain: 'example.com',
      filter_type: 'blacklist',
      pattern_type: 'exact',
      reason: 'Test filter'
    };

    try {
      const insertResponse = await axios.post(
        `${SUPABASE_URL}/rest/v1/email_filters`,
        testFilter,
        {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Insert test successful after RLS fix!');
    } catch (error) {
      console.log('❌ Insert still failing - execute the SQL first:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ RLS fix failed:', error.response?.data || error.message);
  }
}

fixRLSPolicies();
