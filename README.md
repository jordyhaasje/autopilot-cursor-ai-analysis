# 🚀 AutoPilot - Multi-Tenant AI Customer Service System

## 📋 Project Overzicht

AutoPilot is een geavanceerd multi-tenant AI klantenservice systeem dat automatisch emails verwerkt en beantwoordt. Elke tenant (klant) krijgt zijn eigen geïsoleerde flow met configuratie, business rules en AI persona.

## 🏗️ Architectuur

### **Multi-Tenant Systeem**
- **Tenant = Gebruiker**: Elke gebruiker krijgt een eigen tenant met unieke `tenant_id`
- **LoveAble Dashboard**: Frontend waar tenants hun configuratie beheren
- **N8N Workflows**: Automatische email verwerking per tenant
- **Supabase Database**: Multi-tenant data opslag met Row Level Security (RLS)

### **Flow Proces**
1. **Registratie**: Gebruiker meldt aan via LoveAble dashboard
2. **Goedkeuring**: Admin keurt gebruiker goed → krijgt `tenant_id`
3. **Flow Duplicatie**: N8N workflow wordt gedupliceerd voor nieuwe tenant
4. **Configuratie**: Tenant configureert business rules, AI persona, email filters
5. **Live Processing**: Systeem verwerkt automatisch emails voor deze tenant

## 🔑 API Keys & Configuratie

### **Supabase Database**
```javascript
SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY'
SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY'
```

### **N8N Workflow**
```javascript
N8N_URL = 'https://primary-production-9667.up.railway.app'
N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTY2NTY2LCJleHAiOjE3NTc3MzYwMDB9.awhRu46eFbhMPFAiv7hgFTtxLTIwpxFF7ebmXMkFPiM'
WORKFLOW_ID = 'WP5aiR5vN2A9w91i' // CURSOR AI workflow
```

## 📊 Database Structuur

### **Hoofdtabellen**
- **`tenants`**: Tenant configuratie (tenant_id, bedrijfsnaam, gmail_email, ai_persona)
- **`customer_interactions`**: Alle email interacties per tenant
- **`tenant_business_rules`**: Business rules per tenant (compensatie, detectie woorden)
- **`email_filters`**: Email filtering per tenant (spam, blacklist, whitelist)
- **`conversation_threads`**: Email threads per klant
- **`notifications`**: Systeem notificaties
- **`escalations`**: Escalaties bij dreigingen

### **Row Level Security (RLS)**
- Elke tenant ziet alleen zijn eigen data
- Service role key bypassed RLS voor N8N workflows
- Anon key onderhevig aan RLS voor dashboard

## 🤖 AI Capabilities

### **Automatische Detectie**
- **Compensatie Ladder**: Automatische verhoging bij weigeringen
- **Dreiging Detectie**: Herkenning van juridische/agressieve taal
- **Mood Analysis**: Emotie herkenning voor gepaste responses
- **Scenario Matching**: Retour, annulering, adreswijziging, levering
- **Multi-language**: NL/EN/DE ondersteuning

### **Business Rules**
- **Detectie Woorden**: Automatische trigger van regels
- **HTML Templates**: Voorgedefinieerde responses
- **Compensatie Percentages**: Configuratie per scenario
- **Escalatie Regels**: Automatische escalatie bij dreigingen

## 🔧 Huidige Status

### **✅ Wat Werkt**
- Database connectie volledig functioneel
- Email filters werkend (4 records beschikbaar)
- N8N workflow actief (26 nodes)
- Multi-tenant isolatie werkend
- Business rules systeem operationeel

### **⚠️ Bekende Issues**
1. **Missing `updated_at` kolom** in `customer_interactions` tabel
2. **Email Filter node** gebruikt nog oude Supabase key
3. **Database schema** moet bijgewerkt worden

### **🔧 Benodigde Fixes**
```sql
-- Voer dit uit in Supabase SQL Editor
ALTER TABLE customer_interactions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE customer_interactions 
SET updated_at = created_at 
WHERE updated_at IS NULL;
```

## 📁 Project Structuur

### **Belangrijke Bestanden**
- **`/Users/jordy/Desktop/Belangrijk/`**: Originele database structuur en logica
- **`/Users/jordy/Desktop/Vandaag cursor/`**: Huidige werkbestanden
- **`/Users/jordy/Desktop/Oude data/`**: Historische data en vergelijkingen

### **Repository Bestanden**
- **`fix-database-correct.sql`**: Database fix script
- **`check-n8n-workflow-issues.js`**: Workflow analyse script
- **`test-complete-system.js`**: Complete systeem test
- **`workflow-current.json`**: Huidige N8N workflow export

## 🚀 Volgende Stappen

### **Voor AI Agent**
1. **Database Fix**: Voer `fix-database-correct.sql` uit in Supabase
2. **Workflow Test**: Test N8N workflow na database update
3. **Email Filter Fix**: Update Email Filter node met service role key
4. **Dashboard Test**: Verificatie LoveAble dashboard functionaliteit

### **Voor Ontwikkeling**
1. **Flow Duplicatie**: Automatische workflow duplicatie voor nieuwe tenants
2. **Dashboard Integratie**: LoveAble dashboard met tenant management
3. **Monitoring**: Real-time monitoring van alle tenant flows
4. **Scaling**: Ondersteuning voor honderden tenants

## 📚 Documentatie

### **Originele Documentatie**
- **`Logica database van flow.txt`**: Complete flow logica
- **`database autopilot.sql`**: Originele database structuur
- **`LoveAble1.txt` & `LoveAble2.txt`**: Dashboard specificaties

### **Huidige Status**
- **Repository**: https://github.com/jordyhaasje/autopilot-cursor-ai-analysis
- **N8N Workflow**: https://primary-production-9667.up.railway.app/workflow/WP5aiR5vN2A9w91i
- **Supabase Dashboard**: https://cgrlfbolenwynpbvfeku.supabase.co

## 🎯 Project Doel

AutoPilot moet een volledig geautomatiseerd multi-tenant AI klantenservice systeem worden waar:
- Elke tenant zijn eigen geïsoleerde flow heeft
- Gebruikers zich aanmelden via LoveAble dashboard
- Admin gebruikers goedkeurt en automatisch flow dupliceert
- AI automatisch emails verwerkt volgens tenant-specifieke regels
- Dashboard real-time inzicht geeft in alle interacties

---

**Laatste Update**: 14 Augustus 2025  
**Status**: Database fix nodig, workflow operationeel  
**Volgende AI**: Kan direct beginnen met database fix en workflow optimalisatie
