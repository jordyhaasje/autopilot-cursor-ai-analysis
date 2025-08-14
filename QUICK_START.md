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

## 🚨 **CRITIEK: Multi-Tenant Probleem Geïdentificeerd**

### **❌ Get Tenant Data Node Ontbreekt**
- **Probleem**: Workflow kan tenant niet dynamisch bepalen
- **Impact**: Alle tenants gebruiken mogelijk dezelfde configuratie
- **Oplossing**: Get Tenant Data node toevoegen

### **❓ AI Context Builder Issues**
- **Probleem**: Laadt mogelijk alle business rules voor alle tenants
- **Impact**: AI krijgt verkeerde context voor specifieke tenant
- **Oplossing**: Tenant-specifieke business rules loading

## 🧪 Test het Systeem
1. **Database test**: `node test-complete-system.js`
2. **Tenant isolation test**: `node verify-tenant-isolation-fixed.js`
3. **Compensatie test**: Stuur email met "Nee dankje is te weinig"
4. **Multi-tenant test**: Stuur emails naar verschillende tenant addresses

## 📁 Belangrijke Bestanden
- **`PROJECT_STATUS.md`**: Complete project overzicht
- **`ORIGINAL_ARCHITECTURE_ANALYSIS.md`**: Originele architectuur analyse
- **`config.js`**: Alle API keys en configuratie
- **`test-complete-system.js`**: Complete systeem test
- **`/Users/jordy/Desktop/Belangrijk/`**: Originele documentatie

## 🎯 Volgende Stappen (PRIORITEIT)
1. **🔧 Add Get Tenant Data node** - CRITIEK voor multi-tenant functionaliteit
2. **🔧 Update AI Context Builder** - Tenant-specifieke business rules loading
3. **🧪 Test multi-tenant isolation** - Verificatie met verschillende tenant emails
4. **📊 Verificatie LoveAble dashboard** functionaliteit
5. **🚀 Scaling** voor honderden tenants

## 🏗️ Architectuur (Origineel vs Nu)
```
Origineel: Gebruiker registreert → LoveAble Dashboard → Admin keurt goed → 
N8N workflow gedupliceerd → Tenant configureert → AI verwerkt emails

Nu: Gebruiker registreert → LoveAble Dashboard → Admin keurt goed → 
1 workflow voor alle tenants → Tenant detection ontbreekt → AI gebruikt mogelijk verkeerde configuratie
```

## 🚨 **IMMEDIATE ACTIONS NEEDED:**
1. **Add Get Tenant Data node** to determine tenant from email
2. **Update AI Context Builder** to load tenant-specific business rules  
3. **Ensure all nodes use tenant_id** from Get Tenant Data
4. **Test with emails** to different tenant addresses

**Status**: ✅ Compensatie logica gefixed, ❌ Multi-tenant isolation problemen geïdentificeerd  
**Repository**: https://github.com/jordyhaasje/autopilot-cursor-ai-analysis
