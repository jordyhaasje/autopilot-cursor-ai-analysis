// AutoPilot Configuration - Alle API Keys en Instellingen
// Voor gebruik door AI agents en ontwikkelaars

module.exports = {
  // Supabase Database Configuration
  supabase: {
    url: 'https://cgrlfbolenwynpbvfeku.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY',
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY'
  },

  // N8N Workflow Configuration
  n8n: {
    url: 'https://primary-production-9667.up.railway.app',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTY2NTY2LCJleHAiOjE3NTc3MzYwMDB9.awhRu46eFbhMPFAiv7hgFTtxLTIwpxFF7ebmXMkFPiM',
    workflowId: 'WP5aiR5vN2A9w91i' // CURSOR AI workflow
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

  // Current Status
  status: {
    databaseConnection: 'working',
    emailFilters: '4 records available',
    n8nWorkflow: 'active (26 nodes)',
    knownIssues: [
      'Missing updated_at column in customer_interactions',
      'Email Filter node uses old Supabase key'
    ]
  },

  // Required Fixes
  fixes: {
    database: {
      priority: 'high',
      description: 'Add updated_at column to customer_interactions table',
      sqlFile: 'fix-database-correct.sql'
    },
    emailFilter: {
      priority: 'medium',
      description: 'Update Email Filter node to use service role key',
      nodeName: 'Email Filter'
    }
  }
};
