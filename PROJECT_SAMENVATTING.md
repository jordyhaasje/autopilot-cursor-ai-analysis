# Project Samenvatting – AutoPilot (voor volgende Cursor-agent)

Doel
- Multi-tenant AI-klantenservice (dropshipping focus), meertalig (NL/EN/DE), menselijk en contextvast.
- Compensation-first: ladder (15→20→30→40; dreiging 50) met deterministische controle.
- Alles per tenant configureerbaar via LoveAble (persona, signature, regels, dagen/limieten).

Belangrijkste bronnen (vandaag + eerder)
- n8n blueprint(s): kali.json, CURSOR AI.json
- Supabase schema dump: database autopilot.sql
- Documentatie: LoveAble1.docx/.txt, LoveAble2.docx/.txt, diverse .docx in map Logica
- Repo dashboard: autopilots-support-genius (React/Vite/Shadcn)

Wat ik met deze bronnen deed
- Blueprints: node‑volgorde, mappings en actuale node‑namen gecontroleerd; Offer Normalizer als nieuw knooppunt ingepland; If‑routing en “Always output data” opschoning.
- Schema dump: kolomnamen en constraints gevalideerd; missende kolommen (acceptance_detected, cancellation_confirmed, gmail_thread_id) geïntroduceerd; indexen toegevoegd voor thread‑lookup.
- LoveAble1/2: UI/UX intenties en labels/flows geïnventariseerd; vertaald naar threads‑overzicht, notificatiecenter, en regels‑editor roadmap.
- Repo UI: hooks en pagina’s aangepast of toegevoegd om Supabase RLS‑conform te lezen (via get_user_tenant_id) en de nieuwe data te visualiseren (threads/timeline/alerts).

Stand van zaken (functioneel)
- Flow werkt met context, meertaligheid, ladder, refusal/acceptance detection, dreiging-detectie.
- Deterministisch bod via Offer Normalizer (override LLM): JSON + HTML synchroon.
- Threading op `gmail_thread_id`, history tot 30 items, thread‑context append.
- Upserts en idempotentie: `(tenant_id, email_external_id)` op interactions.

Belangrijke wijzigingen t.o.v. eerdere situatie
- AI stuurde soms 30% als eerste bod → gescheiden `last_known_offer` en `expected_offer` + Offer Normalizer die het eindbod afdwingt (JSON én HTML).
- Weigering stapte soms niet door → soft refusal detectie + hard guard in Offer Normalizer: exact één stap hoger vanaf `last_known_offer`.
- Mismatch HTML/DB → Gmail nodes moeten Offer Normalizer HTML gebruiken (niet Response Parser).
- Thread lookup instabiel → lookup via `gmail_thread_id` met fallback `customer_email`; wiring verplaatst direct na Email parser.
- Notificatie type error → type set naar toegestane set (o.a. `dreiging`).

Kern van de flow (n8n, node-namen exact)
1) Gmail Trigger
2) Email parser (Code): From/To, customer_name, `message_id`, `in_reply_to`, `references`, `gmail_thread_id`
3) Email body cleaner (Code): strip HTML + quoted replies
4) Conversation Thread Lookup (Postgres): via `gmail_thread_id` of `customer_email`
5) Get tenant data (Postgres): instellingen + rules (JSON_AGG)
6) Get Conversation History (Postgres): laatste 30
7) Thread ID Generator (Code)
8) Klantnaam Extractor (Code)
9) Conversation Thread Upsert (Postgres): append context + set `gmail_thread_id`
10) Orderdatum Extractor (Code)
11) AI Context builder (Code): taal/mood/soft refusal/dreiging + ladder `expected_offer`
12) Prompt Generator (Code): Compensation-first + tenant persona/signature
13) Message a model1 (OpenAI)
14) Merge1
15) Response Parser (Code): JSON normalisatie, type guard, fallback acceptance/refusal
16) Offer Normalizer (Code): force `finalOffer` en sync in HTML; `final_ladder_step`
17) Conversation Thread Context Update (Postgres): update `ladder_stap` + `huidig_bod`
18) If (dreiging/alerts)
19) Postgres Insert Notification (True)
20) Postgres Insert Escalation (True)
21) Gmail Send Escalation (True)
22) Postgres Store Interaction (False) – gebruikt Offer Normalizer velden
23) Conversation Thread context update (False)
24) Gmail Send Normal (False) – gebruikt Offer Normalizer HTML
25) Mark a message as read (Gmail)

Always output data
- Aan: Code/SELECT nodes
- Uit: Postgres writes, Gmail, OpenAI, If

