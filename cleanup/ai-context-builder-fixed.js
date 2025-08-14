// Node: AI Context builder (FIXED VERSION)
// ID: 5f65e795-82d2-4c5d-83a5-681023898c1b
// Fix: dreigin -> dreiging typfout

function toText(html){ return String(html||'').replace(/<[^>]+>/g,' ').replace(/\s{2,}/g,' ').trim(); }
function lower(x){ return String(x||'').toLowerCase(); }

// Input
const email   = $node["Email body cleaner"].json || {};
const tenant  = $node["Get tenant data"].json || {};
const history = Array.isArray($node["Get Conversation History"].json) ? $node["Get Conversation History"].json : [];
const lookup  = $node["Conversation Thread Lookup"].json || {};
const order   = $node["Orderdatum Extractor"].json || {};
const nameEX  = $node["Klantnaam Extractor"].json || {};

// Tenant basics
const bedrijfsnaam      = tenant.bedrijfsnaam || "Ons bedrijf";
const fallbackLocale    = (tenant.locale || 'nl').split('-')[0];
const ai_persona_name   = tenant.ai_persona_name || "Klantenservice";
const ai_signature_html = tenant.ai_signature_html || `<p>Met vriendelijke groet,<br>${ai_persona_name} – ${bedrijfsnaam}</p>`;
const annulering_toegestaan_dagen     = tenant.annulering_toegestaan_dagen ?? null;
const adreswijziging_toegestaan_dagen = tenant.adreswijziging_toegestaan_dagen ?? null;
const maximaal_extra_compensatie      = tenant.maximaal_extra_compensatie ?? 15;
const retouradres                     = tenant.retouradres || "";

// Sticky klantnaam
let klantnaam = lookup.customer_name || nameEX.extracted_name || email.customer_name || "";
if (!klantnaam && email.customer_email) klantnaam = email.customer_email.split("@")[0];

// History: hoogste eerder bod + samenvatting (VERBETERD: 20 interacties)
let history_max_offer = 0;
const hist_lines = [];
for (const h of history) {
  const msg = toText(h.klant || h.ai || h.message || h.body || "");
  if (h.compensatie_percentage && Number(h.compensatie_percentage) > history_max_offer) history_max_offer = Number(h.compensatie_percentage);
  if (msg) hist_lines.push(`${h.ai ? 'AI' : 'Klant'}: ${msg.slice(0,200)}`);
}
const summary_context = hist_lines.slice(0,20).join(" | "); // VERBETERD: 20 interacties

// Body + taal
const bodyRaw   = String(email.cleaned_text || email.email_body || "");
const bodyLower = lower(bodyRaw);
const langKeywords = {
  nl: ["hoi","hallo","bedankt","retour","terugsturen","bestelling","levering","niet akkoord","weiger","akkoord","annuleren","adreswijziging"],
  en: ["hi","hello","thanks","return","refund","order","delivery","not agree","refuse","agree","cancel","address change"],
  de: ["hallo","danke","rücksendung","zurücksenden","bestellung","lieferung","nicht einverstanden","verweigern","einverstanden","stornieren","adressänderung"]
};
function detectLanguage(text){
  const s = { nl:0, en:0, de:0 };
  for (const [lng, words] of Object.entries(langKeywords)) for (const w of words) if (text.includes(w)) s[lng]++;
  if (/[äöüß]/.test(text)) s.de += 2;
  if (/\bthe\b|\band\b|\bfor\b/.test(text)) s.en += 1;
  if (/\bde\b|\ben\b|\bhet\b/.test(text)) s.nl += 1;
  const best = Object.entries(s).sort((a,b)=>b[1]-a[1])[0];
  return (best && best[1] > 0) ? best[0] : null;
}
const detected_lang = detectLanguage(bodyLower) || fallbackLocale;

// Mood
const neg = { nl:["slecht","teleurgesteld","ontevreden","boos","woedend","onacceptabel","waardeloos","klacht"],
              en:["bad","disappointed","unhappy","angry","unacceptable","worthless","complaint"],
              de:["schlecht","enttäuscht","unzufrieden","wütend","inakzeptabel","beschwerde"] };
