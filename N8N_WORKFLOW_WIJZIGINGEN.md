# 🔧 N8N WORKFLOW WIJZIGINGEN - AutoPilot Project

## 📋 OVERZICHT VAN ALLE N8N WIJZIGINGEN

### **WORKFLOW: CURSOR_AI_WP5aiR5vN2A9w91i**

**Status:** ✅ Actief en werkend  
**Nodes:** 26 (was 25)  
**Laatste update:** 13 Augustus 2025

## 🔧 WIJZIGING 1: EMAIL FILTER NODE TOEGEVOEGD

### **Positie in Flow:**
```
Gmail Trigger → Email Filter → Email Parser → ...
```

### **Functionaliteit:**
- **Multi-tenant email filtering**
- **Spam detection**
- **Domain blocking**
- **Tenant-specific filters**
- **Real-time database queries**

### **Code (JavaScript Node):**
```javascript
// Node: Email Filter - Multi-Tenant Support
const email = $input.first().json;

// Get tenant data from database
const SUPABASE_URL = 'https://cgrlfbolenwynpbvfeku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4';

async function getTenantData() {
  try {
    const response = await $http.get({
      url: SUPABASE_URL + '/rest/v1/tenants',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data || [];
  } catch (error) {
    console.log('Email Filter: Failed to get tenant data:', error.message);
    return [];
  }
}

async function getEmailFilters() {
  try {
    const response = await $http.get({
      url: SUPABASE_URL + '/rest/v1/email_filters',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data || [];
  } catch (error) {
    console.log('Email Filter: Failed to get email filters:', error.message);
    return [];
  }
}

// Main filtering logic
async function filterEmail() {
  const fromEmail = email.from?.toLowerCase() || '';
  const toEmail = email.to?.toLowerCase() || '';
  const subject = email.subject?.toLowerCase() || '';
  const body = email.text?.toLowerCase() || '';
  const emailContent = subject + ' ' + body;
  
  console.log('Email Filter: Processing email from:', fromEmail, 'to:', toEmail);
  
  // Get all tenants
  const tenants = await getTenantData();
  console.log('Email Filter: Found', tenants.length, 'tenants');
  
  if (tenants.length === 0) {
    console.log('Email Filter: No tenants found, allowing email');
    return [{ json: { ...email, filtered_at: new Date().toISOString(), filter_reason: 'no_tenants' } }];
  }
  
  // Find target tenant (who receives the email)
  const targetTenant = tenants.find(t => 
    t.gmail_email && t.gmail_email.toLowerCase() === toEmail
  );
  
  if (!targetTenant) {
    console.log('Email Filter: No target tenant found for:', toEmail);
    console.log('Available tenant emails:', tenants.map(t => t.gmail_email).join(', '));
    return []; // Reject email - no valid tenant
  }
  
  console.log('Email Filter: Found target tenant:', targetTenant.bedrijfsnaam, '(ID:', targetTenant.tenant_id + ')');
  
  // Get all email filters
  const emailFilters = await getEmailFilters();
  console.log('Email Filter: Found', emailFilters.length, 'email filters total');
  
  // Get email filters for THIS specific tenant
  const tenantFilters = emailFilters.filter(f => f.tenant_id === targetTenant.tenant_id);
  console.log('Email Filter: Found', tenantFilters.length, 'email filters for tenant:', targetTenant.bedrijfsnaam);
  
  // Apply email filters for this specific tenant
  for (const filter of tenantFilters) {
    console.log('Email Filter: Checking filter:', filter.email_address, 'Type:', filter.filter_type);
    
    // Check email address filters
    if (filter.email_address && filter.filter_type === 'spam') {
      const filterEmail = filter.email_address.toLowerCase();
      if (fromEmail === filterEmail) {
        console.log('Email Filter: Email blocked by spam filter for tenant:', targetTenant.bedrijfsnaam);
        console.log('Blocked email:', filter.email_address);
        console.log('Reason:', filter.reason);
        return []; // Reject email
      }
    }
    
    // Check domain filters
    if (filter.domain && filter.filter_type === 'spam') {
      const filterDomain = filter.domain.toLowerCase();
      const emailDomain = fromEmail.split('@')[1];
      
      if (emailDomain === filterDomain) {
        console.log('Email Filter: Domain blocked by spam filter for tenant:', targetTenant.bedrijfsnaam);
        console.log('Blocked domain:', filter.domain);
        return []; // Reject email
      }
    }
    
    // Check blacklist filters
    if (filter.email_address && filter.filter_type === 'blacklist') {
      const filterEmail = filter.email_address.toLowerCase();
      if (fromEmail === filterEmail) {
        console.log('Email Filter: Email blocked by blacklist for tenant:', targetTenant.bedrijfsnaam);
        console.log('Blocked email:', filter.email_address);
        return []; // Reject email
      }
    }
  }
  
  // Default spam detection (fallback)
  const defaultSpamKeywords = ['spam', 'unsubscribe', 'click here', 'buy now', 'limited time'];
  const isDefaultSpam = defaultSpamKeywords.some(keyword => emailContent.includes(keyword));
  
  if (isDefaultSpam) {
    console.log('Email Filter: Default spam detected for tenant:', targetTenant.bedrijfsnaam);
    return []; // Reject spam
  }
  
  // Pass through valid email
  console.log('Email Filter: Email passed all checks for tenant:', targetTenant.bedrijfsnaam);
  return [{ 
    json: { 
      ...email, 
      filtered_at: new Date().toISOString(), 
      filter_reason: 'passed',
      tenant_id: targetTenant.tenant_id,
      tenant_name: targetTenant.bedrijfsnaam,
      tenant_gmail: targetTenant.gmail_email,
      target_tenant_detected: true
    } 
  }];
}

// Execute filtering
return await filterEmail();
```

