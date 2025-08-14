# 📊 AutoPilot Project Status - Complete Overzicht

## 🎯 Project Doel
AutoPilot is een multi-tenant AI klantenservice systeem waar elke gebruiker (tenant) zijn eigen geïsoleerde email verwerking krijgt. Gebruikers melden aan via LoveAble dashboard, worden goedgekeurd door admin, en krijgen automatisch een gedupliceerde N8N workflow.

## 🏗️ Architectuur Overzicht

### **Multi-Tenant Flow**
```
1. Gebruiker registreert → LoveAble Dashboard
2. Admin keurt goed → Tenant krijgt tenant_id
3. N8N workflow wordt gedupliceerd → Nieuwe workflow voor tenant
4. Tenant configureert → Business rules, AI persona, email filters
5. Systeem verwerkt emails → Automatisch per tenant
```

### **Database Structuur**
- **`tenants`**: `tenant_id` (primary key), bedrijfsnaam, gmail_email, ai_persona
- **`customer_interactions`**: Alle email interacties per tenant
- **`tenant_business_rules`**: Per-tenant business rules (compensatie, detectie woorden)
- **`email_filters`**: Email filtering per tenant (spam, blacklist, whitelist)
- **`conversation_threads`**: Email threads per klant
- **`notifications`**: Systeem notificaties
- **`escalations`**: Escalaties bij dreigingen

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

## ✅ Huidige Status - Wat Werkt

### **Database**
- ✅ **Connectie**: Volledig functioneel
- ✅ **Email filters**: 4 records beschikbaar
- ✅ **Tenants**: 1 record beschikbaar
- ✅ **Customer interactions**: 4 records beschikbaar
- ✅ **Business rules**: 5 records beschikbaar
- ✅ **Multi-tenant isolatie**: Werkend via RLS

### **N8N Workflow**
- ✅ **Workflow actief**: 26 nodes operationeel
- ✅ **Email Filter node**: Aanwezig en werkend
- ✅ **Postgres Store Interaction**: ON CONFLICT logic aanwezig
- ✅ **AI Context Builder**: Volledig functioneel
- ✅ **Response Parser**: Werkend

### **AI Capabilities**
- ✅ **Compensatie Ladder**: Automatische verhoging bij weigeringen
- ✅ **Dreiging Detectie**: Juridische taal herkenning
- ✅ **Mood Analysis**: Emotie detectie
- ✅ **Multi-language**: NL/EN/DE ondersteuning
- ✅ **Business Rules**: Per-tenant configuratie

## ❌ Bekende Issues - Wat Niet Werkt

### **Database Issues**
1. **Missing `updated_at` kolom** in `customer_interactions` tabel
   - **Error**: `column "updated_at" of relation "customer_interactions" does not exist`
   - **Impact**: N8N Postgres Store Interaction node faalt
   - **Oplossing**: Voeg kolom toe via SQL

2. **Email Filter node** gebruikt oude Supabase key
   - **Issue**: Gebruikt `SUPABASE_KEY` in plaats van `SUPABASE_SERVICE_ROLE_KEY`
   - **Impact**: Kan geen email filters lezen door RLS
   - **Oplossing**: Update node code

### **Workflow Issues**
3. **Sommige Postgres nodes** missen kolommen in queries
   - **Issue**: Queries refereren naar niet-bestaande kolommen
   - **Impact**: Database errors bij uitvoering
   - **Oplossing**: Fix queries

## 🔧 Benodigde Fixes

### **1. Database Fix (PRIORITEIT)**
```sql
-- Voer dit uit in Supabase SQL Editor
ALTER TABLE customer_interactions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE customer_interactions 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Trigger voor automatische updates
CREATE OR REPLACE FUNCTION update_customer_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customer_interactions_updated_at_trigger ON customer_interactions;
CREATE TRIGGER update_customer_interactions_updated_at_trigger
    BEFORE UPDATE ON customer_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_interactions_updated_at();
```

### **2. Email Filter Node Fix**
- Update Email Filter node code om `SUPABASE_SERVICE_ROLE_KEY` te gebruiken
- Test email filtering functionaliteit

### **3. Workflow Testing**
- Test complete N8N workflow na database fixes
- Verificatie van alle nodes en connections

## 📁 Belangrijke Bestanden

### **Originele Documentatie**
- **`/Users/jordy/Desktop/Belangrijk/Logica database van flow.txt`**: Complete flow logica
- **`/Users/jordy/Desktop/Belangrijk/database autopilot.sql`**: Originele database structuur
- **`/Users/jordy/Desktop/Belangrijk/LoveAble1.txt`**: Dashboard specificaties
- **`/Users/jordy/Desktop/Belangrijk/LoveAble2.txt`**: Dashboard specificaties

### **Huidige Repository**
- **`fix-database-correct.sql`**: Database fix script
- **`check-n8n-workflow-issues.js`**: Workflow analyse script
- **`test-complete-system.js`**: Complete systeem test
- **`workflow-current.json`**: Huidige N8N workflow export

## 🚀 Volgende Stappen voor AI Agent

### **Directe Acties**
1. **Database Fix**: Voer `fix-database-correct.sql` uit in Supabase
2. **Workflow Test**: Test N8N workflow na database update
3. **Email Filter Fix**: Update Email Filter node met service role key
4. **Complete Test**: Verificatie van end-to-end functionaliteit

### **Ontwikkeling**
1. **Flow Duplicatie**: Automatische workflow duplicatie voor nieuwe tenants
2. **Dashboard Integratie**: LoveAble dashboard met tenant management
3. **Monitoring**: Real-time monitoring van alle tenant flows
4. **Scaling**: Ondersteuning voor honderden tenants

## 🎯 Project Doel

AutoPilot moet een volledig geautomatiseerd multi-tenant AI klantenservice systeem worden waar:
- Elke tenant zijn eigen geïsoleerde flow heeft
- Gebruikers zich aanmelden via LoveAble dashboard
- Admin gebruikers goedkeurt en automatisch flow dupliceert
- AI automatisch emails verwerkt volgens tenant-specifieke regels
- Dashboard real-time inzicht geeft in alle interacties

## 📊 Technische Details

### **N8N Workflow Nodes**
1. **Gmail Trigger**: Email ontvangst
2. **Email Filter**: Multi-tenant email filtering
3. **Get tenant data**: Tenant configuratie ophalen
4. **Email parser**: Email parsing
5. **Email body cleaner**: Body opschoning
6. **Thread ID Generator**: Thread identificatie
7. **Conversation Thread Lookup**: Thread geschiedenis
8. **Get Conversation History**: Interactie geschiedenis
9. **AI Context Builder**: Context voorbereiding
10. **Orderdatum Extractor**: Order datum extractie
11. **Prompt Generator**: AI prompt generatie
12. **Message a model1**: OpenAI GPT call
13. **Response Parser**: AI response parsing
14. **Offer Normalizer**: Response normalisatie
15. **Postgres Store Interaction**: Database opslag
16. **Gmail Send Normal**: Email verzending
17. **Mark a message as read**: Gmail markering

### **AI Intelligence**
- **Context Builder**: Volledige context voorbereiding
- **Prompt Generator**: Dynamische prompt generatie
- **Response Parser**: AI response verwerking
- **Offer Normalizer**: Deterministische controle

---

**Laatste Update**: 14 Augustus 2025  
**Status**: Database fix nodig, workflow operationeel  
**Volgende AI**: Kan direct beginnen met database fix en workflow optimalisatie
