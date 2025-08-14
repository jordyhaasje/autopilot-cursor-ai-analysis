# 🤖 AutoPilot - Multi-Tenant AI Customer Service

## 🎯 **Project Overzicht**

**AutoPilot** is een revolutionair multi-tenant AI customer service systeem dat automatisch klantemails beantwoordt voor meerdere bedrijven. Elke tenant heeft zijn eigen AI persona, business rules, en volledig geïsoleerde configuratie.

### **🏆 Wat Wil Je Bereiken?**
Een **volledig automatische, intelligente customer service** die:
- **Multi-tenant** werkt (elk bedrijf zijn eigen AI)
- **Context-bewust** is (begrijpt echte intentie)
- **Empathisch** is (voelt met klant mee)
- **Professioneel** is (altijd correcte toon)
- **Slim** is (leert van interacties)
- **Schaalbaar** is (nieuwe tenants toevoegen)

## 🏗️ **Systeem Architectuur**

### **📊 Database (Supabase)**
```
tenants (bedrijven)
├── tenant_id (uniek)
├── bedrijfsnaam
├── gmail_email (ontvangst email)
├── ai_persona_name
├── ai_signature_html
├── n8n_workflow_id
└── status (pending_approval/active)

tenant_business_rules (regels per bedrijf)
├── tenant_id
├── rule_key (scenario naam)
├── rule_config (JSONB met detectie_woorden, percentages)
└── html_template (email sjabloon)

customer_interactions (klant interacties)
├── tenant_id
├── customer_email
├── type (klacht, retour, dreiging, etc.)
├── compensatie_percentage
├── ladder_stap
├── mood_detected
├── dreiging_detected
└── created_at/updated_at
```

### **🔄 N8N Workflow (26 Nodes)**
```
1. Gmail Trigger (nieuwe email)
2. Email Parser (email ontleden)
3. Email Body Cleaner (HTML opschonen)
4. Get tenant data (tenant bepalen via To: email)
5. Email Filter (check of email verwerkt moet worden)
6. Conversation Thread Lookup (eerdere interacties)
7. Thread ID Generator (unieke thread ID)
8. Get Conversation History (geschiedenis ophalen)
9. AI Context Builder (context samenstellen)
10. Prompt Generator (AI prompt maken)
11. Message a model1 (OpenAI API call)
12. Response Parser (AI response ontleden)
13. Offer Normalizer (compensatie normaliseren)
14. If (dreiging gedetecteerd?)
    ├── Postgres Insert Escalation
    └── Gmail Send Escalation
15. Postgres Store Interaction (opslaan)
16. Gmail Send Normal (antwoord versturen)
17. Mark a message as read
```

## 🧠 **AI Intelligentie - Wat Moet de AI Kunnen?**

### **1. Scenario Detectie & Context Begrip**
```
De AI moet slim genoeg zijn om te begrijpen:
- Is dit een klacht, retour, dreiging, annulering?
- Is de klant boos, teleurgesteld, tevreden?
- Wil de klant echt hulp of is het gewoon een opmerking?
- Wat is de echte intentie achter de woorden?

Voorbeelden van slimme detectie:
✅ "De kleur is anders dan verwacht, maar dat is prima" → Geen probleem
✅ "De maat is te klein, maar ik wil hem houden" → Geen retour nodig
✅ "Ik wil graag een andere kleur" → Wel hulp nodig
✅ "Ik ben teleurgesteld in de kwaliteit" → Klacht, compensatie nodig
```

### **2. Compensatie Ladder Intelligentie**
```
De AI moet de compensatie ladder begrijpen:
- Start met 15% bij eerste probleem
- Verhoog naar 20% bij weigering
- Verhoog naar 30% bij tweede weigering
- Maximaal 50% bij dreigingen
- Nooit dezelfde percentage herhalen
- Altijd de volgende stap aanbieden

Voorbeelden van correcte ladder:
✅ Klant weigert 15% → AI biedt 20% aan
✅ Klant weigert 20% → AI biedt 30% aan
❌ Klant weigert 15% → AI biedt 15% aan (FOUT!)
```

