#!/bin/bash

echo "🚀 AutoPilot N8N Lokale Setup Script"
echo "====================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is niet geïnstalleerd!"
    echo "📥 Download Node.js van: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js gevonden: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is niet geïnstalleerd!"
    exit 1
fi

echo "✅ npm gevonden: $(npm --version)"

# Install N8N globally
echo "📦 N8N installeren..."
npm install -g n8n

if [ $? -eq 0 ]; then
    echo "✅ N8N succesvol geïnstalleerd!"
else
    echo "❌ Fout bij installeren van N8N"
    exit 1
fi

# Create .env file
echo "🔧 .env bestand aanmaken..."
cat > .env << EOF
# N8N Railway Instance
RAILWAY_URL=https://primary-production-9667.up.railway.app

# N8N API Key
N8N_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZGY0YzllZC00ZDE1LTQxODUtOGU1Ny1hN2NlNTIwNjBlNGMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTA4MzgyLCJleHAiOjE3NTc2NDk2MDB9.rtJzEp4Fm81LEB7UwVmngqieUNfr8lZZ8A-pWIbdAnE

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://cgrlfbolenwynpbvfeku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNncmxmYm9sZW53eW5wYnZmZWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3ODk0MDgsImV4cCI6MjA2OTM2NTQwOH0.9OawVgkZH1aTPKj0uNRpMZTLRb4re_LYpwxA_RtfCz4

# N8N Configuration
N8N_BASIC_AUTH_ACTIVE=false
N8N_ENCRYPTION_KEY=your-encryption-key-here
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
EOF

echo "✅ .env bestand aangemaakt"

# Test Supabase connection
echo "🗄️ Supabase connectie testen..."
if [ -f "analysis/scripts/analyze-supabase.js" ]; then
    node analysis/scripts/analyze-supabase.js
else
    echo "⚠️ Supabase test script niet gevonden"
fi

echo ""
echo "🎉 Setup voltooid!"
echo ""
echo "📋 Volgende stappen:"
echo "1. Start N8N: n8n start"
echo "2. Ga naar: http://localhost:5678"
echo "3. Import workflow: workflows/complete-export/CURSOR_AI_WP5aiR5vN2A9w91i.json"
echo "4. Configureer credentials:"
echo "   - Postgres: Supabase database"
echo "   - Gmail: OAuth2 setup"
echo "   - OpenAI: API key"
echo ""
echo "📚 Documentatie: config/credentials.md"
echo "🔗 Repository: https://github.com/jordyhaasje/autopilot-cursor-ai-analysis"
