# Zenflow - AIウェルネスコーチ MVP

## プロジェクト概要

毎日5分のセルフケアルーティン（呼吸法・ジャーナリング・ストレスチェック）をAIがパーソナライズし、メンタルヘルスの「見える化」と改善をサポートするアプリ。フリーミアムモデル（無料 → 月額980円）。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + TypeScript
- **スタイル**: Tailwind CSS v4（@theme directive）
- **DB**: Prisma 6 + PostgreSQL（Docker Compose / 本番）
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
npx prisma migrate dev   # マイグレーション実行（開発）
npx prisma migrate deploy # マイグレーション実行（本番）
docker compose up -d     # ローカルPostgreSQL起動
npm test                 # Vitestユニット/API/コンポーネントテスト実行
npm run test:e2e         # Playwright E2Eテスト実行（要dev server）
```

## 環境変数（.env.local）

```
DATABASE_URL="postgresql://zenflow:zenflow_dev@localhost:5432/zenflow"
AUTH_SECRET="(openssl rand -base64 32 で生成)"
AUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-xxxxx"
```
※ Prisma CLIは.env.localを読めないため、.envにもDATABASE_URLを記載済み
※ ローカル開発は `docker compose up -d` でPostgreSQLを起動してから使用

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
- 日付フィールドはDateTime @db.Date型（PostgreSQLのDATE型）。API応答ではISO文字列になるため、クライアント側ではformatDate()で"YYYY-MM-DD"に変換
- ローカル開発にはDocker（PostgreSQL）が必要。`docker compose up -d`で起動

## 次回の作業指示

セッション開始時、残作業リストの1番「セキュリティ」から順番に実装を進めること。
各項目の詳細は以下の通り：

### 1. セキュリティ（完了）
- [x] レート制限の実装（ログイン、API全エンドポイント。ブルートフォース防止）
- [x] セキュリティヘッダーの追加（next.config.tsにHSTS、CSP、X-Frame-Options、X-Content-Type-Options）
- [x] CORS設定
- [x] 環境変数の起動時バリデーション（必須変数が未設定なら起動エラー）
- [x] AIレスポンスのサニタイズ（XSS防止）※JSX自動エスケープで安全確認済み
- [x] パスワード強度ルールの強化（大小英数字・記号要件）

### 2. 認証フロー（完了）
- [x] メール送信基盤の導入（Nodemailer、開発環境はコンソール出力）
- [x] パスワードリセット機能（トークン生成、メール送信、リセットページ）
- [x] メール認証（登録時の確認メール、認証エンドポイント）
- [x] パスワード変更機能（設定ページから）
- [x] アカウント削除機能（GDPR対応、関連データの完全削除）
- [x] セッションタイムアウト設定（JWT maxAge 7日間）

### 3. 決済統合（完了）
- [x] Stripe SDK導入・設定（遅延初期化）
- [x] Checkout Session作成API（/api/stripe/checkout）
- [x] Webhook受信エンドポイント（checkout完了、invoice支払い、サブスク更新/削除）
- [x] 請求履歴の保存・表示（BillingHistoryモデル、設定ページ）
- [x] サブスクリプション自動更新・期限管理（Webhook経由）
- [x] カスタマーポータルリンク（/api/stripe/portal）

### 4. 法的対応（完了）
- [x] プライバシーポリシーページ作成（/privacy）
- [x] 利用規約ページ作成（/terms）
- [x] 特定商取引法に基づく表記ページ作成（/tokushoho）
- [x] Cookie同意バナー（ルートレイアウト、localStorage保持）
- [x] AI利用に関する説明の開示（プライバシーポリシー内）
- [x] データエクスポート機能（/api/auth/export-data、JSON形式）

### 5. DB本番化（完了）
- [x] PostgreSQL移行（provider変更、docker-compose.yml、接続設定）
- [x] インデックス追加（全テーブルにuserId、date等のインデックス追加）
- [x] prisma migrateによるマイグレーション管理導入（0001_init作成）
- [x] コネクションプーリング設定（PrismaClient設定、ログレベル制御）
- [x] 日付フィールドのString→DateTime型修正（@db.Date、全API/コンポーネント対応）

### 6. テスト（完了）
- [x] Vitest導入・設定
- [x] ユニットテスト（streak計算、subscription制限、utils）
- [x] APIテスト（全エンドポイント）
- [x] React Testing Libraryコンポーネントテスト
- [x] Playwright E2Eテスト（認証フロー、気分記録、ジャーナル）

### 7. エラーハンドリング（完了）
- [x] error.tsx（アプリ全体のエラーバウンダリ）
- [x] not-found.tsx（404ページ）
- [x] グローバル500エラーページ
- [x] APIエラーレスポンス形式の統一（エラーコード、メッセージ）
- [x] ネットワークエラー時のユーザー向けUI

### 8. 監視・ログ（完了）
- [x] Sentry導入（エラートラッキング）
- [x] リクエストログ（メソッド、URL、ステータス、所要時間）
- [x] ヘルスチェックエンドポイント（/api/health）
- [x] GA4等のアナリティクス導入

### 9. CI/CD（完了）
- [x] GitHub Actions（lint、型チェック、テスト、ビルド）
- [x] 自動デプロイパイプライン（Vercel or Docker）
- [x] pre-commitフック（husky + lint-staged）

### 10. SEO（次に着手）
- [ ] robots.txt作成
- [ ] sitemap.xml生成
- [ ] OGPタグ（Open Graph）設定
- [ ] 全ページのメタデータ設定

### 11. アクセシビリティ
- [ ] aria-label追加（アイコンボタン、ナビ、ローディング）
- [ ] モーダルのフォーカストラップ
- [ ] キーボードナビゲーション対応

### 12. パフォーマンス
- [ ] Rechartsの動的インポート
- [ ] APIレスポンスキャッシング
- [ ] ジャーナル一覧のページネーション
- [ ] バンドルサイズ分析・最適化

完了した項目にはチェックを入れ（[x]）、コミットメッセージに反映すること。
1つの項目が完了するごとにコミット＆プッシュすること。

## 言語

ユーザーとのコミュニケーションは日本語で行うこと。