## 🔧 WIJZIGING 2: AI CONTEXT BUILDER TYPOFOUT FIX

### **Probleem:**
Typfout `dreigin` in plaats van `dreiging`

### **Oplossing:**
```javascript
// Fix: dreigin → dreiging
const dreiging_detected = (threatWords[detected_lang]||[]).some(w=>bodyLower.includes(w)) || threatWords.nl.some(w=>bodyLower.includes(w));
```

### **Impact:**
- ✅ Dreiging detectie werkt nu correct
- ✅ AI responses zijn accurater
- ✅ Business logic is correct

## 🔧 WIJZIGING 3: CUSTOMER INTERACTIONS VERBETERING

### **Probleem:**
Onjuiste ON CONFLICT logic veroorzaakte duplicate records

### **Oplossing:**
Verbeterde ON CONFLICT logic in Postgres Store Interaction node:

```sql
ON CONFLICT (tenant_id, email_external_id)
DO UPDATE SET
  -- Alleen updaten als nieuwe data beter is
  ai_response = CASE 
    WHEN EXCLUDED.ai_response IS NOT NULL AND EXCLUDED.ai_response != '' 
    THEN EXCLUDED.ai_response 
    ELSE customer_interactions.ai_response 
  END,
  status = EXCLUDED.status,
  type = EXCLUDED.type,
  -- Compensatie: altijd hoogste waarde behouden
  compensatie_percentage = GREATEST(EXCLUDED.compensatie_percentage, customer_interactions.compensatie_percentage),
  onderhandeling_percentage = GREATEST(EXCLUDED.onderhandeling_percentage, customer_interactions.onderhandeling_percentage),
  -- Dreiging: accumuleren (OR logic)
  dreiging_detected = customer_interactions.dreiging_detected OR EXCLUDED.dreiging_detected,
  -- Annulering: accumuleren
  annulering_aangevraagd = customer_interactions.annulering_aangevraagd OR EXCLUDED.annulering_aangevraagd,
  -- Refusal/Acceptance: accumuleren
  refusal_detected = customer_interactions.refusal_detected OR EXCLUDED.refusal_detected,
  acceptance_detected = customer_interactions.acceptance_detected OR EXCLUDED.acceptance_detected,
  cancellation_confirmed = customer_interactions.cancellation_confirmed OR EXCLUDED.cancellation_confirmed,
  -- Ladder stap: altijd hoogste waarde
  ladder_stap = GREATEST(EXCLUDED.ladder_stap, customer_interactions.ladder_stap),
  -- Mood: update alleen als nieuwe mood beschikbaar
  mood_detected = CASE 
    WHEN EXCLUDED.mood_detected IS NOT NULL AND EXCLUDED.mood_detected != 'neutral'
    THEN EXCLUDED.mood_detected 
    ELSE customer_interactions.mood_detected 
  END,
  -- Confidence: update alleen als hoger
  confidence_score = GREATEST(EXCLUDED.confidence_score, customer_interactions.confidence_score),
  ai_confidence_score = GREATEST(EXCLUDED.ai_confidence_score, customer_interactions.ai_confidence_score),
  -- Metadata: merge JSON
  metadata = COALESCE(customer_interactions.metadata, '{}'::jsonb) || COALESCE(EXCLUDED.metadata, '{}'::jsonb),
  -- Klantnaam: update alleen als nieuwe naam beschikbaar
  klantnaam = CASE 
    WHEN EXCLUDED.klantnaam IS NOT NULL AND EXCLUDED.klantnaam != '' AND EXCLUDED.klantnaam != 'undefined'
    THEN EXCLUDED.klantnaam 
    ELSE customer_interactions.klantnaam 
  END,
  -- Interpretation: update alleen als nieuwe beschikbaar
  interpretation = CASE 
    WHEN EXCLUDED.interpretation IS NOT NULL AND EXCLUDED.interpretation != ''
    THEN EXCLUDED.interpretation 
    ELSE customer_interactions.interpretation 
  END,
  -- Days: update alleen als nieuwe waarde beschikbaar
  days = CASE 
    WHEN EXCLUDED.days IS NOT NULL 
    THEN EXCLUDED.days 
    ELSE customer_interactions.days 
  END,
  -- Gmail thread ID: update alleen als nieuwe beschikbaar
  gmail_thread_id = COALESCE(customer_interactions.gmail_thread_id, EXCLUDED.gmail_thread_id),
  -- Updated timestamp
  updated_at = NOW();
```

