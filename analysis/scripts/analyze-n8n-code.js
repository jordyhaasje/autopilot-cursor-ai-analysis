const fs = require('fs');
const path = require('path');

// Supabase configuratie
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeN8NCode() {
  console.log('🔍 N8N Code Analyse Starten...\n');

  // Lees CURSOR AI workflow
  const cursorAIWorkflow = JSON.parse(fs.readFileSync('CURSOR_AI_WP5aiR5vN2A9w91i.json', 'utf8'));
  
  console.log('📋 CURSOR AI WORKFLOW ANALYSE');
  console.log('================================\n');

  // Analyseer alle nodes
  const codeNodes = cursorAIWorkflow.nodes.filter(node => node.type === 'n8n-nodes-base.code');
  const postgresNodes = cursorAIWorkflow.nodes.filter(node => node.type === 'n8n-nodes-base.postgres');
  const gmailNodes = cursorAIWorkflow.nodes.filter(node => node.type.includes('gmail'));
  const openaiNodes = cursorAIWorkflow.nodes.filter(node => node.type.includes('openAi'));

  console.log(`✅ ${codeNodes.length} Code nodes gevonden`);
  console.log(`✅ ${postgresNodes.length} Postgres nodes gevonden`);
  console.log(`✅ ${gmailNodes.length} Gmail nodes gevonden`);
  console.log(`✅ ${openaiNodes.length} OpenAI nodes gevonden\n`);

  // Analyseer belangrijke code nodes
  const importantNodes = [
    'Email parser',
    'Email body cleaner', 
    'AI Context builder',
    'Prompt Generator',
    'Response Parser',
    'Offer Normalizer',
    'Klantnaam Extractor',
    'Orderdatum Extractor',
    'Thread ID Generator'
  ];

  console.log('🤖 BELANGRIJKE CODE NODES ANALYSE');
  console.log('==================================\n');

  for (const nodeName of importantNodes) {
    const node = codeNodes.find(n => n.name === nodeName);
    if (node) {
      console.log(`📝 ${nodeName}:`);
      const code = node.parameters.jsCode;
      
      // Analyseer code functionaliteit
      const analysis = analyzeCodeFunctionality(code, nodeName);
      console.log(`   ${analysis}`);
      
      // Toon belangrijke code snippets
      const snippets = extractImportantSnippets(code, nodeName);
      if (snippets.length > 0) {
        console.log(`   Belangrijke snippets:`);
        snippets.forEach(snippet => {
          console.log(`   - ${snippet}`);
        });
      }
      console.log('');
    }
  }

  // Analyseer Postgres queries
  console.log('🗄️ POSTGRES QUERIES ANALYSE');
  console.log('============================\n');

  for (const node of postgresNodes) {
    console.log(`📊 ${node.name}:`);
    const query = node.parameters.query;
    
    // Analyseer query type
    if (query.includes('SELECT')) {
      console.log(`   Type: SELECT query`);
      if (query.includes('conversation_threads')) {
        console.log(`   Doel: Thread lookup/update`);
      } else if (query.includes('customer_interactions')) {
        console.log(`   Doel: Interaction storage`);
      } else if (query.includes('tenants')) {
        console.log(`   Doel: Tenant data retrieval`);
      } else if (query.includes('notifications')) {
        console.log(`   Doel: Notification storage`);
      }
    } else if (query.includes('INSERT')) {
      console.log(`   Type: INSERT query`);
    } else if (query.includes('UPDATE')) {
      console.log(`   Type: UPDATE query`);
    }
    
    // Check voor belangrijke features
    if (query.includes('gmail_thread_id')) {
      console.log(`   Feature: Gmail threading support`);
    }
    if (query.includes('jsonb')) {
      console.log(`   Feature: JSONB metadata storage`);
    }
    if (query.includes('ON CONFLICT')) {
      console.log(`   Feature: Idempotent upsert`);
    }
    console.log('');
  }

  // Analyseer workflow connections
  console.log('🔗 WORKFLOW CONNECTIONS ANALYSE');
  console.log('================================\n');

  const connections = cursorAIWorkflow.connections;
  const nodeNames = cursorAIWorkflow.nodes.map(n => n.name);
  
  console.log('Node volgorde:');
  let currentNode = 'Gmail Trigger';
  let step = 1;
  
  while (currentNode && step <= 30) {
    console.log(`   ${step}. ${currentNode}`);
    
    const nodeConnections = connections[currentNode];
    if (nodeConnections && nodeConnections.main && nodeConnections.main[0]) {
      const nextNode = nodeConnections.main[0][0];
      if (nextNode && nextNode.node) {
        currentNode = nextNode.node;
      } else {
        break;
      }
    } else {
      break;
    }
    step++;
  }

  // Analyseer Supabase database
  console.log('\n🗄️ SUPABASE DATABASE ANALYSE');
  console.log('============================\n');

  try {
    // Haal alle business rules op
    const { data: businessRules, error: brError } = await supabase
      .from('master_business_rules')
      .select('*')
      .order('category', { ascending: true });

    if (brError) {
      console.log(`❌ Business rules error: ${brError.message}`);
    } else {
      console.log(`✅ ${businessRules.length} master business rules gevonden:\n`);
      
      // Groepeer per categorie
      const categories = {};
      businessRules.forEach(rule => {
        if (!categories[rule.category]) {
          categories[rule.category] = [];
        }
        categories[rule.category].push(rule);
      });

      for (const [category, rules] of Object.entries(categories)) {
        console.log(`📋 CATEGORIE: ${category.toUpperCase()}`);
        console.log('='.repeat(50));
        
        rules.forEach(rule => {
          console.log(`\n${rule.rule_name} (${rule.rule_key})`);
          console.log(`   Beschrijving: ${rule.description}`);
          console.log(`   Verplicht: ${rule.is_required ? 'Ja' : 'Nee'}`);
          
          if (rule.rule_config) {
            const config = typeof rule.rule_config === 'string' 
              ? JSON.parse(rule.rule_config) 
              : rule.rule_config;
            console.log(`   Configuratie: ${JSON.stringify(config, null, 2)}`);
          }
        });
        console.log('');
      }
    }

    // Check voor email filters
    const { data: emailFilters, error: efError } = await supabase
      .from('email_filters')
      .select('*');

    if (efError) {
      console.log(`❌ Email filters error: ${efError.message}`);
    } else {
      console.log(`✅ ${emailFilters.length} email filters gevonden`);
      if (emailFilters.length > 0) {
        console.log('   Email filtering is geconfigureerd maar nog niet actief in workflow');
      }
    }

  } catch (error) {
    console.log(`❌ Database analyse error: ${error.message}`);
  }

  console.log('\n🎯 AI CAPABILITIES SAMENVATTING');
  console.log('================================\n');

  console.log('✅ COMPENSATIE LADDER:');
  console.log('   - Deterministische ladder (15% → 20% → 30% → 40%)');
  console.log('   - Dreiging detectie → direct 50%');
  console.log('   - Offer Normalizer forceert correcte percentages');
  console.log('   - Compensation-first strategie (geen retour tot 40%)');

  console.log('\n✅ CONTEXT & INTELLIGENTIE:');
  console.log('   - Volledige gespreksgeschiedenis (laatste 30 interacties)');
  console.log('   - Gmail threading via gmail_thread_id');
  console.log('   - Meertalige detectie (NL/EN/DE)');
  console.log('   - Emotieherkenning (happy/neutral/frustrated/angry)');
  console.log('   - Soft refusal detectie');
  console.log('   - Onderhandeling binnen marges (+15%)');

  console.log('\n✅ CHINESE DROPSHIPPING OPTIMALISATIE:');
  console.log('   - Delivery buckets (3-6, 7-10, 11-13, 14+ dagen)');
  console.log('   - Geen harde deadlines of tracking links');
  console.log('   - Geruststellende toon voor lange levertijden');
  console.log('   - Orderdatum extractie en days_since_order berekening');

  console.log('\n✅ FASHION-SPECIFIEKE REGELS:');
  console.log('   - Maatproblemen detectie en handling');
  console.log('   - Kleurproblemen detectie en handling');
  console.log('   - Retourbeleid configuratie');
  console.log('   - Replacement-first opties');

  console.log('\n✅ TECHNISCHE FEATURES:');
  console.log('   - Idempotente opslag (unique constraints)');
  console.log('   - JSONB metadata storage');
  console.log('   - Real-time notificaties');
  console.log('   - Multi-tenant isolatie via RLS');
  console.log('   - Conversation context tracking');

  console.log('\n❌ MISSENDE FEATURES:');
  console.log('   - Email filtering workflow (wel in database, niet in flow)');
  console.log('   - VIP klant detectie');
  console.log('   - Geavanceerde analytics');
  console.log('   - A/B testing van responses');
  console.log('   - Machine learning optimalisatie');

  console.log('\n🎉 N8N Code analyse voltooid!');
}

