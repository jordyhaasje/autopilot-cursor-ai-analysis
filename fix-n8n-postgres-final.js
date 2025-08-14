const axios = require('axios');

const N8N_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTY2NTY2LCJleHAiOjE3NTc3MzYwMDB9.awhRu46eFbhMPFAiv7hgFTtxLTIwpxFF7ebmXMkFPiM';

async function fixN8NPostgresFinal() {
  console.log('🔧 Fixing N8N Postgres Store Interaction Query (Final)...\n');

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

    // Find Postgres Store Interaction node
    const postgresNode = workflow.nodes.find(node => node.name === 'Postgres Store Interaction');
    if (!postgresNode) {
      console.log('❌ Postgres Store Interaction node not found');
      return;
    }

    console.log('💾 Found Postgres Store Interaction node, fixing query...');

    // Get current query
    const currentQuery = postgresNode.parameters.query;
    console.log('📋 Current query length:', currentQuery.length);

    // Remove updated_at references from the query
    let fixedQuery = currentQuery;
    
    // Remove updated_at from INSERT column list
    fixedQuery = fixedQuery.replace(/updated_at,\s*/g, '');
    
    // Remove updated_at = NOW() from ON CONFLICT
    fixedQuery = fixedQuery.replace(/,\s*-- Updated timestamp\n\s*updated_at = NOW\(\);/g, ';');
    fixedQuery = fixedQuery.replace(/,\s*updated_at = NOW\(\);/g, ';');

    console.log('📋 Fixed query length:', fixedQuery.length);

    // Update the node
    postgresNode.parameters.query = fixedQuery;

    // Update workflow with all required fields
    console.log('📤 Updating workflow...');
    const updateResponse = await axios.put(
      `${N8N_URL}/api/v1/workflows/WP5aiR5vN2A9w91i`,
      {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        active: workflow.active,
        settings: workflow.settings,
        staticData: workflow.staticData,
        tags: workflow.tags,
        triggerCount: workflow.triggerCount,
        updatedAt: workflow.updatedAt,
        versionId: workflow.versionId
      },
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Postgres Store Interaction query fixed successfully!');
    console.log('🔧 Changes made:');
    console.log('   - Removed updated_at column from INSERT');
    console.log('   - Removed updated_at = NOW() from ON CONFLICT');
    console.log('   - Query now matches current database structure');
    console.log('   - N8N workflow should now work without errors');

  } catch (error) {
    console.error('❌ Failed to fix Postgres query:', error.response?.data || error.message);
  }
}

fixN8NPostgresFinal();
