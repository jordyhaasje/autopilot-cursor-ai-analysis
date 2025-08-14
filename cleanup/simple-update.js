const axios = require('axios');

const RAILWAY_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTA4MzgyLCJleHAiOjE3NTc2NDk2MDB9.rtJzEp4Fm81LEB7UwVmngqieUNfr8lZZ8A-pWIbdAnE';

async function simpleUpdate() {
  console.log('🔧 Simple N8N Update - AI Context Builder Fix...');
  
  try {
    // Get current workflow
    const response = await axios.get(
      `${RAILWAY_URL}/api/v1/workflows/WP5aiR5vN2A9w91i`,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const workflow = response.data;
    console.log(`📋 Current workflow: ${workflow.name}`);

    // Find and fix AI Context Builder
    const aiContextNode = workflow.nodes.find(n => n.name === 'AI Context builder');
    if (aiContextNode && aiContextNode.parameters && aiContextNode.parameters.jsCode) {
      const originalCode = aiContextNode.parameters.jsCode;
      const fixedCode = originalCode.replace(/dreigin/g, 'dreiging');
      
      if (originalCode !== fixedCode) {
        aiContextNode.parameters.jsCode = fixedCode;
        console.log('✅ AI Context Builder typfout fixed (dreigin -> dreiging)');
      } else {
        console.log('ℹ️ No typfout found in AI Context Builder');
      }
    }

    // Update only essential properties
    const updateData = {
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings
    };

    const updateResponse = await axios.put(
      `${RAILWAY_URL}/api/v1/workflows/WP5aiR5vN2A9w91i`,
      updateData,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('🎉 Workflow updated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Update failed:', error.response?.data || error.message);
    return false;
  }
}

simpleUpdate();
