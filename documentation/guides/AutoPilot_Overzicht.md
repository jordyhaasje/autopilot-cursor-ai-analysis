# AutoPilot – Overzicht, Implementatie en Richtlijnen (v3)

Dit document is de single source of truth voor AutoPilot. Het is geschreven zodat iedere ontwikkelaar/AI snel kan instappen en doorbouwen zonder extra context. Bevat: doel, flow, database, business rules, code‑richtlijnen, testplan, troubleshooting, dashboard‑koppelingen en roadmap.

---
## 1. Doel & Scope
- Multi‑tenant AI‑klantenservice voor (drop)shipping.
- Meertalige (NL/EN/DE) antwoorden met menselijke toon en variatie.
- Compensatie‑first: retour/geld‑terug pas op de laatste ladderstap (of dreiging). 
- Sterk geheugen: vorige aanbiedingen, emotie en context bepalen de volgende stap.
- Volledig per tenant te beheren via LoveAble (instellingen en rules). 
- Idempotent opslaan, correcte threading (Gmail) en notificaties/escalaties.

---
## 2. Architectuur – n8n workflow
Node‑namen zijn exact, case‑sensitive. 

1) Gmail Trigger  
2) Email parser (Code)  
3) Email body cleaner (Code)  
4) Conversation Thread Lookup (Postgres)  
5) Get tenant data (Postgres)  
6) Get Conversation History (Postgres)  
7) Thread ID Generator (Code)  
8) Klantnaam Extractor (Code)  
9) Conversation Thread Upsert (Postgres)  
10) Orderdatum Extractor (Code)  
11) AI Context builder (Code)  
12) Prompt Generator (Code)  
13) Message a model1 (OpenAI)  
14) Merge1  
15) Response Parser (Code)  
16) Offer Normalizer (Code)  
17) Conversation Thread Context Update (Postgres)  
18) If (dreiging/alert‑router)  
19) Postgres Insert Notification (True)  
20) Postgres Insert Escalation (True)  
21) Gmail Send Escalation (True)  
22) Postgres Store Interaction (False)  
23) Conversation Thread context update (False)  
24) Gmail Send Normal (False)  
25) Mark a message as read (Gmail)

### 2.1 Wiring‑notities
- Conversation Thread Lookup hangt direct aan Email parser (of Email body cleaner) zodat het 1 item ontvangt.  
- Get Conversation History loopt parallel; dient puur als context voor AI.  
- Gmail Send (Normal/Escalation) gebruikt altijd `Offer Normalizer.ai_response_html`.

### 2.2 Always output data
- AAN: Code‑nodes en SELECT‑nodes (parser/cleaner/context/history/lookup).  
- UIT: Get tenant data, beide Conversation Thread updates, If, alle Postgres‑writes, alle Gmail‑nodes, OpenAI‑node. 

### 2.3 If‑node conditions (OR)
- `{{$node["Response Parser"].json.type}}` equals `threat`
- `{{$node["AI Context builder"].json.dreiging_detected}}` is true
- `{{$node["Response Parser"].json.alert_type}}` notEmpty

---
## 3. Database – Supabase
### 3.1 Belangrijkste tabellen
- `tenants`: basisinstellingen per tenant (persona, signature, locale, retouradres, max extra, dagen annuleren/adreswijziging, active, …).
- `tenant_business_rules`: rules per tenant (`rule_key`, `rule_config` jsonb, `is_active`, `priority`).
- `master_business_rules`: defaults die bij onboarding naar `tenant_business_rules` gekopieerd kunnen worden.
- `conversation_threads`: hoofddrager van een conversatie (PK `thread_id`), met `customer_email`, `customer_name`, `current_status`, `ladder_stap`, `huidig_bod`, `conversation_context` (jsonb array), `gmail_thread_id`.
- `customer_interactions`: elke e‑mailstap met `compensatie_percentage`, flags, `metadata` (jsonb), `email_external_id`, `direction` en `gmail_thread_id`.
- `notifications` en `escalations`: voor LoveAble dashboard alerts/escalaties.