### **3. Multi-Language Support**
```
De AI moet meertalig zijn:
- Nederlands (primair)
- Engels
- Duits
- Automatische taal detectie
- Consistent in dezelfde taal antwoorden
```

### **4. Threat & Escalation Detection**
```
De AI moet dreigingen herkennen:
- "Ik ga een advocaat inschakelen"
- "Ik doe aangifte"
- "Ik ga naar de media"
- "Ik ga klagen bij de ACM"

Bij dreigingen:
- Direct escaleren naar menselijke medewerker
- Hogere compensatie aanbieden (max 50%)
- Professioneel en empathisch blijven
```

## 🚨 **Huidige Problemen & Status**

### **✅ Wat Werkt (Completed)**
- ✅ **Database & Infrastructure**: Volledig werkend
- ✅ **N8N Workflow**: 26 nodes actief
- ✅ **API Connectivity**: N8N en Supabase volledig werkend
- ✅ **Compensatie Ladder**: Geïmplementeerd (15% → 20% → 30% → 50%)
- ✅ **Email Filter**: Service role key geïmplementeerd
- ✅ **Postgres Store Interaction**: Gefixt (updated_at column toegevoegd)

### **❌ KRITIEKE PROBLEMEN (Niet Opgelost)**

#### **1. Te Simpele Detectie**
**Probleem:** AI gebruikt simpele `includes()` check zonder context
**Impact:** 
- "De kleur is anders, maar dat is prima" → AI biedt retour aan
- "De maat is te klein, maar ik wil hem houden" → AI biedt retour aan
**Status:** ❌ **Niet opgelost** - Smart detection nodig

#### **2. Business Rules Loading**
**Probleem:** AI Context Builder laadt mogelijk geen tenant-specifieke business rules
**Impact:** AI krijgt mogelijk verkeerde context
**Status:** ❌ **Niet opgelost** - Tenant-specifieke loading nodig

#### **3. Multi-Tenant Isolation**
**Probleem:** Workflow gebruikt mogelijk hardcoded tenant_id
**Impact:** Alle tenants krijgen dezelfde responses
**Status:** ❌ **Niet opgelost** - Dynamische tenant detection nodig

#### **4. LoveAble Dashboard**
**Probleem:** Workflow duplicatie en admin approval flow niet werkend
**Impact:** Nieuwe tenants kunnen niet actief worden
**Status:** ❌ **Niet opgelost** - Dashboard functionaliteit nodig

## 🔧 **API Keys & Configuratie**

### **N8N Configuration**
```javascript
URL: 'https://primary-production-9667.up.railway.app'
API Key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTcxNzUxLCJleHAiOjE3NTc3MzYwMDB9.sSOhbufmYfF40Zg-UTbmBtKXNh6FG7o9x5hoPjEUIRU'
Workflow ID: 'WP5aiR5vN2A9w91i' // CURSOR AI workflow
```

### **Supabase Configuration**
```javascript
URL: 'https://cgrlfbolenwynpbvfeku.supabase.co'
Anon Key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4'
Service Role Key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc4OTQwOCwiZXhwIjoyMDY5MzY1NDA4fQ.0QKyqBtoHxnn04T3hA0mv5lEbZSKfauysqrNGhMeACY'
```

### **Railway Configuration**
```javascript
Token: '1d744d55-28c7-40ae-8fab-0cf43e17060f'
Name: 'AI Cursor'
```

## 📊 **Database Status**

### **✅ Werkende Tabellen**
- ✅ **tenants** (bedrijven)
- ✅ **tenant_business_rules** (7 records)
- ✅ **master_business_rules** (5 records)
- ✅ **customer_interactions** (met updated_at)
- ✅ **email_filters** (4 records)
- ✅ **conversation_threads**
- ✅ **notifications**
- ✅ **escalations**

### **❌ Ontbrekende Tabellen**
- ❌ **master_scenarios** (bestaat niet)
- ❌ **scenario_rules** (bestaat niet)
- ❌ **scenario_assignments** (bestaat niet)

## 🎯 **Success Metrics**

