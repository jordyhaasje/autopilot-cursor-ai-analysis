const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Laad .env bestand als het bestaat
try {
  require('dotenv').config();
} catch (error) {
  // dotenv is niet geïnstalleerd, dat is OK
}

class CompleteN8NExporter {
  constructor(railwayUrl, apiKey) {
    this.railwayUrl = railwayUrl;
    this.apiKey = apiKey;
    this.exportDir = 'complete-workflows-export';
  }

  async getAllWorkflows() {
    console.log('📊 Alle workflows ophalen...');
    const response = await axios.get(
      `${this.railwayUrl}/api/v1/workflows`,
      {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('📊 API Response:', JSON.stringify(response.data, null, 2));
    const workflows = response.data.data || response.data;
    console.log(`📋 ${workflows.length} workflows gevonden`);
    return workflows;
  }

  async getWorkflowById(workflowId) {
    console.log(`🔍 Workflow ${workflowId} ophalen...`);
    const response = await axios.get(
      `${this.railwayUrl}/api/v1/workflows/${workflowId}`,
      {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  async exportAllWorkflows() {
    // Maak export directory
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }

    // Haal alle workflows op
    const workflows = await this.getAllWorkflows();
    
    const exportedWorkflows = [];
    
    for (const workflow of workflows) {
      try {
        console.log(`📥 Exporteren: ${workflow.name} (${workflow.id})`);
        
        // Haal volledige workflow data op
        const completeWorkflow = await this.getWorkflowById(workflow.id);
        
        // Maak bestandsnaam
        const filename = `${workflow.name.replace(/[^a-zA-Z0-9]/g, '_')}_${workflow.id}.json`;
        const filepath = path.join(this.exportDir, filename);
        
        // Sla workflow op
        fs.writeFileSync(filepath, JSON.stringify(completeWorkflow, null, 2));
        
        exportedWorkflows.push({
          id: workflow.id,
          name: workflow.name,
          active: workflow.active,
          filename: filename,
          description: workflow.description || '',
          tags: workflow.tags || [],
          nodeCount: completeWorkflow.nodes ? completeWorkflow.nodes.length : 0,
          hasCodeNodes: completeWorkflow.nodes ? completeWorkflow.nodes.some(n => n.type === 'n8n-nodes-base.code') : false
        });
        
        console.log(`✅ ${workflow.name} geëxporteerd (${completeWorkflow.nodes ? completeWorkflow.nodes.length : 0} nodes)`);
        
        // Kleine pauze om API niet te overbelasten
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Fout bij exporteren van ${workflow.name}:`, error.message);
      }
    }

    // Maak index bestand
    const indexData = {
      exportDate: new Date().toISOString(),
      totalWorkflows: exportedWorkflows.length,
      railwayUrl: this.railwayUrl,
      workflows: exportedWorkflows
    };

    fs.writeFileSync(
      path.join(this.exportDir, 'index.json'),
      JSON.stringify(indexData, null, 2)
    );

    console.log(`\n🎉 Export voltooid!`);
    console.log(`📁 Directory: ${this.exportDir}`);
    console.log(`📊 ${exportedWorkflows.length} workflows geëxporteerd`);
    
    // Toon code nodes
    const codeNodes = exportedWorkflows.filter(w => w.hasCodeNodes);
    if (codeNodes.length > 0) {
      console.log(`\n💻 Workflows met code nodes:`);
      codeNodes.forEach(w => console.log(`  - ${w.name} (${w.nodeCount} nodes)`));
    }
  }

  async analyzeCodeNodes() {
    console.log('\n🔍 Code nodes analyseren...');
    
    const files = fs.readdirSync(this.exportDir).filter(f => f.endsWith('.json') && f !== 'index.json');
    
    for (const file of files) {
      const filepath = path.join(this.exportDir, file);
      const workflow = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      
      const codeNodes = workflow.nodes ? workflow.nodes.filter(n => n.type === 'n8n-nodes-base.code') : [];
      
      if (codeNodes.length > 0) {
        console.log(`\n📝 ${workflow.name} - Code nodes:`);
        codeNodes.forEach(node => {
          console.log(`  - ${node.name}: ${node.parameters.jsCode ? node.parameters.jsCode.length : 0} karakters`);
        });
      }
    }
  }
}

async function main() {
  const RAILWAY_URL = process.env.RAILWAY_URL || 'https://primary-production-9667.up.railway.app';
  const N8N_API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTA4MzgyLCJleHAiOjE3NTc2NDk2MDB9.rtJzEp4Fm81LEB7UwVmngqieUNfr8lZZ8A-pWIbdAnE';

  if (!N8N_API_KEY || N8N_API_KEY === 'jouw_n8n_api_key') {
    console.log('❌ N8N API Key niet gevonden!');
    console.log('📝 Maak een .env bestand aan met:');
    console.log('RAILWAY_URL=https://jouw-railway-url.up.railway.app');
    console.log('N8N_API_KEY=jouw_n8n_api_key');
    return;
  }

  const exporter = new CompleteN8NExporter(RAILWAY_URL, N8N_API_KEY);
  
  try {
    await exporter.exportAllWorkflows();
    await exporter.analyzeCodeNodes();
  } catch (error) {
    console.error('❌ Export fout:', error.message);
  }
}

main();
