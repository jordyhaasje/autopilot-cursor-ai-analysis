#!/bin/bash

echo "🚀 Repository organisatie starten..."

# Mappen aanmaken
echo "📁 Mappen aanmaken..."
mkdir -p workflows/main
mkdir -p workflows/development
mkdir -p workflows/tenants
mkdir -p workflows/backups
mkdir -p analysis/scripts
mkdir -p analysis/reports
mkdir -p documentation/guides
mkdir -p documentation/original
mkdir -p documentation/dashboard
mkdir -p config

# Workflows verplaatsen
echo "📋 Workflows verplaatsen..."

# Main workflow
cp "CURSOR_AI_WP5aiR5vN2A9w91i.json" workflows/main/

# Development workflows
cp "DIT_IS_DE_GOEDE_"*.json workflows/development/ 2>/dev/null || true
cp "HIER_WERKEN_WE_AAN"*.json workflows/development/ 2>/dev/null || true
cp "My_workflow_"*.json workflows/development/ 2>/dev/null || true

# Tenant workflows
cp "Muko___AutoPilot_Workflow_"*.json workflows/tenants/ 2>/dev/null || true
cp "Maduro_scales___AutoPilot_Workflow_"*.json workflows/tenants/ 2>/dev/null || true
cp "Velora___AutoPilot_Workflow_"*.json workflows/tenants/ 2>/dev/null || true
cp "Hehdhd___AutoPilot_Workflow_"*.json workflows/tenants/ 2>/dev/null || true
cp "Jsjs___AutoPilot_Workflow_"*.json workflows/tenants/ 2>/dev/null || true
cp "jdfjdf___AutoPilot_Workflow_"*.json workflows/tenants/ 2>/dev/null || true

# Backup workflows
cp "BACKUP_"*.json workflows/backups/ 2>/dev/null || true

# Analysis scripts
echo "📊 Analysis scripts verplaatsen..."
cp analyze-*.js analysis/scripts/
cp deep-code-analysis.js analysis/scripts/

# Analysis reports
echo "📋 Analysis reports verplaatsen..."
cp "FINAL_COMPLETE_ANALYSIS.md" analysis/reports/
cp "COMPLETE_ANALYSIS_SUMMARY.md" analysis/reports/
cp "EXPORT_SUMMARY.md" analysis/reports/

# Documentation guides
echo "📖 Documentation guides verplaatsen..."
cp "AutoPilot_Overzicht.md" documentation/guides/
cp "PROJECT_SAMENVATTING.md" documentation/guides/
cp "autopilot-documentation.md" documentation/guides/

# Original documentation
echo "📝 Original documentation verplaatsen..."
cp "AutoPilot hoe werkt het N8N.docx" documentation/original/
cp "cursor_n8n_project_for_ai_customer_serv.md" documentation/original/
cp "extra markdown.md" documentation/original/
cp "Wat kan AutoPilot .txt" documentation/original/
cp "introductie AutoPilot.txt" documentation/original/
cp "ikwildit.txt" documentation/original/

# Dashboard documentation
echo "🎨 Dashboard documentation verplaatsen..."
cp "LoveAble"*.txt documentation/dashboard/

# Config files
echo "⚙️ Config files verplaatsen..."
cp index.json config/
cp .gitignore config/

# Oude bestanden verwijderen (na backup)
echo "🗑️ Oude bestanden verwijderen..."
find . -maxdepth 1 -name "*.json" -not -name "README.md" -delete
find . -maxdepth 1 -name "analyze-*.js" -delete
find . -maxdepth 1 -name "deep-code-analysis.js" -delete
find . -maxdepth 1 -name "FINAL_COMPLETE_ANALYSIS.md" -delete
find . -maxdepth 1 -name "COMPLETE_ANALYSIS_SUMMARY.md" -delete
find . -maxdepth 1 -name "EXPORT_SUMMARY.md" -delete
find . -maxdepth 1 -name "AutoPilot_Overzicht.md" -delete
find . -maxdepth 1 -name "PROJECT_SAMENVATTING.md" -delete
find . -maxdepth 1 -name "autopilot-documentation.md" -delete
find . -maxdepth 1 -name "AutoPilot hoe werkt het N8N.docx" -delete
find . -maxdepth 1 -name "cursor_n8n_project_for_ai_customer_serv.md" -delete
find . -maxdepth 1 -name "extra markdown.md" -delete
find . -maxdepth 1 -name "Wat kan AutoPilot .txt" -delete
find . -maxdepth 1 -name "introductie AutoPilot.txt" -delete
find . -maxdepth 1 -name "ikwildit.txt" -delete
find . -maxdepth 1 -name "LoveAble*.txt" -delete
find . -maxdepth 1 -name "index.json" -delete

echo "✅ Repository organisatie voltooid!"
echo "📁 Nieuwe structuur:"
tree -I 'node_modules|.git' || ls -la