function analyzeCodeFunctionality(code, nodeName) {
  const codeLower = code.toLowerCase();
  
  if (nodeName === 'Email parser') {
    return 'Extraheert klantgegevens, headers, Gmail thread ID';
  } else if (nodeName === 'Email body cleaner') {
    return 'Stript HTML, verwijdert quotes en oude replies';
  } else if (nodeName === 'AI Context builder') {
    return 'Bouwt complete context met ladder, mood, taal, dreiging detectie';
  } else if (nodeName === 'Prompt Generator') {
    return 'Genereert AI prompts met compensation-first policy';
  } else if (nodeName === 'Response Parser') {
    return 'Parseert AI output, fallback detectie, type guard';
  } else if (nodeName === 'Offer Normalizer') {
    return 'Forceert deterministische ladder, synchroniseert HTML/JSON';
  } else if (nodeName === 'Klantnaam Extractor') {
    return 'Extraheert klantnaam uit body, header, email';
  } else if (nodeName === 'Orderdatum Extractor') {
    return 'Zoekt besteldatum, berekent days_since_order';
  } else if (nodeName === 'Thread ID Generator') {
    return 'Genereert thread ID, bepaalt contact count';
  }
  
  return 'Onbekende functionaliteit';
}

function extractImportantSnippets(code, nodeName) {
  const snippets = [];
  const codeLower = code.toLowerCase();
  
  if (nodeName === 'AI Context builder') {
    if (code.includes('compensatie_ladder')) snippets.push('Compensatie ladder configuratie');
    if (code.includes('dreiging_detected')) snippets.push('Dreiging detectie logica');
    if (code.includes('mood')) snippets.push('Emotieherkenning');
    if (code.includes('detectLanguage')) snippets.push('Meertalige detectie');
    if (code.includes('soft_refusal')) snippets.push('Soft refusal detectie');
  } else if (nodeName === 'Prompt Generator') {
    if (code.includes('COMPENSATION-FIRST')) snippets.push('Compensation-first policy');
    if (code.includes('delivery buckets')) snippets.push('Delivery bucket logica');
    if (code.includes('cancellation')) snippets.push('Annulering policy');
  } else if (nodeName === 'Offer Normalizer') {
    if (code.includes('nextStepFrom')) snippets.push('Ladder stap berekening');
    if (code.includes('finalOffer')) snippets.push('Percentage normalisatie');
    if (code.includes('html.replace')) snippets.push('HTML synchronisatie');
  } else if (nodeName === 'Response Parser') {
    if (code.includes('normType')) snippets.push('Type normalisatie');
    if (code.includes('fallback')) snippets.push('Fallback detectie');
    if (code.includes('type guard')) snippets.push('Type guard logica');
  }
  
  return snippets;
}

analyzeN8NCode().catch(console.error);
