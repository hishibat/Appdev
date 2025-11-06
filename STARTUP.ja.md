# 🚀 ABeam IT Governance Assessment - 起動ガイド

## クイックスタート

### 方法1: 起動スクリプトを使う（推奨）

```bash
./start.sh
```

### 方法2: 手動で起動

```bash
# 1. 依存パッケージのインストール（初回のみ）
npm install

# 2. Next.jsサーバーの起動
npm run dev
```

サーバーが起動したら: **http://localhost:3000** にアクセス

---

## 📌 完全セットアップ（データベース機能を使う場合）

### 必要な環境

- Node.js 18以上
- PostgreSQL 15以上（またはSQLite）

### セットアップ手順

```bash
# 1. 環境変数の設定
cp .env.example .env

# 2. .envファイルを編集（PostgreSQLの場合）
# DATABASE_URL="postgresql://user:password@localhost:5432/abeam_governance"

# 3. Prisma Clientの生成
npx prisma generate

# 4. データベーススキーマの作成
npx prisma db push

# 5. サンプルデータの投入
npm run prisma:seed

# 6. サーバーの起動
npm run dev
```

---

## 🌐 アクセス方法

### トップページ
```
http://localhost:3000
```

### デモサーベイ（データベースセットアップ後）
```
http://localhost:3000/survey/demo-survey-token-12345
```

### デモアカウント（データベースセットアップ後）

| 役割 | メール | パスワード |
|------|--------|-----------|
| コンサルタント | admin@abeam.com | admin123 |
| クライアント | client@demo.com | client123 |

---

## 📁 プロジェクト構成

```
/home/user/Appdev/
├── src/                   # ソースコード
│   ├── app/              # Next.js App Router
│   │   ├── api/          # REST API
│   │   ├── survey/       # サーベイUI
│   │   └── results/      # 結果ダッシュボード
│   ├── components/       # UIコンポーネント
│   └── lib/              # ビジネスロジック
├── prisma/               # データベース
│   ├── schema.prisma     # スキーマ定義
│   └── seed.ts           # シードデータ
├── start.sh              # 起動スクリプト
└── README.md             # 詳細ドキュメント
```

---

## 🎯 主な機能

### ✅ 実装済み

1. **アセスメント機能**
   - 50問の評価質問（5ドメイン）
   - 自動保存機能
   - 英語/日本語切替
   - 志向プロファイル選択

2. **分析機能**
   - 自動スコアリング
   - ギャップ分析
   - 推奨事項の生成
   - ロードマップ作成（0-3/3-6/6-12ヶ月）

3. **レポート機能**
   - PDFレポート生成
   - Excelエクスポート
   - インタラクティブなダッシュボード

4. **セキュリティ**
   - PDPA準拠の同意管理
   - 監査ログ
   - トークンベース認証

---

## 🔧 トラブルシューティング

### ポート3000が使用中の場合

```bash
# 別のポートで起動
PORT=3001 npm run dev
```

### Prismaエンジンのダウンロードエラー

```bash
# チェックサムを無視して実行
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### データベースをリセット

```bash
# 注意: すべてのデータが削除されます
npx prisma migrate reset
```

---

## 📚 詳細ドキュメント

完全なドキュメントは [README.md](./README.md) を参照してください。

---

## 🆘 サポート

問題が発生した場合は、開発チームに連絡するか、GitHubリポジトリでIssueを作成してください。
