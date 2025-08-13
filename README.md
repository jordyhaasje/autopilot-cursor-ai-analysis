# N8N Workflows - Railway Export

Deze repository bevat alle N8N workflows die draaien op de Railway-hosted N8N instance.

## 📋 Overzicht

- **Totaal workflows:** 18
- **Export datum:** 13 augustus 2025
- **Railway URL:** https://primary-production-9667.up.railway.app
- **Status:** Alle workflows zijn momenteel inactief

## 🎯 Belangrijke Workflows

### 1. CURSOR AI (ID: WP5aiR5vN2A9w91i)
**Bestand:** `CURSOR_AI_WP5aiR5vN2A9w91i.json`

Dit is de hoofdworkflow voor Cursor AI integratie. Deze workflow:
- Verwerkt inkomende Gmail berichten
- Gebruikt AI voor automatische klantenservice
- Integreert met PostgreSQL database
- Heeft geavanceerde response parsing

**Belangrijke nodes:**
- Gmail Trigger (polling elke minuut)
- AI Context Builder
- Response Parser
- PostgreSQL integratie
- Gmail response sender

### 2. AutoPilot Workflows
Verschillende AutoPilot workflows voor verschillende tenants:
- **Muko - AutoPilot Workflow** (3 versies)
- **Maduro scales - AutoPilot Workflow**
- **Velora - AutoPilot Workflow**
- **Hehdhd - AutoPilot Workflow**

### 3. Development Workflows
- **DIT IS DE GOEDE** (2 versies)
- **HIER WERKEN WE AAN - FLOW ANALYSE EN EVALUATIE**
- **BACKUP juist**

## 🔧 Technische Details

### Database Integratie
Alle workflows gebruiken PostgreSQL met de volgende tabellen:
- `tenants` - Tenant configuratie
- `conversation_threads` - Gespreksgeschiedenis
- `customer_interactions` - Klantinteracties
- `tenant_business_rules` - Business rules per tenant

### AI Integratie
- **Model:** GPT-4O-MINI
- **Context:** Volledige gespreksgeschiedenis
- **Response parsing:** Geavanceerde JSON parsing
- **Multi-language support:** Nederlands, Engels, Duits

### Email Verwerking
- **Trigger:** Gmail polling (elke minuut)
- **Filtering:** Ongelezen berichten van specifieke senders
- **Processing:** HTML cleaning, context building, AI response
- **Response:** Automatische email replies

## 🚀 Setup voor Cursor AI Integratie

### Benodigde Environment Variabelen
```bash
RAILWAY_URL=https://primary-production-9667.up.railway.app
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CURSOR_AI_API_KEY=jouw_cursor_ai_api_key
```

### Database Credentials
- **PostgreSQL:** Geconfigureerd via N8N credentials
- **Gmail OAuth2:** Geconfigureerd voor email verwerking
- **OpenAI API:** Geconfigureerd voor AI responses

## 📊 Workflow Statistieken

| Workflow Type | Aantal | Status |
|---------------|--------|--------|
| AutoPilot | 8 | Inactief |
| Development | 4 | Inactief |
| Cursor AI | 1 | Inactief |
| Backup | 1 | Inactief |
| Test | 4 | Inactief |

## 🔒 Veiligheid

- **API Keys:** Niet opgeslagen in workflows
- **Credentials:** Beveiligd via N8N credential management
- **Database:** Beveiligde PostgreSQL verbindingen
- **Email:** OAuth2 authenticatie voor Gmail

## 📝 Volgende Stappen

1. **Activeren:** Workflows kunnen geactiveerd worden in N8N
2. **Configureren:** Environment variabelen instellen
3. **Testen:** Workflows testen met test emails
4. **Monitoring:** Performance en error monitoring instellen

## 🤝 Cursor AI Integratie

Voor Cursor AI integratie zijn de volgende workflows het meest relevant:
1. **CURSOR AI** - Hoofdworkflow
2. **DIT IS DE GOEDE** - Laatste versie van de werkende flow
3. **BACKUP juist** - Backup van de werkende versie

Deze workflows bevatten alle benodigde logica voor:
- Email verwerking
- AI context building
- Response generation
- Database opslag
- Email responses

## 📞 Support

Voor vragen over deze workflows of Cursor AI integratie, neem contact op via de N8N instance of GitHub issues.
