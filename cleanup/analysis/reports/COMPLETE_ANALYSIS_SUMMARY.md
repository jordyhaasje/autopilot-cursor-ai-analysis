# 🚀 AutoPilot - Complete Analyse & Samenvatting

## 📋 Project Overzicht
**AutoPilot** is een geavanceerd multi-tenant AI-klantenservice systeem voor dropshipping bedrijven, gebouwd met N8N workflows, Supabase database en een LoveAble dashboard. Het systeem is specifiek ontworpen voor Chinese leveranciers waar lange levertijden normaal zijn, maar klanten gerustgesteld moeten worden zonder expliciet over de vertragingen te praten.

---

## 🎯 Kern Doelstellingen
- **Compensatie-first strategie**: Geen retour/geld-terug tot de laatste ladderstap (40%) of dreiging
- **Multi-tenant architectuur**: Elke dropshipper heeft eigen configuratie en isolatie
- **Meertalige ondersteuning**: NL/EN/DE met automatische taalherkenning
- **Context-aware AI**: Volledige gespreksgeschiedenis en emotieherkenning
- **Deterministische ladder**: Voorspelbare compensatie-escalatie (15% → 20% → 30% → 40% → 50% bij dreiging)

---

## 🤖 AI Capabilities & Intelligentie

### 1. **Compensatie Ladder Systeem**
```
Stap 1: 15% compensatie
Stap 2: 20% compensatie (na weigering)
Stap 3: 30% compensatie (na weigering)
Stap 4: 40% compensatie (na weigering)
Dreiging: Direct 50% compensatie
```
- **Deterministisch**: AI slaat geen stappen over
- **Context-aware**: Herkent vorige aanbiedingen via `last_known_offer`
- **Onderhandeling**: +15% extra bij expliciete onderhandeling
- **Retour pas na 40%**: Geen retouradres tot laatste stap

### 2. **Levertijd Management (Chinese Dropshipping)**
```
< 5 werkdagen: Geruststelling, normale levertijd
5-9 werkdagen: Vraag om 3 extra werkdagen af te wachten
> 9 werkdagen: Trackingnummer opvragen, notificatie naar dashboard
13+ dagen: Direct escalatie naar support
```
- **Geen harde deadlines**: Altijd geruststellend, geen exacte levertijden
- **Geen tracking links**: Voorkomt klantverwarring
- **Chinese leveranciers**: Aangepast voor lange levertijden

### 3. **Dreiging & Escalatie Detectie**
**Trigger woorden**: "advocaat", "rechtszaak", "politie", "aangifte", "klacht indienen"
- **Directe actie**: 50% compensatie + notificatie + escalatie
- **Dashboard alert**: Prioriteit "high" voor support team

### 4. **Emotie & Mood Herkenning**
- **Positief**: "tevreden", "bedankt", "prima"
- **Neutraal**: Algemene vragen, informatieverzoeken
- **Frustrated**: Klachten, ontevredenheid
- **Angry**: Dreigingen, escalaties
- **Meertalig**: NL/EN/DE emotieherkenning

### 5. **Fashion-specifieke Problemen**
**Maatproblemen**:
- Trigger: "te klein", "te groot", "past niet", "maat klopt niet"
- Actie: 20% compensatie of replacement-first

**Kleurproblemen**:
- Trigger: "kleur anders", "niet zoals foto", "andere kleur"
- Actie: 25% compensatie

### 6. **Annulering & Adreswijziging**
**Annulering**:
- Max 14 dagen na bestelling (configureerbaar per tenant)
- Te laat: "Sorry, annuleren is niet meer mogelijk"

**Adreswijziging**:
- Max 7 dagen na bestelling (configureerbaar per tenant)
- AI zoekt automatisch naar nieuw adres in bericht

---

## 📊 Database Structuur & Business Rules

### **Kern Tabellen**
1. **`tenants`**: Bedrijfsinstellingen, persona, signature, retouradres
2. **`tenant_business_rules`**: Per-tenant configuratie van alle regels
3. **`master_business_rules`**: Default templates voor nieuwe tenants
4. **`conversation_threads`**: Gespreksdraad met context en ladder status
5. **`customer_interactions`**: Elke e-mailstap met metadata en AI output
6. **`notifications`**: Alerts en escalaties voor dashboard
7. **`escalations`**: Geëscaleerde zaken voor support team

### **Belangrijke Business Rules**

#### **1. Compensatie Ladder (compensatie_ladder)**
```json
{
  "stappen": [15, 20, 30, 40],
  "max_totaal_normaal": 40,
  "dreiging_percentage": 50,
  "max_totaal_dreiging": 65,
  "retour_na_weigering": true,
  "onderhandeling_marge": 15
}
```

