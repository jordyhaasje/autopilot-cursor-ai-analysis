const axios = require('axios');

const RAILWAY_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTA4MzgyLCJleHAiOjE3NTc2NDk2MDB9.rtJzEp4Fm81LEB7UwVmngqieUNfr8lZZ8A-pWIbdAnE';

async function addEmailFilter() {
  console.log('📧 Adding Email Filter Node...');
  
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
    console.log(`📋 Current workflow: ${workflow.name} with ${workflow.nodes.length} nodes`);

    // Create Email Filter node
    const emailFilterNode = {
      parameters: {
        jsCode: `// Node: Email Filter
const email = $input.first().json;

// Tenant filtering
const tenant_email = email.from.toLowerCase();
const expected_tenant = 'lvbendjong@gmail.com';

if (tenant_email !== expected_tenant) {
  console.log('Email Filter: Wrong tenant, skipping');
  return [];
}

// Spam detection
const spamKeywords = ['spam', 'unsubscribe', 'click here', 'buy now', 'limited time'];
const emailContent = (email.subject + ' ' + (email.text || '')).toLowerCase();
const isSpam = spamKeywords.some(keyword => emailContent.includes(keyword));

if (isSpam) {
  console.log('Email Filter: Spam detected, skipping');
  return [];
}

// Pass through valid email
console.log('Email Filter: Email passed checks');
return [{ json: { ...email, filtered_at: new Date().toISOString() } }];`
      },
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [-640, 176],
      id: 'email-filter-' + Date.now(),
      name: 'Email Filter',
      alwaysOutputData: true
    };

    // Add node to workflow
    workflow.nodes.push(emailFilterNode);
    console.log('✅ Email Filter node created');

    // Update connections
    const gmailTriggerNode = workflow.nodes.find(n => n.name === 'Gmail Trigger');
    const emailParserNode = workflow.nodes.find(n => n.name === 'Email parser');
    
    if (gmailTriggerNode && emailParserNode) {
      // Remove old connection
      if (workflow.connections[gmailTriggerNode.name]) {
        delete workflow.connections[gmailTriggerNode.name];
      }
      
      // Add new connections
      workflow.connections[gmailTriggerNode.name] = {
        main: [[{ node: emailFilterNode.name, type: 'main', index: 0 }]]
      };
      
      workflow.connections[emailFilterNode.name] = {
        main: [[{ node: emailParserNode.name, type: 'main', index: 0 }]]
      };
      
      console.log('✅ Connections updated');
    }

    // Update workflow
    const updateData = {
      name: workflow.name,
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

    console.log('🎉 Email Filter node added successfully!');
    console.log(`📊 Total nodes: ${workflow.nodes.length}`);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to add Email Filter:', error.response?.data || error.message);
    return false;
  }
}

addEmailFilter();
