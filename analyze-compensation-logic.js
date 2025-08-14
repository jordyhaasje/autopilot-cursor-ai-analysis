const axios = require('axios');

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

const TENANT_ID = 'af738ad1-9275-4f87-8fa6-fe2748771dc6';

async function analyzeCompensationLogic() {
  console.log('🔍 Analyzing Compensation Logic for Tenant...\n');

  try {
    // Step 1: Get tenant data
    console.log('📊 Step 1: Getting tenant data...');
    const tenantResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenants?tenant_id=eq.${TENANT_ID}`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (tenantResponse.data.length > 0) {
      const tenant = tenantResponse.data[0];
      console.log('✅ Tenant found:');
      console.log(`   - Bedrijfsnaam: ${tenant.bedrijfsnaam}`);
      console.log(`   - Gmail Email: ${tenant.gmail_email}`);
      console.log(`   - AI Persona: ${tenant.ai_persona_name}`);
      console.log(`   - Max Extra Compensatie: ${tenant.maximaal_extra_compensatie}%`);
    } else {
      console.log('❌ Tenant not found');
      return;
    }

    // Step 2: Get business rules for this tenant
    console.log('\n📋 Step 2: Getting business rules...');
    const businessRulesResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenant_business_rules?tenant_id=eq.${TENANT_ID}`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Found ${businessRulesResponse.data.length} business rules:`);
    businessRulesResponse.data.forEach(rule => {
      console.log(`   - ${rule.rule_key}: ${rule.rule_name}`);
      if (rule.rule_config && rule.rule_config.compensatie) {
        console.log(`     Compensatie: ${rule.rule_config.compensatie}%`);
      }
    });

    // Step 3: Get recent customer interactions
    console.log('\n💬 Step 3: Getting recent customer interactions...');
    const interactionsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/customer_interactions?tenant_id=eq.${TENANT_ID}&order=created_at.desc&limit=10`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Found ${interactionsResponse.data.length} recent interactions:`);
    interactionsResponse.data.forEach((interaction, index) => {
      console.log(`\n   ${index + 1}. ${interaction.customer_email} (${interaction.created_at})`);
      console.log(`      - Type: ${interaction.type}`);
      console.log(`      - Status: ${interaction.status}`);
      console.log(`      - Compensatie: ${interaction.compensatie_percentage}%`);
      console.log(`      - Ladder Stap: ${interaction.ladder_stap}`);
      console.log(`      - Refusal Detected: ${interaction.refusal_detected}`);
      console.log(`      - Message: ${interaction.message_body?.substring(0, 100)}...`);
      console.log(`      - AI Response: ${interaction.ai_response?.substring(0, 100)}...`);
    });

    // Step 4: Check for compensation ladder logic
    console.log('\n🪜 Step 4: Analyzing compensation ladder logic...');
    const compensationRule = businessRulesResponse.data.find(rule => 
      rule.rule_key === 'compensatie_ladder' || 
      rule.rule_name?.toLowerCase().includes('compensatie')
    );

    if (compensationRule) {
      console.log('✅ Compensation ladder rule found:');
      console.log(`   - Rule Key: ${compensationRule.rule_key}`);
      console.log(`   - Rule Config: ${JSON.stringify(compensationRule.rule_config, null, 2)}`);
    } else {
      console.log('❌ No compensation ladder rule found');
    }

    // Step 5: Check conversation threads
    console.log('\n🧵 Step 5: Getting conversation threads...');
    const threadsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/conversation_threads?tenant_id=eq.${TENANT_ID}&order=updated_at.desc&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Found ${threadsResponse.data.length} conversation threads:`);
    threadsResponse.data.forEach((thread, index) => {
      console.log(`\n   ${index + 1}. Thread ${thread.thread_id}`);
      console.log(`      - Customer: ${thread.customer_email}`);
      console.log(`      - Total Interactions: ${thread.total_interactions}`);
      console.log(`      - Last Updated: ${thread.updated_at}`);
      if (thread.conversation_context) {
        console.log(`      - Context: ${JSON.stringify(thread.conversation_context, null, 2)}`);
      }
    });

    // Step 6: Analyze the specific issue
    console.log('\n🔍 Step 6: Analyzing the compensation issue...');
    const recentInteractions = interactionsResponse.data.filter(i => 
      i.customer_email === 'lvbendjong@gmail.com'
    );

    if (recentInteractions.length > 0) {
      console.log('✅ Found interactions for lvbendjong@gmail.com:');
      recentInteractions.forEach((interaction, index) => {
        console.log(`\n   Interaction ${index + 1}:`);
        console.log(`      - Ladder Stap: ${interaction.ladder_stap}`);
        console.log(`      - Offered: ${interaction.compensatie_percentage}%`);
        console.log(`      - Refusal: ${interaction.refusal_detected}`);
        console.log(`      - Type: ${interaction.type}`);
        console.log(`      - Message: ${interaction.message_body}`);
        console.log(`      - AI Response: ${interaction.ai_response}`);
      });
    }

    console.log('\n🎯 ANALYSIS SUMMARY:');
    console.log('The issue appears to be in the AI response generation where:');
    console.log('1. Customer refuses 15% compensation');
    console.log('2. AI should offer 20% (next ladder step)');
    console.log('3. But AI response mentions "20% not sufficient" and offers 20% again');
    console.log('4. This suggests a logic error in the AI prompt or response parsing');

  } catch (error) {
    console.error('❌ Analysis failed:', error.response?.data || error.message);
  }
}

analyzeCompensationLogic();