#### **2. Onderhandeling Logica (onderhandeling_logica)**
```json
{
  "trigger_woorden": ["kan het ook", "meer compensatie", "niet genoeg"],
  "max_extra_percentage": 15
}
```

#### **3. Dreiging Detectie (dreiging_detectie)**
```json
{
  "actie": "directe_escalatie",
  "trefwoorden": ["advocaat", "rechtszaak", "politie", "aangifte", "klacht indienen"]
}
```

#### **4. Levertijd Logica (levering_logica)**
```json
{
  "drempel_1": 5,
  "drempel_2": 9,
  "normale_levertijd_werkdagen": "6-9"
}
```

---

## 🔄 N8N Workflow Architectuur

### **Node Volgorde (25 nodes)**
1. **Gmail Trigger** - Ontvangt nieuwe e-mails
2. **Email Parser** - Extraheert klantgegevens
3. **Email Body Cleaner** - Stript quotes en HTML
4. **Conversation Thread Lookup** - Zoekt bestaande thread
5. **Get Tenant Data** - Haalt bedrijfsinstellingen op
6. **Get Conversation History** - Laatste 30 interacties
7. **Thread ID Generator** - Genereert unieke thread ID
8. **Klantnaam Extractor** - Extraheert klantnaam
9. **Conversation Thread Upsert** - Maakt/update thread
10. **Orderdatum Extractor** - Zoekt besteldatum
11. **AI Context Builder** - Bouwt AI prompt met context
12. **Prompt Generator** - Genereert finale prompt
13. **Message a model1** - OpenAI GPT-4O-MINI call
14. **Merge1** - Combineert data
15. **Response Parser** - Parseert AI output
16. **Offer Normalizer** - Normaliseert compensatie percentage
17. **Conversation Thread Context Update** - Update thread context
18. **If** - Dreiging/alerts router
19. **Postgres Insert Notification** - Slaat notificatie op
20. **Postgres Insert Escalation** - Slaat escalatie op
21. **Gmail Send Escalation** - Stuurt escalatie e-mail
22. **Postgres Store Interaction** - Slaat interactie op
23. **Conversation Thread Context Update** - Update thread
24. **Gmail Send Normal** - Stuurt normale e-mail
25. **Mark a message as read** - Markeert als gelezen

### **Kritieke Node Details**

#### **AI Context Builder**
- Bouwt context met `last_known_offer` vs `expected_offer`
- Detecteert taal, mood, dreiging, soft refusal
- Voegt business rules en templates toe

#### **Response Parser**
- Parseert JSON output van AI
- Fallback voor refusal/acceptance detectie
- Type guard voor context-based routing

#### **Offer Normalizer**
- **Kern functie**: Dwingt deterministische ladder
- Bij `refusal_detected`: Exact één stap hoger dan `last_known_offer`
- Synchroniseert JSON en HTML output

---

## 🎨 LoveAble Dashboard Features

### **Multi-tenant Isolatie**
- **RLS (Row Level Security)**: Elke tenant ziet alleen eigen data
- **Tenant approval flow**: Admins keuren nieuwe tenants goed
- **Per-tenant workflows**: Elke tenant heeft eigen N8N workflow

### **Dashboard Componenten**
1. **Notifications Center**: Alerts en escalaties met filters
2. **Threads Overzicht**: Alle klantgesprekken met status
3. **Thread Detail**: Timeline met interacties en quick actions
4. **Business Rules Editor**: Configureerbare regels per tenant
5. **Analytics**: Acceptatiepercentages per ladderstap

### **Real-time Features**
- **Supabase Realtime**: Live updates voor notificaties
- **Chat systeem**: Live chat tussen klanten en admins
- **Admin availability**: Online status van support team

---

## 🔧 Technische Bijzonderheden

### **Idempotentie & Threading**
- **Unique constraint**: `(tenant_id, email_external_id)` voorkomt duplicaten
- **Gmail threading**: Via `gmail_thread_id` voor context
- **Conversation context**: JSONB array met snapshots per stap

### **Multi-language Support**
- **Automatische detectie**: NL/EN/DE uit klantbericht
- **Fallback**: Tenant `locale` instelling
- **Meertalige keywords**: Voor refusal/acceptance detectie

### **Security & RLS**
- **Service role**: Alleen server-side voor migraties
- **Anonymous key**: Voor dashboard (publiek)
- **Tenant isolation**: Volledige data scheiding

---

## 📈 Business Intelligence & Analytics

