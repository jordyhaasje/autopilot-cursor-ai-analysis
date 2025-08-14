const axios = require('axios');

const N8N_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTY2NTY2LCJleHAiOjE3NTc3MzYwMDB9.awhRu46eFbhMPFAiv7hgFTtxLTIwpxFF7ebmXMkFPiM';

async function fixCompensationLogicSimple() {
  console.log('🔧 Fixing Compensation Logic (Simple)...\n');

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

    // Find the Prompt Generator node
    const promptGenerator = workflow.nodes.find(node => node.name === 'Prompt Generator');
    const offerNormalizer = workflow.nodes.find(node => node.name === 'Offer Normalizer');

    if (!promptGenerator || !offerNormalizer) {
      console.log('❌ Required nodes not found');
      return;
    }

    console.log('\n🔍 PROBLEM ANALYSIS:');
    console.log('The AI is saying "20% is not sufficient" but then offering 20% again.');
    console.log('This happens because the AI prompt is not clear enough about ladder progression.');

    console.log('\n🔧 FIXING PROMPT GENERATOR...');
    
    // Fix the Prompt Generator by adding clearer instructions
    let promptCode = promptGenerator.parameters.jsCode;
    
    // Add critical instructions to the system prompt
    const criticalInstructions = `
- CRITICAL: When customer refuses an offer, offer the NEXT ladder step. Do NOT say the current offer is insufficient.
- CRITICAL: If customer refuses 15%, offer 20%. If customer refuses 20%, offer 30%. Never repeat the same percentage.
- CRITICAL: Do not mention that the current offer is "not sufficient" or "not enough" - just offer the next step.`;

    // Insert the critical instructions before the last line of the system prompt
    promptCode = promptCode.replace(
      /- Use all recent context; never repeat a lower offer; keep consistent\./,
      `- Use all recent context; never repeat a lower offer; keep consistent.${criticalInstructions}`
    );

    // Add critical instructions to the user prompt
    const userInstructions = `
6) CRITICAL: If customer refuses an offer, offer the NEXT step. Do NOT say the current offer is insufficient.
7) CRITICAL: Never repeat the same percentage that was just refused.`;

    promptCode = promptCode.replace(
      /5\) Produce a neat, varied HTML email with exactly one closing/,
      `5) Produce a neat, varied HTML email with exactly one closing${userInstructions}
6) CRITICAL: If customer refuses an offer, offer the NEXT step. Do NOT say the current offer is insufficient.
7) CRITICAL: Never repeat the same percentage that was just refused.
8) Produce a neat, varied HTML email with exactly one closing`
    );

    promptGenerator.parameters.jsCode = promptCode;

    console.log('✅ Prompt Generator updated with clearer ladder instructions');

    console.log('\n🔧 FIXING OFFER NORMALIZER...');
    
    // Fix the Offer Normalizer to ensure correct ladder progression
    let normalizerCode = offerNormalizer.parameters.jsCode;
    
    // Add logic to prevent repeating the same offer and clean up HTML
    const htmlCleanupCode = `
// CRITICAL FIX: Remove any mention of current offer being insufficient
html = html.replace(/ik begrijp dat de \\d+% compensatie niet voldoende is/gi, 'ik begrijp dat je meer compensatie wilt');
html = html.replace(/i understand that the \\d+% compensation is not sufficient/gi, 'i understand you want more compensation');
html = html.replace(/ich verstehe, dass die \\d+% entschädigung nicht ausreicht/gi, 'ich verstehe, dass sie mehr entschädigung möchten');`;

    // Insert the HTML cleanup code before the final return
    normalizerCode = normalizerCode.replace(
      /if \(isCompMail && finalOffer > 0\) \{/,
      `if (isCompMail && finalOffer > 0) {${htmlCleanupCode}`
    );

    // Add logic to ensure we don't offer the same percentage that was just refused
    const refusalLogic = `
  // CRITICAL: Ensure we don't offer the same percentage that was just refused
  if (finalOffer <= lastKnown) {
    finalOffer = nextStepFrom(lastKnown);
  }`;

    normalizerCode = normalizerCode.replace(
      /finalOffer = Math\.min\(bumped, isThreat \? maxThreat : maxNorm\);/,
      `finalOffer = Math.min(bumped, isThreat ? maxThreat : maxNorm);${refusalLogic}`
    );

    offerNormalizer.parameters.jsCode = normalizerCode;

    console.log('✅ Offer Normalizer updated with refusal handling fixes');

    // Update the workflow
    console.log('\n📤 Updating workflow...');
    await axios.put(
      `${N8N_URL}/api/v1/workflows/WP5aiR5vN2A9w91i`,
      {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        active: workflow.active
      },
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Workflow updated successfully!');
    console.log('\n🎯 FIXES APPLIED:');
    console.log('1. ✅ Updated Prompt Generator with clearer ladder progression instructions');
    console.log('2. ✅ Added critical instructions to never repeat the same percentage');
    console.log('3. ✅ Updated Offer Normalizer to ensure correct ladder step progression');
    console.log('4. ✅ Added HTML cleanup to remove "not sufficient" mentions');
    console.log('5. ✅ Added logic to prevent offering the same percentage that was just refused');

    console.log('\n🧪 TESTING RECOMMENDATION:');
    console.log('Send a test email with "Nee dankje is te weinig" to verify the fix works correctly.');

  } catch (error) {
    console.error('❌ Fix failed:', error.response?.data || error.message);
  }
}

fixCompensationLogicSimple();
