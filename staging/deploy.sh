#!/bin/bash
# ============================================
# Civics2026 - סקריפט פריסה ל-Cloudflare Pages
# ============================================
# שימוש: bash deploy.sh
# דרישות: Node.js 18+, npm
# ============================================

set -e

echo ""
echo "🎓 Civics2026 - סקריפט פריסה"
echo "================================"
echo ""

# --- 1. בדיקת דרישות ---
echo "🔍 בודק דרישות..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js לא מותקן. התקן מ-https://nodejs.org"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm לא מותקן."
    exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
    echo "❌ נדרש Node.js 18 ומעלה (יש לך: $(node -v))"
    exit 1
fi

echo "✅ Node.js $(node -v), npm $(npm -v)"
echo ""

# --- 2. התקנת תלויות ---
echo "📦 מתקין תלויות..."
npm install
echo ""

# --- 3. התחברות ל-Cloudflare ---
echo "☁️  מתחבר ל-Cloudflare..."
echo "   (ייפתח דפדפן - אשר את ההתחברות)"
echo ""
npx wrangler login
echo ""

# בדיקת התחברות
echo "🔐 מאמת..."
npx wrangler whoami
echo ""

# --- 4. יצירת D1 Database ---
echo "🗄️  מגדיר בסיס נתונים D1..."
echo ""

# בדוק אם ה-DB כבר קיים
DB_EXISTS=$(npx wrangler d1 list 2>/dev/null | grep "civics2026-production" || true)

if [ -z "$DB_EXISTS" ]; then
    echo "   יוצר בסיס נתונים חדש..."
    DB_OUTPUT=$(npx wrangler d1 create civics2026-production 2>&1)
    echo "$DB_OUTPUT"
    
    # חילוץ database_id
    DB_ID=$(echo "$DB_OUTPUT" | grep -oP '"database_id":\s*"\K[^"]+' || echo "$DB_OUTPUT" | grep -oP 'database_id = "\K[^"]+' || true)
    
    if [ -n "$DB_ID" ]; then
        echo ""
        echo "✅ Database ID: $DB_ID"
        echo ""
        echo "⚠️  עדכן את wrangler.jsonc עם ה-ID הזה:"
        echo '   "database_id": "'$DB_ID'"'
        echo ""
        
        # עדכון אוטומטי של wrangler.jsonc
        if command -v sed &> /dev/null; then
            sed -i.bak "s/placeholder-will-be-set-on-deploy/$DB_ID/" wrangler.jsonc 2>/dev/null || true
            echo "✅ wrangler.jsonc עודכן אוטומטית"
        fi
    else
        echo ""
        echo "⚠️  לא הצלחתי לחלץ database_id."
        echo "   הרץ: npx wrangler d1 list"
        echo "   והעתק את ה-ID ל-wrangler.jsonc"
        echo ""
        read -p "   הדבק database_id כאן (או Enter לדלג): " MANUAL_DB_ID
        if [ -n "$MANUAL_DB_ID" ]; then
            sed -i.bak "s/placeholder-will-be-set-on-deploy/$MANUAL_DB_ID/" wrangler.jsonc 2>/dev/null || true
            echo "✅ wrangler.jsonc עודכן"
        fi
    fi
else
    echo "✅ בסיס נתונים civics2026-production כבר קיים"
fi
echo ""

# --- 5. יישום migrations ---
echo "📋 מיישם migrations על D1..."
npx wrangler d1 migrations apply civics2026-production || true
echo ""

# --- 6. בנייה ---
echo "🔨 בונה את הפרויקט..."
npm run build
echo ""

# בדיקת dist
if [ ! -f "dist/_worker.js" ]; then
    echo "❌ הבנייה נכשלה - dist/_worker.js לא נמצא"
    exit 1
fi
echo "✅ בנייה הצליחה ($(du -sh dist | cut -f1))"
echo ""

# --- 7. פריסה ---
echo "🚀 פורס ל-Cloudflare Pages..."
echo ""

# צור project אם לא קיים
npx wrangler pages project create civics2026 --production-branch main 2>/dev/null || true

# פרוס
DEPLOY_OUTPUT=$(npx wrangler pages deploy dist --project-name civics2026 2>&1)
echo "$DEPLOY_OUTPUT"
echo ""

# --- 8. אימות ---
echo "🔍 מאמת פריסה..."
sleep 3

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://civics2026.pages.dev)
API_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://civics2026.pages.dev/api/health)
API_BODY=$(curl -s https://civics2026.pages.dev/api/health)

echo ""
echo "================================"
echo "📊 תוצאות:"
echo "================================"
echo "   דף הבית:  HTTP $HTTP_CODE $([ "$HTTP_CODE" = "200" ] && echo "✅" || echo "❌")"
echo "   API:       HTTP $API_CODE $([ "$API_CODE" = "200" ] && echo "✅" || echo "❌")"
echo "   גרסה:     $API_BODY"
echo ""
echo "🌐 האתר חי: https://civics2026.pages.dev"
echo ""
echo "================================"
echo "🎓 הפריסה הושלמה בהצלחה!"
echo "================================"
