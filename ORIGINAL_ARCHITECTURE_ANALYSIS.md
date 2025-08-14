# 🏗️ Originele AutoPilot Architectuur Analyse

## 📋 **Basis Multi-Tenant Structuur (Origineel)**

### **🔐 Tenant Isolation & RLS**
```
auth.users → profiles → tenants → ALL DATA
```
- **Elke gebruiker** krijgt een `profile` gekoppeld aan `auth.users`
- **Elke tenant** heeft een unieke `tenant_id` 
- **Alle data** is geïsoleerd per tenant via RLS policies
- **Admins** kunnen alle data zien, gebruikers alleen hun eigen tenant

### **📊 Database Tabellen (17 totaal)**
```
Core Systeem:
├── tenants (hoofdtabel voor bedrijven)
├── profiles (gebruikersprofielen)
└── system_logs (audit trail)

Klantinteractie:
├── customer_interactions (alle emails/interacties)
├── conversation_threads (gesprek geschiedenis)
├── notifications (meldingen/alerts)
└── escalations (geëscaleerde zaken)

Business Rules:
├── master_business_rules (templates)
├── tenant_business_rules (tenant-specifiek)
├── master_scenarios (voorgedefinieerd)
├── scenario_rules (rules per scenario)
└── scenario_assignments (toewijzingen)

Live Chat:
├── chat_sessions (chat sessies)
├── chat_messages (berichten)
└── admin_availability (online status)

Filters & Leads:
├── email_filters (email filtering)
└── leads (contact/demo aanvragen)
```

## 🎯 **Hoe Werkt de Multi-Tenant Flow?**

### **1. Registratie & Tenant Creation**
```
Gebruiker registreert → auth.users aangemaakt → profile aangemaakt → 
Tenant aangemaakt (status: pending_approval) → Admin keurt goed → 
Profile gekoppeld aan tenant → Workflow gedupliceerd
```

### **2. Data Isolation per Tenant**
```sql
-- Alle queries zijn tenant-gebaseerd
SELECT * FROM customer_interactions 
WHERE tenant_id = get_user_tenant_id()

-- RLS policies zorgen voor automatische filtering
CREATE POLICY "Users can only see their own tenant data" 
ON customer_interactions FOR ALL 
USING (tenant_id = get_user_tenant_id())
```

### **3. Business Rules per Tenant**
```json
{
  "rule_key": "compensatie_ladder",
  "rule_config": {
    "stappen": [15, 20, 30, 50],
    "max_stappen": 4,
    "detectie_woorden": ["weiger", "niet genoeg", "te weinig"]
  },
  "html_template": "<p>We bieden je {{percentage}}% compensatie aan...</p>"
}
```

## 🔄 **Originele N8N Flow Logica**

### **Flow Stappen:**
1. **Gmail Trigger** → Nieuwe email ontvangen
2. **Email Parser** → Klantnaam, email, body extraheren
3. **Body Cleaner** → HTML, handtekeningen, replies verwijderen
4. **Get Tenant Data** → Tenant info ophalen via ontvangend email
5. **Thread Lookup** → Bestaande conversatie zoeken/aanmaken
6. **Get Conversation History** → Laatste 5 interacties ophalen
7. **AI Context Builder** → Prompt samenstellen met:
   - Business rules detectie
   - Mood/emotie analyse
   - Compensatie ladder berekening
   - Dreiging detectie
   - Taalherkenning
8. **Prompt Generator** → AI instructies samenstellen
9. **OpenAI Call** → AI response genereren
10. **Response Parser** → JSON output parsen
11. **Offer Normalizer** → Compensatie percentage normaliseren
12. **Database Inserts** → Interactie, notifications, escalations opslaan
13. **Gmail Send** → Response naar klant sturen

### **Business Rules Detectie:**
```javascript
// Voor elke business rule:
if (cleaned_body.includes(detectie_woord)) {
  // Regel wordt getriggerd
  // AI krijgt instructie mee
  // HTML template beschikbaar
}
```

## 🎯 **Wat Was de Bedoeling?**

### **Multi-Tenant Dashboard (LoveAble)**
- **Elke tenant** heeft eigen dashboard
- **Configuratie** van business rules per tenant
- **Email filters** per tenant
- **AI persona** per tenant (naam, signature, tone)
- **Compensatie regels** per tenant
- **Notificaties** per tenant

### **Automatische Workflow Duplicatie**
- **Nieuwe tenant** → **N8N workflow gedupliceerd**
- **Unieke workflow ID** per tenant
- **Tenant-specifieke configuratie** in workflow
- **Geïsoleerde email verwerking** per tenant

### **Business Rules Engine**
- **Master templates** voor standaard regels
- **Tenant-specifieke aanpassingen** mogelijk
- **Detectie woorden** per scenario
- **HTML templates** voor AI responses
- **Compensatie ladders** per tenant

## 🔍 **Wat Hebben We Behouden?**

### **✅ Nog Intact:**
- **Multi-tenant database structuur**
- **RLS policies** voor data isolatie
- **Tenant-based workflow** (WP5aiR5vN2A9w91i)
- **Business rules systeem**
- **Email filters** per tenant
- **Compensatie ladder logica**

### **❓ Mogelijk Gewijzigd:**
- **Workflow duplicatie** (momenteel 1 workflow voor alle tenants)
- **Tenant-specifieke configuratie** in workflow
- **Business rules detectie** in AI Context Builder
- **Email filter implementatie**

## 🚨 **Kritieke Vragen:**

### **1. Workflow Duplicatie**
- **Origineel**: Elke tenant had eigen workflow
- **Nu**: 1 workflow voor alle tenants
- **Vraag**: Hoe wordt tenant-specifieke configuratie bepaald?

### **2. Business Rules Implementatie**
- **Origineel**: Rules werden geladen per tenant
- **Nu**: Worden alle rules geladen?
- **Vraag**: Hoe wordt de juiste tenant bepaald?

### **3. Email Filtering**
- **Origineel**: Filters per tenant
- **Nu**: Worden filters correct toegepast?
- **Vraag**: Hoe wordt tenant_id bepaald in Email Filter node?

## 📝 **Aanbevelingen:**

### **1. Verificatie Multi-Tenant**
```javascript
// Controleer in elke node:
const tenant_id = await getTenantIdFromEmail(to_email);
// of
const tenant_id = await getTenantIdFromWorkflow();
```

### **2. Business Rules Loading**
```javascript
// In AI Context Builder:
const tenantRules = await getTenantBusinessRules(tenant_id);
// Niet alle rules voor alle tenants
```

### **3. Workflow Configuratie**
- **Optie A**: Terug naar workflow duplicatie per tenant
- **Optie B**: Dynamische tenant detectie in huidige workflow
- **Optie C**: Tenant-specifieke configuratie via database

## 🎯 **Conclusie:**

De **basis multi-tenant architectuur** staat nog steeds goed, maar we moeten **verificeren** of:
1. **Tenant isolation** correct werkt in de huidige workflow
2. **Business rules** per tenant worden geladen
3. **Email filters** per tenant worden toegepast
4. **Workflow configuratie** tenant-specifiek is

**Status**: Basis architectuur intact, maar verificatie nodig voor tenant-specifieke functionaliteit.
