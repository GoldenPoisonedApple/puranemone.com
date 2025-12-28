use axum::{
    routing::{get, post, delete},
    Router,
};
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// モジュール宣言
mod error;
mod models;
mod repositories;
mod services;
mod handlers;

use repositories::db_repository::CalligraphyRepository;
use services::calligraphy::CalligraphyService;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
	const MAX_CONNECTIONS: u32 = 5;
	const SERVER_PORT: u16 = 3000;


  // 構造化ログの初期化
  // RUST_LOG環境変数でレベル制御可能 (デフォルトは debug)
  tracing_subscriber::registry()
    .with(
      tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| "server=debug".into()),
    )
    .with(tracing_subscriber::fmt::layer())
    .init();

  // DB接続プールの作成
	// poolは内部的にArc(参照カウンタ)で共有される
  let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
  let pool = PgPoolOptions::new()
    .max_connections(MAX_CONNECTIONS)
    .connect(&database_url)
    .await?;
  tracing::info!("Connected to Database!");

  // 依存関係の構築 (DI)
  // Pool -> Repository -> Service
	// 起動時に一度だけ構築し、Stateとして注入
  let repository = CalligraphyRepository::new(pool);
  let service = CalligraphyService::new(repository);

  // ルーティング定義
  let app = Router::new()
    .route("/api/calligraphy", post(handlers::calligraphy::upsert))
    .route("/api/calligraphy", get(handlers::calligraphy::list))
    .route("/api/calligraphy/:id", get(handlers::calligraphy::get))
    .route("/api/calligraphy/:id", delete(handlers::calligraphy::delete),
    )
    .with_state(service); // StateとしてServiceを注入

	// サーバー起動
	let addr = SocketAddr::from(([0, 0, 0, 0], SERVER_PORT));
	tracing::info!("listening on {}", addr);
	let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
	axum::serve(listener, app).await.unwrap();

	Ok(())
}
