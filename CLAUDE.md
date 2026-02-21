# Zenflow - AIウェルネスコーチ MVP

## プロジェクト概要

毎日5分のセルフケアルーティン（呼吸法・ジャーナリング・ストレスチェック）をAIがパーソナライズし、メンタルヘルスの「見える化」と改善をサポートするアプリ。フリーミアムモデル（無料 → 月額980円）。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + TypeScript
- **スタイル**: Tailwind CSS v4（@theme directive）
- **DB**: Prisma 6 + SQLite（開発用）
- **認証**: NextAuth.js v5 beta（Credentials + JWT）
- **AI**: Anthropic Claude API（claude-sonnet-4-5-20250514）
- **チャート**: Recharts
- **状態管理**: Zustand
- **バリデーション**: Zod

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動（localhost:3000）
npm run build        # 本番ビルド
npx prisma studio    # DB GUI
npx prisma db push   # スキーマをDBに反映
```

## 環境変数（.env.local）

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="(openssl rand -base64 32 で生成)"
AUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-xxxxx"
```
※ Prisma CLIは.env.localを読めないため、.envにもDATABASE_URLを記載済み

## ディレクトリ構造

```
src/
├── app/
│   ├── page.tsx                     # ランディングページ（8セクション）
│   ├── globals.css                  # デザイントークン(@theme)
│   ├── layout.tsx                   # ルートレイアウト（Geist + Noto Sans JP）
│   ├── (auth)/login, signup/        # 認証ページ
│   ├── (main)/                      # 認証済みエリア（サイドバーレイアウト）
│   │   ├── dashboard/               # ダッシュボード
│   │   ├── selfcare/                # セルフケアルーティン
│   │   ├── journal/, journal/new/, journal/[id]/  # AIジャーナリング
│   │   ├── mood/                    # 気分トラッキング
│   │   ├── pricing/                 # 料金プラン
│   │   └── settings/                # 設定
│   └── api/                         # APIルート群
├── auth.ts, auth.config.ts, middleware.ts
├── components/                      # UI / layout / dashboard / mood / selfcare / journal / premium
├── hooks/                           # useSubscription, useStreak, useFeatureGate, useMoodData
├── lib/                             # prisma, anthropic, auth-helpers, prompts, streak, subscription, utils
├── stores/app-store.ts              # Zustand
└── types/                           # 型定義
```

## 現在の状態（2026-02-22時点）

### 完了済み（MVP全7フェーズ実装完了）
- Phase 1: プロジェクト基盤（Prisma, デザインシステム, UIコンポーネント）
- Phase 2: 認証（NextAuth v5, サインアップ/ログイン）
- Phase 3: ランディングページ + メインレイアウト + ダッシュボード
- Phase 4: 気分トラッキング（5段階セレクター, Rechartsグラフ）
- Phase 5: セルフケア + ストリーク（AIルーティン生成, タイマー, プログレスリング）
- Phase 6: AIジャーナリング（SSEストリーミング, 感情分析）
- Phase 7: フリーミアム + 仕上げ（サブスクリプション制限, 料金ページ）

**ビルド**: エラー0件、23ルート生成済み
**ローカル動作確認済み**: localhost:3000

### 未実装（本番リリースに必要な残作業）

優先度順：
1. **セキュリティ**: レート制限、セキュリティヘッダー、CORS設定
2. **認証フロー**: パスワードリセット、メール認証、アカウント削除、パスワード変更
3. **決済統合**: Stripe連携（現在はDB直接変更のみ）、Webhook、請求管理
4. **法的対応**: プライバシーポリシー、利用規約、特定商取引法表記
5. **DB本番化**: PostgreSQL移行、インデックス追加、マイグレーション管理
6. **テスト**: テストフレームワーク導入、ユニット/API/E2Eテスト
7. **エラーハンドリング**: error.tsx、not-found.tsx、統一エラーレスポンス
8. **監視・ログ**: Sentry等エラートラッキング、リクエストログ、アラート
9. **CI/CD**: GitHub Actions、自動テスト・デプロイパイプライン
10. **SEO**: robots.txt、sitemap.xml、OGPタグ
11. **アクセシビリティ**: aria-label、フォーカス管理、キーボードナビ
12. **パフォーマンス**: バンドル最適化、キャッシング、ページネーション

詳細な残作業リストは会話履歴を参照。

## 既知の注意点

- Prisma 7は非互換のため6.xを使用
- Zod v4では`.errors`ではなく`.issues`を使用
- Next.js 16でmiddleware非推奨警告あり（proxy移行が必要）
- ANTHROPIC_API_KEYにはダミー値が入っている（実キーに差し替え要）
- `.env`と`.env.local`の両方が必要（Prisma CLI用とNext.js用）

## 言語

ユーザーとのコミュニケーションは日本語で行うこと。
