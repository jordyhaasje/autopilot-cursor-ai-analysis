# 🎯 Business Rules Analyse - Waar Haalt de AI Zijn Informatie Vandaan?

## 📋 **Database Tabellen Overzicht**

### **1. tenant_business_rules**
```sql
-- Tenant-specifieke regels (per bedrijf)
tenant_business_rules:
  - tenant_id (welk bedrijf)
  - rule_key (unieke naam: 'compensatie_ladder', 'fashion_maatprobleem')
  - rule_config (JSONB met detectie_woorden, percentages, acties)
  - html_template (email template met variabelen)
  - created_at
```

**Voorbeeld:**
```json
{
  "tenant_id": "af738ad1-9275-4f87-8fa6-fe2748771dc6",
  "rule_key": "fashion_maatprobleem",
  "rule_config": {
    "detectie_woorden": ["te klein", "te groot", "past niet"],
    "compensatie": 20,
    "actie": "retour_aanbieden"
  },
  "html_template": "<p>Het spijt ons dat de maat niet goed is. Je kunt het artikel {{retour_termijn}} dagen retourneren.</p>"
}
```

### **2. master_business_rules**
```sql
-- Template regels (voor alle tenants)
master_business_rules:
  - rule_key (unieke naam)
  - rule_config (JSONB template)
  - html_template (basis template)
  - created_at
```

**Doel:** Standaard templates die tenants kunnen kopiëren/aanpassen

### **3. master_scenarios**
```sql
-- Voorgedefinieerde scenario's
master_scenarios:
  - scenario_key (unieke naam)
  - scenario_name (beschrijving)
  - scenario_config (JSONB met standaard instellingen)
  - created_at
```

**Voorbeeld:**
```json
{
  "scenario_key": "fashion_maatprobleem",
  "scenario_name": "Fashion Maat Probleem",
  "scenario_config": {
    "default_compensatie": 20,
    "default_actie": "retour_aanbieden",
    "default_detectie_woorden": ["te klein", "te groot", "past niet"]
  }
}
```

### **4. scenario_rules**
```sql
-- Rules per scenario
scenario_rules:
  - scenario_key (verwijst naar master_scenarios)
  - rule_key (verwijst naar master_business_rules)
  - rule_config (JSONB met scenario-specifieke instellingen)
  - created_at
```

### **5. scenario_assignments**
```sql
-- Welke scenario's zijn toegewezen aan welke tenants
scenario_assignments:
  - tenant_id (welk bedrijf)
  - scenario_key (welk scenario)
  - active (boolean)
  - created_at
```

## 🔍 **Hoe Werkt Dit in de Flow?**

### **Stap 1: Welke Regels Worden Geladen?**

**Originele Logica (uit Logica database van flow.txt):**
```
3. Tenant en Business Rules ophalen
   - Get Tenant Data node:
   - Zoekt tenant via ontvangend e-mailadres (To:)
   - Haalt tenant-specifieke instellingen op
   - Alle business rules voor deze tenant uit tenant_business_rules
```

**Dit betekent:**
- AI laadt **alleen** regels uit `tenant_business_rules` voor de specifieke tenant
- **NIET** uit master_business_rules of scenario_rules
- **NIET** alle regels voor alle tenants

### **Stap 2: Hoe Worden Regels Toegepast?**

**Originele Logica:**
```
5. Context Builder / AI Prompt samenstellen
   - Detectie van scenario's:
   - Controle via business rules en detectie_woorden
   - Regels uit business rules: Actieve regels en HTML templates worden meegegeven in de prompt
```

**Dit betekent:**
1. AI krijgt **alle tenant_business_rules** voor de tenant
2. Voor elke regel: `rule_config.detectie_woorden` wordt gecontroleerd
3. Als een woord voorkomt → regel wordt "getriggerd"
4. `html_template` wordt meegegeven aan AI als "guidance"

## 🚨 **PROBLEEM: Te Simpele Detectie**

### **Wat Er Nu Gebeurt:**
```javascript
// Simpele detectie (waarschijnlijk)
if (cleaned_body.includes(detectie_woord)) {
  // Regel wordt getriggerd
  // AI krijgt html_template mee
}
```

### **Waarom Dit Problematisch Is:**

#### **1. Context Blindheid**
```
Klant schrijft: "Ik vind de kleur anders dan verwacht, maar dat is prima"
→ "kleur anders" wordt gedetecteerd
→ AI biedt retour aan (terwijl klant tevreden is!)
```

