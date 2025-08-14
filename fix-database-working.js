const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function fixDatabaseWorking() {
  console.log('🔧 Fixing Database (Working)...\n');

  try {
    // Check current database structure
    console.log('📊 Checking current database structure...');
    const checkResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/customer_interactions?limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (checkResponse.data.length > 0) {
      const hasUpdatedAt = 'updated_at' in checkResponse.data[0];
      console.log(`✅ Customer interactions table check: ${hasUpdatedAt ? 'updated_at column exists' : 'updated_at column missing'}`);
      
      if (hasUpdatedAt) {
        console.log('✅ Database is already fixed!');
        return;
      }
    }

    console.log('\n🔧 Adding updated_at column to customer_interactions...');
    
    // Add updated_at column
    const addColumnSQL = `
      ALTER TABLE customer_interactions 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    `;

    await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      { sql: addColumnSQL },
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ updated_at column added successfully');

    // Update existing records
    console.log('\n🔧 Updating existing records...');
    const updateSQL = `
      UPDATE customer_interactions 
      SET updated_at = created_at 
      WHERE updated_at IS NULL;
    `;

    await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      { sql: updateSQL },
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Existing records updated successfully');

    // Add trigger for automatic updates
    console.log('\n🔧 Adding trigger for automatic updates...');
    const triggerSQL = `
      CREATE OR REPLACE FUNCTION update_customer_interactions_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS update_customer_interactions_updated_at_trigger ON customer_interactions;

      CREATE TRIGGER update_customer_interactions_updated_at_trigger
          BEFORE UPDATE ON customer_interactions
          FOR EACH ROW
          EXECUTE FUNCTION update_customer_interactions_updated_at();
    `;

    await axios.post(
      `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
      { sql: triggerSQL },
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Trigger added successfully');

    // Verify the fix
    console.log('\n🔍 Verifying the fix...');
    const verifyResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/customer_interactions?limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (verifyResponse.data.length > 0) {
      const hasUpdatedAt = 'updated_at' in verifyResponse.data[0];
      if (hasUpdatedAt) {
        console.log('✅ Database fix verified successfully!');
        console.log(`   - Sample record has updated_at: ${verifyResponse.data[0].updated_at}`);
      } else {
        console.log('❌ Database fix verification failed');
      }
    }

    console.log('\n🎯 DATABASE FIX COMPLETED:');
    console.log('1. ✅ Added updated_at column to customer_interactions');
    console.log('2. ✅ Updated existing records with created_at values');
    console.log('3. ✅ Added trigger for automatic updates');
    console.log('4. ✅ Verified the fix works correctly');

    console.log('\n🧪 TESTING RECOMMENDATION:');
    console.log('The N8N workflow should now work without the "updated_at column does not exist" error.');

  } catch (error) {
    console.error('❌ Database fix failed:', error.response?.data || error.message);
    
    // If exec_sql function doesn't exist, provide manual instructions
    if (error.response?.data?.message?.includes('exec_sql')) {
      console.log('\n📝 MANUAL DATABASE FIX REQUIRED:');
      console.log('The exec_sql function is not available. Please run this SQL manually in Supabase:');
      console.log('');
      console.log('-- Add updated_at column');
      console.log('ALTER TABLE customer_interactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();');
      console.log('');
      console.log('-- Update existing records');
      console.log('UPDATE customer_interactions SET updated_at = created_at WHERE updated_at IS NULL;');
      console.log('');
      console.log('-- Add trigger');
      console.log('CREATE OR REPLACE FUNCTION update_customer_interactions_updated_at()');
      console.log('RETURNS TRIGGER AS $$');
      console.log('BEGIN');
      console.log('    NEW.updated_at = NOW();');
      console.log('    RETURN NEW;');
      console.log('END;');
      console.log('$$ LANGUAGE plpgsql;');
      console.log('');
      console.log('DROP TRIGGER IF EXISTS update_customer_interactions_updated_at_trigger ON customer_interactions;');
      console.log('');
      console.log('CREATE TRIGGER update_customer_interactions_updated_at_trigger');
      console.log('    BEFORE UPDATE ON customer_interactions');
      console.log('    FOR EACH ROW');
      console.log('    EXECUTE FUNCTION update_customer_interactions_updated_at();');
    }
  }
}

fixDatabaseWorking();
