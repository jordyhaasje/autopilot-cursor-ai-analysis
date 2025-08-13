# 🔍 **COMPLETE WORKFLOW ANALYSE - CURSOR AI**

## 📋 **PROBLEEM OPGELOST!**

Je had helemaal gelijk! De originele export bevatte **NIET** alle code details. We hebben nu:

✅ **Volledige workflow data** geëxporteerd  
✅ **Alle code nodes** met complete JavaScript code  
✅ **Alle Postgres queries** met volledige SQL  
✅ **Alle node parameters** en configuraties  
✅ **Complete workflow structuur** met connections  

## 🎯 **CURSOR AI WORKFLOW - VOLLEDIGE ANALYSE**

### **📊 Workflow Overzicht**
- **Naam**: CURSOR AI
- **ID**: WP5aiR5vN2A9w91i
- **Nodes**: 25 nodes
- **Code Nodes**: 9 nodes met JavaScript
- **Postgres Nodes**: 9 nodes met SQL queries
- **Gmail Nodes**: 4 nodes (trigger + send)
- **OpenAI Node**: 1 node (GPT-4O-MINI)

### **💻 CODE NODES - VOLLEDIGE ANALYSE**

#### **1. AI Context Builder (9.740 karakters)**
**Functie**: Kern intelligentie voor context building
**Belangrijke features**:
- **Mood detectie**: Negatieve/positieve woorden per taal (NL/EN/DE)
- **Ladder berekening**: Deterministische compensatie ladder
- **Dreiging detectie**: Juridische dreigingen herkennen
- **Business rules**: Per-tenant configuratie
- **Gespreksgeschiedenis**: Laatste 30 interacties
- **Taal detectie**: Automatische taalherkenning

**Kern code patronen**:
```javascript
// Mood detectie
const negativeWordsPerTaal = {
  nl: ["niet blij", "ontevreden", "slecht", "teleurgesteld"],
  en: ["not happy", "dissatisfied", "bad", "disappointed"],
  de: ["nicht zufrieden", "schlecht", "enttäuscht"]
};

// Ladder berekening
const ladderCfg = {
  stappen: [15, 20, 30, 40],
  dreiging_percentage: 50,
  onderhandeling_marge: 15,
  max_totaal_normaal: 40
};

// Dreiging detectie
const threatWords = (rules.dreiging_detectie?.trefwoorden || []).map(lower);
const isThreat = threatWords.some(kw => body.includes(kw));
```

#### **2. Response Parser (5.415 karakters)**
**Functie**: AI response verwerking en normalisatie
**Belangrijke features**:
- **JSON parsing**: Robuuste JSON extractie uit AI response
- **Type normalisatie**: Intent classification (compensation/return/cancellation/etc.)
- **Fallback detectie**: Meertalige refusal/acceptance detectie
- **HTML synchronisatie**: JSON en HTML altijd synchroon
- **Metadata merge**: Order datum en andere metadata

**Kern code patronen**:
```javascript
// JSON parsing met fallbacks
function tryParseJson(s){
  if (!s || typeof s !== 'string') return null;
  const m = s.match(/\{[\s\S]*\}\s*$/); 
  let block = m ? m[0] : null; 
  if (!block) return null;
  try { return JSON.parse(block); } catch(e) {}
  // Fallback cleaning...
}

// Type normalisatie
function normType(t){
  const s = String(t||'').toLowerCase();
  if (["compensatie","compensation"].includes(s)) return "compensation";
  if (["retour","return","return_request"].includes(s)) return "return";
  // ... meer types
  return "general";
}
```

#### **3. Prompt Generator (3.978 karakters)**
**Functie**: Dynamische prompt generatie voor AI
**Belangrijke features**:
- **Meertalige prompts**: NL/EN/DE prompt templates
- **Context-aware**: Past prompt aan op situatie
- **Business rules integratie**: Tenant-specifieke instructies
- **Variatie**: Verschillende prompts per type

#### **4. Offer Normalizer (2.153 karakters)**
**Functie**: Deterministische controle van aanbiedingen
**Belangrijke features**:
- **Ladder controle**: Forceert correcte percentages
- **HTML synchronisatie**: JSON en HTML altijd synchroon
- **Refusal handling**: Automatische stap verhoging
- **Consistentie**: Tussen DB en e-mail

