const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';
const RAILWAY_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTA4MzgyLCJleHAiOjE3NTc2NDk2MDB9.rtJzEp4Fm81LEB7UwVmngqieUNfr8lZZ8A-pWIbdAnE';

async function finalTest() {
  console.log('🎯 Final AutoPilot Test...\n');

  const results = [];

  // Test 1: Database Schema Fix
  console.log('🧪 Test 1: Database Schema Fix');
  try {
    const joinResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenants?select=tenant_id,bedrijfsnaam,tenant_business_rules(rule_key,master_business_rules(rule_name,category))`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('✅ Database schema fix working - foreign key constraint successful');
    results.push({ name: 'Database Schema Fix', passed: true });
  } catch (error) {
    console.log('❌ Database schema fix failed:', error.response?.data?.message || error.message);
    results.push({ name: 'Database Schema Fix', passed: false });
  }

  // Test 2: Business Rules Loading
  console.log('\n🧪 Test 2: Business Rules Loading');
  try {
    const rulesResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/master_business_rules?select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Business rules loading successful - ${rulesResponse.data.length} rules available`);
    results.push({ name: 'Business Rules Loading', passed: true });
  } catch (error) {
    console.log('❌ Business rules loading failed:', error.response?.data?.message || error.message);
    results.push({ name: 'Business Rules Loading', passed: false });
  }

  // Test 3: N8N Connection
  console.log('\n🧪 Test 3: N8N Connection');
  try {
    const n8nResponse = await axios.get(
      `${RAILWAY_URL}/api/v1/workflows`,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ N8N connection successful - ${n8nResponse.data.data?.length || 0} workflows found`);
    results.push({ name: 'N8N Connection', passed: true });
  } catch (error) {
    console.log('❌ N8N connection failed:', error.response?.data?.message || error.message);
    results.push({ name: 'N8N Connection', passed: false });
  }

  // Test 4: CURSOR AI Workflow
  console.log('\n🧪 Test 4: CURSOR AI Workflow');
  try {
    const workflowResponse = await axios.get(
      `${RAILWAY_URL}/api/v1/workflows/WP5aiR5vN2A9w91i`,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    const workflow = workflowResponse.data;
    const emailFilterNode = workflow.nodes.find(n => n.name === 'Email Filter');
    const aiContextNode = workflow.nodes.find(n => n.name === 'AI Context builder');
    
    console.log(`✅ CURSOR AI workflow found - ${workflow.nodes.length} nodes`);
    console.log(`✅ Email Filter node: ${emailFilterNode ? 'PRESENT' : 'MISSING'}`);
    console.log(`✅ AI Context Builder: ${aiContextNode ? 'PRESENT' : 'MISSING'}`);
    
    if (emailFilterNode && aiContextNode) {
      results.push({ name: 'CURSOR AI Workflow', passed: true });
    } else {
      results.push({ name: 'CURSOR AI Workflow', passed: false });
    }
  } catch (error) {
    console.log('❌ CURSOR AI workflow test failed:', error.response?.data?.message || error.message);
    results.push({ name: 'CURSOR AI Workflow', passed: false });
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}: ${result.passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! AutoPilot is ready for production!');
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above.');
  }

  return results;
}

finalTest();
