const axios = require("axios");

const RAILWAY_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTA4MzgyLCJleHAiOjE3NTc2NDk2MDB9.rtJzEp4Fm81LEB7UwVmngqieUNfr8lZZ8A-pWIbdAnE';

async function updateN8NFlow() {
  console.log('🚀 Starting N8N Flow Updates...');
  
  try {
    // 1. Get current workflow
    console.log('📋 Getting current workflow...');
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
    console.log(`✅ Current workflow: ${workflow.name} with ${workflow.nodes.length} nodes`);

    // 2. Fix AI Context Builder typfout
    console.log('🧠 Fixing AI Context Builder typfout...');
    const aiContextNode = workflow.nodes.find(n => n.name === 'AI Context builder');
    if (aiContextNode && aiContextNode.parameters && aiContextNode.parameters.jsCode) {
      // Fix dreigin -> dreiging
      aiContextNode.parameters.jsCode = aiContextNode.parameters.jsCode.replace(/dreigin/g, 'dreiging');
      console.log('✅ AI Context Builder typfout fixed');
    }

    // 3. Update workflow
    console.log('💾 Updating workflow...');
    const updateResponse = await axios.put(
      `${RAILWAY_URL}/api/v1/workflows/WP5aiR5vN2A9w91i`,
      workflow,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('🎉 N8N Flow updated successfully!');
    console.log(`📊 Total nodes: ${workflow.nodes.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to update N8N flow:', error.response?.data || error.message);
    return false;
  }
}

updateN8NFlow();