#### **5. Email Parser (1.434 karakters)**
**Functie**: Gmail email parsing
**Belangrijke features**:
- **Header parsing**: From/To/Subject extractie
- **Naam extractie**: Klantnaam uit email headers
- **Email ID tracking**: Voor threading

#### **6. Klantnaam Extractor (1.295 karakters)**
**Functie**: Intelligente naam extractie
**Belangrijke features**:
- **Multi-source**: Email headers, body, signature
- **Fallback**: Email username als backup
- **Cleaning**: HTML en formatting verwijderen

#### **7. Orderdatum Extractor (980 karakters)**
**Functie**: Besteldatum extractie uit tekst
**Belangrijke features**:
- **Pattern matching**: Verschillende datum formaten
- **Relative dates**: "gisteren", "vorige week", etc.
- **Fallback**: Vraagt datum als niet gevonden

#### **8. Email Body Cleaner (727 karakters)**
**Functie**: Email body cleaning
**Belangrijke features**:
- **HTML stripping**: Schone tekst extractie
- **Quote removal**: Gmail quotes verwijderen
- **Formatting**: Consistentie in tekst

#### **9. Thread ID Generator (649 karakters)**
**Functie**: Gmail threading
**Belangrijke features**:
- **UUID generatie**: Unieke thread IDs
- **Contact counting**: Aantal contacten per thread
- **Thread continuity**: Herkent vervolgcontacten

### **🗄️ POSTGRES NODES - VOLLEDIGE ANALYSE**

#### **1. Get tenant data**
**Query**: Haalt tenant configuratie en business rules op
**Features**:
- **Business rules**: JSON_AGG van alle tenant rules
- **Locale configuratie**: Taal en regio instellingen
- **AI persona**: Naam en signature configuratie

#### **2. Get Conversation History**
**Query**: Haalt gespreksgeschiedenis op
**Features**:
- **30 interacties**: Laatste 30 berichten
- **Thread matching**: Via gmail_thread_id of email
- **Metadata**: Ladder stappen, mood, context

#### **3. Conversation Thread Upsert**
**Query**: Maakt/update conversation threads
**Features**:
- **Upsert logic**: INSERT ... ON CONFLICT
- **Contact counting**: Increment total_interactions
- **Timestamp tracking**: last_contact_date

#### **4. Postgres Store Interaction**
**Query**: Slaat klantinteractie op
**Features**:
- **Volledige metadata**: Alle AI output
- **JSONB storage**: Flexibele metadata opslag
- **Thread linking**: Via thread_id

#### **5. Postgres Insert Notification**
**Query**: Dashboard notificaties
**Features**:
- **Conditional**: Alleen bij alerts
- **Priority levels**: Voor support team
- **Rich payload**: JSON met alle details

#### **6. Postgres Insert Escalation**
**Query**: Dreiging escalatie
**Features**:
- **Escalation tracking**: Voor support team
- **Reason logging**: Waarom geëscaleerd
- **Level tracking**: Ladder stap bij escalatie

### **🔗 WORKFLOW CONNECTIONS**

```
Gmail Trigger → Email Parser → Email Body Cleaner → Get Tenant Data
                                                      ↓
Get Conversation History → Conversation Thread Lookup → Thread ID Generator
                                                              ↓
Conversation Thread Upsert → AI Context Builder → Prompt Generator
                                                      ↓
Message a model1 (OpenAI) → Response Parser → Offer Normalizer
                                                      ↓
If (Escalation Check) → Postgres Insert Notification
                              ↓
Postgres Store Interaction → Gmail Send Normal
```

### **🎯 KERN INTELLIGENTIE - WAT DE AI MOET BEGRIJPEN**

#### **1. Compensatie Ladder Systeem**
```javascript
// Deterministische ladder
const ladderCfg = {
  stappen: [15, 20, 30, 40],        // Normale stappen
  dreiging_percentage: 50,          // Dreiging direct 50%
  onderhandeling_marge: 15,         // +15% bij onderhandeling
  max_totaal_normaal: 40,           // Max normale compensatie
  retour_na_weigering: true         // Retour pas na max stap
};

// Slimme ladder berekening
let refusal_count = 0;
if (history.length > 0) {
  for (let h of history) {
    if (['compensation', 'return'].includes((h.type||'').toLowerCase()) &&
        (h.refusal_detected === true)) {
      refusal_count += 1;
    }
  }
}
let ladder_stap = 1 + refusal_count;
```