const pos = { nl:["tevreden","blij","top","geweldig","super","dank","bedankt"],
              en:["satisfied","happy","great","awesome","super","thanks","thank you"],
              de:["zufrieden","glücklich","toll","großartig","super","danke"] };
function anyContains(list){ return (list||[]).some(w=>bodyLower.includes(w)); }
let mood = "neutral";
if (anyContains(neg[detected_lang] || []) || anyContains(neg.nl)) mood = "frustrated";
if (anyContains(pos[detected_lang] || []) || anyContains(pos.nl)) mood = (mood==="frustrated" ? "frustrated" : "happy");

// Dreiging (FIXED: dreigin -> dreiging)
const threatWords = {
  nl:["consumentenbond","advocaat","politie","rechtszaak","juridisch","aangifte"],
  en:["attorney","lawyer","police","lawsuit","legal","report"],
  de:["anwalt","polizei","klage","rechtlich","anzeige"]
};
const dreiging_detected = (threatWords[detected_lang]||[]).some(w=>bodyLower.includes(w)) || threatWords.nl.some(w=>bodyLower.includes(w));

// Onderhandeling (expliciet %)
let onderhandeling_percentage = 0;
const percMatches = [...bodyLower.matchAll(/(\d{1,2})\s?%/g)];
if (percMatches.length) onderhandeling_percentage = Math.max(...percMatches.map(m => parseInt(m[1],10)));

// Rules (VERBETERD: Betere error handling)
const rulesList = tenant.business_rules || [];
const rules = Object.fromEntries((rulesList||[]).map(r => [r.rule_key, r.rule_config || {}]));
const ladder_cfg = rules["compensatie_ladder"] || {
  stappen: [15,20,30,40],
  start_percentage: 15,
  onderhandeling_marge: Math.min(15, maximaal_extra_compensatie),
  max_totaal_normaal: 40,
  max_totaal_dreiging: 50, // FIXED: was dreigin, nu dreiging
  geen_retour_voor_40: true
};
const stappen    = Array.isArray(ladder_cfg.stappen) && ladder_cfg.stappen.length ? ladder_cfg.stappen : [15,20,30,40];
const max_norm   = Number(ladder_cfg.max_totaal_normaal ?? 40);
const max_threat = Number(ladder_cfg.max_totaal_dreiging ?? 50); // FIXED: was dreigin, nu dreiging

// Category keywords (meertalig + tenant)
function mergeArr(base, extra){ return Array.from(new Set([...(base||[]), ...((extra||[]))])); }
const defaults = {
  refusal:       { nl:["nee","niet akkoord","weiger","liever niet","geen akkoord","geen deal"], en:["no","not agree","refuse","rather not"], de:["nein","nicht einverstanden","verweigern"] },
  acceptance:    { nl:["akkoord","ok","oke","oké","prima","deal"], en:["agree","ok","okay","fine","deal","accepted"], de:["einverstanden","ok","okay","in ordnung","deal","akzeptiert"] },
  return_intent: { nl:["retour","retourneren","terugsturen","geld terug","refund","terugbetaling"], en:["return","refund","send back","money back"], de:["rücksendung","zurücksenden","rückzahlung"] },
  order_keywords:{ nl:["bestelling","levering","zending","ordernummer","track","tracken"], en:["order","delivery","shipment","tracking","track"], de:["bestellung","lieferung","sendung","verfolgung"] }
};
const cat = rules["category_keywords"] || {};
const kw_refusal = mergeArr(defaults.refusal[detected_lang], mergeArr(defaults.refusal.nl, cat.refusal));
const kw_accept  = mergeArr(defaults.acceptance[detected_lang], mergeArr(defaults.acceptance.nl, cat.acceptance));
const kw_return  = mergeArr(defaults.return_intent[detected_lang], mergeArr(defaults.return_intent.nl, cat.return_intent));
const kw_order   = mergeArr(defaults.order_keywords[detected_lang], mergeArr(defaults.order_keywords.nl, cat.order_keywords));

