const axios = require('axios');

const N8N_URL = 'https://primary-production-9667.up.railway.app';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTY2NTY2LCJleHAiOjE3NTc3MzYwMDB9.awhRu46eFbhMPFAiv7hgFTtxLTIwpxFF7ebmXMkFPiM';

async function updateN8NCorrectKey() {
  console.log('🔧 Updating N8N Email Filter Node with Correct API Key...\n');

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

    // Find Email Filter node
    const emailFilterNode = workflow.nodes.find(node => node.name === 'Email Filter');
    if (!emailFilterNode) {
      console.log('❌ Email Filter node not found');
      return;
    }

    console.log('📧 Found Email Filter node, updating code...');

    // Updated Email Filter code with service role key
    const updatedCode = `// Node: Email Filter - Multi-Tenant Support
const email = $input.first().json;

// Get tenant data from database
const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY';

async function getTenantData() {
  try {
    const response = await $http.get({
      url: SUPABASE_URL + '/rest/v1/tenants',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data || [];
  } catch (error) {
    console.log('Email Filter: Failed to get tenant data:', error.message);
    return [];
  }
}

async function getEmailFilters() {
  try {
    const response = await $http.get({
      url: SUPABASE_URL + '/rest/v1/email_filters',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_SERVICE_ROLE_KEY,
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
  const toEmail = email.to?.toLowerCase() || '';
  const subject = email.subject?.toLowerCase() || '';
  const body = email.text?.toLowerCase() || '';
  const emailContent = subject + ' ' + body;
  
  console.log('Email Filter: Processing email from:', fromEmail, 'to:', toEmail);
  
  // Get all tenants
  const tenants = await getTenantData();
  console.log('Email Filter: Found', tenants.length, 'tenants');
  
  if (tenants.length === 0) {
    console.log('Email Filter: No tenants found, allowing email');
    return [{ json: { ...email, filtered_at: new Date().toISOString(), filter_reason: 'no_tenants' } }];
  }
  
  // Find target tenant (who receives the email)
  const targetTenant = tenants.find(t => 
    t.gmail_email && t.gmail_email.toLowerCase() === toEmail
  );
  
  if (!targetTenant) {
    console.log('Email Filter: No target tenant found for:', toEmail);
    console.log('Available tenant emails:', tenants.map(t => t.gmail_email).join(', '));
    return []; // Reject email - no valid tenant
  }
  
  console.log('Email Filter: Found target tenant:', targetTenant.bedrijfsnaam, '(ID:', targetTenant.tenant_id + ')');
  
  // Get all email filters
  const emailFilters = await getEmailFilters();
  console.log('Email Filter: Found', emailFilters.length, 'email filters total');
  
  // Get email filters for THIS specific tenant
  const tenantFilters = emailFilters.filter(f => f.tenant_id === targetTenant.tenant_id);
  console.log('Email Filter: Found', tenantFilters.length, 'email filters for tenant:', targetTenant.bedrijfsnaam);
  
  // Apply email filters for this specific tenant
  for (const filter of tenantFilters) {
    console.log('Email Filter: Checking filter:', filter.email_address, 'Type:', filter.filter_type);
    
    // Check email address filters
    if (filter.email_address && filter.filter_type === 'spam') {
      const filterEmail = filter.email_address.toLowerCase();
      if (fromEmail === filterEmail) {
        console.log('Email Filter: Email blocked by spam filter for tenant:', targetTenant.bedrijfsnaam);
        console.log('Blocked email:', filter.email_address);
        console.log('Reason:', filter.reason);
        return []; // Reject email
      }
    }
    
    // Check domain filters
    if (filter.domain && filter.filter_type === 'spam') {
      const filterDomain = filter.domain.toLowerCase();
      const emailDomain = fromEmail.split('@')[1];
      
      if (emailDomain === filterDomain) {
        console.log('Email Filter: Domain blocked by spam filter for tenant:', targetTenant.bedrijfsnaam);
        console.log('Blocked domain:', filter.domain);
        return []; // Reject email
      }
    }
    
    // Check blacklist filters
    if (filter.email_address && filter.filter_type === 'blacklist') {
      const filterEmail = filter.email_address.toLowerCase();
      if (fromEmail === filterEmail) {
        console.log('Email Filter: Email blocked by blacklist for tenant:', targetTenant.bedrijfsnaam);
        console.log('Blocked email:', filter.email_address);
        return []; // Reject email
      }
    }
  }
  
  // Default spam detection (fallback)
  const defaultSpamKeywords = ['spam', 'unsubscribe', 'click here', 'buy now', 'limited time'];
  const isDefaultSpam = defaultSpamKeywords.some(keyword => emailContent.includes(keyword));
  
  if (isDefaultSpam) {
    console.log('Email Filter: Default spam detected for tenant:', targetTenant.bedrijfsnaam);
    return []; // Reject spam
  }
  
  // Pass through valid email
  console.log('Email Filter: Email passed all checks for tenant:', targetTenant.bedrijfsnaam);
  return [{ 
    json: { 
      ...email, 
      filtered_at: new Date().toISOString(), 
      filter_reason: 'passed',
      tenant_id: targetTenant.tenant_id,
      tenant_name: targetTenant.bedrijfsnaam,
      tenant_gmail: targetTenant.gmail_email,
      target_tenant_detected: true
    } 
  }];
}

// Execute filtering
return await filterEmail();`;

    // Update the node
    emailFilterNode.parameters.jsCode = updatedCode;

    // Update workflow
    console.log('📤 Updating workflow...');
    const updateResponse = await axios.put(
      `${N8N_URL}/api/v1/workflows/WP5aiR5vN2A9w91i`,
      workflow,
      {
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Email Filter node updated successfully!');
    console.log('🔧 Changes made:');
    console.log('   - Updated to use service role key');
    console.log('   - Can now read email filters from database');
    console.log('   - Multi-tenant filtering enabled');
    console.log('   - Real-time update completed');

  } catch (error) {
    console.error('❌ Failed to update Email Filter node:', error.response?.data || error.message);
  }
}

updateN8NCorrectKey();
