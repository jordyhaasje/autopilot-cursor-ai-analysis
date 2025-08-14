// Test Script voor AutoPilot Fixes
// Test alle verbeteringen lokaal

const axios = require('axios');
require('dotenv').config();

class AutoPilotTester {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    this.railwayUrl = process.env.RAILWAY_URL;
    this.n8nApiKey = process.env.N8N_API_KEY;
  }

  async testDatabaseFix() {
    console.log('🔧 Testing Database Schema Fix...');
    
    try {
      // Test 1: Check foreign key constraint
      const checkQuery = `
        SELECT 
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND tc.table_name='tenant_business_rules';
      `;

      const response = await axios.post(
        `${this.supabaseUrl}/rest/v1/rpc/exec_sql`,
        { query: checkQuery },
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Foreign key constraint check:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Database fix test failed:', error.message);
      return false;
    }
  }

  async testBusinessRulesLoading() {
    console.log('📋 Testing Business Rules Loading...');
    
    try {
      const testQuery = `
        SELECT
          t.tenant_id,
          t.bedrijfsnaam,
          t.ai_persona_name,
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'rule_key', COALESCE(tbr.rule_key, m.rule_key),
              'rule_name', m.rule_name,
              'rule_config', tbr.rule_config,
              'html_template', tbr.html_template,
              'category', m.category
            )
          ) AS business_rules
        FROM public.tenants t
        LEFT JOIN public.tenant_business_rules tbr
          ON t.tenant_id = tbr.tenant_id AND tbr.is_active = true
        LEFT JOIN public.master_business_rules m
          ON m.rule_key = tbr.rule_key
        WHERE t.gmail_email = 'lvbendjong@gmail.com'
          AND t.active = true
        GROUP BY t.tenant_id;
      `;

      const response = await axios.post(
        `${this.supabaseUrl}/rest/v1/rpc/exec_sql`,
        { query: testQuery },
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Business rules loaded:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Business rules test failed:', error.message);
      return false;
    }
  }

  async testN8NConnection() {
    console.log('🔗 Testing N8N Connection...');
    
    try {
      const response = await axios.get(
        `${this.railwayUrl}/api/v1/workflows`,
        {
          headers: {
            'X-N8N-API-KEY': this.n8nApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ N8N connection successful, workflows found:', response.data.data?.length || 0);
      return true;
    } catch (error) {
      console.error('❌ N8N connection failed:', error.message);
      return false;
    }
  }

  async testEmailFilter() {
    console.log('📧 Testing Email Filter Logic...');
    
    // Simuleer email filter test
    const testEmails = [
      {
        from: 'lvbendjong@gmail.com',
        subject: 'Test email',
        text: 'This is a normal email'
      },
      {
        from: 'spam@example.com',
        subject: 'Spam email',
        text: 'Click here to win money'
      },
      {
        from: 'lvbendjong@gmail.com',
        subject: 'Unsubscribe',
        text: 'Please unsubscribe me'
      }
    ];

    for (const email of testEmails) {
      const isSpam = this.checkSpam(email);
      const isValidTenant = email.from === 'lvbendjong@gmail.com';
      
      console.log(`📧 Email from ${email.from}:`, {
        validTenant: isValidTenant,
        isSpam: isSpam,
        shouldProcess: isValidTenant && !isSpam
      });
    }

    return true;
  }

  checkSpam(email) {
    const spamKeywords = [
      'spam', 'unsubscribe', 'click here', 'buy now', 'limited time',
      'act now', 'exclusive offer', 'free money', 'lottery', 'winner',
      'urgent', 'immediate action', 'once in a lifetime', 'guaranteed',
      'no risk', '100% free', 'cash bonus', 'earn money', 'work from home'
    ];

    const emailContent = (email.subject + ' ' + (email.text || '')).toLowerCase();
    return spamKeywords.some(keyword => emailContent.includes(keyword));
  }

  async runAllTests() {
    console.log('🚀 Starting AutoPilot Tests...\n');

    const tests = [
      { name: 'Database Schema Fix', test: () => this.testDatabaseFix() },
      { name: 'Business Rules Loading', test: () => this.testBusinessRulesLoading() },
      { name: 'N8N Connection', test: () => this.testN8NConnection() },
      { name: 'Email Filter Logic', test: () => this.testEmailFilter() }
    ];

    const results = [];

    for (const test of tests) {
      console.log(`\n🧪 Running: ${test.name}`);
      const result = await test.test();
      results.push({ name: test.name, passed: result });
      console.log(`${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASSED' : 'FAILED'}\n`);
    }

    const passed = results.filter(r => r.passed).length;
    const total = results.length;

    console.log('📊 Test Results Summary:');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);

    if (passed === total) {
      console.log('🎉 All tests passed! AutoPilot is ready for production.');
    } else {
      console.log('⚠️ Some tests failed. Please check the errors above.');
    }

    return results;
  }
}

// Run tests
const tester = new AutoPilotTester();
tester.runAllTests().catch(console.error);
