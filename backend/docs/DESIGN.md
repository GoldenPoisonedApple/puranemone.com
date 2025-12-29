# システム設計書: 書き初めアプリ (Backend)

## 1. 概要
本システムは、ユーザーが「書き初め（新年の抱負など）」を投稿・閲覧・管理するためのバックエンドAPIサーバーです。
Rust言語とAxumフレームワークを採用し、堅牢性、パフォーマンス、型安全性を重視した設計となっています。

## 2. 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
| --- | --- | --- | --- |
| **言語** | Rust | 1.75+ | メイン開発言語 |
| **Webフレームワーク** | Axum | 0.7 | HTTPサーバー、ルーティング |
| **非同期ランタイム** | Tokio | 1.0 | 非同期処理基盤 |
| **データベース** | PostgreSQL | 15+ | データ永続化 |
| **DBクライアント** | SQLx | 0.8 | 型安全なSQL実行、コネクションプール |
| **シリアライズ** | Serde | 1.0 | JSONの相互変換 |
| **エラーハンドリング** | thiserror | 2.0 | エラー型定義 |
| **ロギング** | Tracing | 0.1 | 構造化ログ |
| **テスト** | Mockall | 0.14 | モックテスト |

## 3. アーキテクチャ設計

本システムは、関心事の分離（Separation of Concerns）を徹底するため、レイヤードアーキテクチャを採用しています。

```mermaid
graph TD
    Client[クライアント] --> Handler[Handlers (Controller)]
    Handler --> Service[Services (Business Logic)]
    Service --> Repository[Repositories (Data Access)]
    Repository --> DB[(PostgreSQL)]
    
    subgraph "Cross-Cutting Concerns"
        Extractor[Extractors (Auth/Cookie)]
        Error[Error Handling]
        Model[Models (Domain Objects)]
    end
```

### 3.1. 各レイヤーの責務

*   **Handlers (`src/handlers/`)**:
    *   HTTPリクエストの受け付け、パラメータのパース。
    *   Serviceの呼び出し。
    *   HTTPレスポンス（ステータスコード、JSON）の生成。
    *   **特徴**: ロジックを持たず、入出力の変換に徹する。

*   **Services (`src/services/`)**:
    *   ビジネスロジックの実装（バリデーション、計算、複数リポジトリの調整）。
    *   トランザクション管理（必要に応じて）。
    *   **特徴**: 特定のWebフレームワークに依存しない純粋なRustコード。

*   **Repositories (`src/repositories/`)**:
    *   データベースへのCRUD操作。
    *   SQLxを使用したクエリ実行。
    *   **特徴**: `Trait` として定義され、テスト時にモックへの差し替えが可能。

*   **Models (`src/models/`)**:
    *   ドメインオブジェクト（データ構造）の定義。
    *   DBのテーブル構造とJSONレスポンスの形状（DTO）を定義。

*   **Extractors (`src/extractors.rs`)**:
    *   Axumの機能を利用し、リクエストから共通データ（認証ユーザー情報など）を抽出する。
    *   今回はCookieベースの簡易認証（ユーザーIDの自動発行・維持）を担当。

## 4. API エンドポイント定義

| メソッド | パス | 説明 | 認証 |
| --- | --- | --- | --- |
| `POST` | `/api/calligraphy` | 書き初めの新規作成・更新 (Upsert) | 自動 (Cookie) |
| `GET` | `/api/calligraphy` | 書き初めの一覧取得 (最新順) | 不要 |
| `GET` | `/api/calligraphy/:id` | 特定の書き初めを取得 | 自動 (Cookie) |
| `DELETE` | `/api/calligraphy/:id` | 自分の書き初めを削除 | 自動 (Cookie) |

### 4.1. 認証仕様
*   **方式**: Cookieベースのセッションレス認証（簡易版）。
*   **挙動**:
    *   リクエストに `calli_user_id` クッキーがない場合、サーバー側でUUIDを生成し、`Set-Cookie` でクライアントに付与する。
    *   以降のリクエストでは、このCookieの値をユーザーIDとして識別する。
    *   **注意**: 本格的なログイン機能ではなく、ブラウザ単位の識別を行う仕組み。

## 5. データベース設計

### テーブル: `calligraphy`

| カラム名 | 型 | 制約 | 説明 |
| --- | --- | --- | --- |
| `user_id` | UUID | PK | ユーザー識別子 |
| `user_name` | TEXT | NOT NULL | ユーザー名 |
| `content` | TEXT | NOT NULL | 書き初めの内容 |
| `created_at` | TIMESTAMPTZ | NOT NULL | 作成日時 |
| `updated_at` | TIMESTAMPTZ | NOT NULL | 更新日時 |

*   **特徴**: `user_id` を主キーとしているため、1ユーザーにつき1つの書き初めのみ保持する設計（Upsert仕様）。

## 6. エラーハンドリング設計

アプリケーション独自のエラー型 `AppError` を定義し、一元管理しています。

| エラー型 | HTTPステータス | 説明 |
| --- | --- | --- |
| `AppError::Validation` | 400 Bad Request | 入力値不正（文字数超過など） |
| `AppError::NotFound` | 404 Not Found | 対象リソースが存在しない |
| `AppError::Database` | 500 Internal Server Error | DB接続エラー、クエリエラー |
| `AppError::Internal` | 500 Internal Server Error | その他の予期せぬエラー |

## 7. テスト戦略

*   **ユニットテスト**:
    *   `mockall` を使用してリポジトリをモック化し、Service層とHandler層を独立してテスト。
    *   異常系（バリデーションエラー、NotFound）のカバレッジを重視。
*   **結合テスト (`tests/api_test.rs`)**:
    *   実際のDB（またはテスト用DB）に接続。
    *   `tower::ServiceExt::oneshot` を使用し、HTTPサーバーを起動せずにリクエスト処理フロー全体を検証。
    *   シナリオテスト（作成 -> 取得 -> 削除 -> 確認）を実施。

## 8. ディレクトリ構成

```
/app
├── Cargo.toml          # 依存関係定義
├── src/
│   ├── main.rs         # エントリーポイント (サーバー起動)
│   ├── lib.rs          # アプリケーション初期化ロジック (テスト用)
│   ├── error.rs        # エラー定義
│   ├── extractors.rs   # 認証・Cookie処理
│   ├── handlers/       # APIハンドラ
│   ├── services/       # ビジネスロジック
│   ├── repositories/   # DBアクセス
│   └── models/         # データ構造
└── tests/
    └── api_test.rs     # 結合テスト
```
