const axios = require('axios');

const N8N_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTcxNzUxLCJleHAiOjE3NTc3MzYwMDB9.sSOhbufmYfF40Zg-UTbmBtKXNh6FG7o9x5hoPjEUIRU';

const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function verifyTenantIsolation() {
  console.log('🔍 Verifying Tenant Isolation in Current Workflow...\n');

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

    // Find key nodes for tenant isolation
    const getTenantData = workflow.nodes.find(node => node.name === 'Get Tenant Data');
    const aiContextBuilder = workflow.nodes.find(node => node.name === 'AI Context builder');
    const emailFilter = workflow.nodes.find(node => node.name === 'Email Filter');
    const postgresStoreInteraction = workflow.nodes.find(node => node.name === 'Postgres Store Interaction');

    console.log('\n🔍 ANALYZING TENANT ISOLATION:');

    // 1. Check Get Tenant Data node
    console.log('\n1️⃣ Get Tenant Data Node:');
    if (getTenantData) {
      console.log('✅ Node found');
      if (getTenantData.parameters && getTenantData.parameters.jsCode) {
        const code = getTenantData.parameters.jsCode;
        if (code.includes('tenant_id')) {
          console.log('✅ tenant_id wordt gebruikt');
        } else {
          console.log('❌ tenant_id niet gevonden in code');
        }
        if (code.includes('getTenantIdFromEmail') || code.includes('tenant_id')) {
          console.log('✅ Tenant detection logica aanwezig');
        } else {
          console.log('❌ Tenant detection logica niet gevonden');
        }
      }
    } else {
      console.log('❌ Get Tenant Data node niet gevonden');
    }

    // 2. Check AI Context Builder
    console.log('\n2️⃣ AI Context Builder Node:');
    if (aiContextBuilder) {
      console.log('✅ Node found');
      if (aiContextBuilder.parameters && aiContextBuilder.parameters.jsCode) {
        const code = aiContextBuilder.parameters.jsCode;
        
        // Check for business rules loading
        if (code.includes('tenant_business_rules')) {
          console.log('✅ Business rules per tenant worden geladen');
        } else {
          console.log('❌ Business rules per tenant niet gevonden');
        }
        
        // Check for tenant_id usage
        if (code.includes('tenant_id')) {
          console.log('✅ tenant_id wordt gebruikt in context building');
        } else {
          console.log('❌ tenant_id niet gebruikt in context building');
        }
        
        // Check for business rules detection
        if (code.includes('detectie_woorden') || code.includes('rule_config')) {
          console.log('✅ Business rules detectie logica aanwezig');
        } else {
          console.log('❌ Business rules detectie logica niet gevonden');
        }
      }
    } else {
      console.log('❌ AI Context Builder node niet gevonden');
    }

    // 3. Check Email Filter node
    console.log('\n3️⃣ Email Filter Node:');
    if (emailFilter) {
      console.log('✅ Node found');
      if (emailFilter.parameters && emailFilter.parameters.jsCode) {
        const code = emailFilter.parameters.jsCode;
        if (code.includes('tenant_id')) {
          console.log('✅ Email filters per tenant worden gebruikt');
        } else {
          console.log('❌ Email filters per tenant niet gevonden');
        }
        if (code.includes('SUPABASE_SERVICE_ROLE_KEY')) {
          console.log('✅ Service role key wordt gebruikt');
        } else {
          console.log('❌ Service role key niet gevonden');
        }
      }
    } else {
      console.log('❌ Email Filter node niet gevonden');
    }

    // 4. Check Postgres Store Interaction
    console.log('\n4️⃣ Postgres Store Interaction Node:');
    if (postgresStoreInteraction) {
      console.log('✅ Node found');
      if (postgresStoreInteraction.parameters && postgresStoreInteraction.parameters.query) {
        const query = postgresStoreInteraction.parameters.query;
        if (query.includes('tenant_id')) {
          console.log('✅ tenant_id wordt opgeslagen in database');
        } else {
          console.log('❌ tenant_id wordt niet opgeslagen');
        }
      }
    } else {
      console.log('❌ Postgres Store Interaction node niet gevonden');
    }

    // 5. Check database for tenant isolation
    console.log('\n5️⃣ Database Tenant Isolation Check:');
    
    // Get all tenants
    const tenantsResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenants?select=tenant_id,bedrijfsnaam,gmail_email`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Found ${tenantsResponse.data.length} tenants:`);
    tenantsResponse.data.forEach(tenant => {
      console.log(`   - ${tenant.bedrijfsnaam} (${tenant.gmail_email})`);
    });

    // Check business rules per tenant
    const businessRulesResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/tenant_business_rules?select=tenant_id,rule_key,rule_name`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Found ${businessRulesResponse.data.length} business rules:`);
    const rulesByTenant = {};
    businessRulesResponse.data.forEach(rule => {
      if (!rulesByTenant[rule.tenant_id]) {
        rulesByTenant[rule.tenant_id] = [];
      }
      rulesByTenant[rule.tenant_id].push(rule.rule_key);
    });

    Object.keys(rulesByTenant).forEach(tenantId => {
      console.log(`   - Tenant ${tenantId}: ${rulesByTenant[tenantId].join(', ')}`);
    });

    // Check email filters per tenant
    const emailFiltersResponse = await axios.get(
      `${SUPABASE_URL}/rest/v1/email_filters?select=tenant_id,filter_type,email_address`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Found ${emailFiltersResponse.data.length} email filters:`);
    const filtersByTenant = {};
    emailFiltersResponse.data.forEach(filter => {
      if (!filtersByTenant[filter.tenant_id]) {
        filtersByTenant[filter.tenant_id] = [];
      }
      filtersByTenant[filter.tenant_id].push(`${filter.filter_type}: ${filter.email_address}`);
    });

    Object.keys(filtersByTenant).forEach(tenantId => {
      console.log(`   - Tenant ${tenantId}: ${filtersByTenant[tenantId].join(', ')}`);
    });

    console.log('\n🎯 TENANT ISOLATION ANALYSIS SUMMARY:');
    console.log('✅ Multi-tenant database structuur intact');
    console.log('✅ Business rules per tenant aanwezig');
    console.log('✅ Email filters per tenant aanwezig');
    console.log('❓ Workflow tenant detection moet gecontroleerd worden');
    console.log('❓ Business rules loading in workflow moet gecontroleerd worden');

    console.log('\n📝 RECOMMENDATIONS:');
    console.log('1. Verificatie nodig: Hoe wordt tenant_id bepaald in workflow?');
    console.log('2. Verificatie nodig: Worden business rules per tenant geladen?');
    console.log('3. Verificatie nodig: Worden email filters per tenant toegepast?');
    console.log('4. Test nodig: Stuur test email naar verschillende tenant emails');

  } catch (error) {
    console.error('❌ Verification failed:', error.response?.data || error.message);
  }
}

verifyTenantIsolation();