### 3.2 Key constraints & indexen
- UNIQUE: `customer_interactions(tenant_id, email_external_id)` → idempotent per e‑mail.  
- PK `conversation_threads.thread_id` + UNIQUE `(thread_id, tenant_id)` en `(tenant_id, customer_email)`.  
- Indexen op `gmail_thread_id` in beide tabellen (thread‑koppeling).

### 3.3 Kolom‑gebruik (praktisch)
- `compensatie_percentage`: uiteindelijke aangeboden percentage (Offer Normalizer).  
- `onderhandeling_percentage`: expliciet door klant genoemd %.  
- `refusal_detected` / `acceptance_detected`: uit parser + fallback.  
- `cancellation_confirmed` / `annulering_aangevraagd`: annuleringspad.  
- `metadata` (jsonb): `order_date_iso`, `days_since_order`, `needs_order_info`.  
- `mood_detected`: `happy|neutral|frustrated|angry` (heuristiek).  
- `ai_confidence_score`: modelvertrouwen (nu 0.95).  
- `confidence_score`: flowvertrouwen (nu 1).  
- `ignore`/`spam`: gereserveerd voor filters; nu niet actief.  
- `conversation_context` (threads): array van snapshots per stap (ts, type, status, ladder, bod).  
- `ladder_stap` (threads + interactions): stapnummer behorend bij het aangeboden bod.

---
## 4. Business rules (per tenant)
### 4.1 Rule keys en aanbevolen velden
- `compensatie_ladder`: `{ stappen:[15,20,30,40], start_percentage:15, onderhandeling_marge:15, max_totaal_normaal:40, max_totaal_dreiging:50, geen_retour_voor_40:true }`
- `onderhandeling_logica`: `{ trigger_woorden:[…], max_extra_percentage:<num> }` (fallback: `tenants.maximaal_extra_compensatie`).
- `soft_refusal_phrases`: `{ phrases:[…] }` (impliciete weigering).
- `category_keywords`: `{ refusal:[…], acceptance:[…], return_intent:[…], order_keywords:[…] }` (meertalig beheren).  
- `delivery_buckets`: teksten voor 3–6, 7–10, 11–13, 14+. 
- `fashion_maatprobleem`: `{ actie:"replacement_first", compensatie_na_weigering:40, detectie_woorden:[…] }`.

### 4.2 Gedrag
- Regels zijn hints + guards; AI beslist binnen context.  
- Weigering telt alleen als: (a) er al een bod loopt (last_known_offer>0), of (b) expliciet hoger % is gevraagd.  
- “Nee dankje” in een ander onderwerp triggert niets; type‑guard en context‑guard beschermen dit.

---
## 5. Intelligentie, taal & ladder (kernlogica)
- Taal: detectie NL/EN/DE uit klantzin (fallback `tenants.locale`).  
- Emotie (mood): heuristiek meertalig.  
- Dreiging: meertalige trefwoorden; direct 50% (bounded) + notificatie/escalatie.  
- Ladder deterministisch: 
  - `last_known_offer` = max(thread.huidig_bod, history_max_offer).  
  - `expected_offer` = volgende stap (start 15, weigering +1, dreiging 50).  
  - Offer Normalizer dwingt percentage en doet bij `refusal_detected=true` exact één stap verhoging vanaf `last_known_offer`.  
- Guard op type: als er al een bod liep en model zegt “general”, dan coercion naar `negotiation`/`return` afhankelijk van context.

