// AutoPilot Configuration - Alle API Keys en Instellingen
// Voor gebruik door AI agents en ontwikkelaars

module.exports = {
  // Supabase Database Configuration
  supabase: {
    url: 'https://cgrlfbolenwynpbvfeku.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY'
  },

  // N8N Workflow Configuration (UPDATED)
  n8n: {
    url: 'https://primary-production-9667.up.railway.app',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTcxNzUxLCJleHAiOjE3NTc3MzYwMDB9.sSOhbufmYfF40Zg-UTbmBtKXNh6FG7o9x5hoPjEUIRU',
    workflowId: 'WP5aiR5vN2A9w91i', // CURSOR AI workflow
    name: 'Cursor 1'
  },

  // Railway Configuration (Alternative)
  railway: {
    token: '1d744d55-28c7-40ae-8fab-0cf43e17060f',
    name: 'AI Cursor'
  },

  // Database Tables
  tables: {
    tenants: 'tenants',
    customerInteractions: 'customer_interactions',
    tenantBusinessRules: 'tenant_business_rules',
    emailFilters: 'email_filters',
    conversationThreads: 'conversation_threads',
    notifications: 'notifications',
    escalations: 'escalations'
  },

  // Project Paths
  paths: {
    originalDatabase: '/Users/jordy/Desktop/Belangrijk/database autopilot.sql',
    originalLogic: '/Users/jordy/Desktop/Belangrijk/Logica database van flow.txt',
    loveAbleDocs: '/Users/jordy/Desktop/Belangrijk/LoveAble1.txt',
    currentWork: '/Users/jordy/Desktop/Vandaag cursor/',
    oldData: '/Users/jordy/Desktop/Oude data/'
  },

  // Current Status (UPDATED)
  status: {
    databaseConnection: 'working',
    emailFilters: '4 records available',
    n8nWorkflow: 'active (26 nodes)',
    databaseFixed: 'updated_at column exists',
    compensationLogicFixed: 'prompt and normalizer updated',
    knownIssues: [
      'All major issues resolved'
    ]
  },

  // Required Fixes (UPDATED)
  fixes: {
    database: {
      priority: 'completed',
      description: 'updated_at column added to customer_interactions table',
      status: '✅ FIXED'
    },
    emailFilter: {
      priority: 'completed',
      description: 'Email Filter node uses service role key',
      status: '✅ FIXED'
    },
    compensationLogic: {
      priority: 'completed',
      description: 'AI prompt and normalizer updated to fix ladder progression',
      status: '✅ FIXED'
    }
  }
};
