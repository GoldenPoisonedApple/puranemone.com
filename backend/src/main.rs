use axum::{
    extract::State,
    routing::get,
    Router,
    Json,
};
use serde_json::{json, Value};
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    // B. 構造化ログの初期化
    // RUST_LOG環境変数でレベル制御可能 (デフォルトは debug)
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "server=debug".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // C. DB接続プールの作成
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to DB");

    tracing::info!("Connected to Database!");

    // アプリケーションの状態としてPoolを持たせる
    let app = Router::new()
        .route("/", get(health_check))
        .route("/db_test", get(db_test)) // DB接続テスト用
        .with_state(pool);

    let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
    tracing::info!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// ヘルスチェック
async fn health_check() -> &'static str {
    "Hello from Modern Rust Backend!"
}

// DB接続テストハンドラ
// State経由でDBプールを受け取る
async fn db_test(State(pool): State<sqlx::PgPool>) -> Json<Value> {
    // sqlx::query (実行時チェック) を使用
    // ※ query! (コンパイル時チェック) は開発環境にDBがないとビルドコケるため、まずはこれで
    let row: (i64,) = sqlx::query_as("SELECT 1")
        .fetch_one(&pool)
        .await
        .unwrap_or((0,));

    Json(json!({
        "status": "ok",
        "db_result": row.0
    }))
}