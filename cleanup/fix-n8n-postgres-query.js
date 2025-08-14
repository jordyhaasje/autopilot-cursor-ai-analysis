const axios = require('axios');

const N8N_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTY2NTY2LCJleHAiOjE3NTc3MzYwMDB9.awhRu46eFbhMPFAiv7hgFTtxLTIwpxFF7ebmXMkFPiM';

async function fixN8NPostgresQuery() {
  console.log('🔧 Fixing N8N Postgres Store Interaction Query...\n');

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

    // Fixed query without updated_at column
    const fixedQuery = `INSERT INTO public.customer_interactions (
  tenant_id, thread_id, customer_email, contact_count,
  message_body, ai_response, status, type,
  compensatie_percentage, onderhandeling_percentage,
  dreiging_detected, annulering_aangevraagd,
  refusal_detected, acceptance_detected, cancellation_confirmed,
  retour_pogingen, escalation_reason, spam, "ignore",
  ai_confidence_score, created_at, ladder_stap, mood_detected, confidence_score,
  metadata, klantnaam, interpretation, days, email_external_id, direction, gmail_thread_id
) VALUES (
  '{{ $node["Get tenant data"].json.tenant_id }}'::uuid,
  '{{ $node["Thread ID Generator"].json.thread_id }}'::uuid,
  '{{ $node["Email parser"].json.customer_email }}',
  (
    SELECT COALESCE(MAX(ci.contact_count), 0) + 1
    FROM public.customer_interactions ci
    WHERE ci.tenant_id = '{{ $node["Get tenant data"].json.tenant_id }}'::uuid
      AND ci.thread_id = '{{ $node["Thread ID Generator"].json.thread_id }}'::uuid
      AND ci.direction = 'inbound'
  ),
  '{{ ($node["Email body cleaner"].json.cleaned_body || "").replace(/'/g,"''") }}',
  '{{ ($node["Offer Normalizer"].json.ai_response_html || "").replace(/'/g,"''") }}',
  '{{ $node["Offer Normalizer"].json.status }}',
  '{{ $node["Offer Normalizer"].json.type }}',
  {{ $node["Offer Normalizer"].json.compensatie_percentage || 0 }},
  {{ $node["Offer Normalizer"].json.onderhandeling_percentage || 0 }},
  {{ $node["Offer Normalizer"].json.dreiging_detected ? 'true' : 'false' }},
  {{ $node["Offer Normalizer"].json.cancellation_confirmed ? 'true' : 'false' }},
  {{ $node["Offer Normalizer"].json.refusal_detected ? 'true' : 'false' }},
  {{ $node["Offer Normalizer"].json.acceptance_detected ? 'true' : 'false' }},
  {{ $node["Offer Normalizer"].json.cancellation_confirmed ? 'true' : 'false' }},
  0,
  {{ $node["Offer Normalizer"].json.alert_type ? `'${$node["Offer Normalizer"].json.alert_type.replace(/'/g,"''")}'` : 'NULL' }},
  false,
  false,
  {{ $node["AI Context builder"].json.confidence_score || 0.95 }},
  NOW(),
  {{ $node["Offer Normalizer"].json.final_ladder_step || 1 }},
  '{{ $node["AI Context builder"].json.mood || "neutral" }}',
  {{ $node["AI Context builder"].json.confidence_score || 1 }},
  {{ $node["Offer Normalizer"].json.metadata
      ? ("'" + JSON.stringify($node["Offer Normalizer"].json.metadata).replace(/'/g,"''") + "'::jsonb")
       : "'{}'::jsonb"
  }},
  '{{ ($node["AI Context builder"].json.klantnaam || "").replace(/'/g,"''") }}',
  '{{ $node["Offer Normalizer"].json.summary || "" }}',
  {{ $node["Orderdatum Extractor"].json.days_since_order ?? 'NULL' }},
  '{{ $node["Email parser"].json.message_id || $node["Email parser"].json.email_id }}',
  'inbound',
  NULLIF('{{ $node["Email parser"].json.gmail_thread_id }}','')
)
ON CONFLICT (tenant_id, email_external_id)
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
  gmail_thread_id = COALESCE(customer_interactions.gmail_thread_id, EXCLUDED.gmail_thread_id);`;

    // Update the node
    postgresNode.parameters.query = fixedQuery;

    // Update workflow
    console.log('📤 Updating workflow...');
    const updateResponse = await axios.put(
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

fixN8NPostgresQuery();
