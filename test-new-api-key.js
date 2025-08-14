const axios = require('axios');

const N8N_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTcxNzUxLCJleHAiOjE3NTc3MzYwMDB9.sSOhbufmYfF40Zg-UTbmBtKXNh6FG7o9x5hoPjEUIRU';

async function testNewApiKey() {
  console.log('🔑 Testing New API Key...\n');

  try {
    // Test getting the workflow
    console.log('📡 Testing workflow access...');
    const workflowResponse = await axios.get(
      `${N8N_URL}/api/v1/workflows/WP5aiR5vN2A9w91i`,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Workflow access successful!');
    console.log(`   - Workflow name: ${workflowResponse.data.name}`);
    console.log(`   - Active: ${workflowResponse.data.active}`);
    console.log(`   - Nodes: ${workflowResponse.data.nodes.length}`);

    // Test updating the workflow (minimal test)
    console.log('\n📤 Testing workflow update capability...');
    const updateResponse = await axios.put(
      `${N8N_URL}/api/v1/workflows/WP5aiR5vN2A9w91i`,
      {
        name: workflowResponse.data.name,
        nodes: workflowResponse.data.nodes,
        connections: workflowResponse.data.connections,
        active: workflowResponse.data.active,
        settings: workflowResponse.data.settings
      },
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Workflow update successful!');
    console.log('🎉 New API key is working perfectly!');

    return true;

  } catch (error) {
    console.error('❌ API key test failed:', error.response?.data || error.message);
    return false;
  }
}

testNewApiKey();
