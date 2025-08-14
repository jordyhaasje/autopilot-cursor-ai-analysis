// Node: Email Filter
// Positie: Na Gmail Trigger, voor Email parser
// Doel: Spam detection, tenant filtering, email validation

const email = $input.first().json;

// Stap 1: Basis email validatie
if (!email || !email.from || !email.subject) {
  console.log('Email Filter: Invalid email format, skipping');
  return [];
}

// Stap 2: Tenant filtering
const tenant_email = email.from.toLowerCase();
const expected_tenant = 'lvbendjong@gmail.com';

if (tenant_email !== expected_tenant) {
  console.log(`Email Filter: Email from ${tenant_email}, expected ${expected_tenant}, skipping`);
  return [];
}

// Stap 3: Spam detection
const spamKeywords = [
  'spam', 'unsubscribe', 'click here', 'buy now', 'limited time',
  'act now', 'exclusive offer', 'free money', 'lottery', 'winner',
  'urgent', 'immediate action', 'once in a lifetime', 'guaranteed',
  'no risk', '100% free', 'cash bonus', 'earn money', 'work from home'
];

const emailContent = (email.subject + ' ' + (email.text || '') + ' ' + (email.html || '')).toLowerCase();
const isSpam = spamKeywords.some(keyword => emailContent.includes(keyword));

if (isSpam) {
  console.log(`Email Filter: Spam detected with keywords, skipping`);
  return [];
}

// Stap 4: Rate limiting check (basis implementatie)
const currentTime = Date.now();
const lastEmailTime = $node["Gmail Trigger"].json.timestamp || 0;
const timeDiff = currentTime - lastEmailTime;

if (timeDiff < 1000) { // 1 seconde minimum tussen emails
  console.log(`Email Filter: Rate limiting, too soon after last email`);
  return [];
}

// Stap 5: Email content validation
const hasValidContent = email.text && email.text.trim().length > 10;
const hasValidSubject = email.subject && email.subject.trim().length > 2;

if (!hasValidContent || !hasValidSubject) {
  console.log('Email Filter: Invalid content or subject, skipping');
  return [];
}

// Stap 6: Duplicate detection (basis implementatie)
const emailHash = btoa(email.subject + email.text).slice(0, 20);
const lastEmailHash = $node["Gmail Trigger"].json.lastEmailHash || '';

if (emailHash === lastEmailHash) {
  console.log('Email Filter: Duplicate email detected, skipping');
  return [];
}

// Stap 7: Pass through valid email
console.log('Email Filter: Email passed all checks, processing');
return [{
  json: {
    ...email,
    filtered_at: new Date().toISOString(),
    filter_reason: 'passed',
    email_hash: emailHash
  }
}];
