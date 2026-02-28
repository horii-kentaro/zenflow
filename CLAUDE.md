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
- **状態管理**: Zustand（persist middleware でlocalStorage永続化済み）
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
│   │   ├── dashboard/               # ダッシュボード（進捗カード、挨拶、マイルストーン、クイックアクション）
│   │   ├── selfcare/                # セルフケア（タイプ選択、タイマー、履歴タブ）
│   │   ├── journal/, journal/new/, journal/[id]/  # AIジャーナリング（検索、お気に入り、おすすめトピック）
│   │   ├── mood/                    # 気分トラッキング（コンテキストタグ、週間サマリー、カレンダー）
│   │   ├── pricing/                 # 料金プラン（FAQ、機能比較、利用状況）
│   │   └── settings/                # 設定（4タブ: プロフィール/サブスクリプション/セキュリティ/データ）
│   └── api/                         # APIルート群
│       ├── auth/profile/            # プロフィール更新 (PATCH)
│       ├── selfcare/history/        # セルフケア履歴 (GET)
│       ├── selfcare/today-status/   # 今日の完了状態 (GET)
│       └── usage/                   # 利用残数 (GET)
├── auth.ts, auth.config.ts, middleware.ts
├── components/
│   ├── dashboard/                   # GreetingHeader, TodayProgress, QuickActions, StreakMilestone, ...
│   ├── mood/                        # MoodContextTags, WeeklySummary, MoodCalendar, ...
│   ├── selfcare/                    # RoutineTypeSelector, SelfcareHistory, RoutineTimer, ...
│   ├── journal/                     # JournalSearch, ChatInterface(おすすめトピック), ...
│   ├── premium/                     # FAQ, FeatureComparison, UsageStatus, ...
│   ├── layout/                      # Sidebar(残数表示), SidebarUsage, ...
│   └── ui/                          # Skeleton, Button, Input, Modal, ...
├── hooks/                           # useSubscription, useStreak, useFeatureGate, useMoodData
├── lib/                             # prisma, anthropic, auth-helpers, prompts, streak, subscription, utils
├── stores/app-store.ts              # Zustand（persist: plan, sidebarOpen, planFetchedAt）
└── types/                           # 型定義
```

## 現在の状態（2026-02-28時点）

### 完了済み
- MVP全7フェーズ実装完了
- 本番リリース残作業12項目すべて完了（セキュリティ〜パフォーマンス）
- **8ページ機能強化完了**（2026-02-28実装）

### 8ページ機能強化の詳細（最新実装）

#### Phase 1: ダッシュボード強化
- [x] GreetingHeader - 時間帯別挨拶（朝/昼/夜）+ 日付・曜日表示
- [x] TodayProgress - 気分記録/セルフケア/ジャーナルの3つの完了状況カード
- [x] QuickActions - 3つのアクションへのカラー付きショートカットボタン
- [x] StreakMilestone - 7/14/30/60/100日到達時の祝福バナー（localStorage管理）

#### Phase 2: 気分トラッキング強化
- [x] MoodContextTags - 7種類のきっかけタグ選択（仕事/人間関係/健康/天気/睡眠/運動/その他）
- [x] WeeklySummary - 平均スコア、記録日数/7、前週比較（↑↓→）
- [x] MoodCalendar - Pro限定の月間カレンダービュー（カラードット、日付クリックで詳細表示）
- [x] DBスキーマ: MoodEntry.context (String?) 追加

#### Phase 3: セルフケア強化
- [x] 今日/履歴タブ切替（SelfcareHistory: 無料7日/Pro 30日）
- [x] RoutineTypeSelector - 5種類選択（おまかせ/呼吸法/ストレッチ/マインドフルネス/ボディスキャン）
- [x] タイマーUX改善 - ステップ名大表示、進捗ドット、ステップ情報をリング上部に移動
- [x] API: `/api/selfcare/history`, `/api/selfcare/today-status`

#### Phase 4: ジャーナル強化
- [x] JournalSearch - キーワード検索バー + 感情フィルター + お気に入りフィルター
- [x] お気に入り機能 - ハートアイコンでトグル（PATCH `/api/journal/[id]`）
- [x] ChatInterface改善 - おすすめトピック3チップ（「今日の気分について」「最近嬉しかったこと」「悩んでいること」）
- [x] DBスキーマ: Journal.isFavorite (Boolean) 追加

#### Phase 5: 料金ページ強化
- [x] FAQ - アコーディオン形式の5問
- [x] FeatureComparison - Free/Pro 12項目の機能比較テーブル
- [x] UsageStatus - 無料ユーザー向けプログレスバー付き利用状況

#### Phase 6: 設定ページ強化
- [x] タブレイアウト（URLハッシュ対応: #profile/#subscription/#security/#data）
- [x] プロフィール編集 - 名前のインライン編集（PATCH `/api/auth/profile`）
- [x] 通知設定 - 支払い通知/週間レポートのON/OFF切替
- [x] DBスキーマ: User.notificationPrefs (Json?) 追加

#### Phase 7: 共通UX改善
- [x] Zustand永続化（persist middleware: plan, sidebarOpen, planFetchedAt。キャッシュ5分）
- [x] SidebarUsage - 無料ユーザー向け残り回数表示 / Proバッジ
- [x] Skeleton UI - CardSkeleton, ListSkeleton コンポーネント
- [x] API: `/api/usage`

**ビルド**: エラー0件、47ルート生成
**テスト**: 20ファイル、195テスト全パス
**デプロイ**: Vercel自動デプロイ済み（https://zenflow-alpha.vercel.app）

## 既知の注意点

- Prisma 7は非互換のため6.xを使用
- Zod v4では`.errors`ではなく`.issues`を使用
- Next.js 16でmiddleware非推奨警告あり（proxy移行が必要）
- ANTHROPIC_API_KEYにはダミー値が入っている（実キーに差し替え要）
- `.env`と`.env.local`の両方が必要（Prisma CLI用とNext.js用）
- 日付フィールドはDateTime @db.Date型（PostgreSQLのDATE型）。API応答ではISO文字列になるため、クライアント側ではformatDate()で"YYYY-MM-DD"に変換
- ローカル開発にはDocker（PostgreSQL）が必要。`docker compose up -d`で起動

## 次回の作業指示

8ページ機能強化が完了し、Vercelにデプロイ済み。次のステップとして以下を検討：

### 優先度高
1. **ローカル動作確認**: `docker compose up -d && npm run dev` で全ページの無料/有料プラン動作確認
   - `POST /api/subscription { "plan": "premium" }` でPro切替テスト
   - 各ページのPro限定機能（カレンダー、履歴30日等）が正しく動作するか確認
2. **本番DBマイグレーション**: Vercel上で `npx prisma migrate deploy` が必要（context, isFavorite, notificationPrefs）
3. **E2Eテスト追加**: 新機能（検索、お気に入り、タブ切替等）のPlaywrightテスト

### 優先度中
4. **ジャーナルタイトル自動生成**: AIの初回応答後にタイトルを自動設定する機能（プラン済み未実装）
5. **タイトルインライン編集**: ジャーナル一覧でタイトルクリックで編集
6. **通知設定の永続化**: 現在のnotificationPrefsはDB保存済みだが、ページ読み込み時にDBから読み込むロジックが未実装

### 優先度低
7. **PWA対応**: Service Worker、オフライン対応
8. **多言語対応**: i18n基盤
9. **ダークモード**: テーマ切替

## 言語

ユーザーとのコミュニケーションは日本語で行うこと。
