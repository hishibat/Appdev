#!/bin/bash

echo "🚀 ABeam IT Governance Assessment - 起動スクリプト"
echo "=================================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.jsがインストールされていません"
    exit 1
fi

echo "✅ Node.js バージョン: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 依存パッケージをインストール中..."
    npm install
fi

echo "📊 現在の状態:"
echo "  - プロジェクトディレクトリ: $(pwd)"
echo "  - データベース: SQLite (prisma/dev.db)"
echo ""

# Try to generate Prisma Client
echo "🔧 Prisma Clientを生成中..."
if PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate 2>/dev/null; then
    echo "✅ Prisma Client生成完了"

    # Push database schema
    echo "🗄️  データベーススキーマを作成中..."
    if npx prisma db push 2>/dev/null; then
        echo "✅ データベース作成完了"

        # Seed database
        echo "🌱 サンプルデータを投入中..."
        if npm run prisma:seed 2>/dev/null; then
            echo "✅ シードデータ投入完了"
        fi
    fi
else
    echo "⚠️  Prisma Clientの生成に失敗しました"
    echo "    ネットワーク制約のため、データベース機能は利用できません"
    echo "    トップページのみ表示可能です"
fi

echo ""
echo "🌐 Next.jsサーバーを起動中..."
echo ""
echo "=================================================="
echo "アクセスURL:"
echo "  http://localhost:3000"
echo ""
echo "利用可能な機能:"
echo "  ✅ トップページ（ランディングページ）"
if [ -f "prisma/dev.db" ]; then
    echo "  ✅ サーベイ機能"
    echo "  ✅ 結果ダッシュボード"
    echo "  ✅ PDF/Excelレポート"
    echo ""
    echo "デモアカウント:"
    echo "  サーベイトークン: demo-survey-token-12345"
    echo "  URL: http://localhost:3000/survey/demo-survey-token-12345"
else
    echo "  ⚠️  データベース機能は未設定"
fi
echo "=================================================="
echo ""
echo "サーバーを停止するには Ctrl+C を押してください"
echo ""

# Start Next.js
npm run dev
