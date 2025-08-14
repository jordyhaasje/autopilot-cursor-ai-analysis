# 🚀 AutoPilot Quick Start Guide voor AI Agent

## 🎯 Wat is AutoPilot?
Multi-tenant AI klantenservice systeem waar elke gebruiker (tenant) zijn eigen geïsoleerde email verwerking krijgt via LoveAble dashboard en N8N workflows.

## 🔑 API Keys (Direct Gebruik)
```javascript
// Supabase Database
SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co'
SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY'

// N8N Workflow
N8N_URL = 'https://primary-production-9667.up.railway.app'
N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTY2NTY2LCJleHAiOjE3NTc3MzYwMDB9.awhRu46eFbhMPFAiv7hgFTtxLTIwpxFF7ebmXMkFPiM'
WORKFLOW_ID = 'WP5aiR5vN2A9w91i'
```

## ❌ Bekende Issues (Moet Gefixed Worden)
1. **Database Error**: `column "updated_at" of relation "customer_interactions" does not exist`
2. **Email Filter**: Node gebruikt oude Supabase key

## 🔧 Directe Fix (PRIORITEIT)
Voer dit uit in Supabase SQL Editor:
```sql
ALTER TABLE customer_interactions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE customer_interactions 
SET updated_at = created_at 
WHERE updated_at IS NULL;
```

## 📁 Belangrijke Bestanden
- **`PROJECT_STATUS.md`**: Complete project overzicht
- **`config.js`**: Alle API keys en configuratie
- **`fix-database-correct.sql`**: Database fix script
- **`/Users/jordy/Desktop/Belangrijk/`**: Originele documentatie

## 🎯 Volgende Stappen
1. **Database fix** uitvoeren
2. **N8N workflow testen**
3. **Email Filter node updaten**
4. **Complete systeem testen**

## 🏗️ Architectuur
```
Gebruiker registreert → LoveAble Dashboard → Admin keurt goed → 
N8N workflow gedupliceerd → Tenant configureert → AI verwerkt emails
```

**Status**: Database fix nodig, workflow operationeel  
**Repository**: https://github.com/jordyhaasje/autopilot-cursor-ai-analysis