#### **2. Te Simpele Matching**
```
Klant schrijft: "De andere kleur die ik bestelde is perfect"
→ "andere kleur" wordt gedetecteerd
→ AI denkt: kleurprobleem!
```

#### **3. Geen Nuance**
```
Klant schrijft: "De maat is te klein, maar ik wil hem houden"
→ "te klein" wordt gedetecteerd
→ AI biedt retour aan (terwijl klant het wil houden!)
```

## 🎯 **Hoe Zou Het Beter Moeten Werken?**

### **Optie 1: AI-Only Approach (Aanbevolen)**
```javascript
// Geef AI alle context, laat AI beslissen
const prompt = `
Klant bericht: "${cleaned_body}"

Beschikbare business rules:
${JSON.stringify(tenant_business_rules)}

Instructies:
- Lees de context van het bericht
- Bepaal of er echt een probleem is
- Gebruik business rules alleen als relevant
- Bied geen retour aan als klant tevreden is
- Wees empathisch maar niet over-reactief
`;
```

### **Optie 2: Smart Detection + AI**
```javascript
// Slimmere detectie met context
function smartDetection(cleaned_body, business_rules) {
  const detected_rules = [];
  
  business_rules.forEach(rule => {
    const words = rule.rule_config.detectie_woorden;
    const context = analyzeContext(cleaned_body, words);
    
    if (context.relevant && !context.positive) {
      detected_rules.push(rule);
    }
  });
  
  return detected_rules;
}

function analyzeContext(text, words) {
  // Check voor positieve context
  const positive_indicators = ["maar prima", "maar goed", "maar fijn", "wil houden"];
  const is_positive = positive_indicators.some(indicator => 
    text.toLowerCase().includes(indicator)
  );
  
  // Check voor expliciete wensen
  const explicit_requests = ["wil retour", "wil ruilen", "wil terugsturen"];
  const has_explicit_request = explicit_requests.some(request => 
    text.toLowerCase().includes(request)
  );
  
  return {
    relevant: words.some(word => text.toLowerCase().includes(word)),
    positive: is_positive,
    explicit_request: has_explicit_request
  };
}
```

## 🔍 **Wat Gebeurt Er Nu in de Workflow?**

### **Huidige Status (Uit Analyse):**
- ❌ **Business Rules Loading**: Niet gevonden in AI Context Builder
- ❌ **Tenant ID Usage**: Niet gevonden
- ✅ **Compensatie Ladder**: Werkend
- ✅ **Database**: Alle regels aanwezig

### **Waarschijnlijke Implementatie:**
```javascript
// Waarschijnlijk hardcoded of alle regels geladen
const allBusinessRules = await getAllBusinessRules(); // ❌ Verkeerd!
// In plaats van:
const tenantBusinessRules = await getTenantBusinessRules(tenant_id); // ✅ Correct
```

## 📝 **IMMEDIATE ACTIONS NEEDED**

### **1. Verificatie Business Rules Loading**
```javascript
// In AI Context Builder moet staan:
const tenant_id = getTenantIdFromEmail(to_email);
const tenantBusinessRules = await getTenantBusinessRules(tenant_id);
```

### **2. Implementatie Smart Detection**
```javascript
// In plaats van simpele includes():
const detectedRules = smartDetection(cleaned_body, tenantBusinessRules);
```

### **3. AI Prompt Verbetering**
```javascript
// Geef AI meer context en instructies:
const prompt = `
Klant bericht: "${cleaned_body}"

Beschikbare regels: ${JSON.stringify(detectedRules)}

BELANGRIJK:
- Lees de volledige context
- Bied alleen hulp aan als klant dat echt wil
- Wees empathisch maar niet over-reactief
- Gebruik regels alleen als relevant
`;
```

## 🎯 **Conclusie**

### **Het Probleem:**
1. **Te simpele detectie**: Alleen `includes()` check
2. **Geen context**: AI krijgt geen volledige context
3. **Over-reactief**: AI biedt hulp aan wanneer niet nodig
4. **Geen nuance**: Positieve context wordt genegeerd

### **De Oplossing:**
1. **Smart detection** met context analyse
2. **AI-Only approach** met volledige context
3. **Betere instructies** voor AI
4. **Tenant-specifieke loading** van business rules

### **Volgende Stap:**
**Implementatie van smart detection en verbeterde AI prompt** om de AI slimmer te maken en context-bewust te laten reageren.
