const { createClient } = require('@supabase/supabase-js');

// Supabase configuratie
const supabaseUrl = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeSupabase() {
  console.log('🔍 Supabase Database Analyse Starten...\n');

  try {
    // 1. Tenants analyseren
    console.log('📋 1. TENANTS ANALYSE');
    console.log('====================');
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*');
    
    if (tenantsError) {
      console.error('❌ Tenants error:', tenantsError);
    } else {
      console.log(`✅ ${tenants.length} tenants gevonden:`);
      tenants.forEach((tenant, index) => {
        console.log(`\n${index + 1}. ${tenant.bedrijfsnaam || 'Onbekend'}`);
        console.log(`   - Tenant ID: ${tenant.tenant_id}`);
        console.log(`   - Gmail: ${tenant.gmail_email}`);
        console.log(`   - AI Persona: ${tenant.ai_persona_name}`);
        console.log(`   - Locale: ${tenant.locale || tenant.taalvoorkeur || 'nl'}`);
        console.log(`   - Actief: ${tenant.active ? 'Ja' : 'Nee'}`);
        console.log(`   - Annulering dagen: ${tenant.annulering_toegestaan_dagen || 'Niet ingesteld'}`);
        console.log(`   - Adreswijziging dagen: ${tenant.adreswijziging_toegestaan_dagen || 'Niet ingesteld'}`);
        console.log(`   - Max compensatie: ${tenant.maximaal_extra_compensatie || 'Niet ingesteld'}%`);
      });
    }

    // 2. Business Rules analyseren
    console.log('\n\n📋 2. BUSINESS RULES ANALYSE');
    console.log('============================');
    const { data: businessRules, error: rulesError } = await supabase
      .from('master_business_rules')
      .select('*');
    
    if (rulesError) {
      console.error('❌ Business rules error:', rulesError);
    } else {
      console.log(`✅ ${businessRules.length} master business rules gevonden:`);
      businessRules.forEach((rule, index) => {
        console.log(`\n${index + 1}. ${rule.rule_name} (${rule.rule_key})`);
        console.log(`   - Categorie: ${rule.category}`);
        console.log(`   - Beschrijving: ${rule.description || 'Geen beschrijving'}`);
      });
    }

    // 3. Tenant Business Rules analyseren
    console.log('\n\n📋 3. TENANT BUSINESS RULES ANALYSE');
    console.log('====================================');
    const { data: tenantRules, error: tenantRulesError } = await supabase
      .from('tenant_business_rules')
      .select(`
        *,
        master_business_rules (rule_name, category, description)
      `);
    
    if (tenantRulesError) {
      console.error('❌ Tenant business rules error:', tenantRulesError);
    } else {
      console.log(`✅ ${tenantRules.length} tenant business rules gevonden:`);
      tenantRules.forEach((rule, index) => {
        console.log(`\n${index + 1}. Tenant: ${rule.tenant_id}`);
        console.log(`   - Regel: ${rule.master_business_rules?.rule_name || rule.rule_key}`);
        console.log(`   - Actief: ${rule.is_active ? 'Ja' : 'Nee'}`);
        console.log(`   - Config: ${JSON.stringify(rule.rule_config, null, 2)}`);
      });
    }

    // 4. Conversation Threads analyseren
    console.log('\n\n📋 4. CONVERSATION THREADS ANALYSE');
    console.log('==================================');
    const { data: threads, error: threadsError } = await supabase
      .from('conversation_threads')
      .select('*')
      .limit(10);
    
    if (threadsError) {
      console.error('❌ Conversation threads error:', threadsError);
    } else {
      console.log(`✅ ${threads.length} conversation threads (eerste 10):`);
      threads.forEach((thread, index) => {
        console.log(`\n${index + 1}. Thread: ${thread.thread_id}`);
        console.log(`   - Customer: ${thread.customer_email}`);
        console.log(`   - Tenant: ${thread.tenant_id}`);
        console.log(`   - Total interactions: ${thread.total_interactions}`);
        console.log(`   - Current status: ${thread.current_status}`);
        console.log(`   - Ladder stap: ${thread.ladder_stap}`);
        console.log(`   - Huidig bod: ${thread.huidig_bod}%`);
        console.log(`   - Last contact: ${thread.last_contact_date}`);
      });
    }

    // 5. Customer Interactions analyseren
    console.log('\n\n📋 5. CUSTOMER INTERACTIONS ANALYSE');
    console.log('====================================');
    const { data: interactions, error: interactionsError } = await supabase
      .from('customer_interactions')
      .select('*')
      .limit(10);
    
    if (interactionsError) {
      console.error('❌ Customer interactions error:', interactionsError);
    } else {
      console.log(`✅ ${interactions.length} customer interactions (eerste 10):`);
      interactions.forEach((interaction, index) => {
        console.log(`\n${index + 1}. Interaction: ${interaction.id}`);
        console.log(`   - Thread: ${interaction.thread_id}`);
        console.log(`   - Type: ${interaction.type}`);
        console.log(`   - Status: ${interaction.status}`);
        console.log(`   - Compensatie: ${interaction.compensatie_percentage}%`);
        console.log(`   - Ladder stap: ${interaction.ladder_stap}`);
        console.log(`   - Refusal detected: ${interaction.refusal_detected}`);
        console.log(`   - Acceptance detected: ${interaction.acceptance_detected}`);
        console.log(`   - Created: ${interaction.created_at}`);
      });
    }

    // 6. Database schema analyseren
    console.log('\n\n📋 6. DATABASE SCHEMA ANALYSE');
    console.log('============================');
    
    // Probeer verschillende tabellen te vinden
    const tables = [
      'tenants', 'conversation_threads', 'customer_interactions', 
      'tenant_business_rules', 'master_business_rules', 'notifications',
      'escalations', 'orders', 'products', 'customers'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error && data !== null) {
          console.log(`✅ Tabel '${table}' bestaat`);
          if (data.length > 0) {
            console.log(`   - Kolommen: ${Object.keys(data[0]).join(', ')}`);
          }
        }
      } catch (e) {
        console.log(`❌ Tabel '${table}' bestaat niet`);
      }
    }

    // 7. Statistieken
    console.log('\n\n📋 7. STATISTIEKEN');
    console.log('==================');
    
    // Tel records per tabel
    const stats = {};
    for (const table of ['tenants', 'conversation_threads', 'customer_interactions']) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          stats[table] = count;
        }
      } catch (e) {
        stats[table] = 'Error';
      }
    }
    
    console.log('Database statistieken:');
    Object.entries(stats).forEach(([table, count]) => {
      console.log(`   - ${table}: ${count} records`);
    });

  } catch (error) {
    console.error('❌ Algemene fout:', error);
  }
}

// Voer de analyse uit
analyzeSupabase().then(() => {
  console.log('\n\n🎉 Supabase analyse voltooid!');
}).catch(console.error);
