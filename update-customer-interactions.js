const axios = require('axios');

const RAILWAY_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTA4MzgyLCJleHAiOjE3NTc2NDk2MDB9.rtJzEp4Fm81LEB7UwVmngqieUNfr8lZZ8A-pWIbdAnE';

async function updateCustomerInteractions() {
  console.log('🔄 Updating Customer Interactions Query...');
  
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

    // Find Postgres Store Interaction node
    const storeInteractionNode = workflow.nodes.find(n => n.name === 'Postgres Store Interaction');
    if (storeInteractionNode && storeInteractionNode.parameters && storeInteractionNode.parameters.query) {
      console.log('✅ Found Postgres Store Interaction node');
      
      // Update the ON CONFLICT logic
      const oldQuery = storeInteractionNode.parameters.query;
      const newQuery = oldQuery.replace(
        /ON CONFLICT \(tenant_id, email_external_id\)\s*DO UPDATE SET[\s\S]*?;/,
        `ON CONFLICT (tenant_id, email_external_id)
DO UPDATE SET
  -- Alleen updaten als nieuwe data beter is
  ai_response = CASE 
    WHEN EXCLUDED.ai_response IS NOT NULL AND EXCLUDED.ai_response != '' 
    THEN EXCLUDED.ai_response 
    ELSE customer_interactions.ai_response 
  END,
  status = EXCLUDED.status,
  type = EXCLUDED.type,
  -- Compensatie: altijd hoogste waarde behouden
  compensatie_percentage = GREATEST(EXCLUDED.compensatie_percentage, customer_interactions.compensatie_percentage),
  onderhandeling_percentage = GREATEST(EXCLUDED.onderhandeling_percentage, customer_interactions.onderhandeling_percentage),
  -- Dreiging: accumuleren (OR logic)
  dreiging_detected = customer_interactions.dreiging_detected OR EXCLUDED.dreiging_detected,
  -- Annulering: accumuleren
  annulering_aangevraagd = customer_interactions.annulering_aangevraagd OR EXCLUDED.annulering_aangevraagd,
  -- Refusal/Acceptance: accumuleren
  refusal_detected = customer_interactions.refusal_detected OR EXCLUDED.refusal_detected,
  acceptance_detected = customer_interactions.acceptance_detected OR EXCLUDED.acceptance_detected,
  cancellation_confirmed = customer_interactions.cancellation_confirmed OR EXCLUDED.cancellation_confirmed,
  -- Ladder stap: altijd hoogste waarde
  ladder_stap = GREATEST(EXCLUDED.ladder_stap, customer_interactions.ladder_stap),
  -- Mood: update alleen als nieuwe mood beschikbaar
  mood_detected = CASE 
    WHEN EXCLUDED.mood_detected IS NOT NULL AND EXCLUDED.mood_detected != 'neutral'
    THEN EXCLUDED.mood_detected 
    ELSE customer_interactions.mood_detected 
  END,
  -- Confidence: update alleen als hoger
  confidence_score = GREATEST(EXCLUDED.confidence_score, customer_interactions.confidence_score),
  ai_confidence_score = GREATEST(EXCLUDED.ai_confidence_score, customer_interactions.ai_confidence_score),
  -- Metadata: merge JSON
  metadata = COALESCE(customer_interactions.metadata, '{}'::jsonb) || COALESCE(EXCLUDED.metadata, '{}'::jsonb),
  -- Klantnaam: update alleen als nieuwe naam beschikbaar
  klantnaam = CASE 
    WHEN EXCLUDED.klantnaam IS NOT NULL AND EXCLUDED.klantnaam != '' AND EXCLUDED.klantnaam != 'undefined'
    THEN EXCLUDED.klantnaam 
    ELSE customer_interactions.klantnaam 
  END,
  -- Interpretation: update alleen als nieuwe beschikbaar
  interpretation = CASE 
    WHEN EXCLUDED.interpretation IS NOT NULL AND EXCLUDED.interpretation != ''
    THEN EXCLUDED.interpretation 
    ELSE customer_interactions.interpretation 
  END,
  -- Days: update alleen als nieuwe waarde beschikbaar
  days = CASE 
    WHEN EXCLUDED.days IS NOT NULL 
    THEN EXCLUDED.days 
    ELSE customer_interactions.days 
  END,
  -- Gmail thread ID: update alleen als nieuwe beschikbaar
  gmail_thread_id = COALESCE(customer_interactions.gmail_thread_id, EXCLUDED.gmail_thread_id),
  -- Updated timestamp
  updated_at = NOW();`
      );
      
      storeInteractionNode.parameters.query = newQuery;
      console.log('✅ Customer Interactions query updated with improved ON CONFLICT logic');
    } else {
      console.log('⚠️ Postgres Store Interaction node not found');
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

    console.log('🎉 Customer Interactions updated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to update Customer Interactions:', error.response?.data || error.message);
    return false;
  }
}

updateCustomerInteractions();
