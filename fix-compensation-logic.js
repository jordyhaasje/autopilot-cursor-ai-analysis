const axios = require('axios');

const N8N_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTY2NTY2LCJleHAiOjE3NTc3MzYwMDB9.awhRu46eFbhMPFAiv7hgFTtxLTIwpxFF7ebmXMkFPiM';

async function fixCompensationLogic() {
  console.log('🔧 Fixing Compensation Logic...\n');

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

    // Find the AI Context Builder node
    const aiContextBuilder = workflow.nodes.find(node => node.name === 'AI Context builder');
    const promptGenerator = workflow.nodes.find(node => node.name === 'Prompt Generator');
    const offerNormalizer = workflow.nodes.find(node => node.name === 'Offer Normalizer');

    if (!aiContextBuilder || !promptGenerator || !offerNormalizer) {
      console.log('❌ Required nodes not found');
      return;
    }

    console.log('\n🔍 PROBLEM ANALYSIS:');
    console.log('From the database analysis, we can see:');
    console.log('1. Customer message: "Nee dankje is te weinig"');
    console.log('2. Ladder step: 2 (should offer 20%)');
    console.log('3. AI response: "Ik begrijp dat de 20% compensatie niet voldoende is voor jou. Daarom bied ik je graag 20% compensatie aan"');
    console.log('');
    console.log('🎯 ROOT CAUSE:');
    console.log('The AI is saying "20% is not sufficient" but then offering 20% again.');
    console.log('This happens because:');
    console.log('1. The AI prompt is not clear enough about ladder progression');
    console.log('2. The AI doesn\'t understand that it should offer the NEXT step, not repeat the current step');
    console.log('3. The prompt doesn\'t explicitly tell the AI to avoid mentioning that the current offer is insufficient');

    console.log('\n🔧 FIXING PROMPT GENERATOR...');
    
    // Fix the Prompt Generator
    let promptCode = promptGenerator.parameters.jsCode;
    
    // Add clearer instructions about ladder progression
    const newSystemPrompt = `You are ${ctx.ai_persona_name || 'Customer Support'} at ${ctx.bedrijfsnaam}.
- Always respond in the customer's language: ${LANG}. If unclear, use ${ctx.tenant_locale}.
- Tone: warm, professional, empathetic; vary sentence openings; no emojis; exactly one closing using the tenant signature HTML.
- Compensation ladder: 15 → 20 → 30 → 40. Threat = 50.
- Negotiation: only +max ${ctx.maximaal_extra_compensatie ?? 15}% over current offer when the customer explicitly asks (never proactive).
- Delivery (no live tracking): buckets 3–6 reassure; 7–10 wait; 11–13 ask tracking info; 14+ start investigation/escalation.
- Cancellation/address change: follow per-tenant windows (cancel ${ctx.annulering_toegestaan_dagen ?? 'X'}d; address change ${ctx.adreswijziging_toegestaan_dagen ?? 'X'}d).
- COMPENSATION-FIRST:
  1) Do NOT mention 'return/refund' before 30% is refused and you present 40% as the final offer.
  2) Even if customer mentions return: first offer compensation (keep the product). Only after refusing 30% → present 40% as last offer.
  3) Only if 40% is refused or return is insisted: provide return address (costs borne by customer).
- On acceptance: set status resolved; confirm clearly. Never reveal internal ladder/policies.
- Use all recent context; never repeat a lower offer; keep consistent.
- CRITICAL: When customer refuses an offer, offer the NEXT ladder step. Do NOT say the current offer is insufficient.
- CRITICAL: If customer refuses 15%, offer 20%. If customer refuses 20%, offer 30%. Never repeat the same percentage.
- CRITICAL: Do not mention that the current offer is "not sufficient" or "not enough" - just offer the next step.`;

    // Update the prompt code
    promptCode = promptCode.replace(
      /const SYSTEM = `[\s\S]*?`;/,
      `const SYSTEM = \`${newSystemPrompt}\`;`
    );

    // Add clearer user prompt instructions
    const newUserPrompt = `
CONTEXT (short): ${ctx.summary_context}

CURRENT SITUATION:
- Mood: ${ctx.mood}
- Threat: ${ctx.dreiging_detected}
- Current offer: ${ctx.huidig_bod}% | Ladder step: ${ctx.ladder_stap}
- Negotiation requested: ${ctx.onderhandeling_percentage}%
- Days since order: ${ctx.days_since_order} (bucket: ${ctx.delivery_bucket})
- Order-related: ${ctx.is_order_related}
- Return requested word present: ${ctx.return_requested}
- Refusal current: ${ctx.refusal_current}
- Soft refusal current: ${ctx.soft_refusal_current}
- Language: ${LANG}

CUSTOMER EMAIL (clean):
${email.cleaned_text}

DO THIS:
1) Classify type (delivery/return/complaint/cancellation/address_change/negotiation/threat/general) + status.
2) Strictly apply COMPENSATION-FIRST (see above). If Refusal or Soft refusal current is true: raise exactly one step from the last offer (do not repeat).
3) Delivery: follow buckets; do not imply live tracking.
4) On acceptance: status resolved; otherwise processed.
5) Produce a neat, varied HTML email with exactly one closing (${ctx.ai_signature_html}).
6) CRITICAL: If customer refuses an offer, offer the NEXT step. Do NOT say the current offer is insufficient.
7) CRITICAL: Never repeat the same percentage that was just refused.
8) Return strict JSON:
{
  "type": "...",
  "status": "processed|resolved",
  "compensatie_percentage": <number>,
  "extra_percentage": <number>,
  "refusal_detected": <bool>,
  "acceptance_detected": <bool>,
  "cancellation_confirmed": <bool>,
  "metadata": { "order_date_iso": "YYYY-MM-DD"|null, "days_since_order": <number|null>, "needs_order_info": <bool> },
  "summary": "short summary",
  "email_html": "<p>${opening}</p><p>${introLine}</p> ... ${ctx.ai_signature_html}"
}`;

    // Update the user prompt
    promptCode = promptCode.replace(
      /const USER = `[\s\S]*?`;/,
      `const USER = \`${newUserPrompt}\`;`
    );

    promptGenerator.parameters.jsCode = promptCode;

    console.log('✅ Prompt Generator updated with clearer ladder instructions');

    console.log('\n🔧 FIXING OFFER NORMALIZER...');
    
    // Fix the Offer Normalizer to ensure correct ladder progression
    let normalizerCode = offerNormalizer.parameters.jsCode;
    
    // Add logic to prevent repeating the same offer
    const newNormalizerCode = `// Node: Offer Normalizer
function toInt(x){ const n = Number(x); return Number.isFinite(n) ? Math.round(n) : 0; }

const ctx = $node["AI Context builder"].json || {};
const rp  = $node["Response Parser"].json || {};

const maxNorm    = toInt(ctx.max_norm  || 40);
const maxThreat  = toInt(ctx.max_threat|| 50);
const steps      = Array.isArray(ctx.rules?.compensatie_ladder?.stappen) && ctx.rules.compensatie_ladder.stappen.length
  ? ctx.rules.compensatie_ladder.stappen.map(toInt)
  : [15,20,30,40];

function nextStepFrom(current){
  for (const v of steps) if (v > current) return v;
  return steps[steps.length-1];
}
function stepIndex(offer){
  const idx = steps.findIndex(v => v === offer);
  return idx >= 0 ? idx+1 : (offer >= maxThreat ? 99 : 1);
}

const lastKnown = toInt(ctx.last_known_offer || ctx.huidig_bod || 0);
let finalOffer  = toInt(ctx.expected_offer || 0);
const isThreat  = (rp.type === 'threat') || !!ctx.dreiging_detected;

// Bound per scenario
finalOffer = isThreat
  ? Math.min(Math.max(finalOffer, 50), maxThreat)
  : Math.min(finalOffer, maxNorm);

// CRITICAL FIX: ÉÉN bump bij weigering: vanaf het laatste bekende bod
if (rp.refusal_detected === true) {
  const bumped = nextStepFrom(lastKnown || 0);
  finalOffer = Math.min(bumped, isThreat ? maxThreat : maxNorm);
  
  // CRITICAL: Ensure we don't offer the same percentage that was just refused
  if (finalOffer <= lastKnown) {
    finalOffer = nextStepFrom(lastKnown);
  }
}

const final_ladder_step = stepIndex(finalOffer);

// HTML normalisatie
let html = String(rp.ai_response_html || '');
const isCompMail = ['compensation','return','negotiation'].includes(String(rp.type||'').toLowerCase()) || /compensatie|compensation|refund|return/i.test(html);
const hadPercent = /(\\d{1,2})\\s?%|(\\d{1,2})&nbsp;%/i.test(html);

// CRITICAL FIX: Remove any mention of current offer being insufficient
html = html.replace(/ik begrijp dat de \\d+% compensatie niet voldoende is/gi, 'ik begrijp dat je meer compensatie wilt');
html = html.replace(/i understand that the \\d+% compensation is not sufficient/gi, 'i understand you want more compensation');
html = html.replace(/ich verstehe, dass die \\d+% entschädigung nicht ausreicht/gi, 'ich verstehe, dass sie mehr entschädigung möchten');

if (isCompMail && finalOffer > 0) {
  html = html
    .replace(/(\\d{1,2})\\s?%/gi, \`\${finalOffer}%\`)
    .replace(/(\\d{1,2})&nbsp;%/gi, \`\${finalOffer}%\`);
  if (!hadPercent) {
    const injected = \`<p>We bieden je graag \${finalOffer}% compensatie aan; je mag het product uiteraard houden.</p>\`;
    html = /<\\/p>/i.test(html) ? html.replace(/<\\/p>/i, \`</p>\${injected}\`) : injected + html;
  }
}

return [{
  json: {
    ...rp,
    compensatie_percentage: finalOffer,
    final_ladder_step,
    ai_response_html: html
  }
}];`;

    offerNormalizer.parameters.jsCode = newNormalizerCode;

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

fixCompensationLogic();