### **📈 Huidige Status**
- **Database connectivity**: ✅ 100%
- **N8N workflow**: ✅ 100% actief
- **API connectivity**: ✅ 100%
- **Multi-tenant isolation**: ❌ 0%
- **AI intelligentie**: ❌ 30%
- **Context awareness**: ❌ 10%

### **🎯 Doelen**
- **Multi-tenant isolation**: 100%
- **AI intelligentie**: 90%
- **Context awareness**: 85%
- **Customer satisfaction**: 95%
- **Response time**: < 5 minuten
- **Escalation rate**: < 10%

## 🚀 **Volgende Stappen**

### **🔧 PRIORITEIT 1: AI Intelligentie Fixes**
1. **Smart Detection** implementeren (context-bewuste detectie)
2. **Business Rules Loading** fixen (tenant-specifieke loading)
3. **AI Prompt** verbeteren (betere instructies)
4. **Context Analysis** implementeren (positieve indicators)

### **🔧 PRIORITEIT 2: Multi-Tenant Fixes**
1. **Get Tenant Data** node implementeren (dynamische tenant detection)
2. **Tenant Isolation** verifiëren (alle nodes controleren)
3. **Multi-tenant testing** (verschillende tenant emails)

### **🔧 PRIORITEIT 3: LoveAble Dashboard**
1. **Workflow Duplicatie** implementeren (Edge Function)
2. **Admin Approval Flow** implementeren (dashboard functionaliteit)
3. **Real-time Data** per tenant

## 📁 **Belangrijke Bestanden**

### **📋 Analyse & Documentatie**
- **`AI_VISION_AND_REQUIREMENTS.md`**: Complete AI visie en requirements
- **`PROJECT_STATUS.md`**: Gedetailleerde project status en TODO's
- **`BUSINESS_RULES_ANALYSIS.md`**: Business rules analyse en problemen
- **`ORIGINAL_ARCHITECTURE_ANALYSIS.md`**: Originele architectuur analyse
- **`FLOW_LOGIC_COMPARISON.md`**: Vergelijking originele vs huidige flow logica
- **`LOVEABLE_SYSTEM_ANALYSIS.md`**: LoveAble dashboard analyse

### **🔧 Scripts & Tools**
- **`config.js`**: Alle API keys en configuratie
- **`check-business-rules-loading.js`**: Business rules loading verificatie
- **`test-ai-intelligence.js`**: AI intelligentie test
- **`verify-tenant-isolation-fixed.js`**: Tenant isolation verificatie
- **`check-loveable-dashboard.js`**: LoveAble dashboard status check

### **📚 Originele Documentatie**
- **`/Users/jordy/Desktop/Belangrijk/`**: Originele documentatie
  - `LoveAble1.txt`: Database structuur en hooks
  - `LoveAble2.txt`: Multi-tenant flow en koppelingen
  - `Logica database van flow.txt`: N8N flow logica
  - `database autopilot.sql`: Originele database schema

## 🎯 **Testing & Development**

### **🧪 Test Tenant**
```javascript
Tenant ID: 'af738ad1-9275-4f87-8fa6-fe2748771dc6'
Email: [tenant gmail email]
Business Rules: 7 rules geconfigureerd
```

### **🔧 Development Commands**
```bash
# Test business rules loading
node check-business-rules-loading.js

# Test AI intelligence
node test-ai-intelligence.js

# Test tenant isolation
node verify-tenant-isolation-fixed.js

# Test LoveAble dashboard
node check-loveable-dashboard.js
```

## 🎯 **Conclusie**

**De basis infrastructuur werkt perfect**, maar de **AI intelligentie en multi-tenant functionaliteit** hebben kritieke problemen die opgelost moeten worden.

**Prioriteit 1:** Smart detection en business rules loading
**Prioriteit 2:** Multi-tenant isolation  
**Prioriteit 3:** LoveAble dashboard functionaliteit

**De AI moet slimmer worden** om echt context-bewust en empathisch te zijn! 🚀

---

**Repository:** https://github.com/jordyhaasje/autopilot-cursor-ai-analysis
**N8N Workflow:** https://primary-production-9667.up.railway.app/workflow/WP5aiR5vN2A9w91i
**Supabase:** https://cgrlfbolenwynpbvfeku.supabase.co
