# 🤖 AI Visie & Requirements - AutoPilot Multi-Tenant Customer Service

## 🎯 **Wat Wil Je Met Deze AI?**

### **🏢 Multi-Tenant SaaS Platform**
Je wilt een **intelligente AI customer service** die automatisch klantemails beantwoordt voor **meerdere bedrijven (tenants)**. Elke tenant heeft zijn eigen:
- **AI persona** (naam, toon, stijl)
- **Business rules** (compensatie ladder, scenario's, detectie woorden)
- **Email filters** (welke emails wel/niet verwerken)
- **Instellingen** (retour termijn, adreswijziging, annulering)
- **HTML templates** (email sjablonen)

### **🧠 AI Intelligentie - Wat Moet de AI Kunnen?**

#### **1. Scenario Detectie & Context Begrip**
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

#### **2. Compensatie Ladder Intelligentie**
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

#### **3. Multi-Language Support**
```
De AI moet meertalig zijn:
- Nederlands (primair)
- Engels
- Duits
- Automatische taal detectie
- Consistent in dezelfde taal antwoorden
```

#### **4. Threat & Escalation Detection**
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

#### **5. Business Rules Engine**
```
De AI moet tenant-specifieke regels toepassen:
- Detectie woorden per scenario
- Compensatie percentages per scenario
- Email templates per scenario
- Retour termijnen per tenant
- Adreswijziging regels per tenant
```

#### **6. Context Awareness**
```
De AI moet context begrijpen:
- Eerdere interacties met dezelfde klant
- Geschiedenis van compensaties
- Patronen in klantgedrag
- Seizoensinvloeden
- Product-specifieke problemen
```

## 🏗️ **Systeem Architectuur**

### **📊 Database Structuur**
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

### **🔄 N8N Workflow Flow**
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

## 🎯 **Wat Moet de AI Precies Doen?**

### **📧 Email Verwerking**
1. **Email ontvangen** via Gmail
2. **Tenant bepalen** via ontvangst emailadres
3. **Email filteren** (spam, auto-replies, etc.)
4. **Context analyseren** (scenario, mood, dreiging)
5. **Business rules toepassen** (tenant-specifiek)
6. **Compensatie ladder volgen** (indien nodig)
7. **Antwoord genereren** (empathisch, professioneel)
8. **Interactie opslaan** (voor geschiedenis)
9. **Email versturen** (met juiste signature)

### **🧠 AI Beslissingsproces**
```
1. CONTEXT ANALYSE
   - Wat is het scenario? (klacht, retour, dreiging, etc.)
   - Wat is de mood? (boos, teleurgesteld, tevreden)
   - Is er een dreiging?
   - Wat is de echte intentie?

2. BUSINESS RULES TOEPASSEN
   - Welke regels zijn relevant?
   - Welke detectie woorden zijn getriggerd?
   - Wat is de juiste actie?

3. COMPENSATIE BEPALEN
   - Welke ladder stap zijn we?
   - Wat is de juiste percentage?
   - Is escalatie nodig?

4. RESPONSE GENEREREN
   - Juiste toon (empathisch, professioneel)
   - Juiste taal (NL/EN/DE)
   - Juiste template gebruiken
   - Juiste compensatie aanbieden
```

## 🚨 **Huidige Problemen & Oplossingen**

### **❌ Probleem 1: Te Simpele Detectie**
**Wat er nu gebeurt:**
```javascript
if (cleaned_body.includes(detectie_woord)) {
  // Regel wordt getriggerd
}
```

**Waarom dit fout is:**
- "De kleur is anders, maar dat is prima" → AI biedt retour aan
- "De maat is te klein, maar ik wil hem houden" → AI biedt retour aan

**Oplossing:**
```javascript
function smartDetection(cleaned_body, business_rules) {
  const detected_rules = [];
  
  business_rules.forEach(rule => {
    const context = analyzeContext(cleaned_body, rule.detectie_woorden);
    
    if (context.relevant && !context.positive) {
      detected_rules.push(rule);
    }
  });
  
  return detected_rules;
}
```

### **❌ Probleem 2: Compensatie Ladder Fout**
**Wat er nu gebeurt:**
```
Klant weigert 15% → AI zegt: "20% is niet voldoende, hier is 20%"
```

**Oplossing:**
```javascript
// In Prompt Generator
- CRITICAL: When customer refuses an offer, offer the NEXT ladder step
- CRITICAL: Never repeat the same percentage that was just refused

// In Offer Normalizer
if (finalOffer <= lastKnown) {
  finalOffer = nextStepFrom(lastKnown);
}
```

### **❌ Probleem 3: Geen Tenant Isolation**
**Wat er nu gebeurt:**
- AI gebruikt mogelijk hardcoded tenant_id
- Business rules worden niet tenant-specifiek geladen

**Oplossing:**
```javascript
// In AI Context Builder
const tenant_id = getTenantIdFromEmail(to_email);
const tenantBusinessRules = await getTenantBusinessRules(tenant_id);
```

## 🎯 **Wat Wil Je Bereiken?**

### **🏆 Einddoel**
Een **volledig automatische, intelligente customer service** die:
- **Multi-tenant** werkt (elk bedrijf zijn eigen AI)
- **Context-bewust** is (begrijpt echte intentie)
- **Empathisch** is (voelt met klant mee)
- **Professioneel** is (altijd correcte toon)
- **Slim** is (leert van interacties)
- **Schaalbaar** is (nieuwe tenants toevoegen)

### **📈 Success Metrics**
- **Klanttevredenheid** verhogen
- **Response time** verlagen (van uren naar minuten)
- **Escalatie rate** verlagen (AI lost meer op)
- **Compensatie kosten** optimaliseren
- **Medewerker workload** verlagen

### **🔄 Continuous Improvement**
- **AI leert** van elke interactie
- **Business rules** worden geoptimaliseerd
- **Templates** worden verbeterd
- **Detectie** wordt slimmer
- **Compensatie ladder** wordt geoptimaliseerd

## 🚀 **Volgende Stappen**

### **🔧 Immediate Fixes (Prioriteit 1)**
1. **Smart Detection** implementeren
2. **Compensatie Ladder** fixen
3. **Tenant Isolation** verifiëren
4. **AI Prompt** verbeteren

### **🔧 Medium Term (Prioriteit 2)**
1. **Context Analysis** verbeteren
2. **Multi-language** optimaliseren
3. **Threat Detection** verfijnen
4. **Business Rules** uitbreiden

### **🔧 Long Term (Prioriteit 3)**
1. **Machine Learning** toevoegen
2. **Sentiment Analysis** implementeren
3. **Predictive Analytics** toevoegen
4. **Advanced Escalation** logic

## 🎯 **Conclusie**

Je wilt een **revolutionaire AI customer service** die:
- **Automatisch** klantemails beantwoordt
- **Intelligent** context begrijpt
- **Multi-tenant** werkt
- **Empathisch** en **professioneel** is
- **Schaalbaar** en **leerbaar** is

**De basis is er**, maar de **AI intelligentie moet verbeterd** worden om echt context-bewust en empathisch te zijn! 🚀
