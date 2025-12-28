# API 仕様書

## 1. 概要
書き初めアプリケーションのバックエンドAPI仕様書です。
クライアント（フロントエンド）は、このAPIを通じて書き初めの投稿、閲覧、削除を行います。

### ベースURL
開発環境: `http://localhost:3000`

### 共通仕様
*   **データ形式**: リクエスト・レスポンス共に `application/json`
*   **認証**: Cookie (`calli_user_id`) を使用。
    *   初回アクセス時にサーバーが自動的に `Set-Cookie` ヘッダーでIDを付与します。
    *   フロントエンドは、以降のリクエストで自動的にこのCookieを送信する必要があります（ブラウザの標準挙動でOK）。
    *   `fetch` や `axios` を使用する場合、`credentials: 'include'` (または `withCredentials: true`) の設定が必要になる場合があります（CORS設定による）。

---

## 2. エンドポイント一覧

### 2.1. 書き初めを投稿・更新する

自分の書き初めを作成します。すでに存在する場合は上書き更新されます。

*   **URL**: `/api/calligraphy`
*   **Method**: `POST`
*   **認証**: 必須（Cookie自動付与）

#### リクエストボディ
```json
{
  "content": "今年の抱負は早起きです"
}
```
*   `content` (string, 必須): 書き初めの内容。最大50文字。

#### レスポンス (200 OK)
```json
{
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "content": "今年の抱負は早起きです",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

#### エラーレスポンス
*   `400 Bad Request`: バリデーションエラー（文字数超過など）
    ```json
    {
      "error": "Content must be 50 chars or less"
    }
    ```

---

### 2.2. 書き初め一覧を取得する

全ユーザーの書き初めを、作成日時の新しい順に取得します。

*   **URL**: `/api/calligraphy`
*   **Method**: `GET`
*   **認証**: 不要

#### レスポンス (200 OK)
```json
[
  {
    "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "content": "今年の抱負は早起きです",
    "created_at": "2025-01-01T10:00:00Z",
    "updated_at": "2025-01-01T10:00:00Z"
  },
  {
    "user_id": "b1ffcd88-...",
    "content": "健康第一",
    "created_at": "2025-01-01T09:30:00Z",
    "updated_at": "2025-01-01T09:30:00Z"
  }
]
```
*   配列形式で返却されます。最大100件。

---

### 2.3. 自分の書き初めを取得する

現在ログインしている（Cookieを持っている）ユーザーの書き初めを取得します。

*   **URL**: `/api/calligraphy/:id`
    *   `:id` には、Cookieで保持している自分の `user_id` を指定してください。
    *   ※本来は `/me` エンドポイントが望ましいですが、現状はID指定が必要です。IDはPOST時のレスポンス等で把握してください。
*   **Method**: `GET`
*   **認証**: 必須

#### レスポンス (200 OK)
```json
{
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "content": "今年の抱負は早起きです",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

#### エラーレスポンス
*   `404 Not Found`: まだ書き初めを投稿していない場合
    ```json
    {
      "error": "Resource Not Found"
    }
    ```

---

### 2.4. 自分の書き初めを削除する

*   **URL**: `/api/calligraphy/:id`
    *   `:id` には自分の `user_id` を指定。
*   **Method**: `DELETE`
*   **認証**: 必須

#### レスポンス (204 No Content)
*   ボディなし。成功時はステータスコードのみ返却。

#### エラーレスポンス
*   `404 Not Found`: 削除対象が存在しない場合

---

## 3. 型定義 (TypeScript用)

フロントエンド開発用の型定義サンプルです。

```typescript
// 書き初めモデル
export interface Calligraphy {
  user_id: string;    // UUID
  content: string;    // 本文
  created_at: string; // ISO 8601 Date String
  updated_at: string; // ISO 8601 Date String
}

// 新規作成・更新リクエスト
export interface CreateCalligraphyRequest {
  content: string;
}

// エラーレスポンス
export interface ApiError {
  error: string;
}
```