---
## 6. Definitieve codeblokken (samengevat uit flow)
De volledige versies staan in de n8n‑nodes:
- Email body cleaner (strip + quote‑cut)  
- AI Context builder (meertalig, guards, last_known_offer vs expected_offer)  
- Response Parser (fallbacks, type‑guard, rijke summary)  
- Offer Normalizer (single‑step bump, final_ladder_step, HTML sync)  
- Conversation Thread Context Update (zet `ladder_stap` + `huidig_bod`, append context, telt +1)  
- Postgres Store Interaction (lange versie; `ladder_stap` uit Offer Normalizer)  
- Postgres Insert Notification (priority low/high)

> Zie de n8n workflow voor exact ingelijmde code (we hebben deze al vervangen).

---
## 7. Testplan (must pass)
1) Nieuw retourverzoek → 15% (HTML+DB synchroon).  
2) “Nee” → 20% → “Nee” → 30% → “Nee” → 40% → bij nogmaals “nee” pas retouradres.  
3) Dreiging ("advocaat") → 50% + notification + escalation.  
4) Annulering/adreswijziging: volgt per‑tenant dagen; meertalig antwoord.  
5) Levering: buckets (3–6 / 7–10 / 11–13 / 14+) met passende toon; geen live tracking claim.  
6) Naam sticky; threads hergebruiken via `gmail_thread_id`.  
7) `conversation_context`: groeit per stap (ts, type, status, ladder, bod).  
8) `ladder_stap` in thread + interaction reflecteert laatste aanbod.

---
## 8. Troubleshooting
- E‑mail toont ander % dan DB → Gmail nodes moeten `Offer Normalizer.ai_response_html` gebruiken.  
- Ladder blijft hangen op 15% → check dat Offer Normalizer bump op `last_known_offer` uitvoert en dat thread‑update `huidig_bod` zet.  
- Notification priority error → gebruik ‘low’/‘high’, niet ‘normal’.  
- Duplicaten → UNIQUE `(tenant_id, email_external_id)` en juiste `message_id`.  
- “No data found for item-index …” → Conversation Thread Lookup mag geen lijst als input krijgen; hang aan `Email parser` of gebruik `Item Lists: Keep first`.

---
## 9. LoveAble dashboard – integratie
- `tenants`: persona, signature (HTML), locale, retouradres, max extra, annulerings‑ en adreswijzigingsdagen.  
- `tenant_business_rules`: editors per `rule_key` (chips/number/toggles/JSON).  
- `notifications`/`escalations`: tonen alerts/escalaties per tenant.  
- Onboarding: kopieer `master_business_rules` → `tenant_business_rules`.  
- Workflows per tenant dupliceren: alleen Gmail‑connectie varieert, logica identiek.

### 9.1 UI‑aanbevelingen
- Regellisten als chips (refusal/acceptance/return/order).  
- Number inputs voor marges/dagen.  
- Rich text voor signature.  
- Preview van ladder en eindgrenzen (normaal/dreiging).  
- Rapportage: acceptatiepercentages per stap (15/20/30/40/50) en per categorie.

---
## 10. Security & RLS
- RLS policies zorgen dat iedere tenant alleen eigen data ziet.  
- Service role alleen server‑side gebruiken.  
- Geen gevoelige keys client‑side in LoveAble. 

---
## 11. Roadmap / To‑do
- Extra talen (FR/ES).  
- Dynamische `ai_confidence_score` uit modellogprobs.  
- Meer granulariteit in delivery bucket‑teksten per tenant.  
- Geavanceerde intents (kleur/maat/kapot) als aparte rules + templates.  
- Dashboard: bulk‑edit rules, A/B‑testing van ladder/teksten. 

---
## 12. Changelog (belangrijkste wijzigingen)
- v3: Offer Normalizer met single‑step bump; AI Context builder splitst `last_known_offer` en `expected_offer`; type‑guard in Response Parser; Conversation Thread Lookup hangt aan Email parser; Conversation Thread Context Update schrijft `ladder_stap` + `huidig_bod` en telt +1; Postgres Store Interaction gebruikt `final_ladder_step`.
- v2: documenteer flow, rules en node‑instellingen; notificatie priority fix; Gmail nodes → Offer Normalizer.

