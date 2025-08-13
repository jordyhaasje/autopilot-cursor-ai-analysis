# 🔑 **CREDENTIALS & CONFIGURATIE**

## 📋 **Voor Lokale N8N Setup**

### **🚀 N8N API Credentials**
```bash
# N8N Railway Instance
RAILWAY_URL=https://primary-production-9667.up.railway.app

# N8N API Key
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTA4MzgyLCJleHAiOjE3NTc2NDk2MDB9.rtJzEp4Fm81LEB7UwVmngqieUNfr8lZZ8A-pWIbdAnE
```

### **🗄️ Supabase Database Credentials**
```bash
# Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://cgrlfbolenwynpbvfeku.supabase.co

# Supabase Anonymous Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4
```

### **📧 Gmail Credentials**
```bash
# Gmail OAuth2 (moet handmatig geconfigureerd worden in N8N)
# Account: lvbendjong@gmail.com
# Scope: https://www.googleapis.com/auth/gmail.modify
```

### **🤖 OpenAI Credentials**
```bash
# OpenAI API Key (moet handmatig geconfigureerd worden in N8N)
# Model: gpt-4o-mini
# Account: AutoPilot AI
```

---

## 🔧 **Lokale Setup Instructies**

### **1. N8N Installeren**
```bash
# N8N globaal installeren
npm install -g n8n

# N8N starten
n8n start
```

### **2. Environment Variables Instellen**
Maak een `.env` bestand aan in je lokale N8N directory:
```bash
# .env bestand
RAILWAY_URL=https://primary-production-9667.up.railway.app
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTA4MzgyLCJleHAiOjE3NTc2NDk2MDB9.rtJzEp4Fm81LEB7UwVmngqieUNfr8lZZ8A-pWIbdAnE

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cgrlfbolenwynpbvfeku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4
```

### **3. Workflow Importeren**
1. Ga naar `http://localhost:5678`
2. Import workflow: `workflows/complete-export/CURSOR_AI_WP5aiR5vN2A9w91i.json`
3. Configureer credentials:
   - **Postgres**: Supabase database connectie
   - **Gmail**: OAuth2 setup
   - **OpenAI**: API key instellen

### **4. Database Connectie Testen**
```bash
# Test script uitvoeren
node analysis/scripts/analyze-supabase.js
```

---

## 🔒 **Security Notes**

### **✅ Veilige Keys**
- **Supabase Anonymous Key**: Veilig voor public repositories
- **N8N API Key**: Alleen voor development/testing
- **Railway URL**: Public endpoint

### **⚠️ Handmatige Configuratie Nodig**
- **Gmail OAuth2**: Moet handmatig geconfigureerd worden
- **OpenAI API Key**: Moet handmatig toegevoegd worden
- **Postgres Credentials**: Via Supabase dashboard

---

## 📊 **Database Schema**

### **Belangrijke Tabellen**
- `tenants`: Tenant configuratie
- `master_business_rules`: Centrale business rules
- `tenant_business_rules`: Per-tenant overrides
- `conversation_threads`: Gespreksgeschiedenis
- `customer_interactions`: Klantinteracties
- `escalations`: Dreiging escalaties
- `notifications`: Dashboard notificaties

### **Test Data**
```sql
-- Test tenant
SELECT * FROM tenants WHERE gmail_email = 'lvbendjong@gmail.com';

-- Test business rules
SELECT * FROM master_business_rules LIMIT 5;

-- Test conversation threads
SELECT * FROM conversation_threads LIMIT 5;
```

---

## 🚀 **Quick Start**

1. **Clone repository**:
   ```bash
   git clone https://github.com/jordyhaasje/autopilot-cursor-ai-analysis.git
   cd autopilot-cursor-ai-analysis
   ```

2. **Installeer dependencies**:
   ```bash
   npm install
   ```

3. **Start N8N**:
   ```bash
   n8n start
   ```

4. **Import workflow**:
   - Import `workflows/complete-export/CURSOR_AI_WP5aiR5vN2A9w91i.json`
   - Configureer credentials
   - Test workflow

---

**Status**: ✅ **Alle credentials beschikbaar voor lokale setup**