Database (Supabase)
- Belangrijkste tabellen: `tenants`, `tenant_business_rules`, `master_business_rules`, `conversation_threads`, `customer_interactions`, `notifications`, `escalations`
- Extra kolommen toegevoegd: interactions: `acceptance_detected`, `cancellation_confirmed`, `gmail_thread_id`; threads: `gmail_thread_id`
- Indexen: `ix_ct_gmail_thread`, `ix_ci_gmail_thread`; Unique: `ux_ci_tenant_email_external`
- Constraints: notifications.type in {escalation, retouradres_verleend, max_compensatie, dreiging, high_volume}; priority in {low, medium, high, critical}; status in {unread, read, resolved}

Business rules (per tenant)
- `compensatie_ladder`: stappen + maxima; `geen_retour_voor_40`
- `soft_refusal_phrases` en `category_keywords` (meertalig)
- `fashion_maatprobleem` (master + tenant)
- Dagen: annulering/adreswijziging; `maximaal_extra_compensatie`; `retouradres`; `ai_persona_name`, `ai_signature_html`, `locale`

Deterministische ladder
- `last_known_offer` = max(thread.huidig_bod, historisch hoogste)
- `expected_offer` = begin of volgende stap; dreiging = 50, begrensd
- Offer Normalizer: bij `refusal_detected` → precies één stap hoger dan `last_known_offer`, binnen max

LoveAble dashboard (repo UI)
- Hooks: `useThreads`, `useEnhancedNotifications`, `useCustomerInteractions`, `useConversationTimeline`
- Pagina’s: `Notificaties.tsx` (filters/acties), `Klantcontacten.tsx` (threads-overzicht + detail timeline)
- RLS via `get_user_tenant_id` RPC; `.env.local` bevat publieke Supabase URL/ANON key

Testdata (seed)
- `seed-thread-3` (dreiging): thread + 1 interaction (50%) + 1 notification (type=dreiging)
- `seed-thread-1` (compensatie): thread aanwezig; 2 interactions (15% → 20%) toevoegen (metadata='{}'::jsonb)
- `seed-thread-2` (levering): aanmaken met 1 interaction (days_since_order=8) aanbevolen

Wat moet je terugdraaien?
- Niets terugdraaien in DB of flow. Zorg alleen dat alle verwijzingen naar AI-output nu uit Offer Normalizer komen (niet uit Response Parser) voor `ai_response_html` en percentages.

Wat mogelijk nog “anders” is dan je gewend was
- `Always output data` staat UIT op kritieke writes en branching (If, Postgres, Gmail, OpenAI). Dit maakt fouten zichtbaar en voorkomt “stil” doorlopen.
- Notificaties gebruiken `status` (unread/read/resolved) en priority (low/medium/high/critical). Type alleen uit de toegestane lijst.
- Threads behouden `conversation_context` als jsonb array; timeline in UI combineert dit met interactions voor compact overzicht.

Wat nog te doen (prioritair)
- Seed interacties voor seed-thread-1 en seed-thread-2 voltooien
- Quick actions werkend maken (resolve thread, open Gmail URL, kopieer retouradres (uit tenant settings))
- UI polish: tooltips/animaties, skeleton states, labels i18n consistent

Belangrijke locaties
- Desktop: `~/Desktop/AutoPilot_Overzicht.md` (hoofddocument)
- Repo: `autopilots-support-genius` (branch `feature/dashboard-sprint1`)
- n8n: nodes conform lijst hierboven (case-sensitive); Offer Normalizer output als bron voor DB en e-mails

Notitie
- Deze samenvatting is niet 100% up-to-date met iedere commit, maar bevat alle kernbeslissingen en mappings. Gebruik dit als start; controleer de laatste branch en n8n‑blueprint voor exacte codeblokken en node‑namen.

---

Voor nieuwe agent (Cursor)
- Lees dit bestand eerst, daarna `~/Desktop/AutoPilot_Overzicht.md` voor detail.
- Zet `.env.local` met publieke Supabase URL/ANON en start lokaal (`npm install --legacy-peer-deps`, `npm run dev -- --port 8080 --host`).
- Raadpleeg bronnen op Desktop: `Logica/kali.json`, `CURSOR AI.json`, `Logica/database autopilot.sql`, `LoveAble1/2.docx(.txt)`.
- Let op in n8n: Offer Normalizer is de bron voor `ai_response_html` en percentages; If‑node OR; Conversation Thread Lookup direct na Email parser; Always output data uit op kritieke nodes.

Te delen met de agent
- Repo‑link, `.env.local` placeholders, Desktop‑documenten (dit bestand + AutoPilot_Overzicht.md).
- Eventuele recente n8n exports (CURSOR AI.json) en Supabase schema (database autopilot.sql).
- Indien nodig toegang tot Supabase SQL Editor (voor seed/migraties) – niet de service‑role key delen.