---
## 13. Glossary
- last_known_offer: hoogste reeds aangeboden bod in deze thread.  
- expected_offer: volgende bod volgens ladder/logica.  
- final_ladder_step: stapnummer voor het verzonden bod (Offer Normalizer).  
- compensation‑first: geen retour/geld‑terug tot de laatste ladderstap (of dreiging).

---
## 14. Repos & Locaties
- LoveAble UI/dashboard: https://github.com/jordyhaasje/autopilots-support-genius  
- Dit document: `~/Desktop/AutoPilot_Overzicht.md`


---
## 15. Sessielog (vandaag) – wijzigingen en status

- Seed & constraints
  - `notifications.type` mag alleen: `escalation`, `retouradres_verleend`, `max_compensatie`, `dreiging`, `high_volume`. Seed aangepast naar `type='dreiging'` (ok).
  - Toegevoegd: thread `seed-thread-3` (dreiging) + 1 interaction + 1 notification (id=9). Status later gewijzigd naar `read` vanuit UI.
  - Aangemaakt: thread `seed-thread-1` (compensatie-ladder). Interacties klaar om toe te voegen (we gebruiken `metadata='{}'::jsonb` om JSON-fouten te voorkomen).
  - `seed-thread-2` (levering) ligt klaar om te seeden (één interaction met delivery-bucket voorbeeld).
- Flow/n8n
  - Offer Normalizer definitief bronpunt voor percentage en HTML; Gmail‑send nodes gebruiken `{{$node["Offer Normalizer"].json.ai_response_html}}`.
  - Conversation Thread Lookup is nu rechtstreeks na Email parser aangesloten (en ontvangt 1 item) om “No data found for item-index” te voorkomen.
  - If‑node OR‑condities: (type=threat) of (ctx.dreiging_detected) of (alert_type not empty). Always output data staat uit op deze node.
  - Postgres Store Interaction upsert op `(tenant_id, email_external_id)` met `::jsonb` casting voor metadata.
- Dashboard (LoveAble)
  - Nieuwe hook: `useThreads.ts` (threads‑overzicht per tenant). 
  - Notificaties: `useEnhancedNotifications` + filters voor type/priority/status en acties (read/resolved).
  - `Klantcontacten.tsx`: threads‑tabel + thread‑detail met gecombineerde timeline (interactions) en quick‑actions placeholders.

Openstaande punten
- Seed: interacties voor `seed-thread-1` en hele `seed-thread-2` nog toevoegen (technisch klaar, JSON quoting gefixt door '{}'::jsonb te gebruiken).
- UI: quick actions koppelen (resolve thread, open Gmail, kopieer retouradres), tooltips/animaties verfijnen.

Terugdraaien nodig?
- Nee. We hebben niets in de database teruggedraaid; we hebben alleen values gecorrigeerd (notification type). In n8n hebben we wiring en node‑bronnen verbeterd (Offer Normalizer als bron voor e‑mail HTML en percentage). Indien je oude mapping gebruikte richting Response Parser voor `ai_response_html` of percentages, vervang die door Offer Normalizer.

---

## 16. Voor nieuwe agent (Cursor) – Onboarding en Setup

Aanpak in 10 minuten:
- Lees eerst `~/Desktop/PROJECT_SAMENVATTING.md` (korte briefing) en daarna dit document voor details.
- Repo clonen: `git clone https://github.com/jordyhaasje/autopilots-support-genius.git`
- `.env.local` aanmaken met Supabase URL/ANON (publiek). Service‑role/DB wachtwoorden nooit in repo.
- `npm install --legacy-peer-deps` en `npm run dev -- --port 8080 --host` → open `http://localhost:8080`.
- RLS vereist tenant‑context; login en RPC `get_user_tenant_id` wordt gebruikt in hooks.
- n8n blueprint openen (zie bronnen hieronder), node‑namen case‑sensitive houden; Offer Normalizer output gebruiken in alle writes/emails.

