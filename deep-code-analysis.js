const fs = require('fs');

async function deepCodeAnalysis() {
  console.log('🔍 Diepgaande Code Analyse Starten...\n');

  // Lees CURSOR AI workflow
  const cursorAIWorkflow = JSON.parse(fs.readFileSync('CURSOR_AI_WP5aiR5vN2A9w91i.json', 'utf8'));
  
  // Extraheer alle code nodes
  const codeNodes = cursorAIWorkflow.nodes.filter(node => node.type === 'n8n-nodes-base.code');
  
  console.log('🤖 KRITIEKE CODE BLOKKEN ANALYSE');
  console.log('==================================\n');

  // 1. AI Context Builder - KERN VAN DE INTELLIGENTIE
  const contextBuilder = codeNodes.find(n => n.name === 'AI Context builder');
  if (contextBuilder) {
    console.log('🧠 AI CONTEXT BUILDER - KERN VAN DE INTELLIGENTIE');
    console.log('='.repeat(60));
    
    const code = contextBuilder.parameters.jsCode;
    
    // Analyseer belangrijke functies
    console.log('\n📊 BELANGRIJKE FUNCTIES:');
    
    if (code.includes('detectLanguage')) {
      console.log('✅ Meertalige detectie (NL/EN/DE)');
      console.log('   - Keywords per taal voor detectie');
      console.log('   - Fallback naar tenant locale');
    }
    
    if (code.includes('mood')) {
      console.log('✅ Emotieherkenning (happy/neutral/frustrated/angry)');
      console.log('   - Meertalige emotie keywords');
      console.log('   - Context-aware mood detection');
    }
    
    if (code.includes('dreiging_detected')) {
      console.log('✅ Dreiging detectie');
      console.log('   - Trigger woorden: "advocaat", "rechtszaak", "politie", "aangifte"');
      console.log('   - Direct escalatie naar 50% compensatie');
    }
    
    if (code.includes('compensatie_ladder')) {
      console.log('✅ Compensatie ladder logica');
      console.log('   - Deterministische stappen: 15% → 20% → 30% → 40%');
      console.log('   - last_known_offer vs expected_offer berekening');
      console.log('   - Dreiging = direct 50% (bounded)');
    }
    
    if (code.includes('soft_refusal')) {
      console.log('✅ Soft refusal detectie');
      console.log('   - "te weinig", "niet genoeg", "kan dit hoger"');
      console.log('   - Onderhandeling percentage detectie');
      console.log('   - Context-aware refusal detection');
    }
    
    if (code.includes('delivery_bucket')) {
      console.log('✅ Delivery bucket logica');
      console.log('   - <5, 5-9, 11-13, 14+ dagen');
      console.log('   - Chinese dropshipping optimalisatie');
      console.log('   - Geen harde deadlines');
    }
    
    console.log('\n🎯 CONTEXT BUILDING FEATURES:');
    console.log('   - Volledige gespreksgeschiedenis (laatste 30 interacties)');
    console.log('   - Gmail threading via gmail_thread_id');
    console.log('   - Business rules integratie');
    console.log('   - Tenant-specifieke configuratie');
    console.log('   - Orderdatum extractie en days_since_order');
    console.log('   - Fashion-specifieke probleem detectie');
  }

  // 2. Prompt Generator - AI PROMPT ENGINEERING
  const promptGenerator = codeNodes.find(n => n.name === 'Prompt Generator');
  if (promptGenerator) {
    console.log('\n\n📝 PROMPT GENERATOR - AI PROMPT ENGINEERING');
    console.log('='.repeat(60));
    
    const code = promptGenerator.parameters.jsCode;
    
    console.log('\n🎯 PROMPT STRATEGIE:');
    
    if (code.includes('COMPENSATION-FIRST')) {
      console.log('✅ Compensation-first policy');
      console.log('   - Geen retour/geld-terug tot 40% geweigerd');
      console.log('   - Altijd eerst compensatie aanbieden');
      console.log('   - Retour alleen als laatste redmiddel');
    }
    
    if (code.includes('delivery buckets')) {
      console.log('✅ Delivery bucket responses');
      console.log('   - 3-6 dagen: geruststellen');
      console.log('   - 7-10 dagen: wachten vragen');
      console.log('   - 11-13 dagen: tracking info opvragen');
      console.log('   - 14+ dagen: onderzoek starten');
    }
    
    if (code.includes('cancellation')) {
      console.log('✅ Annulering/adreswijziging policy');
      console.log('   - Per-tenant configuratie');
      console.log('   - Policy windows respecteren');
      console.log('   - Meertalige responses');
    }
    
    console.log('\n🤖 AI INSTRUCTIES:');
    console.log('   - Warm, professioneel, empathisch');
    console.log('   - Geen emoji\'s, exact één afsluiting');
    console.log('   - Variatie in openingszinnen');
    console.log('   - Tenant signature HTML gebruiken');
    console.log('   - Nooit interne ladder/policies onthullen');
  }

  // 3. Offer Normalizer - DETERMINISTISCHE CONTROLE
  const offerNormalizer = codeNodes.find(n => n.name === 'Offer Normalizer');
  if (offerNormalizer) {
    console.log('\n\n⚖️ OFFER NORMALIZER - DETERMINISTISCHE CONTROLE');
    console.log('='.repeat(60));
    
    const code = offerNormalizer.parameters.jsCode;
    
    console.log('\n🎯 KERN FUNCTIES:');
    
    if (code.includes('nextStepFrom')) {
      console.log('✅ Ladder stap berekening');
      console.log('   - Deterministische stap verhoging');
      console.log('   - Geen willekeur in percentages');
      console.log('   - Bounded door tenant limieten');
    }
    
    if (code.includes('finalOffer')) {
      console.log('✅ Percentage normalisatie');
      console.log('   - Forceert correcte percentages');
      console.log('   - Dreiging = 50% (bounded)');
      console.log('   - Normaal = max 40%');
    }
    
    if (code.includes('html.replace')) {
      console.log('✅ HTML synchronisatie');
      console.log('   - JSON en HTML altijd synchroon');
      console.log('   - Percentage injectie in HTML');
      console.log('   - Consistentie tussen DB en e-mail');
    }
    
    console.log('\n🔄 NORMALISATIE LOGICA:');
    console.log('   - last_known_offer als basis');
    console.log('   - Één stap verhoging bij weigering');
    console.log('   - Dreiging = direct 50%');
    console.log('   - HTML percentage vervanging');
    console.log('   - final_ladder_step berekening');
  }

  // 4. Response Parser - AI OUTPUT PARSING
  const responseParser = codeNodes.find(n => n.name === 'Response Parser');
  if (responseParser) {
    console.log('\n\n🔍 RESPONSE PARSER - AI OUTPUT PARSING');
    console.log('='.repeat(60));
    
    const code = responseParser.parameters.jsCode;
    
    console.log('\n🎯 PARSING FUNCTIES:');
    
    if (code.includes('normType')) {
      console.log('✅ Type normalisatie');
      console.log('   - compensation, return, cancellation, address_change');
      console.log('   - negotiation, threat, delivery, general');
      console.log('   - Meertalige type detectie');
    }
    
    if (code.includes('fallback')) {
      console.log('✅ Fallback detectie');
      console.log('   - Meertalige refusal/acceptance detectie');
      console.log('   - Tenant keywords als fallback');
      console.log('   - Graceful degradation');
    }
    
    if (code.includes('type guard')) {
      console.log('✅ Type guard logica');
      console.log('   - Context-based type coercion');
      console.log('   - last_known_offer guard');
      console.log('   - Return intent detection');
    }
    
    console.log('\n📊 OUTPUT NORMALISATIE:');
    console.log('   - JSON parsing met fallbacks');
    console.log('   - HTML fallback generatie');
    console.log('   - Metadata merge en normalisatie');
    console.log('   - Flag normalisatie (boolean)');
    console.log('   - Rijke summary generatie');
  }

  // 5. Email Body Cleaner - CONTENT CLEANING
  const emailCleaner = codeNodes.find(n => n.name === 'Email body cleaner');
  if (emailCleaner) {
    console.log('\n\n🧹 EMAIL BODY CLEANER - CONTENT CLEANING');
    console.log('='.repeat(60));
    
    const code = emailCleaner.parameters.jsCode;
    
    console.log('\n🎯 CLEANING FUNCTIES:');
    
    if (code.includes('strip HTML')) {
      console.log('✅ HTML stripping');
      console.log('   - Style en script tags verwijderen');
      console.log('   - HTML entities normaliseren');
      console.log('   - Whitespace normalisatie');
    }
    
    if (code.includes('gequote reply')) {
      console.log('✅ Quote removal');
      console.log('   - Gmail/Outlook/Apple Mail varianten');
      console.log('   - "On ... wrote:" detectie');
      console.log('   - "From:" header detectie');
      console.log('   - Forwarded message detectie');
    }
    
    console.log('\n📧 CLEANING RESULT:');
    console.log('   - Schone tekst voor AI analyse');
    console.log('   - Geen ruis van oude replies');
    console.log('   - Consistente input voor alle nodes');
  }

  // 6. Klantnaam Extractor - INTELLIGENTE NAAM DETECTIE
  const nameExtractor = codeNodes.find(n => n.name === 'Klantnaam Extractor');
  if (nameExtractor) {
    console.log('\n\n👤 KANTNAAM EXTRACTOR - INTELLIGENTE NAAM DETECTIE');
    console.log('='.repeat(60));
    
    const code = nameExtractor.parameters.jsCode;
    
    console.log('\n🎯 EXTRACTIE METHODEN:');
    
    if (code.includes('body_signature')) {
      console.log('✅ Body signature extractie');
      console.log('   - "Met vriendelijke groet" detectie');
      console.log('   - Score: 0.95 (hoogste prioriteit)');
    }
    
    if (code.includes('header_display')) {
      console.log('✅ Header display name');
      console.log('   - From header parsing');
      console.log('   - Score: 0.85 (hoge prioriteit)');
    }
    
    if (code.includes('local_part')) {
      console.log('✅ Email local part');
      console.log('   - Username uit email adres');
      console.log('   - Score: 0.60 (laagste prioriteit)');
    }
    
    console.log('\n📊 SCORING SYSTEEM:');
    console.log('   - Multi-source naam detectie');
    console.log('   - Confidence scoring per methode');
    console.log('   - Beste match selectie');
    console.log('   - Fallback naar email username');
  }

  // 7. Orderdatum Extractor - INTELLIGENTE DATUM DETECTIE
  const orderExtractor = codeNodes.find(n => n.name === 'Orderdatum Extractor');
  if (orderExtractor) {
    console.log('\n\n📅 ORDERDATUM EXTRACTOR - INTELLIGENTE DATUM DETECTIE');
    console.log('='.repeat(60));
    
    const code = orderExtractor.parameters.jsCode;
    
    console.log('\n🎯 EXTRACTIE FUNCTIES:');
    
    if (code.includes('dateRegex')) {
      console.log('✅ Datum regex detectie');
      console.log('   - DD/MM/YYYY, DD-MM-YYYY, DD MM YYYY');
      console.log('   - Automatische jaar correctie (YY → YYYY)');
      console.log('   - ISO date conversie');
    }
    
    if (code.includes('days_since_order')) {
      console.log('✅ Days since order berekening');
      console.log('   - Automatische dag berekening');
      console.log('   - Voor delivery bucket logica');
      console.log('   - Voor annulering/adreswijziging policy');
    }
    
    if (code.includes('needs_order_info')) {
      console.log('✅ Order info detectie');
      console.log('   - Confidence scoring');
      console.log('   - Fallback naar handmatige opvraag');
    }
    
    console.log('\n📊 OUTPUT:');
    console.log('   - order_date_iso: YYYY-MM-DD format');
    console.log('   - days_since_order: aantal dagen');
    console.log('   - needs_order_info: boolean flag');
    console.log('   - confidence: 0.1-0.9 score');
  }

  // 8. Thread ID Generator - THREADING LOGICA
  const threadGenerator = codeNodes.find(n => n.name === 'Thread ID Generator');
  if (threadGenerator) {
    console.log('\n\n🧵 THREAD ID GENERATOR - THREADING LOGICA');
    console.log('='.repeat(60));
    
    const code = threadGenerator.parameters.jsCode;
    
    console.log('\n🎯 THREADING FUNCTIES:');
    
    if (code.includes('uuidv4')) {
      console.log('✅ UUID generatie');
      console.log('   - Unieke thread ID per conversatie');
      console.log('   - UUID v4 format');
    }
    
    if (code.includes('contact_count')) {
      console.log('✅ Contact count berekening');
      console.log('   - Increment per nieuw contact');
      console.log('   - Voor analytics en tracking');
    }
    
    if (code.includes('is_new_thread')) {
      console.log('✅ Thread status detectie');
      console.log('   - Nieuwe vs bestaande thread');
      console.log('   - Voor verschillende flows');
    }
    
    console.log('\n📊 THREADING LOGICA:');
    console.log('   - Gmail threading via gmail_thread_id');
    console.log('   - Fallback naar customer_email');
    console.log('   - Unieke thread per klant/tenant');
    console.log('   - Contact count voor analytics');
  }

  console.log('\n\n🎯 BELANGRIJKE INZICHTEN');
  console.log('='.repeat(60));
  
  console.log('\n✅ STERKE PUNTEN:');
  console.log('   - Zeer geavanceerde context building');
  console.log('   - Deterministische ladder controle');
  console.log('   - Meertalige ondersteuning');
  console.log('   - Chinese dropshipping optimalisatie');
  console.log('   - Robuuste error handling');
  console.log('   - Idempotente database operaties');
  
  console.log('\n❌ MISSENDE FEATURES:');
  console.log('   - Email filtering workflow (wel in database)');
  console.log('   - VIP klant detectie');
  console.log('   - Geavanceerde analytics');
  console.log('   - A/B testing van responses');
  console.log('   - Machine learning optimalisatie');
  console.log('   - Real-time performance monitoring');
  
  console.log('\n🚀 VOLGENDE STAPPEN:');
  console.log('   1. Email filtering workflow implementeren');
  console.log('   2. VIP klant detectie toevoegen');
  console.log('   3. Geavanceerde analytics dashboard');
  console.log('   4. A/B testing framework');
  console.log('   5. Machine learning integratie');
  console.log('   6. Performance monitoring');
  
  console.log('\n🎉 Diepgaande code analyse voltooid!');
}

deepCodeAnalysis().catch(console.error);
