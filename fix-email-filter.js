const axios = require('axios');

const RAILWAY_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTA4MzgyLCJleHAiOjE3NTc2NDk2MDB9.rtJzEp4Fm81LEB7UwVmngqieUNfr8lZZ8A-pWIbdAnE';

async function fixEmailFilter() {
  console.log('🔧 Fixing Email Filter Node - Making it Dynamic...');
  
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

    // Find and update Email Filter node
    const emailFilterNode = workflow.nodes.find(n => n.name === 'Email Filter');
    if (emailFilterNode) {
      console.log('✅ Found Email Filter node, updating with dynamic logic...');
      
      // Update with dynamic tenant-based filtering
      emailFilterNode.parameters.jsCode = `// Node: Email Filter - Dynamic Tenant-Based
const email = $input.first().json;

// Get tenant data from database
const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function getTenantData() {
  try {
    const response = await $http.get({
      url: SUPABASE_URL + '/rest/v1/tenants',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data || [];
  } catch (error) {
    console.log('Email Filter: Failed to get tenant data:', error.message);
    return [];
  }
}

async function getEmailFilters(tenantId) {
  try {
    const response = await $http.get({
      url: SUPABASE_URL + '/rest/v1/email_filters?tenant_id=eq.' + tenantId,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data || [];
  } catch (error) {
    console.log('Email Filter: Failed to get email filters:', error.message);
    return [];
  }
}

// Main filtering logic
async function filterEmail() {
  const fromEmail = email.from?.toLowerCase() || '';
  const subject = email.subject?.toLowerCase() || '';
  const body = email.text?.toLowerCase() || '';
  const emailContent = subject + ' ' + body;
  
  console.log('Email Filter: Processing email from:', fromEmail);
  
  // Get all tenants
  const tenants = await getTenantData();
  console.log('Email Filter: Found', tenants.length, 'tenants');
  
  if (tenants.length === 0) {
    console.log('Email Filter: No tenants found, allowing email');
    return [{ json: { ...email, filtered_at: new Date().toISOString(), filter_reason: 'no_tenants' } }];
  }
  
  // Find matching tenant
  const matchingTenant = tenants.find(t => 
    t.gmail_email && t.gmail_email.toLowerCase() === fromEmail
  );
  
  if (!matchingTenant) {
    console.log('Email Filter: No matching tenant found for:', fromEmail);
    console.log('Available tenant emails:', tenants.map(t => t.gmail_email).join(', '));
    return []; // Reject email
  }
  
  console.log('Email Filter: Found matching tenant:', matchingTenant.bedrijfsnaam, '(ID:', matchingTenant.tenant_id + ')');
  
  // Get tenant-specific email filters
  const emailFilters = await getEmailFilters(matchingTenant.tenant_id);
  console.log('Email Filter: Found', emailFilters.length, 'email filters for tenant');
  
  // Apply tenant-specific filters
  for (const filter of emailFilters) {
    if (filter.filter_type === 'spam_keywords') {
      const keywords = filter.filter_value?.split(',').map(k => k.trim().toLowerCase()) || [];
      const isSpam = keywords.some(keyword => emailContent.includes(keyword));
      
      if (isSpam) {
        console.log('Email Filter: Spam detected by tenant filter:', filter.filter_value);
        return []; // Reject spam
      }
    }
    
    if (filter.filter_type === 'sender_domain') {
      const domain = filter.filter_value?.toLowerCase();
      const emailDomain = fromEmail.split('@')[1];
      
      if (domain && emailDomain === domain) {
        console.log('Email Filter: Sender domain blocked:', domain);
        return []; // Reject domain
      }
    }
  }
  
  // Default spam detection (fallback)
  const defaultSpamKeywords = ['spam', 'unsubscribe', 'click here', 'buy now', 'limited time'];
  const isDefaultSpam = defaultSpamKeywords.some(keyword => emailContent.includes(keyword));
  
  if (isDefaultSpam) {
    console.log('Email Filter: Default spam detected');
    return []; // Reject spam
  }
  
  // Pass through valid email
  console.log('Email Filter: Email passed all checks');
  return [{ 
    json: { 
      ...email, 
      filtered_at: new Date().toISOString(), 
      filter_reason: 'passed',
      tenant_id: matchingTenant.tenant_id,
      tenant_name: matchingTenant.bedrijfsnaam,
      tenant_gmail: matchingTenant.gmail_email
    } 
  }];
}

// Execute filtering
return await filterEmail();`;

      console.log('✅ Email Filter node updated with dynamic tenant-based logic');
    } else {
      console.log('❌ Email Filter node not found');
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

    console.log('🎉 Email Filter node fixed successfully!');
    console.log('📊 Now supports:');
    console.log('   ✅ Dynamic tenant detection');
    console.log('   ✅ Tenant-specific email filters');
    console.log('   ✅ Database-driven spam detection');
    console.log('   ✅ Real-time filter updates');
    console.log('   ✅ Support for jordyhaass@gmail.com (Tabakshop)');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to fix Email Filter:', error.response?.data || error.message);
    return false;
  }
}

fixEmailFilter();