### **Tracked Metrics**
- **Acceptatie ratio**: Per ladderstap (15%/20%/30%/40%/50%)
- **Escalatie rate**: Dreigingen en escalaties
- **Response time**: AI response snelheid
- **Customer mood**: Emotie trends over tijd
- **Category distribution**: Retour/levering/annulering ratio's

### **Dashboard KPIs**
- **Open threads**: Actieve klantgesprekken
- **Accept ratio**: Per compensatie percentage
- **Alerts**: Open/high priority notificaties
- **Escalations**: Geëscaleerde zaken

---

## 🚀 Roadmap & Toekomstige Features

### **Fase 1 (Huidig)**
- ✅ Multi-tenant architectuur
- ✅ Compensatie ladder
- ✅ Dreiging detectie
- ✅ Basic dashboard

### **Fase 2 (Gepland)**
- 🔄 Geavanceerde analytics
- 🔄 A/B testing van ladder/teksten
- 🔄 Bulk-edit business rules
- 🔄 Scenario management

### **Fase 3 (Toekomst)**
- 📋 Extra talen (FR/ES)
- 📋 WhatsApp integratie
- 📋 Dynamische AI confidence scores
- 📋 Machine learning voor optimalisatie

---

## 🎯 Kern Principes

### **1. Compensation-First**
- Geen retour/geld-terug tot 40% geweigerd
- Altijd eerst compensatie aanbieden
- Retour alleen als laatste redmiddel

### **2. Chinese Dropshipping Optimalisatie**
- Lange levertijden accepteren als normaal
- Geruststellen zonder harde deadlines
- Geen tracking links delen
- Focus op compensatie bij klachten

### **3. Context-Aware AI**
- Volledige gespreksgeschiedenis
- Emotieherkenning en aanpassing
- Deterministische ladder zonder willekeur
- Menselijke, gevarieerde responses

### **4. Multi-Tenant Isolatie**
- Elke dropshipper volledig geïsoleerd
- Eigen business rules en configuratie
- Aparte workflows per tenant
- RLS voor data security

---

## 📋 Testplan & Validatie

### **Must-Pass Scenarios**
1. **Nieuw retourverzoek** → 15% compensatie
2. **Weigering ladder** → 15% → 20% → 30% → 40% → retouradres
3. **Dreiging detectie** → Direct 50% + escalatie
4. **Annulering binnen termijn** → Bevestiging
5. **Annulering buiten termijn** → Weigering
6. **Levertijd vragen** → Bucket-based responses
7. **Onderhandeling** → +15% extra bij expliciete vraag

### **Edge Cases**
- **Race conditions**: Idempotentie via unique constraints
- **Multi-language**: Fallback naar tenant locale
- **Missing data**: Graceful degradation
- **Thread conflicts**: Gmail threading resolution

---

## 🔗 Integratie Punten

### **N8N ↔ Supabase**
- **Real-time data**: Via Postgres nodes
- **Business rules**: JSON configuratie
- **Threading**: Via `gmail_thread_id`

### **Dashboard ↔ Supabase**
- **RLS policies**: Tenant isolation
- **Real-time subscriptions**: Notificaties
- **Custom functions**: `get_user_tenant_id()`

### **Gmail ↔ N8N**
- **OAuth2**: Gmail API integratie
- **Threading**: Via Gmail thread ID
- **Read status**: Automatische markering

---

## 📊 Performance & Schaalbaarheid

### **Database Optimalisatie**
- **Indexen**: Op `gmail_thread_id`, `tenant_id`
- **JSONB**: Voor flexibele metadata
- **Partitioning**: Mogelijk voor grote volumes

### **N8N Optimalisatie**
- **Always output data**: Alleen op code/select nodes
- **Error handling**: Graceful degradation
- **Queue management**: Voor hoge volumes

### **Dashboard Performance**
- **Virtual scrolling**: Voor grote lijsten
- **Optimistic updates**: Snelle UI feedback
- **Caching**: Voor business rules

---

## 🎉 Conclusie

AutoPilot is een geavanceerd, productie-klaar AI-klantenservice systeem specifiek ontworpen voor Chinese dropshipping. Het combineert:

- **Intelligente compensatie ladder** met deterministische controle
- **Multi-tenant architectuur** met volledige isolatie
- **Context-aware AI** met emotieherkenning
- **Chinese dropshipping optimalisatie** voor lange levertijden
- **Real-time dashboard** met uitgebreide analytics
- **Robuuste technische architectuur** met N8N + Supabase

Het systeem is klaar voor productie en kan direct worden ingezet voor dropshipping bedrijven die hun klantenservice willen automatiseren met behoud van menselijke touch en Chinese leverancier-specifieke optimalisaties.
