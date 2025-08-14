const axios = require('axios');

const N8N_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTY2NTY2LCJleHAiOjE3NTc3MzYwMDB9.awhRu46eFbhMPFAiv7hgFTtxLTIwpxFF7ebmXMkFPiM';

async function activateN8NSimple() {
  console.log('🔧 Activating N8N Workflow (Simple)...\n');

  try {
    // Get current workflow
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
    console.log(`📊 Current status: ${workflow.active ? 'Active' : 'Inactive'}`);

    if (workflow.active) {
      console.log('✅ Workflow is already active!');
      return;
    }

    // Try to activate using minimal payload
    console.log('📤 Activating workflow...');
    const activateResponse = await axios.put(
      `${N8N_URL}/api/v1/workflows/WP5aiR5vN2A9w91i`,
      {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        active: true
      },
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Workflow activated successfully!');
    console.log('🎉 AutoPilot is now running and ready to process emails');

  } catch (error) {
    console.error('❌ Failed to activate workflow:', error.response?.data || error.message);
    
    // Try alternative activation method
    console.log('\n🔄 Trying alternative activation method...');
    try {
      const alternativeResponse = await axios.post(
        `${N8N_URL}/api/v1/workflows/WP5aiR5vN2A9w91i/activate`,
        {},
        {
          headers: {
            'X-N8N-API-KEY': N8N_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Workflow activated via alternative method!');
    } catch (altError) {
      console.error('❌ Alternative activation also failed:', altError.response?.data || altError.message);
    }
  }
}

activateN8NSimple();
