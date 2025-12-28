use server::create_app;
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

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

  let app = create_app(pool);

	// サーバー起動
	let addr = SocketAddr::from(([0, 0, 0, 0], SERVER_PORT));
	tracing::info!("listening on {}", addr);
	let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
	axum::serve(listener, app).await.unwrap();

	Ok(())
}
