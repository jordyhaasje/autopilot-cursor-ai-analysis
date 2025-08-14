const fs = require('fs');
const path = require('path');

class CompleteWorkflowAnalyzer {
  constructor(workflowPath) {
    this.workflowPath = workflowPath;
    this.workflow = null;
  }

  loadWorkflow() {
    try {
      const data = fs.readFileSync(this.workflowPath, 'utf8');
      this.workflow = JSON.parse(data);
      console.log(`📋 Workflow geladen: ${this.workflow.name}`);
      return true;
    } catch (error) {
      console.error(`❌ Fout bij laden workflow: ${error.message}`);
      return false;
    }
  }

  analyzeNodes() {
    if (!this.workflow || !this.workflow.nodes) {
      console.log('❌ Geen nodes gevonden');
      return;
    }

    console.log(`\n🔍 ${this.workflow.nodes.length} nodes geanalyseerd:`);

    const nodeTypes = {};
    const codeNodes = [];
    const postgresNodes = [];
    const gmailNodes = [];
    const openaiNodes = [];

    this.workflow.nodes.forEach(node => {
      // Tel node types
      nodeTypes[node.type] = (nodeTypes[node.type] || 0) + 1;

      // Categoriseer nodes
      if (node.type === 'n8n-nodes-base.code') {
        codeNodes.push(node);
      } else if (node.type === 'n8n-nodes-base.postgres') {
        postgresNodes.push(node);
      } else if (node.type.includes('gmail')) {
        gmailNodes.push(node);
      } else if (node.type.includes('openai')) {
        openaiNodes.push(node);
      }
    });

    console.log('\n📊 Node types:');
    Object.entries(nodeTypes).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    return {
      nodeTypes,
      codeNodes,
      postgresNodes,
      gmailNodes,
      openaiNodes
    };
  }

  analyzeCodeNodes(codeNodes) {
    if (!codeNodes || codeNodes.length === 0) {
      console.log('\n❌ Geen code nodes gevonden');
      return;
    }

    console.log(`\n💻 ${codeNodes.length} Code nodes geanalyseerd:`);

    codeNodes.forEach((node, index) => {
      console.log(`\n📝 Code Node ${index + 1}: ${node.name}`);
      console.log(`   Type: ${node.type}`);
      console.log(`   ID: ${node.id}`);
      
      if (node.parameters && node.parameters.jsCode) {
        const code = node.parameters.jsCode;
        console.log(`   Code lengte: ${code.length} karakters`);
        console.log(`   Code preview: ${code.substring(0, 200)}...`);
        
        // Analyseer code inhoud
        this.analyzeCodeContent(node.name, code);
      } else {
        console.log(`   ⚠️ Geen code gevonden in parameters`);
      }
    });
  }

  analyzeCodeContent(nodeName, code) {
    console.log(`\n🔍 Code analyse voor ${nodeName}:`);
    
    // Zoek naar belangrijke functies/patronen
    const patterns = {
      'Database queries': /(SELECT|INSERT|UPDATE|DELETE|CREATE)/gi,
      'API calls': /(axios|fetch|request)/gi,
      'Business logic': /(compensatie|ladder|dreiging|mood|emotie)/gi,
      'Context building': /(context|history|thread)/gi,
      'Response generation': /(response|prompt|openai)/gi,
      'Error handling': /(try|catch|error)/gi,
      'JSON manipulation': /(JSON\.|parse|stringify)/gi,
      'Array operations': /(map|filter|reduce|forEach)/gi
    };

    Object.entries(patterns).forEach(([category, pattern]) => {
      const matches = code.match(pattern);
      if (matches) {
        console.log(`   ${category}: ${matches.length} matches`);
      }
    });

    // Zoek naar variabelen
    const variables = code.match(/\b(const|let|var)\s+(\w+)/g);
    if (variables) {
      console.log(`   Variabelen: ${variables.length} gedefinieerd`);
    }

    // Zoek naar functies
    const functions = code.match(/\b(function|=>)\s*(\w+)?/g);
    if (functions) {
      console.log(`   Functies: ${functions.length} gevonden`);
    }
  }

