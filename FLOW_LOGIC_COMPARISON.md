# 🔄 Flow Logica Vergelijking - Origineel vs Huidige Implementatie

## 📋 **Originele Flow Logica (Uit Logica database van flow.txt)**

### **🔄 Complete Flow Stappen (Origineel)**
```
1. Inkomende e-mail wordt ontvangen
   - Gmail trigger node vangt nieuwe ongelezen e-mails op
   - Data: headers (From, To, Subject), body, threadId

2. Parsing & Schoonmaken
   - Email Parser: klantnaam, e-mailadres, onderwerp, body, ontvangstdatum
   - Body Cleaner: verwijdert oude replies, HTML, handtekeningen
   - Resultaat: "cleaned_body"

3. Tenant en Business Rules ophalen
   - Get Tenant Data: zoekt tenant via ontvangend e-mailadres (To:)
   - Haalt tenant-specifieke instellingen op
   - Alle business rules voor deze tenant uit tenant_business_rules

4. Thread & Interactiegeschiedenis ophalen
   - Thread Lookup: checkt bestaande thread (customer_email + tenant_id)
   - Get Conversation History: laatste 5+ interacties voor context

5. Context Builder / AI Prompt samenstellen
   - Klantnaam: herkend uit handtekening, body, e-mail
   - Mood detectie: negatieve/positieve woorden
   - Detectie van scenario's via business rules
   - Compensatieladder: stap = weigeringen + 1
   - Dreiging detectie: juridische/agressieve taal
   - Taalherkenning: NL/EN/DE
   - Days-since-order: uit tekst of history
   - Klantgeschiedenis: laatste AI-antwoorden & klantreacties
   - Regels uit business rules: actieve regels en HTML templates

6. AI Model / OpenAI Call
   - AI bedenkt antwoord op basis van ALLE context
   - Bepaalt scenario, ladder stap, dreiging, retouradres, mood/taal
   - Output: HTML reactie + JSON object

7. Response Parser & Output Mapping
   - Extract alle velden uit AI-output
   - Checkt extra acties (notification/escalation)

8. Database Inserts
   - Store Interaction: opslag in customer_interactions
   - Update thread met laatste context
   - Insert Notification/Escalation indien nodig

9. Antwoord versturen naar klant
   - Gmail Send: AI-gegenereerde mail terug
   - Huisstijl, correcte afsluiter, geen verboden woorden

10. Logging & Dashboard Updates
    - Alles gelogd: system_logs, escalations, notifications
    - Dashboard real-time updates via Supabase hooks
```

### **🎯 AI Intelligentie (Origineel)**

#### **Scenario Detectie**
- **Klacht**: "te klein", "slecht", "niet blij"
- **Retour**: "ik wil retourneren", "kan ik terugsturen"
- **Dreiging**: "advocaat", "aangifte", "politie"
- **Annulering**: "annuleren", "bestelling stoppen"
- **Adreswijziging**: "adres wijzigen", "verhuisd"
- **Levering**: "waar is mijn bestelling", "levering"
- **Onderhandeling**: "meer compensatie", "hogere korting"

#### **Business Rules Engine**
```json
{
  "rule_key": "fashion_maatprobleem",
  "rule_config": {
    "detectie_woorden": ["te klein", "te groot", "past niet"],
    "compensatie": 20,
    "actie": "retour_aanbieden"
  },
  "html_template": "<p>Het spijt ons dat de maat niet goed is. Je kunt het artikel {{retour_termijn}} dagen retourneren.</p>"
}
```

#### **Compensatie Ladder**
- **Stap 1**: 15% compensatie
- **Stap 2**: 20% compensatie  
- **Stap 3**: 30% compensatie
- **Stap 4**: 50% compensatie (max)
- **Logica**: weigeringen + 1 = ladder stap

#### **Mood & Emotie Detectie**
- **Negatief**: "niet blij", "teleurgesteld", "boos"
- **Positief**: "blij", "tevreden", "fijn"
- **Neutraal**: standaard tone

#### **Taalherkenning**
- **Nederlands**: NL scenario's en mood
- **Engels**: EN scenario's en mood
- **Duits**: DE scenario's en mood

## 🔍 **Huidige Implementatie Analyse**

### **✅ Wat We Hebben (26 Nodes)**
```
1. Gmail Trigger ✅
2. Email Parser ✅
3. Body Cleaner ✅
4. Get Tenant Data ❌ (ONTBREEKT - CRITIEK)
5. Thread Lookup ✅
6. Get Conversation History ✅
7. AI Context Builder ✅
8. Prompt Generator ✅
9. OpenAI Call ✅
10. Response Parser ✅
11. Offer Normalizer ✅
12. Postgres Store Interaction ✅
13. Gmail Send ✅
14. Email Filter ✅
15. Mark as Read ✅
```

### **❌ Wat We Missen (Kritieke Gaps)**

#### **1. Get Tenant Data Node Ontbreekt**
**Origineel**: Zoekt tenant via ontvangend e-mailadres (To:)
**Nu**: ❌ Node ontbreekt - workflow kan tenant niet bepalen
**Impact**: Alle tenants gebruiken mogelijk dezelfde configuratie

#### **2. Business Rules Loading**
**Origineel**: Alle business rules voor specifieke tenant
**Nu**: ❓ Mogelijk alle rules voor alle tenants
**Impact**: AI krijgt verkeerde context