#### **2. Chinese Dropshipping Optimalisatie**
```javascript
// Levertijd management
const deliveryCfg = {
  drempel_1: 5,                     // < 5 dagen: geruststelling
  drempel_2: 9,                     // 5-9 dagen: extra wachten
  normale_levertijd_werkdagen: '6-9' // Chinese norm
};

// Geen harde deadlines
// Geen tracking links
// Altijd geruststellend
```

#### **3. Dreiging Detectie**
```javascript
// Meertalige dreiging woorden
const threatWords = (rules.dreiging_detectie?.trefwoorden || []).map(lower);
const isThreat = threatWords.some(kw => body.includes(kw));

// Directe actie bij dreiging
if (isThreat) {
  expected_offer = Math.min(Math.max(baseOffer, 50), max_threat);
  alert_type = 'dreiging';
  escalation_needed = true;
}
```

#### **4. Emotie & Mood Herkenning**
```javascript
// Meertalige mood detectie
const negativeWordsPerTaal = {
  nl: ["niet blij", "ontevreden", "slecht", "teleurgesteld"],
  en: ["not happy", "dissatisfied", "bad", "disappointed"],
  de: ["nicht zufrieden", "schlecht", "enttäuscht"]
};

const body = lower(email.cleaned_body || email.email_body || "");
const negativeWords = negativeWordsPerTaal[locale] || negativeWordsPerTaal.nl;
const mood = negativeWords.some(w => body.includes(w)) ? "negative" : "neutral";
```

#### **5. Context-Aware Intelligentie**
```javascript
// Volledige gespreksgeschiedenis
const conversation = history.slice(0, 5).map((h, i) => ({
  nr: i + 1,
  klant: toText(h.message_body || ''),
  ai: toText(h.ai_response || ''),
  type: (h.type || '').toLowerCase(),
  ladder_stap: h.ladder_stap ?? null,
  refusal_detected: h.refusal_detected ?? false,
  created_at: h.created_at || null,
}));

// Context-aware responses
const prompt = `
**GESPREKSGESCHIEDENIS:**
${conversation.map(c => 
  `[${c.created_at}] KLANT: "${c.klant}" | AI: "${c.ai}"${c.ladder_stap ? ' (ladder:' + c.ladder_stap + ')' : ''}`
).join('\n')}
`;
```

### **🚀 LOKALE N8N SETUP - NU MOGELIJK!**

Met de volledige workflow data kunnen we nu:

1. **Lokale N8N installeren**
2. **CURSOR AI workflow importeren**
3. **Alle code nodes** hebben de volledige JavaScript code
4. **Alle Postgres queries** zijn compleet
5. **Alle connections** zijn gedefinieerd
6. **Alle parameters** zijn ingesteld

### **📋 VOLGENDE STAPPEN**

1. **Lokale N8N Setup**:
   ```bash
   # N8N lokaal installeren
   npm install -g n8n
   
   # N8N starten
   n8n start
   ```

2. **Workflow Importeren**:
   - Import `CURSOR_AI_WP5aiR5vN2A9w91i.json`
   - Alle code nodes zijn compleet
   - Alle connections zijn correct

3. **Database Connectie**:
   - Supabase credentials instellen
   - Postgres nodes configureren
   - Test queries uitvoeren

4. **Email Connectie**:
   - Gmail OAuth2 instellen
   - Trigger configureren
   - Test emails versturen

### **🎯 CONCLUSIE**

**PROBLEEM OPGELOST!** We hebben nu:
- ✅ **Volledige workflow data** met alle code details
- ✅ **Complete JavaScript code** in alle 9 code nodes
- ✅ **Volledige SQL queries** in alle 9 Postgres nodes
- ✅ **Complete workflow structuur** met alle connections
- ✅ **Alle node parameters** en configuraties

**Lokale N8N setup is nu mogelijk** voor testing en ontwikkeling!

---

**Status**: ✅ **Volledige workflow data beschikbaar voor lokale setup**