const soft_rule    = rules["soft_refusal_phrases"] || {};
const soft_phrases = mergeArr(soft_rule.phrases || [], [
  "te weinig","niet genoeg","kan dit hoger","meer compensatie","kan er nog wat bij",
  "dat schiet niet op","hier heb ik weinig aan","vind dit niet passend","valt tegen",
  "moeilijk mee akkoord","ik verwacht meer","can you do more","too low","not enough","zu wenig"
]);

// Weigering (meertalig)
function listToRegex(list){ return new RegExp("\\b(" + (list||[]).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join("|") + ")\\b","i"); }
const refuseRe = listToRegex(kw_refusal);
const acceptRe = listToRegex(kw_accept);
const refusal_current = !!(refuseRe && refuseRe.test(bodyLower)) && !(acceptRe && acceptRe.test(bodyLower));
const soft_refusal_current =
  !(acceptRe && acceptRe.test(bodyLower)) &&
  (soft_phrases.some(p => bodyLower.includes(p.toLowerCase())) ||
   (onderhandeling_percentage && onderhandeling_percentage > (Number(lookup.huidig_bod||0) || 0)));

// Levering / order
const days = typeof order.days_since_order === 'number' ? order.days_since_order : null;
let delivery_bucket = "unknown";
if (days !== null) {
  if (days <= 2) delivery_bucket = "very_early";
  else if (days <= 6) delivery_bucket = "3_6";
  else if (days <= 10) delivery_bucket = "7_10";
  else if (days <= 13) delivery_bucket = "11_13";
  else delivery_bucket = "14_plus";
}
const is_order_related = (kw_order || []).some(w => bodyLower.includes(w)) || !!order.order_date_iso || delivery_bucket !== "unknown";
const return_requested = (kw_return || []).some(w => bodyLower.includes(w));

// Basis bod en volgende stap
const baseOffer = Math.max(Number(lookup.huidig_bod || 0), Number(history_max_offer || 0));
function nextStepFrom(current) { for (const v of stappen) { if (v > current) return v; } return stappen[stappen.length - 1]; }
let expected_offer;
if (dreiging_detected) {
  expected_offer = Math.min(Math.max(baseOffer, 50), max_threat);
} else if (baseOffer === 0) {
  expected_offer = stappen[0];
} else if (refusal_current || soft_refusal_current || (onderhandeling_percentage && onderhandeling_percentage > baseOffer)) {
  expected_offer = Math.min(nextStepFrom(baseOffer), max_norm);
} else {
  expected_offer = Math.min(baseOffer, max_norm);
}
const expected_ladder_step = (() => {
  const idx = stappen.findIndex(v => v === expected_offer);
  return idx >= 0 ? (idx + 1) : (expected_offer >= max_threat ? 99 : 1);
})();

// Confidence (VERBETERD: Betere confidence scoring)
let confidence_score = 1;
if (history.length === 0) confidence_score = 0.8; // Minder confident bij nieuwe klant
if (detected_lang === 'unknown') confidence_score = 0.7; // Minder confident bij onbekende taal
if (days === null) confidence_score = 0.9; // Minder confident bij geen order info

// Output (VERBETERD: Meer debug info)
return {
  klantnaam,
  mood,
  detected_lang,
  dreiging_detected,
  onderhandeling_percentage,
  huidig_bod: baseOffer,
  last_known_offer: baseOffer,
  expected_offer,
  expected_ladder_step,
  days_since_order: days,
  delivery_bucket,
  is_order_related,
  summary_context,
  ai_signature_html,
  ai_persona_name,
  rules,
  tenant_locale: fallbackLocale,
  bedrijfsnaam,
  annulering_toegestaan_dagen,
  adreswijziging_toegestaan_dagen,
  maximaal_extra_compensatie,
  retouradres,
  return_requested,
  refusal_current,
  soft_refusal_current,
  history_max_offer,
  max_norm,
  max_threat,
  confidence_score,
  // DEBUG INFO
  debug_info: {
    history_count: history.length,
    summary_length: summary_context.length,
    language_confidence: detected_lang !== 'unknown' ? 'high' : 'low',
    order_info_available: days !== null
  }
};
