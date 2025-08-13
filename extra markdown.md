# Laatste markdown - Complete AutoPilot Samenvatting

Dit is een complete samenvatting van het AutoPilot project. Voor meer details, zie de andere documenten op het bureaublad:
- `AutoPilot_Overzicht.md` - Volledige handleiding en sessielog
- `PROJECT_SAMENVATTING.md` - Briefing voor nieuwe agents

---

## Project Doel

AutoPilot is een multi-tenant AI-klantenservice systeem voor dropshipping bedrijven. Het doel is:
- **Compensation-first**: AI biedt eerst compensatie aan (15% → 20% → 30% → 40%), pas bij 40% weigering komt retouradres
- **Menselijk en contextvast**: AI onthoudt vorige aanbiedingen en reageert natuurlijk op vervolgcontact
- **Meertalig**: NL/EN/DE detectie en antwoorden
- **Per tenant configureerbaar**: Alles via LoveAble dashboard instelbaar
- **Deterministisch**: Ladder werkt altijd correct, geen willekeur

---

## Kern Logica

### 1. Ladder Systeem
```
Eerste contact: 15%
Weigering: 20%
Weigering: 30% 
Weigering: 40%
Weigering: retouradres (kosten klant)
Dreiging: direct 50%
```

### 2. Slimme Detecties
- **Taal**: NL/EN/DE via keywords en heuristiek
- **Mood**: happy/neutral/frustrated/angry via meertalige woorden
- **Dreiging**: "advocaat", "consumentenbond", "politie" → direct 50%
- **Soft refusal**: "te weinig", "kan dit hoger", "meer compensatie"
- **Acceptance**: "akkoord", "ok", "deal", "prima"

### 3. Context Bewust
- AI krijgt laatste 30 interacties mee
- Onthoudt `last_known_offer` (hoogste ooit aangeboden)
- Berekent `expected_offer` (volgende stap)
- Thread via `gmail_thread_id` (Gmail threading)

---

## N8N Flow (Definitieve Node Volgorde)

1. **Gmail Trigger** - Nieuwe e-mail
2. **Email parser (Code)** - Extraheert headers, customer info
3. **Email body cleaner (Code)** - Strip HTML, verwijder quotes
4. **Conversation Thread Lookup (Postgres)** - Zoek bestaande thread
5. **Get tenant data (Postgres)** - Haal tenant instellingen + rules
6. **Get Conversation History (Postgres)** - Laatste 30 interacties
7. **Thread ID Generator (Code)** - Genereer thread_id
8. **Klantnaam Extractor (Code)** - Zoek naam in content
9. **Conversation Thread Upsert (Postgres)** - Maak/update thread
10. **Orderdatum Extractor (Code)** - Zoek order info
11. **AI Context builder (Code)** - Bouw complete context
12. **Prompt Generator (Code)** - Maak AI prompts
13. **Message a model1 (OpenAI)** - AI call
14. **Merge1** - Combineer data
15. **Response Parser (Code)** - Parse AI output
16. **Offer Normalizer (Code)** - Force correct percentage
17. **Conversation Thread Context Update (Postgres)** - Update thread
18. **If** - Route dreiging/alerts
19. **Postgres Insert Notification (True)** - Dreiging notificatie
20. **Postgres Insert Escalation (True)** - Escalatie
21. **Gmail Send Escalation (True)** - Stuur dreiging mail
22. **Postgres Store Interaction (False)** - Sla interactie op
23. **Conversation Thread context update (False)** - Update thread
24. **Gmail Send Normal (False)** - Stuur normale mail
25. **Mark a message as read (Gmail)** - Markeer gelezen

---

## Belangrijke Code Blokken

### Email parser (Code)
```javascript
return [{
  json: {
    customer_email: $json.from,
    customer_name: $json.from_name,
    message_id: $json.message_id,
    in_reply_to: $json.in_reply_to,
    references: $json.references,
    gmail_thread_id: $json.thread_id
  }
}];
```