## 📊 NODE OVERZICHT (26 NODES)

### **Trigger Nodes:**
1. **Gmail Trigger** - Email ontvangst

### **Processing Nodes:**
2. **Email Filter** - Multi-tenant filtering ⭐ **NIEUW**
3. **Email Parser** - Email parsing
4. **Email Body Cleaner** - Text cleaning
5. **Klantnaam Extractor** - Naam extractie
6. **Orderdatum Extractor** - Order datum extractie
7. **Conversation Thread Lookup** - Thread lookup
8. **Get tenant data** - Tenant informatie
9. **Get Conversation History** - Gespreksgeschiedenis
10. **AI Context builder** - Context voorbereiding ⭐ **GEFIXT**
11. **Prompt Generator** - Prompt generatie
12. **OpenAI** - AI response generatie
13. **Response Parser** - Response parsing
14. **Offer Normalizer** - Offer normalisatie
15. **Postgres Store Interaction** - Database opslag ⭐ **VERBETERD**

### **Output Nodes:**
16. **Gmail Send** - Email verzending

### **Utility Nodes:**
17-26. **Various utility nodes** - Ondersteunende functionaliteit

## 🔗 CONNECTIONS

### **Hoofdflow:**
```
Gmail Trigger → Email Filter → Email Parser → Email Body Cleaner → 
Klantnaam Extractor → Orderdatum Extractor → Conversation Thread Lookup → 
Get tenant data → Get Conversation History → AI Context builder → 
Prompt Generator → OpenAI → Response Parser → Offer Normalizer → 
Postgres Store Interaction → Gmail Send
```

### **Belangrijke wijzigingen:**
- ✅ **Email Filter** toegevoegd na Gmail Trigger
- ✅ **Connections** aangepast voor nieuwe flow
- ✅ **Error handling** verbeterd

## 🧪 TESTING

### **Test Cases:**

1. **Email Filtering Test:**
   - Email van `lvbendjong@gmail.com` naar `jordyhaass@gmail.com` → **GEBLOKKEERD**
   - Email van andere adressen naar `jordyhaass@gmail.com` → **TOEGESTAAN**

2. **AI Context Test:**
   - Dreiging detectie werkt correct
   - Context building is accurater

3. **Customer Interactions Test:**
   - Geen duplicate records meer
   - Correcte data accumulatie

### **Test Scripts:**
- `test-email-filter-working.js` - Email filtering test
- `final-test.js` - Complete workflow test
- `test-autopilot.js` - End-to-end test

## 📈 PERFORMANCE

### **Verbeteringen:**
- ✅ **Email filtering** voorkomt onnodige verwerking
- ✅ **Database queries** geoptimaliseerd
- ✅ **Error handling** verbeterd
- ✅ **Multi-tenant support** geïmplementeerd

### **Metrics:**
- **26 nodes** totaal (was 25)
- **Email filtering** actief
- **Multi-tenant** support
- **Error rate** verminderd

## 🔮 VOLGENDE STAPPEN

### **Korte termijn:**
1. **Performance monitoring** toevoegen
2. **Error logging** verbeteren
3. **A/B testing** implementeren

### **Lange termijn:**
1. **Machine learning** integration
2. **Advanced analytics** nodes
3. **Real-time notifications**
4. **Multi-language expansion**

---

**Laatste update:** 13 Augustus 2025  
**Status:** ✅ Alle N8N wijzigingen succesvol geïmplementeerd  
**Impact:** Volledig werkend multi-tenant AI klantenservice systeem