#### **3. Scenario Detectie**
**Origineel**: Uitgebreide detectie van alle scenario's
**Nu**: ❓ Status onbekend - detectie mogelijk beperkt
**Impact**: AI herkent mogelijk niet alle scenario's

#### **4. Compensatie Ladder**
**Origineel**: Dynamische ladder berekening
**Nu**: ✅ Gefixed in Offer Normalizer
**Status**: Werkend na recente fixes

## 🎯 **Vergelijking: Originele vs Huidige AI Intelligentie**

### **✅ Nog Werkend**
- **Compensatie ladder**: Gefixed en werkend
- **Email parsing**: Volledig functioneel
- **Database opslag**: Alle velden correct
- **Gmail integratie**: Werkend

### **❓ Status Onbekend**
- **Scenario detectie**: Alle scenario's herkend?
- **Mood detectie**: Emotie herkenning werkend?
- **Taalherkenning**: NL/EN/DE ondersteuning?
- **Dreiging detectie**: Juridische taal herkenning?
- **Business rules**: Per tenant geladen?

### **❌ Niet Werkend**
- **Tenant detection**: Get Tenant Data node ontbreekt
- **Multi-tenant isolation**: Workflow gebruikt mogelijk verkeerde tenant

## 📊 **Database Kolommen Analyse**

### **Customer Interactions (Origineel vs Nu)**
```sql
-- Origineel: Alle velden voor complete AI intelligentie
customer_interactions:
  - tenant_id ✅
  - customer_email ✅
  - message_body ✅
  - ai_response ✅
  - type ✅ (scenario detectie)
  - status ✅
  - compensatie_percentage ✅
  - ladder_stap ✅
  - refusal_detected ✅
  - mood_detected ✅
  - dreiging_detected ✅
  - days_since_order ✅
  - thread_id ✅
  - created_at ✅
  - updated_at ✅ (toegevoegd)
```

### **Business Rules (Origineel vs Nu)**
```sql
-- Origineel: Complete rule configuratie
tenant_business_rules:
  - tenant_id ✅
  - rule_key ✅
  - rule_config ✅ (JSONB met detectie_woorden, percentages, acties)
  - html_template ✅
  - created_at ✅
```

## 🚨 **KRITIEKE GAPS GEÏDENTIFICEERD**

### **1. Tenant Detection (CRITIEK)**
- **Origineel**: Get Tenant Data node bepaalt tenant uit email
- **Nu**: Node ontbreekt - workflow kan tenant niet bepalen
- **Oplossing**: Add Get Tenant Data node

### **2. Business Rules Loading (CRITIEK)**
- **Origineel**: Rules per tenant geladen
- **Nu**: Mogelijk alle rules voor alle tenants
- **Oplossing**: Tenant-specifieke loading in AI Context Builder

### **3. Scenario Detectie (VERIFICATIE NODIG)**
- **Origineel**: Uitgebreide detectie van alle scenario's
- **Nu**: Status onbekend
- **Oplossing**: Verificatie van alle scenario's

### **4. AI Prompt Compleetheid (VERIFICATIE NODIG)**
- **Origineel**: Complete context met alle informatie
- **Nu**: Status onbekend
- **Oplossing**: Verificatie van prompt compleetheid

## 📝 **IMMEDIATE ACTIONS NEEDED**

### **🔧 CRITIEK - Tenant Detection**
1. **Add Get Tenant Data node** voor dynamische tenant detection
2. **Implementeer tenant lookup** via ontvangend email adres
3. **Test multi-tenant isolation** met verschillende tenant emails

### **🔧 CRITIEK - Business Rules**
1. **Update AI Context Builder** voor tenant-specifieke loading
2. **Verificatie scenario detectie** voor alle scenario's
3. **Test business rules** per tenant

### **🧪 VERIFICATIE**
1. **Test alle scenario's**: klacht, retour, dreiging, annulering, adreswijziging
2. **Test mood detectie**: negatief, positief, neutraal
3. **Test taalherkenning**: NL, EN, DE
4. **Test compensatie ladder**: alle stappen
5. **Test dreiging detectie**: juridische taal

### **📊 DATABASE VERIFICATIE**
1. **Controleer alle kolommen** in customer_interactions
2. **Verificatie business rules** structuur
3. **Test data opslag** voor alle velden

## 🎯 **Conclusie**

### **✅ Wat Werkt**
- **Compensatie ladder**: Gefixed en werkend
- **Email processing**: Volledig functioneel
- **Database structuur**: Alle kolommen aanwezig
- **Gmail integratie**: Werkend

### **❌ Wat Niet Werkt**
- **Tenant detection**: Get Tenant Data node ontbreekt
- **Multi-tenant isolation**: Workflow gebruikt mogelijk verkeerde tenant

### **❓ Wat Onbekend Is**
- **Scenario detectie**: Alle scenario's herkend?
- **AI prompt compleetheid**: Alle context meegegeven?
- **Business rules loading**: Per tenant correct?

### **🎯 Volgende Stap**
**Implementatie van Get Tenant Data node** en **verificatie van alle AI intelligentie** om de originele flow logica volledig te herstellen.

**Tenant ID voor testing**: `af738ad1-9275-4f87-8fa6-fe2748771dc6`
