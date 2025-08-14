# 🚀 AutoPilot Quick Start Guide voor AI Agent

## 🎯 Wat is AutoPilot?
Multi-tenant AI klantenservice systeem waar elke gebruiker (tenant) zijn eigen geïsoleerde email verwerking krijgt via LoveAble dashboard en N8N workflows.

## 🔑 API Keys (Direct Gebruik)
```javascript
// Supabase Database
SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co'
SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY'

// N8N Workflow (UPDATED)
N8N_URL = 'https://primary-production-9667.up.railway.app'
N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTcxNzUxLCJleHAiOjE3NTc3MzYwMDB9.sSOhbufmYfF40Zg-UTbmBtKXNh6FG7o9x5hoPjEUIRU'
WORKFLOW_ID = 'WP5aiR5vN2A9w91i'
```

## ✅ Status - Alle Issues Opgelost!
- ✅ **Database**: `updated_at` kolom toegevoegd
- ✅ **Compensatie Logica**: AI prompt en normalizer gefixed
- ✅ **Email Filter**: Service role key geïmplementeerd
- ✅ **N8N Workflow**: Actief en werkend

## 🧪 Test het Systeem
1. **Database test**: `node test-complete-system.js`
2. **Compensatie test**: Stuur email met "Nee dankje is te weinig"
3. **Workflow test**: Controleer N8N workflow status

## 📁 Belangrijke Bestanden
- **`PROJECT_STATUS.md`**: Complete project overzicht
- **`config.js`**: Alle API keys en configuratie
- **`test-complete-system.js`**: Complete systeem test
- **`/Users/jordy/Desktop/Belangrijk/`**: Originele documentatie

## 🎯 Volgende Stappen
1. **Test de compensatie logica** met een nieuwe email
2. **Verificatie LoveAble dashboard** functionaliteit
3. **Monitoring** van alle tenant flows
4. **Scaling** voor honderden tenants

## 🏗️ Architectuur
```
Gebruiker registreert → LoveAble Dashboard → Admin keurt goed → 
N8N workflow gedupliceerd → Tenant configureert → AI verwerkt emails
```

**Status**: ✅ Alle major issues opgelost, systeem operationeel  
**Repository**: https://github.com/jordyhaasje/autopilot-cursor-ai-analysis