### AI Context builder (Code)
```javascript
// Taal detectie
const langKeywords = {
  nl: ["hoi","hallo","bedankt","retour","terugsturen"],
  en: ["hi","hello","thanks","return","refund"],
  de: ["hallo","danke","rücksendung","zurücksenden"]
};

// Ladder berekening
const baseOffer = Math.max(Number(lookup.huidig_bod || 0), Number(history_max_offer || 0));
let expected_offer;
if (dreiging_detected) {
  expected_offer = Math.min(Math.max(baseOffer, 50), max_threat);
} else if (baseOffer === 0) {
  expected_offer = stappen[0];
} else if (refusal_current || soft_refusal_current) {
  expected_offer = Math.min(nextStepFrom(baseOffer), max_norm);
} else {
  expected_offer = Math.min(baseOffer, max_norm);
}

return {
  klantnaam, mood, detected_lang, dreiging_detected,
  huidig_bod: baseOffer, expected_offer, expected_ladder_step,
  rules, tenant_locale, bedrijfsnaam
};
```

### Offer Normalizer (Code) - KRITIEK
```javascript
const lastKnown = toInt(ctx.last_known_offer || ctx.huidig_bod || 0);
let finalOffer = toInt(ctx.expected_offer || 0);

// Dreiging = 50%
if (isThreat) {
  finalOffer = Math.min(Math.max(finalOffer, 50), maxThreat);
} else {
  finalOffer = Math.min(finalOffer, maxNorm);
}

// Weigering = +1 stap
if (rp.refusal_detected === true) {
  const bumped = nextStepFrom(lastKnown || 0);
  finalOffer = Math.min(bumped, isThreat ? maxThreat : maxNorm);
}

// Sync HTML
let html = String(rp.ai_response_html || '');
if (isCompMail && finalOffer > 0) {
  html = html.replace(/(\d{1,2})\s?%/gi, `${finalOffer}%`);
}

return [{
  json: {
    ...rp,
    compensatie_percentage: finalOffer,
    final_ladder_step,
    ai_response_html: html
  }
}];
```

### Prompt Generator (Code)
```javascript
const SYSTEM = `
You are ${ctx.ai_persona_name || 'Customer Support'} at ${ctx.bedrijfsnaam}.
- Always respond in the customer's language: ${LANG}
- Tone: warm, professional, empathetic; no emojis
- Compensation ladder: 15 → 20 → 30 → 40. Threat = 50.
- COMPENSATION-FIRST:
  1) Do NOT mention 'return/refund' before 30% is refused
  2) Even if customer mentions return: first offer compensation
  3) Only if 40% is refused: provide return address (costs borne by customer)
- On acceptance: set status resolved; confirm clearly
`;

const USER = `
CONTEXT: ${ctx.summary_context}
CURRENT: Mood: ${ctx.mood}, Threat: ${ctx.dreiging_detected}
CURRENT OFFER: ${ctx.huidig_bod}% | Ladder step: ${ctx.ladder_stap}
CUSTOMER EMAIL: ${email.cleaned_text}

DO THIS:
1) Classify type (delivery/return/complaint/cancellation/negotiation/threat/general)
2) Apply COMPENSATION-FIRST policy
3) Produce HTML email with exactly one closing
4) Return JSON with type, status, compensatie_percentage, refusal_detected, acceptance_detected
`;
```

---

## Tenant Regels (Configureerbaar)

### 1. Compensatie Ladder
```json
{
  "stappen": [15, 20, 30, 40],
  "start_percentage": 15,
  "onderhandeling_marge": 15,
  "max_totaal_normaal": 40,
  "max_totaal_dreiging": 50,
  "geen_retour_voor_40": true
}
```

### 2. Soft Refusal Phrases
```json
{
  "phrases": [
    "te weinig", "niet genoeg", "kan dit hoger", "meer compensatie",
    "dat schiet niet op", "hier heb ik weinig aan", "valt tegen"
  ]
}
```

### 3. Category Keywords (Meertalig)
```json
{
  "refusal": ["nee", "niet akkoord", "weiger", "no", "not agree", "refuse"],
  "acceptance": ["akkoord", "ok", "oke", "prima", "deal", "agree"],
  "return_intent": ["retour", "retourneren", "terugsturen", "return", "refund"],
  "order_keywords": ["bestelling", "levering", "order", "delivery"]
}
```