Checklist (kort):
- [ ] Gmail Send nodes gebruiken `{{$node["Offer Normalizer"].json.ai_response_html}}`
- [ ] `Postgres Store Interaction` leest `ladder_stap` en `compensatie_percentage` uit Offer Normalizer
- [ ] Conversation Thread Lookup direct na Email parser (enkel item)
- [ ] If‑node OR‑condities: threat/ctx.dreiging/alert_type; Always output data = uit
- [ ] Notifications type binnen toegestane set (bv. `dreiging`)
- [ ] Threads/Interactions hebben `gmail_thread_id` gevuld

Openstaande acties voor jou:
- Seed aanvullen: 2 interacties voor `seed-thread-1` + 1 interaction voor `seed-thread-2` (delivery bucket). Gebruik `metadata='{}'::jsonb` om JSON‑quoting issues te vermijden.
- Quick actions in UI koppelen (resolve, open Gmail‑URL, kopieer `tenants.retouradres`).

---

## 17. Te delen bestanden en locaties (bronnen)

- Repo (dashboard/UI): `https://github.com/jordyhaasje/autopilots-support-genius`
- Desktop documenten:
  - `~/Desktop/PROJECT_SAMENVATTING.md` (briefing voor agent)
  - `~/Desktop/AutoPilot_Overzicht.md` (dit document)
- n8n/Logica map:
  - `~/Desktop/Logica/kali.json` (oorspronkelijke blueprint)
  - `~/Desktop/CURSOR AI.json` (laatste blueprintversie)
  - `~/Desktop/Logica/database autopilot.sql` (schema dump)
  - `~/Desktop/LoveAble1.docx` + `LoveAble1.txt`, `~/Desktop/LoveAble2.docx` + `LoveAble2.txt` (UI/flow toelichting)
- Supabase (productie database): via SQL Editor (service‑role) voor seed/migraties; RLS actief voor dashboard.

Opmerking security
- Deel geen service‑role keys of wachtwoorden in deze documenten. Gebruik placeholders of deel secrets buiten Git/markdown om.

## Appendix A – Regels aanmaken/updaten (SOP)
Dit is het operationele stappenplan om samen nieuwe business rules te maken of bestaande te wijzigen. Regels zijn hints/guards; AI beslist binnen context en schakelt niet “blind” op losse woorden.

### A.1 Nieuwe rule toevoegen (master + tenant)
1) Voeg de rule eenmalig toe aan `master_business_rules` (template/default):
```sql
INSERT INTO master_business_rules (rule_key, rule_name, rule_config, html_template, category, description, is_required, created_at)
VALUES (
  'fashion_maatprobleem',
  'Maat/Fit probleem',
  '{
    "detectie_woorden": ["te klein","te groot","valt klein","valt groot","past niet","maat klopt niet","size too small","too big","doesn''t fit","passt nicht"],
    "policy": "replacement_first",          
    "start_compensatie": 25,                 
    "retour_direct_kosten_klant": true       
  }'::jsonb,
  NULL,
  'fashion',
  'Herken maat/fit issues en pas beleid toe (replacement, startcompensatie of direct retour).',
  false,
  NOW()
)
ON CONFLICT (rule_key) DO NOTHING;
```
2) Activeer/overschrijf per tenant in `tenant_business_rules`:
```sql
INSERT INTO tenant_business_rules (tenant_id, rule_key, rule_config, is_active, priority, updated_at)
VALUES (
  '<TENANT_ID>',
  'fashion_maatprobleem',
  '{
    "detectie_woorden": ["te klein","te groot","past niet","maat klopt niet","size too small","too big","doesn''t fit","passt nicht"],
    "policy": "start_comp",                 
    "start_compensatie": 25,
    "retour_direct_kosten_klant": true
  }'::jsonb,
  true,
  10,
  NOW()
)
ON CONFLICT (tenant_id, rule_key)
DO UPDATE SET rule_config=EXCLUDED.rule_config, is_active=true, updated_at=NOW();
```
3) De flow leest deze waarden realtime (geen redeploy nodig). Context/prompt gebruiken de flags:
- `size_issue_detected`, `size_policy`, `size_start_comp`, `force_return_immediate`, `force_replacement_first`, `size_retour_kosten_klant`.
- Alleen bij duidelijke context (lopend bod of expliciete size‑woorden) past AI de policy toe.