  analyzePostgresNodes(postgresNodes) {
    if (!postgresNodes || postgresNodes.length === 0) {
      console.log('\n❌ Geen Postgres nodes gevonden');
      return;
    }

    console.log(`\n🗄️ ${postgresNodes.length} Postgres nodes geanalyseerd:`);

    postgresNodes.forEach((node, index) => {
      console.log(`\n📊 Postgres Node ${index + 1}: ${node.name}`);
      console.log(`   Type: ${node.type}`);
      console.log(`   ID: ${node.id}`);
      
      if (node.parameters) {
        if (node.parameters.query) {
          console.log(`   Query: ${node.parameters.query.substring(0, 100)}...`);
        }
        if (node.parameters.operation) {
          console.log(`   Operation: ${node.parameters.operation}`);
        }
        if (node.parameters.table) {
          console.log(`   Table: ${node.parameters.table}`);
        }
      }
    });
  }

  analyzeConnections() {
    if (!this.workflow.connections) {
      console.log('\n❌ Geen connections gevonden');
      return;
    }

    console.log('\n🔗 Workflow connections:');
    
    Object.entries(this.workflow.connections).forEach(([sourceNode, connections]) => {
      console.log(`\n📤 Van: ${sourceNode}`);
      Object.entries(connections).forEach(([output, targets]) => {
        console.log(`   Output ${output}:`);
        targets.forEach(target => {
          console.log(`     → ${target.node} (input: ${target.index})`);
        });
      });
    });
  }

  generateSummary() {
    console.log('\n📋 WORKFLOW SAMENVATTING:');
    console.log(`   Naam: ${this.workflow.name}`);
    console.log(`   ID: ${this.workflow.id}`);
    console.log(`   Actief: ${this.workflow.active}`);
    console.log(`   Nodes: ${this.workflow.nodes ? this.workflow.nodes.length : 0}`);
    console.log(`   Connections: ${this.workflow.connections ? Object.keys(this.workflow.connections).length : 0}`);
    
    if (this.workflow.settings) {
      console.log(`   Settings: ${Object.keys(this.workflow.settings).join(', ')}`);
    }
  }

  saveAnalysis(outputPath) {
    const analysis = {
      workflow: {
        name: this.workflow.name,
        id: this.workflow.id,
        active: this.workflow.active,
        nodeCount: this.workflow.nodes ? this.workflow.nodes.length : 0
      },
      nodes: this.analyzeNodes(),
      connections: this.workflow.connections,
      settings: this.workflow.settings,
      analysisDate: new Date().toISOString()
    };

    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    console.log(`\n💾 Analyse opgeslagen: ${outputPath}`);
  }
}

async function main() {
  const workflowPath = process.argv[2];
  
  if (!workflowPath) {
    console.log('❌ Geef een workflow bestand op als argument');
    console.log('📝 Gebruik: node analyze-complete-workflow.js <workflow-file.json>');
    return;
  }

  if (!fs.existsSync(workflowPath)) {
    console.log(`❌ Bestand niet gevonden: ${workflowPath}`);
    return;
  }

  const analyzer = new CompleteWorkflowAnalyzer(workflowPath);
  
  if (!analyzer.loadWorkflow()) {
    return;
  }

  analyzer.generateSummary();
  const nodeAnalysis = analyzer.analyzeNodes();
  
  if (nodeAnalysis) {
    analyzer.analyzeCodeNodes(nodeAnalysis.codeNodes);
    analyzer.analyzePostgresNodes(nodeAnalysis.postgresNodes);
  }
  
  analyzer.analyzeConnections();
  
  // Sla analyse op
  const outputPath = workflowPath.replace('.json', '_analysis.json');
  analyzer.saveAnalysis(outputPath);
}

main().catch(console.error);
