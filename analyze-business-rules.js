const { createClient } = require('@supabase/supabase-js');

// Supabase configuratie
const supabaseUrl = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeBusinessRules() {
  console.log('🔍 Business Rules Gedetailleerde Analyse\n');

  try {
    // Haal alle business rules op
    const { data: rules, error } = await supabase
      .from('master_business_rules')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`✅ ${rules.length} business rules gevonden\n`);

    // Groepeer per categorie
    const categories = {};
    rules.forEach(rule => {
      if (!categories[rule.category]) {
        categories[rule.category] = [];
      }
      categories[rule.category].push(rule);
    });

    // Analyseer elke categorie
    Object.entries(categories).forEach(([category, categoryRules]) => {
      console.log(`📋 CATEGORIE: ${category.toUpperCase()}`);
      console.log('='.repeat(50));
      
      categoryRules.forEach((rule, index) => {
        console.log(`\n${index + 1}. ${rule.rule_name} (${rule.rule_key})`);
        console.log(`   Beschrijving: ${rule.description || 'Geen beschrijving'}`);
        
        if (rule.rule_config) {
          console.log(`   Configuratie:`);
          console.log(`     ${JSON.stringify(rule.rule_config, null, 6)}`);
        }
        
        if (rule.html_template) {
          console.log(`   HTML Template: ${rule.html_template.substring(0, 100)}...`);
        }
        
        console.log(`   Verplicht: ${rule.is_required ? 'Ja' : 'Nee'}`);
      });
      
      console.log('\n');
    });

    // Specifieke analyse van belangrijke regels
    console.log('🎯 BELANGRIJKE REGELS ANALYSE');
    console.log('=============================');

    // Compensatie ladder
    const compensatieLadder = rules.find(r => r.rule_key === 'compensatie_ladder');
    if (compensatieLadder) {
      console.log('\n💰 COMPENSATIE LADDER:');
      console.log(`   Regel: ${compensatieLadder.rule_name}`);
      console.log(`   Config: ${JSON.stringify(compensatieLadder.rule_config, null, 2)}`);
    }

    // Delivery logica
    const deliveryLogica = rules.find(r => r.rule_key === 'levering_logica');
    if (deliveryLogica) {
      console.log('\n🚚 DELIVERY LOGICA:');
      console.log(`   Regel: ${deliveryLogica.rule_name}`);
      console.log(`   Config: ${JSON.stringify(deliveryLogica.rule_config, null, 2)}`);
    }

    // Dreiging detectie
    const dreigingDetectie = rules.find(r => r.rule_key === 'dreiging_detectie');
    if (dreigingDetectie) {
      console.log('\n⚠️ DREIGING DETECTIE:');
      console.log(`   Regel: ${dreigingDetectie.rule_name}`);
      console.log(`   Config: ${JSON.stringify(dreigingDetectie.rule_config, null, 2)}`);
    }

    // Onderhandeling logica
    const onderhandelingLogica = rules.find(r => r.rule_key === 'onderhandeling_logica');
    if (onderhandelingLogica) {
      console.log('\n🤝 ONDERHANDELING LOGICA:');
      console.log(`   Regel: ${onderhandelingLogica.rule_name}`);
      console.log(`   Config: ${JSON.stringify(onderhandelingLogica.rule_config, null, 2)}`);
    }

    // Weigering detectie
    const weigeringDetectie = rules.find(r => r.rule_key === 'weigering_detectie');
    if (weigeringDetectie) {
      console.log('\n❌ WEIGERING DETECTIE:');
      console.log(`   Regel: ${weigeringDetectie.rule_name}`);
      console.log(`   Config: ${JSON.stringify(weigeringDetectie.rule_config, null, 2)}`);
    }

    // Annulering policy
    const annuleringPolicy = rules.find(r => r.rule_key === 'annulering_policy');
    if (annuleringPolicy) {
      console.log('\n🚫 ANNULERING POLICY:');
      console.log(`   Regel: ${annuleringPolicy.rule_name}`);
      console.log(`   Config: ${JSON.stringify(annuleringPolicy.rule_config, null, 2)}`);
    }

    // Adreswijziging policy
    const adreswijzigingPolicy = rules.find(r => r.rule_key === 'adreswijziging_policy');
    if (adreswijzigingPolicy) {
      console.log('\n📍 ADRESWIJZIGING POLICY:');
      console.log(`   Regel: ${adreswijzigingPolicy.rule_name}`);
      console.log(`   Config: ${JSON.stringify(adreswijzigingPolicy.rule_config, null, 2)}`);
    }

    // Retourbeleid
    const retourbeleid = rules.find(r => r.rule_key === 'retourbeleid_fashion');
    if (retourbeleid) {
      console.log('\n📦 RETOURBELEID:');
      console.log(`   Regel: ${retourbeleid.rule_name}`);
      console.log(`   Config: ${JSON.stringify(retourbeleid.rule_config, null, 2)}`);
    }

    // Fashion specifieke regels
    const fashionMaat = rules.find(r => r.rule_key === 'fashion_maatprobleem');
    const fashionKleur = rules.find(r => r.rule_key === 'fashion_kleurprobleem');
    
    if (fashionMaat || fashionKleur) {
      console.log('\n👕 FASHION SPECIFIEKE REGELS:');
      if (fashionMaat) {
        console.log(`   Maatprobleem: ${JSON.stringify(fashionMaat.rule_config, null, 2)}`);
      }
      if (fashionKleur) {
        console.log(`   Kleurprobleem: ${JSON.stringify(fashionKleur.rule_config, null, 2)}`);
      }
    }

    // Samenvatting van AI capabilities
    console.log('\n🤖 AI CAPABILITIES SAMENVATTING');
    console.log('===============================');
    console.log('De AI kan het volgende:');
    console.log('✅ Compensatie ladder toepassen (15% → 20% → 30% → 40%)');
    console.log('✅ Delivery buckets hanteren (<5, 5-9, >9 werkdagen)');
    console.log('✅ Dreigingen detecteren en escaleren');
    console.log('✅ Onderhandeling binnen marges (+15%)');
    console.log('✅ Weigeringen en acceptaties detecteren');
    console.log('✅ Annuleringen binnen policy windows');
    console.log('✅ Adreswijzigingen binnen policy windows');
    console.log('✅ Fashion-specifieke problemen herkennen (maat, kleur)');
    console.log('✅ Retourbeleid toepassen');
    console.log('✅ Multi-language support (NL, EN, DE)');
    console.log('✅ Context-aware responses met gespreksgeschiedenis');
    console.log('✅ Compensatie-first strategie (geen retour tot 40% geweigerd)');

  } catch (error) {
    console.error('❌ Fout:', error);
  }
}

// Voer de analyse uit
analyzeBusinessRules().then(() => {
  console.log('\n\n🎉 Business rules analyse voltooid!');
}).catch(console.error);