### A.2 Bestaande rule wijzigen (tenant)
- Update `tenant_business_rules.rule_config` met nieuwe waarden; `updated_at` en `priority` indien gewenst. 
- Flow pakt dit direct op. 

### A.3 Richtlijnen
- Woordenlijsten zijn hints; gebruik altijd context‑guards (lopend bod, intent). 
- Houd defaults in `master_business_rules`; kopieer bij onboarding naar `tenant_business_rules`.

---
## Appendix B – LoveAble dashboard: huidige werking en roadmap

### B.1 Huidige werking
- Onboarding: nieuwe tenant moet worden goedgekeurd. 
- Bij goedkeuring: dupliceren we de n8n‑flow voor de tenant en zetten we de Gmail‑connectie om. 
- Elke tenant heeft daarmee een eigen flow; alleen e‑mails van de betreffende Gmail komen binnen (geen cross‑tenant mix). 
- Dashboard leest:
  - `tenants` (instellingen), `tenant_business_rules` (rules)
  - `conversation_threads`, `customer_interactions` (gesprekken/logs)
  - `notifications`, `escalations` (alerts/escalaties)

### B.2 Master vs Tenant rules
- `master_business_rules`: centrale defaults/templates. 
- `tenant_business_rules`: per tenant actief; wordt bij onboarding gevuld vanuit master en is daarna door de gebruiker aanpasbaar. 
- Optioneel: `master_scenarios` + `scenario_rules` + `scenario_assignments` voor bundels van rules die in één keer naar een tenant gekopieerd worden.

### B.3 UI‑verbeteringen (roadmap)
- Rule‑editors per `rule_key` (chips/number/toggles/JSON) inclusief validatie. 
- Scenario beheer: kies een `master_scenarios` bij onboarding om regels in bulk te kopiëren. 
- Rapportage: conversie per ladderstap (15/20/30/40/50), accept/decline ratio, categories. 
- Workflow health: laatste errors per node, latency, queue. 
- E‑mail filters beheer: `email_filters` voor spam/ignore/vip en directe koppeling aan interactions.

### B.4 Extra kolommen/velden voor UI (aanbevolen)
- `customer_interactions.interpretation`: toon korte modelinterpretatie in lijsten. 
- `notifications.status/resolved_at`, `escalations.assigned_to/resolution_notes/escalation_level`: volledige levenscyclus beheren. 
- `conversation_threads.vip_status`: markeer VIP in UI. 
- `tenant_business_rules.priority`: sortering/overrule zichtbaar maken. 

### B.5 Veiligheid
- RLS policies zorgen voor tenant‑isolatie. 
- Gebruik service‑role alleen server‑side; dashboard gebruikt user tokens per tenant.

---
## Appendix C – Operationele afspraken
- Nieuwe of gewijzigde rules ontwikkelen we samen volgens Appendix A (SQL + kleine context/prompt‑aanpassing). 
- Bij twijfel over woorddetectie: eerst context‑guard toevoegen, daarna woordenlijst uitbreiden. 
- Bij regressies: volg het testplan (15→20→30→40, dreiging 50, buckets, annulering/adreswijziging). 


---
## Appendix D – LoveAble Dashboard Implementatieplan

### D.1 UX-doelen
- Superstrak, professioneel, geen emoji's; consistente labels/i18n; snelle feedback (skeletons, toasts), tooltips met korte uitleg.
- Handelingen in 2–3 klikken max: zien → begrijpen → handelen.

