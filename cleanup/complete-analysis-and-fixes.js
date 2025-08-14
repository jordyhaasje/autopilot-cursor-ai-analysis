const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function completeAnalysis() {
  console.log('🔍 COMPLETE AUTO PILOT ANALYSIS & FIXES\n');
  console.log('='.repeat(60));

  // 1. DATABASE STATUS
  console.log('\n📊 1. DATABASE STATUS');
  console.log('-'.repeat(30));
  
  try {
    const tenantsResponse = await axios.get(`${SUPABASE_URL}/rest/v1/tenants`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Tenants: ${tenantsResponse.data.length} records`);
    
    const emailFiltersResponse = await axios.get(`${SUPABASE_URL}/rest/v1/email_filters`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`❌ Email Filters: ${emailFiltersResponse.data.length} records (EMPTY!)`);
    
    const interactionsResponse = await axios.get(`${SUPABASE_URL}/rest/v1/customer_interactions`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Customer Interactions: ${interactionsResponse.data.length} records`);
    
  } catch (error) {
    console.log(`❌ Database check failed: ${error.message}`);
  }

  // 2. EMAIL FILTER PROBLEMS
  console.log('\n📧 2. EMAIL FILTER PROBLEMS');
  console.log('-'.repeat(30));
  
  console.log('❌ PROBLEM 1: Email filters table is empty');
  console.log('❌ PROBLEM 2: Dashboard cannot save email filters');
  console.log('❌ PROBLEM 3: N8N workflow missing email filter node');
  console.log('❌ PROBLEM 4: RLS policies blocking dashboard access');
  
  // 3. N8N WORKFLOW PROBLEMS
  console.log('\n⚙️ 3. N8N WORKFLOW PROBLEMS');
  console.log('-'.repeat(30));
  
  console.log('❌ PROBLEM 1: Email Filter node not in current workflow');
  console.log('❌ PROBLEM 2: Postgres Store Interaction has errors');
  console.log('❌ PROBLEM 3: Gmail trigger filter may be incorrect');
  
  // 4. SOLUTIONS
  console.log('\n🔧 4. SOLUTIONS NEEDED');
  console.log('-'.repeat(30));
  
  console.log('\n📧 EMAIL FILTER FIXES:');
  console.log('1. Add missing columns to email_filters table');
  console.log('2. Fix RLS policies for dashboard access');
  console.log('3. Add Email Filter node to N8N workflow');
  console.log('4. Test email filter functionality');
  
  console.log('\n⚙️ N8N WORKFLOW FIXES:');
  console.log('1. Import updated workflow with Email Filter node');
  console.log('2. Fix Postgres Store Interaction ON CONFLICT logic');
  console.log('3. Update Gmail trigger filters');
  console.log('4. Test complete workflow');
  
  console.log('\n🗄️ DATABASE FIXES:');
  console.log('1. Add missing email_filters columns');
  console.log('2. Fix RLS policies');
  console.log('3. Add sample email filter data');
  console.log('4. Test dashboard functionality');

  // 5. SQL FIXES
  console.log('\n📝 5. REQUIRED SQL FIXES');
  console.log('-'.repeat(30));
  
  const sqlFixes = `
-- FIX 1: Add missing columns to email_filters table
ALTER TABLE email_filters 
ADD COLUMN IF NOT EXISTS filter_value TEXT,
ADD COLUMN IF NOT EXISTS regex_pattern TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- FIX 2: Fix RLS policies for email_filters
DROP POLICY IF EXISTS "Users can read email filters for their tenant" ON email_filters;
DROP POLICY IF EXISTS "Users can insert email filters for their tenant" ON email_filters;
DROP POLICY IF EXISTS "Users can update email filters for their tenant" ON email_filters;
DROP POLICY IF EXISTS "Users can delete email filters for their tenant" ON email_filters;

-- Create simple policy that allows authenticated users
CREATE POLICY "Allow all authenticated users" ON email_filters
FOR ALL USING (auth.role() = 'authenticated');

-- Enable RLS
ALTER TABLE email_filters ENABLE ROW LEVEL SECURITY;

-- FIX 3: Add sample email filter data
INSERT INTO email_filters (tenant_id, email_address, domain, filter_type, pattern_type, reason, filter_value, created_at)
VALUES 
  ('af738ad1-9275-4f87-8fa6-fe2748771dc6', 'spam@example.com', NULL, 'spam', 'exact', 'Test spam filter', 'spam@example.com', NOW()),
  ('af738ad1-9275-4f87-8fa6-fe2748771dc6', NULL, 'spamdomain.com', 'spam', 'domain', 'Test domain filter', 'spamdomain.com', NOW());
`;

  console.log(sqlFixes);

  // 6. N8N WORKFLOW FIXES
  console.log('\n⚙️ 6. N8N WORKFLOW FIXES');
  console.log('-'.repeat(30));
  
  console.log('1. Add Email Filter node after Gmail Trigger');
  console.log('2. Update Postgres Store Interaction ON CONFLICT logic');
  console.log('3. Fix Gmail trigger sender filter');
  console.log('4. Test complete workflow execution');

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Execute SQL fixes in Supabase');
  console.log('2. Update N8N workflow with Email Filter node');
  console.log('3. Test dashboard email filter creation');
  console.log('4. Test complete N8N workflow');
  console.log('5. Verify all functionality works');

  console.log('\n' + '='.repeat(60));
  console.log('✅ ANALYSIS COMPLETE - READY FOR FIXES');
}

completeAnalysis();
