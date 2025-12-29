# 書き初めアプリ - アーキテクチャドキュメント

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [ディレクトリ構造](#ディレクトリ構造)
3. [アーキテクチャ概要](#アーキテクチャ概要)
4. [データフロー](#データフロー)
5. [コンポーネント階層](#コンポーネント階層)
6. [状態管理](#状態管理)
7. [API通信](#api通信)
8. [型定義](#型定義)
9. [定数管理](#定数管理)
10. [ユーティリティ関数](#ユーティリティ関数)
11. [カスタムフック](#カスタムフック)
12. [スタイリング](#スタイリング)
13. [依存関係](#依存関係)

---

## プロジェクト概要

### アプリケーション名
書き初めアプリ（Kakizome App）

### 技術スタック
- **フレームワーク**: React 19.2.0
- **言語**: TypeScript 5.9.3
- **ビルドツール**: Vite 7.2.4
- **状態管理**: React Query (@tanstack/react-query) 5.90.13
- **フォーム管理**: React Hook Form 7.69.0
- **スタイリング**: CSS Modules + CSS Variables

### 主な機能
1. 書き初めの一覧表示（縦書き、マルチカラムレイアウト）
2. 書き初めの投稿・編集・削除
3. 自分の書き初めの識別とハイライト表示
4. オープニングアニメーション
5. モーダルダイアログによる入力・編集
6. プライバシーポリシー表示

---

## ディレクトリ構造

```
src/
├── main.tsx                 # エントリーポイント
├── App.tsx                  # メインコンポーネント
├── App.css                  # メインコンポーネントのスタイル
│
├── components/              # UIコンポーネント
│   ├── Opening/            # オープニングアニメーション
│   ├── CalligraphyList/    # 書き初めリスト表示
│   ├── CalligraphyCard/    # 書き初めカード（個別）
│   ├── CalligraphyModal/   # 書き初め入力・編集モーダル
│   ├── FloatingButton/     # フローティングアクションボタン
│   ├── CharacterCounter/   # 文字数カウンター
│   ├── ConfirmDialog/      # 確認ダイアログ
│   ├── PrivacyPolicyModal/ # プライバシーポリシーモーダル
│   └── Footer/             # フッター
│
├── lib/                     # ライブラリ関連
│   ├── api.ts              # API通信層
│   └── hooks.ts            # API操作用カスタムフック
│
├── hooks/                   # アプリケーション用カスタムフック
│   ├── useErrorHandler.ts  # エラーハンドリング
│   ├── useModalState.ts    # モーダル状態管理
│   └── useModalEffects.ts  # モーダル共通効果
│
├── utils/                   # ユーティリティ関数
│   ├── calligraphy.ts      # 書き初め関連ユーティリティ
│   ├── errorHandler.ts     # エラーハンドリングユーティリティ
│   ├── formatters.ts       # フォーマッター関数
│   └── className.ts        # クラス名結合ユーティリティ
│
├── constants/               # 定数定義
│   └── index.ts            # アプリケーション全体の定数
│
├── types/                   # 型定義
│   └── calligraphy.ts      # 書き初め関連の型定義
│
├── styles/                  # グローバルスタイル
│   └── index.css           # グローバルCSS
│
└── assets/                  # 静的アセット
    └── icons/              # アイコン画像
```

---

## アーキテクチャ概要

### アーキテクチャパターン
- **コンポーネント指向**: 再利用可能なコンポーネントに分割
- **カスタムフック**: ビジネスロジックをフックに分離
- **関心の分離**: UI、ロジック、データアクセスを分離
- **単一責任の原則**: 各モジュールが明確な責務を持つ

### レイヤー構造

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Components, UI, Styling)          │
├─────────────────────────────────────┤
│         Business Logic Layer        │
│  (Custom Hooks, Utils)              │
├─────────────────────────────────────┤
│         Data Access Layer           │
│  (API Client, React Query)          │
├─────────────────────────────────────┤
│         External Services           │
│  (Backend API)                      │
└─────────────────────────────────────┘
```

---

## データフロー

### 1. データ取得フロー

```
App.tsx
  ↓ useQuery
lib/hooks.ts (useCalligraphySubmit/useCalligraphyDelete)
  ↓ calligraphyApi
lib/api.ts
  ↓ client()
Backend API (/api/calligraphy)
  ↓ Response
React Query Cache
  ↓
App.tsx (list state)
  ↓
CalligraphyList Component
  ↓
CalligraphyCard Components
```

### 2. データ送信フロー

```
CalligraphyModal Component
  ↓ handleSubmit
App.tsx (handleSubmit)
  ↓ submit()
lib/hooks.ts (useCalligraphySubmit)
  ↓ mutation.mutate()
lib/api.ts (calligraphyApi.upsert)
  ↓ POST /api/calligraphy
Backend API
  ↓ Success Response
React Query Cache Invalidation
  ↓
Automatic Refetch
  ↓
UI Update
```

### 3. 自分の書き初めの識別フロー

```
Backend API Response
  ↓ Calligraphy[] (is_mine: boolean)
App.tsx
  ↓ findMyCalligraphy(list)
utils/calligraphy.ts
  ↓ list.find(item => item.is_mine)
App.tsx (myCalligraphy)
  ↓
CalligraphyModal (initialData)
FloatingButton (hasCalligraphy)
CalligraphyCard (isMine prop)
```

---

## コンポーネント階層

```
App
├── Opening (条件付きレンダリング)
├── div.app
│   ├── h1, h3, p (タイトル・説明)
│   ├── CalligraphyList
│   │   └── CalligraphyCard[] (動的生成)
│   └── Footer
├── FloatingButton (条件付きレンダリング)
├── CalligraphyModal (条件付きレンダリング)
│   ├── CharacterCounter
│   └── Form (React Hook Form)
├── PrivacyPolicyModal (条件付きレンダリング)
└── ConfirmDialog (条件付きレンダリング)
```

### コンポーネント一覧

| コンポーネント | 責務 | Props |
|--------------|------|-------|
| `App` | アプリケーション全体の状態管理とレイアウト | - |
| `Opening` | オープニングアニメーション表示 | `onComplete` |
| `CalligraphyList` | リストの状態管理（ローディング、エラー、空状態） | `list`, `isLoading`, `error`, `onCardClick` |
| `CalligraphyCard` | 個別の書き初めカード表示 | `calligraphy`, `isMine`, `onClick` |
| `CalligraphyModal` | 書き初めの入力・編集フォーム | `isOpen`, `onClose`, `onSubmit`, `onDelete`, `initialData`, `isEdit`, `serverError` |
| `FloatingButton` | 右下のフローティングアクションボタン | `onClick`, `hasCalligraphy` |
| `CharacterCounter` | 文字数カウンター（円形プログレス） | `current`, `max` |
| `ConfirmDialog` | 確認ダイアログ | `isOpen`, `title`, `message`, `onConfirm`, `onCancel` |
| `PrivacyPolicyModal` | プライバシーポリシー表示 | `isOpen`, `onClose` |
| `Footer` | フッター情報表示 | `onOpenPrivacyPolicy` |

---

## 状態管理

### ローカル状態（useState）

#### App.tsx
- `showOpening`: オープニング表示フラグ
- `showContent`: コンテンツ表示フラグ

#### useModalState
- `openModal`: 現在開いているモーダルの種類 (`'calligraphy' | 'privacy' | 'deleteConfirm' | null`)

#### useErrorHandler
- `error`: エラーメッセージ (`string | null`)

### サーバー状態（React Query）

#### Query
- `['calligraphy', 'list']`: 書き初め一覧データ
  - `staleTime`: 5分
  - `refetchOnWindowFocus`: false

#### Mutation
- `useCalligraphySubmit`: 書き初めの投稿・更新
- `useCalligraphyDelete`: 書き初めの削除

### 状態の依存関係

```
showOpening
  ↓ handleOpeningComplete
showContent
  ↓
CalligraphyList, FloatingButton, Footer の表示制御

openModal (useModalState)
  ↓
CalligraphyModal, PrivacyPolicyModal, ConfirmDialog の表示制御

error (useErrorHandler)
  ↓
CalligraphyModal (serverError prop)
```

---

## API通信

### APIエンドポイント

| メソッド | エンドポイント | 説明 | 認証 |
|---------|--------------|------|------|
| `GET` | `/api/calligraphy` | 書き初め一覧取得 | Cookie |
| `POST` | `/api/calligraphy` | 書き初め作成・更新 | Cookie |
| `DELETE` | `/api/calligraphy/me` | 自分の書き初め削除 | Cookie |

### APIクライアント構造

```typescript
lib/api.ts
├── client<T>()           # 共通Fetchラッパー
│   ├── credentials: 'include' (Cookie送信)
│   ├── エラーハンドリング
│   └── JSONパース
└── calligraphyApi
    ├── list()            # GET /api/calligraphy
    ├── upsert(data)      # POST /api/calligraphy
    └── delete()          # DELETE /api/calligraphy/me
```

### エラーハンドリング

```typescript
utils/errorHandler.ts
├── logError()            # エラーログ出力
├── isApiError()          # エラー型判定
└── getErrorMessage()    # エラーメッセージ取得
```

---

## 型定義

### 主要な型

#### Calligraphy
```typescript
interface Calligraphy {
  user_name: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_mine: boolean;
}
```

#### CreateCalligraphyRequest
```typescript
interface CreateCalligraphyRequest {
  user_name: string;
  content: string;
}
```

#### ApiError / ApiErrorResponse
```typescript
interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}
```

### 型の使用箇所

| 型 | 使用箇所 |
|---|---------|
| `Calligraphy` | APIレスポンス、コンポーネントProps、ユーティリティ関数 |
| `CreateCalligraphyRequest` | フォーム入力、APIリクエスト |
| `ApiError` | エラーハンドリング |

---

## 定数管理

### 定数の分類

#### API_CONFIG
- `BASE_URL`: APIのベースURL
- `STALE_TIME`: React Queryのキャッシュ時間

#### FORM_LIMITS
- `USER_NAME_MAX_LENGTH`: ユーザー名の最大文字数
- `CONTENT_MAX_LENGTH`: 書き初め内容の最大文字数
- `CONTENT_CENTER_THRESHOLD`: 中央揃えの閾値（行数）

#### UI_CONFIG
- `OPENING_FADE_DELAY`: オープニング終了後の遅延時間
- `MODAL_DEFAULT_USER_NAME`: モーダルのデフォルトユーザー名

#### MESSAGES
- ユーザー向けメッセージ（ローディング、エラー、空状態など）

#### MODAL_TITLES
- モーダルのタイトル

#### VALIDATION_MESSAGES
- バリデーションメッセージ（関数形式で動的生成）

#### QUERY_KEYS
- React Queryのクエリキー

---

## ユーティリティ関数

### calligraphy.ts

| 関数 | 説明 | 使用箇所 |
|------|------|---------|
| `getLineCount()` | 書き初めの行数をカウント | `shouldCenterContent()` |
| `shouldCenterContent()` | 中央揃えが必要か判定 | `CalligraphyCard` |
| `findMyCalligraphy()` | 自分の書き初めを抽出 | `App.tsx` |
| `generateCardId()` | カードの一意IDを生成 | `App.tsx`, `CalligraphyCard`, `CalligraphyList` |
| `toInitialData()` | Calligraphyから初期データを生成 | `App.tsx` |

### errorHandler.ts

| 関数 | 説明 | 使用箇所 |
|------|------|---------|
| `logError()` | エラーログを統一管理 | `lib/hooks.ts` |
| `isApiError()` | APIエラーの型判定 | - |
| `getErrorMessage()` | エラーメッセージを取得 | `lib/hooks.ts` |

### formatters.ts

| 関数 | 説明 | 使用箇所 |
|------|------|---------|
| `formatDate()` | 日付を日本語形式でフォーマット | `CalligraphyCard` |

### className.ts

| 関数 | 説明 | 使用箇所 |
|------|------|---------|
| `cn()` | クラス名を結合 | `CalligraphyCard` |

---

## カスタムフック

### lib/hooks.ts

#### useCalligraphySubmit
- **責務**: 書き初めの投稿・更新
- **戻り値**: `{ submit, isSubmitting, error }`
- **内部処理**:
  1. `calligraphyApi.upsert`を呼び出し
  2. 成功時: クエリキャッシュを無効化
  3. エラー時: エラーログ出力

#### useCalligraphyDelete
- **責務**: 書き初めの削除
- **戻り値**: `{ deleteCalligraphy, isDeleting, error }`
- **内部処理**:
  1. `calligraphyApi.delete`を呼び出し
  2. 成功時: クエリキャッシュを無効化
  3. エラー時: エラーログ出力

### hooks/useErrorHandler.ts

- **責務**: エラーメッセージの管理
- **戻り値**: `{ error, resetError, handleError }`
- **使用箇所**: `App.tsx`

### hooks/useModalState.ts

- **責務**: 複数モーダルの状態管理を統一
- **戻り値**: `{ isOpen, open, close }`
- **管理するモーダル**: `'calligraphy' | 'privacy' | 'deleteConfirm'`
- **使用箇所**: `App.tsx`

### hooks/useModalEffects.ts

- **責務**: モーダルの共通効果（Escキー、bodyスクロール制御、フォーカストラップ）
- **パラメータ**: `isOpen`, `onClose`, `initialData`, `reset`, `modalContentRef`
- **使用箇所**: `CalligraphyModal`

---

## スタイリング

### CSS構造

#### グローバルスタイル (`styles/index.css`)
- CSS変数（カラーパレット、フォント）
- リセットCSS
- 和紙テクスチャ背景

#### コンポーネントスタイル
- 各コンポーネントに専用のCSSファイル
- CSS Modules形式（`.module.css`ではないが、スコープ化）

### CSS変数

```css
--color-washi: #FFF8DC;
--color-sumi: #1F2937;
--color-gold: #D4A574;
--color-accent: #DC2626;
--font-family-mincho: "Yu Mincho", "游明朝", "YuMincho", serif;
```

### レイアウト

#### マルチカラムレイアウト
- CSS Multi-column Layoutを使用
- `column-width: 230px`
- レスポンシブ対応（モバイル: 1列）

#### 縦書き表示
- `writing-mode: vertical-rl`
- `text-orientation: upright`
- Edge対応のベンダープレフィックス付き

---

## 依存関係

### 外部依存関係

```
@tanstack/react-query  # データフェッチング・キャッシング
react-hook-form        # フォーム管理・バリデーション
react                  # UIライブラリ
react-dom              # DOM操作
```

### 内部依存関係

```
App.tsx
├── components/* (UIコンポーネント)
├── lib/hooks.ts (API操作)
├── hooks/* (アプリケーションロジック)
├── utils/* (ユーティリティ)
├── constants/index.ts (定数)
└── types/calligraphy.ts (型定義)

lib/hooks.ts
├── lib/api.ts (API通信)
├── utils/errorHandler.ts (エラーハンドリング)
└── constants/index.ts (定数)

components/CalligraphyModal
├── hooks/useModalEffects.ts (モーダル効果)
└── constants/index.ts (定数)
```

---

## データフロー詳細図

### 書き初め一覧取得

```
[User] 
  ↓ ページ読み込み
[App.tsx]
  ↓ useQuery({ queryKey: ['calligraphy', 'list'] })
[React Query]
  ↓ calligraphyApi.list()
[lib/api.ts]
  ↓ fetch('/api/calligraphy')
[Backend API]
  ↓ Response: Calligraphy[]
[React Query Cache]
  ↓ data: list
[App.tsx]
  ↓ findMyCalligraphy(list)
[utils/calligraphy.ts]
  ↓ myCalligraphy
[App.tsx]
  ↓ list prop
[CalligraphyList]
  ↓ map()
[CalligraphyCard[]]
```

### 書き初め投稿

```
[User] フォーム入力
  ↓ 送信ボタンクリック
[CalligraphyModal]
  ↓ handleSubmit(data)
[App.tsx]
  ↓ handleSubmit(data)
[lib/hooks.ts] useCalligraphySubmit
  ↓ submit(data)
[lib/api.ts] calligraphyApi.upsert
  ↓ POST /api/calligraphy
[Backend API]
  ↓ Success: Calligraphy
[React Query]
  ↓ invalidateQueries(['calligraphy', 'list'])
[React Query]
  ↓ 自動再取得
[App.tsx]
  ↓ list更新
[UI自動更新]
```

---

## パフォーマンス最適化

### メモ化

1. **useMemo**: `myCalligraphy`の計算結果をメモ化
2. **useCallback**: イベントハンドラーをメモ化
3. **memo**: `CalligraphyCard`コンポーネントをメモ化

### React Queryの最適化

- `staleTime`: 5分間キャッシュを使用
- `refetchOnWindowFocus`: false（不要な再取得を防止）

### キーの最適化

- `key={generateCardId(item)}`: 一意のIDを使用してReactの再レンダリングを最適化

---

## アクセシビリティ

### ARIA属性

- `role="dialog"`: モーダルダイアログ
- `aria-modal="true"`: モーダル状態
- `aria-labelledby`: タイトル参照
- `aria-describedby`: 説明文参照

### キーボード操作

- **Escキー**: モーダルを閉じる
- **Tabキー**: フォーカストラップ（モーダル内）
- **Enterキー**: フォーム送信

### フォーカス管理

- モーダル開閉時のフォーカス移動
- フォーカストラップ（Tabキーでモーダル内を循環）

---

## セキュリティ

### Cookie認証
- `credentials: 'include'`でCookieを自動送信
- バックエンドでユーザー識別

### CSP（Content Security Policy）
- Nginxで設定
- XSS対策

### 入力バリデーション
- React Hook Formによるクライアント側バリデーション
- 最大文字数制限（ユーザー名: 20文字、内容: 50文字）

---

## ブラウザ対応

### Edge対応
- `-ms-writing-mode`: Edge用の縦書き設定
- `-ms-flex`: Edge用のFlexbox設定
- `-ms-overflow-style`: Edge用のスクロールバー設定

### フォント
- Yu Mincho（游明朝）を使用
- システムフォントをフォールバック

---

## 開発・ビルド

### 開発サーバー
```bash
npm run dev
```

### ビルド
```bash
npm run build
```

### リント
```bash
npm run lint
```

---

## 今後の拡張可能性

### 追加可能な機能
1. 書き初めの検索・フィルタリング
2. 書き初めの並び替え（新着順、更新順）
3. ページネーション
4. 書き初めの画像アップロード
5. 書き初めのシェア機能（URL生成）

### 改善可能な点
1. エラーバウンダリーの追加
2. オフライン対応（Service Worker）
3. パフォーマンスモニタリング
4. ユニットテスト・E2Eテストの追加

---

## まとめ

このアプリケーションは、以下の原則に基づいて設計されています：

1. **関心の分離**: UI、ロジック、データアクセスを明確に分離
2. **再利用性**: カスタムフックとユーティリティ関数の活用
3. **型安全性**: TypeScriptによる型定義
4. **保守性**: 定数とメッセージの一元管理
5. **パフォーマンス**: メモ化とReact Queryによる最適化
6. **アクセシビリティ**: ARIA属性とキーボード操作のサポート

このドキュメントは、コードベースの理解と保守を支援するためのものです。