### 4. Fashion Maatprobleem
```json
{
  "detectie_woorden": ["te klein", "te groot", "past niet", "maat klopt niet"],
  "policy": "replacement_first",
  "start_compensatie": 25,
  "retour_direct_kosten_klant": true
}
```

### 5. Delivery Buckets
```json
{
  "3_6": "Je bestelling is verwerkt en onderweg. Levering binnen 3-6 dagen.",
  "7_10": "Je bestelling is onderweg. Levering binnen 7-10 dagen.",
  "11_13": "Levering duurt langer dan verwacht. Heb je ordernummer?",
  "14_plus": "Levering duurt te lang. We starten onderzoek."
}
```

---

## Wat de AI Nu Kan

### 1. Slimme Analyse
- **Intent Classification**: delivery/return/complaint/cancellation/negotiation/threat/general
- **Mood Detection**: happy/neutral/frustrated/angry via meertalige keywords
- **Threat Detection**: "advocaat", "consumentenbond", "politie" → direct escalatie
- **Soft Refusal**: "te weinig", "kan dit hoger" → volgende ladder stap
- **Acceptance Detection**: "akkoord", "ok", "deal" → status resolved

### 2. Context Bewust
- Onthoudt vorige aanbiedingen (`last_known_offer`)
- Berekent volgende stap (`expected_offer`)
- Herkent vervolgcontact via `gmail_thread_id`
- Krijgt laatste 30 interacties mee als context

### 3. Meertalig
- Detecteert NL/EN/DE uit klantbericht
- Antwoordt in juiste taal
- Keywords per taal voor detecties
- Fallback naar tenant locale

### 4. Compensation-First
- Biedt eerst compensatie aan (houd product)
- Geen retour/refund tot 40% weigering
- Dreiging = direct 50% (binnen tenant limiet)
- Retouradres alleen als laatste optie

### 5. Deterministic Control
- Offer Normalizer forceert correct percentage
- HTML en JSON altijd synchroon
- Ladder werkt altijd stap voor stap
- Geen willekeur in aanbiedingen

---

## Database Schema

### Belangrijkste Tabellen
- `tenants`: persona, signature, locale, retouradres, max extra, dagen
- `tenant_business_rules`: rules per tenant (JSON config)
- `master_business_rules`: defaults/templates
- `conversation_threads`: hoofddrager conversatie
- `customer_interactions`: elke e-mail stap
- `notifications`: alerts voor dashboard
- `escalations`: dreigingen voor handmatige actie

### Key Constraints
- `notifications.type`: escalation, retouradres_verleend, max_compensatie, dreiging, high_volume
- `notifications.priority`: low, medium, high, critical
- `notifications.status`: unread, read, resolved
- Unique: `customer_interactions(tenant_id, email_external_id)`

---

## LoveAble Dashboard

### Hooks
- `useThreads`: threads overzicht met filters
- `useEnhancedNotifications`: notificaties met acties
- `useCustomerInteractions`: interacties per thread
- `useConversationTimeline`: gecombineerde timeline

### Pagina's
- **Notificaties**: filters (type/priority/status), "Open thread", mark as read
- **Klantcontacten**: threads overzicht + detail timeline
- **Rules Editor**: per rule_key configureerbaar
- **Tenant Settings**: persona, signature, locale, retouradres

### RLS (Row Level Security)
- Elke tenant ziet alleen eigen data
- Via `get_user_tenant_id` RPC
- Service role alleen server-side

---

## Testplan (Must Pass)

1. **Nieuw retourverzoek** → 15% (HTML+DB synchroon)
2. **"Nee"** → 20% → **"Nee"** → 30% → **"Nee"** → 40% → bij nogmaals "nee" pas retouradres
3. **Dreiging ("advocaat")** → 50% + notification + escalation
4. **Annulering/adreswijziging**: volgt per-tenant dagen; meertalig antwoord
5. **Levering**: buckets (3–6 / 7–10 / 11–13 / 14+) met passende toon
6. **Naam sticky**: threads hergebruiken via `gmail_thread_id`
7. **Context groeit**: `conversation_context` per stap
8. **Ladder synchroon**: `ladder_stap` in thread + interaction

---


**Kern**: Offer Normalizer forceert deterministische ladder; Compensation-first policy; meertalige context; tenant-isolatie via RLS.
