# 🚀 AutoPilot Cursor AI Analysis

## 📋 Project Overzicht
Dit repository bevat de complete analyse van het AutoPilot AI-klantenservice systeem, inclusief N8N workflows, Supabase database analyse, en alle documentatie.

## 🎯 Wat is AutoPilot?
AutoPilot is een geavanceerd multi-tenant AI-klantenservice systeem voor dropshipping bedrijven, specifiek ontworpen voor Chinese leveranciers waar lange levertijden normaal zijn.

## 📁 Repository Structuur

```
autopilot-cursor-ai-analysis/
├── 📁 workflows/
│   ├── 🎯 main/
│   │   └── CURSOR_AI_WP5aiR5vN2A9w91i.json     # Hoofdworkflow voor Cursor AI
│   ├── 🧪 development/
│   │   ├── DIT_IS_DE_GOEDE_*.json              # Development workflows
│   │   ├── HIER_WERKEN_WE_AAN_*.json           # Work-in-progress
│   │   └── My_workflow_*.json                  # Test workflows
│   ├── 🏢 tenants/
│   │   ├── Muko___AutoPilot_Workflow_*.json    # Tenant-specifieke workflows
│   │   ├── Maduro_scales___AutoPilot_*.json
│   │   ├── Velora___AutoPilot_Workflow_*.json
│   │   └── Hehdhd___AutoPilot_Workflow_*.json
│   └── 💾 backups/
│       └── BACKUP_*.json                       # Backup workflows
├── 📁 analysis/
│   ├── 📊 scripts/
│   │   ├── analyze-n8n-code.js                 # N8N code analyse
│   │   ├── analyze-business-rules.js           # Business rules analyse
│   │   ├── analyze-supabase.js                 # Database analyse
│   │   └── deep-code-analysis.js               # Diepgaande code analyse
│   └── 📋 reports/
│       ├── FINAL_COMPLETE_ANALYSIS.md          # Complete analyse
│       ├── COMPLETE_ANALYSIS_SUMMARY.md        # Samenvatting
│       └── EXPORT_SUMMARY.md                   # Export overzicht
├── 📁 documentation/
│   ├── 📖 guides/
│   │   ├── AutoPilot_Overzicht.md              # Project overzicht
│   │   ├── PROJECT_SAMENVATTING.md             # Project samenvatting
│   │   └── autopilot-documentation.md          # AutoPilot documentatie
│   ├── 📝 original/
│   │   ├── AutoPilot hoe werkt het N8N.docx    # Originele documentatie
│   │   ├── cursor_n8n_project_for_ai_customer_serv.md
│   │   ├── extra markdown.md
│   │   ├── Wat kan AutoPilot .txt
│   │   ├── introductie AutoPilot.txt
│   │   └── ikwildit.txt
│   └── 🎨 dashboard/
│       ├── LoveAble1.txt                       # Dashboard documentatie
│       └── LoveAble2.txt
├── 📁 config/
│   ├── index.json                              # Workflow index
│   └── .gitignore                              # Git configuratie
├── 🤖 AI_CAPABILITIES_COMPLETE.md              # Complete AI capabilities
└── 📄 README.md                                # Deze file
```

## 🎯 Kern Features

### **AI Capabilities:**
- **Compensatie Ladder**: Deterministische 15% → 20% → 30% → 40% → 50% (dreiging)
- **Chinese Dropshipping**: Optimalisatie voor lange levertijden
- **Dreiging Detectie**: Juridische dreigingen herkennen en escaleren
- **Emotieherkenning**: Happy/neutral/frustrated/angry detectie
- **Meertalig**: NL/EN/DE ondersteuning
- **Context-aware**: Volledige gespreksgeschiedenis
- **Soft Refusal**: Impliciete weigering detectie
- **Fashion-specifiek**: Maat- en kleurproblemen

### **Business Rules:**
- **14 Business Rules**: Per-tenant configuratie
- **Delivery Buckets**: Tijdsgebonden responses
- **Policy Windows**: Annulering/adreswijziging termijnen
- **Tenant Isolation**: Per-tenant regels en limieten
- **Escalation Rules**: Dreiging en escalatie logica

## 🚀 Lokale N8N Setup

### **Quick Start**
```bash
# 1. Clone repository
git clone https://github.com/jordyhaasje/autopilot-cursor-ai-analysis.git
cd autopilot-cursor-ai-analysis

# 2. Run setup script
chmod +x setup-local-n8n.sh
./setup-local-n8n.sh

# 3. Start N8N
n8n start
```

### **Handmatige Setup**
1. **N8N installeren**: `npm install -g n8n`
2. **Environment variables**: Zie `config/credentials.md`
3. **Workflow importeren**: `workflows/complete-export/CURSOR_AI_WP5aiR5vN2A9w91i.json`
4. **Credentials configureren**:
   - **Postgres**: Supabase database connectie
   - **Gmail**: OAuth2 setup
   - **OpenAI**: API key instellen

### **Credentials**
Alle benodigde credentials staan in `config/credentials.md`:
- ✅ **N8N API Key**: Voor Railway connectie
- ✅ **Supabase URL & Key**: Voor database connectie
- ⚠️ **Gmail OAuth2**: Handmatig configureren
- ⚠️ **OpenAI API Key**: Handmatig toevoegen

## 📋 Volgende Stappen

1. **Lokale Testing**: N8N workflow testen
2. **Email Filtering**: Implementeren (momenteel alleen in database)
3. **Performance Monitoring**: Toevoegen
4. **A/B Testing**: Framework implementeren

## 📊 Database Schema

### **Supabase Tables:**
- `tenants`: Tenant configuratie en instellingen
- `master_business_rules`: Centrale business rules
- `tenant_business_rules`: Per-tenant overrides
- `conversation_threads`: Gespreksgeschiedenis
- `customer_interactions`: Klantinteracties
- `email_filters`: Email filtering regels (nog niet geïmplementeerd)

## 🔧 Technische Details

### **N8N Workflow:**
- **Gmail Trigger**: Email ontvangst
- **Postgres Nodes**: Database interacties
- **Code Nodes**: AI logica en context building
- **OpenAI**: GPT-4O-MINI voor responses
- **Gmail Send**: Email verzending

### **AI Intelligence:**
- **Context Builder**: Volledige context voorbereiding
- **Prompt Generator**: Dynamische prompt generatie
- **Response Parser**: AI response verwerking
- **Offer Normalizer**: Deterministische controle

## 📞 Contact

Voor vragen over dit project, neem contact op via GitHub issues.

---

**Status**: ✅ Repository georganiseerd en klaar voor GitHub push
