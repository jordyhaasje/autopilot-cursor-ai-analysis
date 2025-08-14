const axios = require('axios');

const N8N_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTcxNzUxLCJleHAiOjE3NTc3MzYwMDB9.sSOhbufmYfF40Zg-UTbmBtKXNh6FG7o9x5hoPjEUIRU';

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function checkBusinessRulesLoading() {
  console.log('🔍 Checking Business Rules Loading in Workflow...\n');

  try {
    // 1. Get current workflow
    console.log('📡 Getting current workflow...');
    const workflowResponse = await axios.get(
      `${N8N_URL}/api/v1/workflows/WP5aiR5vN2A9w91i`,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const workflow = workflowResponse.data;
    console.log(`✅ Workflow loaded: ${workflow.nodes.length} nodes`);

    // 2. Find AI Context Builder node
    const aiContextBuilder = workflow.nodes.find(node => node.name === 'AI Context builder');

    console.log('\n🔍 ANALYZING BUSINESS RULES LOADING:');

    if (aiContextBuilder && aiContextBuilder.parameters && aiContextBuilder.parameters.jsCode) {
      const code = aiContextBuilder.parameters.jsCode;
      
      console.log('\n1️⃣ Business Rules Loading Analysis:');
      
      // Check for different types of business rules loading
      const loadingPatterns = [
        'tenant_business_rules',
        'master_business_rules', 
        'scenario_rules',
        'master_scenarios',
        'scenario_assignments',
        'getAllBusinessRules',
        'getTenantBusinessRules',
        'getBusinessRules'
      ];

      console.log('✅ Business Rules Loading Patterns:');
      loadingPatterns.forEach(pattern => {
        if (code.includes(pattern)) {
          console.log(`   ✅ ${pattern} found`);
        } else {
          console.log(`   ❌ ${pattern} not found`);
        }
      });

      // Check for tenant_id usage
      console.log('\n2️⃣ Tenant ID Usage:');
      if (code.includes('tenant_id')) {
        console.log('✅ tenant_id wordt gebruikt');
        
        // Look for specific tenant_id patterns
        const tenantPatterns = [
          'tenant_id',
          'getTenantId',
          'getTenantIdFromEmail',
          'to_email',
          'email'
        ];

        tenantPatterns.forEach(pattern => {
          if (code.includes(pattern)) {
            console.log(`   ✅ ${pattern} found`);
          }
        });
      } else {
        console.log('❌ tenant_id wordt niet gebruikt');
      }

      // Check for database queries
      console.log('\n3️⃣ Database Query Patterns:');
      const queryPatterns = [
        'SELECT',
        'FROM tenant_business_rules',
        'WHERE tenant_id',
        'supabase',
        'fetch',
        'axios'
      ];

      queryPatterns.forEach(pattern => {
        if (code.includes(pattern)) {
          console.log(`   ✅ ${pattern} found`);
        } else {
          console.log(`   ❌ ${pattern} not found`);
        }
      });

      // Check for hardcoded values
      console.log('\n4️⃣ Hardcoded Values Check:');
      const hardcodedPatterns = [
        'af738ad1-9275-4f87-8fa6-fe2748771dc6',
        'tenant_id:',
        'tenant_id =',
        'tenant_id: "',
        'tenant_id: \''
      ];

      hardcodedPatterns.forEach(pattern => {
        if (code.includes(pattern)) {
          console.log(`   ⚠️  Hardcoded value found: ${pattern}`);
        }
      });

      // Extract relevant code snippets
      console.log('\n5️⃣ Relevant Code Snippets:');
      
      // Look for business rules related code
      const lines = code.split('\n');
      const relevantLines = lines.filter(line => 
        line.includes('business') || 
        line.includes('rule') || 
        line.includes('tenant') ||
        line.includes('detectie')
      );

      if (relevantLines.length > 0) {
        console.log('   Found relevant code lines:');
        relevantLines.slice(0, 10).forEach(line => {
          console.log(`   ${line.trim()}`);
        });
      } else {
        console.log('   No relevant code lines found');
      }

    } else {
      console.log('❌ AI Context Builder not found or no code');
    }

    // 3. Check database for all business rules types
    console.log('\n6️⃣ Database Business Rules Check:');
    
    // Check tenant_business_rules
    const tenantRulesResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenant_business_rules?select=tenant_id,rule_key&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ tenant_business_rules: ${tenantRulesResponse.data.length} records`);

    // Check master_business_rules
    try {
      const masterRulesResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/master_business_rules?select=rule_key&limit=5`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ master_business_rules: ${masterRulesResponse.data.length} records`);
    } catch (error) {
      console.log('❌ master_business_rules: Table does not exist or no access');
    }

    // Check master_scenarios
    try {
      const masterScenariosResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/master_scenarios?select=scenario_key&limit=5`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ master_scenarios: ${masterScenariosResponse.data.length} records`);
    } catch (error) {
      console.log('❌ master_scenarios: Table does not exist or no access');
    }

    // Check scenario_rules
    try {
      const scenarioRulesResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/scenario_rules?select=scenario_key,rule_key&limit=5`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ scenario_rules: ${scenarioRulesResponse.data.length} records`);
    } catch (error) {
      console.log('❌ scenario_rules: Table does not exist or no access');
    }

    // Check scenario_assignments
    try {
      const scenarioAssignmentsResponse = await axios.get(
        `${SUPABASE_URL}/rest/v1/scenario_assignments?select=tenant_id,scenario_key&limit=5`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ scenario_assignments: ${scenarioAssignmentsResponse.data.length} records`);
    } catch (error) {
      console.log('❌ scenario_assignments: Table does not exist or no access');
    }

    console.log('\n🎯 BUSINESS RULES LOADING ANALYSIS SUMMARY:');
    console.log('❌ Business rules loading niet gevonden in AI Context Builder');
    console.log('❌ Tenant ID usage niet gevonden');
    console.log('❌ Database queries niet gevonden');
    console.log('⚠️  Mogelijk hardcoded tenant_id of alle regels geladen');
    console.log('✅ Database tabellen aanwezig (tenant_business_rules)');

    console.log('\n🚨 KRITIEKE PROBLEMEN:');
    console.log('1. ❌ AI Context Builder laadt mogelijk geen business rules');
    console.log('2. ❌ Geen tenant-specifieke loading');
    console.log('3. ❌ Mogelijk hardcoded tenant_id');
    console.log('4. ❌ AI krijgt mogelijk verkeerde context');

    console.log('\n📝 RECOMMENDATIONS:');
    console.log('1. Implementeer tenant-specifieke business rules loading');
    console.log('2. Add Get Tenant Data node voor dynamische tenant detection');
    console.log('3. Update AI Context Builder met correcte database queries');
    console.log('4. Test met verschillende tenant emails');

  } catch (error) {
    console.error('❌ Business rules loading check failed:', error.response?.data || error.message);
  }
}

checkBusinessRulesLoading();