### D.2 Schermen & componenten
1) Overzicht
- KPI-cards (useDashboardStats): open threads, accept-ratio per ladder, alerts open/high.
- Realtime badges voor nieuwe notificaties.

2) Notifications Center
- Tabel: type, priority, title, ts, thread link, status (read/resolved).
- Filters: type (threat/acceptance/max_refused/return_sent/...); priority; status.
- Acties: mark read, resolve, open thread.
- Bron: `notifications` (toon ook `metadata.alert_type`, `thread_id`).

3) Threads lijst
- Kolommen: klant (email/naam), laatste contact, ladder_stap (badge), huidig_bod (%), mood, current_status, escalation_level, VIP.
- Filters/zoek: email, status, type, ladder, mood.
- Bron: `conversation_threads`.

4) Thread detail
- Timeline: merge `customer_interactions` + `conversation_context` (ts, type, status, bod/stap) met duidelijke labels.
- Actiepaneel: bied 15/20/30/40; stuur retouradres; replacement-first; escaleren; resolve.
- Meta: `metadata.days_since_order`, `order_date_iso`, detected_lang, dreiging, gmail_thread_id.

5) Rules Editor (per tenant)
- Editors per rule_key:
  - compensatie_ladder: stappen-array, max_norm/dreiging, toggles (geen_retour_voor_40), preview.
  - onderhandeling_logica: trigger_woorden (chips), max_extra_percentage.
  - soft_refusal_phrases: chips.
  - category_keywords: chipsgroepen (refusal/acceptance/return/order).
  - delivery_buckets: min/max/messages.
  - fashion_maatprobleem: detectie_woorden, policy (replacement_first|start_comp|return_immediate|ladder), start_compensatie, retour_kosten.
- Opslag: `tenant_business_rules.rule_config`; scenario-loader kopieert `master_scenarios`.

6) Templates & Signature
- Rich text editor; variabelenpalet ({{customer_name}}, {{company_name}}, {{signature}}, {{order_date}}, {{days_since_order}}).
- Live preview met tenant-signature.

7) Tenant Settings
- Persona/signature (HTML), locale, retouradres, max extra, annulering/adreswijziging dagen.

### D.3 Mappings (belangrijkste kolommen)
- Threads: ladder_stap, huidig_bod, customer_mood, current_status, vip_status, conversation_context, gmail_thread_id.
- Interactions: compensatie_percentage, onderhandeling_percentage, refusal/acceptance, cancellation_confirmed, metadata, interpretation, direction, created_at.
- Notifications: type, priority, title, message, metadata.alert_type, status/read/resolved_at, thread_id.
- Escalations: escalation_type/level, current_status, assigned_to, resolution_notes.

### D.4 Notificaties (minimaal)
- threat (high), acceptance_detected, max_ladder_refused, return_address_sent, cancellation_confirmed, address_change_request, confirmation_missing, size_issue_detected, high_compensation, vip_customer.

### D.5 Techniek
- Supabase Realtime op `notifications` per tenant_id.
- RLS enforced; alleen `NEXT_PUBLIC_SUPABASE_*` in frontend.
- Forms met Zod-schema's; optimistic updates; toasts bij succes/fout.

### D.6 Roadmap UI
- Fase 1: Notifications Center, Threads lijst/detail.
- Fase 2: Rules Editor (compensatie_ladder + fashion_maatprobleem), Templates.
- Fase 3: Scenario management, uitgebreide rapportage, escalations board.

---
## Appendix E – UI Richtlijnen
- Typografie/spacing consistent; states: loading (skeleton), empty, error.
- Labels in NL; i18n via tenant.locale voor teksten.
- Tooltips kort, zonder emoji; help-links naar kennisbank.
- Actieknoppen: primaire acties rechtsboven; destructief in rood.
- Tabellen met sticky header, paginatie/virtuele lijst bij veel rijen.

