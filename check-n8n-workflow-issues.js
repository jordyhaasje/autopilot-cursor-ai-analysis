const axios = require('axios');

const N8N_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTY2NTY2LCJleHAiOjE3NTc3MzYwMDB9.awhRu46eFbhMPFAiv7hgFTtxLTIwpxFF7ebmXMkFPiM';

async function checkN8NWorkflowIssues() {
  console.log('🔍 Checking N8N Workflow for Potential Issues...\n');

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
    console.log(`📊 Workflow status: ${workflow.active ? 'Active' : 'Inactive'}`);

    // Check each node for potential issues
    console.log('\n🔍 Analyzing nodes for potential issues...\n');

    const issues = [];

    workflow.nodes.forEach((node, index) => {
      console.log(`${index + 1}. ${node.name} (${node.type})`);
      
      // Check Postgres nodes for SQL issues
      if (node.type === 'n8n-nodes-base.postgres') {
        const query = node.parameters.query || '';
        
        // Check for updated_at references
        if (query.includes('updated_at')) {
          console.log(`   ⚠️  Uses updated_at column`);
        }
        
        // Check for potential SQL syntax issues
        if (query.includes('ON CONFLICT')) {
          console.log(`   ✅ Has ON CONFLICT logic`);
        }
        
        // Check for missing columns
        const requiredColumns = ['tenant_id', 'thread_id', 'customer_email'];
        requiredColumns.forEach(col => {
          if (!query.includes(col)) {
            console.log(`   ❌ Missing column: ${col}`);
            issues.push(`${node.name}: Missing column ${col}`);
          }
        });
      }

      // Check Code nodes for potential issues
      if (node.type === 'n8n-nodes-base.code') {
        const code = node.parameters.jsCode || '';
        
        // Check for Supabase key usage
        if (code.includes('SUPABASE_KEY')) {
          console.log(`   ⚠️  Uses SUPABASE_KEY (should use SUPABASE_SERVICE_ROLE_KEY)`);
          issues.push(`${node.name}: Uses old Supabase key`);
        }
        
        if (code.includes('SUPABASE_SERVICE_ROLE_KEY')) {
          console.log(`   ✅ Uses SUPABASE_SERVICE_ROLE_KEY`);
        }
      }

      // Check for disabled nodes
      if (node.disabled) {
        console.log(`   ⚠️  Node is disabled`);
        issues.push(`${node.name}: Node is disabled`);
      }
    });

    // Check workflow connections
    console.log('\n🔗 Checking workflow connections...');
    const connections = workflow.connections;
    if (connections) {
      Object.keys(connections).forEach(sourceNode => {
        const targets = connections[sourceNode];
        Object.keys(targets).forEach(output => {
          const targetNodes = targets[output];
          targetNodes.forEach(target => {
            console.log(`   ${sourceNode} → ${target.node}`);
          });
        });
      });
    }

    // Summary
    console.log('\n📋 ISSUE SUMMARY:');
    if (issues.length === 0) {
      console.log('✅ No major issues found');
    } else {
      issues.forEach(issue => {
        console.log(`❌ ${issue}`);
      });
    }

    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('1. Execute fix-database-correct.sql in Supabase');
    console.log('2. Test workflow after database changes');
    console.log('3. Check if all nodes are properly connected');
    console.log('4. Verify email filtering works correctly');

  } catch (error) {
    console.error('❌ Failed to check workflow:', error.response?.data || error.message);
  }
}

checkN8NWorkflowIssues();
