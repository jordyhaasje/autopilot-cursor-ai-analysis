const axios = require('axios');

const N8N_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTY2NTY2LCJleHAiOjE3NTc3MzYwMDB9.awhRu46eFbhMPFAiv7hgFTtxLTIwpxFF7ebmXMkFPiM';

async function analyzeN8NCompensationLogic() {
  console.log('🔍 Analyzing N8N Compensation Logic...\n');

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

    // Find key nodes for compensation logic
    const aiContextBuilder = workflow.nodes.find(node => node.name === 'AI Context builder');
    const promptGenerator = workflow.nodes.find(node => node.name === 'Prompt Generator');
    const offerNormalizer = workflow.nodes.find(node => node.name === 'Offer Normalizer');
    const responseParser = workflow.nodes.find(node => node.name === 'Response Parser');

    console.log('\n🔍 Analyzing AI Context Builder...');
    if (aiContextBuilder && aiContextBuilder.parameters.jsCode) {
      const code = aiContextBuilder.parameters.jsCode;
      
      // Look for compensation ladder logic
      if (code.includes('compensatie_ladder')) {
        console.log('✅ Found compensatie_ladder logic in AI Context Builder');
        
        // Extract ladder step calculation
        const ladderMatch = code.match(/ladder_stap.*?=.*?(\d+)/);
        if (ladderMatch) {
          console.log(`   - Ladder step calculation: ${ladderMatch[0]}`);
        }
        
        // Look for refusal detection
        if (code.includes('refusal_detected')) {
          console.log('✅ Found refusal detection logic');
        }
        
        // Look for compensation percentage calculation
        if (code.includes('compensatie_percentage')) {
          console.log('✅ Found compensation percentage logic');
        }
      } else {
        console.log('❌ No compensatie_ladder logic found in AI Context Builder');
      }
    }

    console.log('\n🔍 Analyzing Prompt Generator...');
    if (promptGenerator && promptGenerator.parameters.jsCode) {
      const code = promptGenerator.parameters.jsCode;
      
      // Look for compensation instructions
      if (code.includes('compensatie')) {
        console.log('✅ Found compensation instructions in prompt');
        
        // Look for ladder step instructions
        if (code.includes('ladder_stap')) {
          console.log('✅ Found ladder step instructions');
        }
        
        // Look for refusal handling
        if (code.includes('weigering') || code.includes('refusal')) {
          console.log('✅ Found refusal handling instructions');
        }
      }
    }

    console.log('\n🔍 Analyzing Offer Normalizer...');
    if (offerNormalizer && offerNormalizer.parameters.jsCode) {
      const code = offerNormalizer.parameters.jsCode;
      
      // Look for compensation normalization
      if (code.includes('compensatie_percentage')) {
        console.log('✅ Found compensation percentage normalization');
        
        // Look for ladder step logic
        if (code.includes('ladder_stap')) {
          console.log('✅ Found ladder step logic in normalizer');
        }
        
        // Look for final ladder step calculation
        if (code.includes('final_ladder_step')) {
          console.log('✅ Found final ladder step calculation');
        }
      }
    }

    console.log('\n🔍 Analyzing Response Parser...');
    if (responseParser && responseParser.parameters.jsCode) {
      const code = responseParser.parameters.jsCode;
      
      // Look for compensation parsing
      if (code.includes('compensatie_percentage')) {
        console.log('✅ Found compensation percentage parsing');
      }
      
      // Look for ladder step parsing
      if (code.includes('ladder_stap')) {
        console.log('✅ Found ladder step parsing');
      }
    }

    // Analyze the specific issue
    console.log('\n🎯 SPECIFIC ISSUE ANALYSIS:');
    console.log('From the database analysis, we can see:');
    console.log('1. Customer message: "Nee dankje is te weinig"');
    console.log('2. Ladder step: 2 (should offer 20%)');
    console.log('3. AI response: "Ik begrijp dat de 20% compensatie niet voldoende is voor jou. Daarom bied ik je graag 20% compensatie aan"');
    console.log('');
    console.log('🔍 PROBLEM IDENTIFIED:');
    console.log('The AI is saying "20% is not sufficient" but then offering 20% again.');
    console.log('This suggests the AI prompt is not correctly instructing the AI to:');
    console.log('- Recognize that the customer refused 15%');
    console.log('- Offer the next ladder step (20%)');
    console.log('- Not mention that 20% is insufficient');
    console.log('');
    console.log('🔧 LIKELY FIXES NEEDED:');
    console.log('1. Update AI Context Builder to correctly calculate ladder step');
    console.log('2. Update Prompt Generator to give clearer instructions about ladder progression');
    console.log('3. Update Offer Normalizer to ensure correct percentage is offered');
    console.log('4. Add logic to prevent AI from offering the same percentage twice');

  } catch (error) {
    console.error('❌ Analysis failed:', error.response?.data || error.message);
  }
}

analyzeN8NCompensationLogic();
