pub mod error;
pub mod extractors;
pub mod handlers;
pub mod models;
pub mod repositories;
pub mod services;

use axum::{
  routing::{delete, get, post},
  Router,
};
use repositories::db_repository::CalligraphyRepository;
use services::calligraphy::CalligraphyService;
use sqlx::PgPool;
use tower_cookies::CookieManagerLayer;

pub fn create_app(pool: PgPool) -> Router {
  // 依存関係の構築 (DI)
  // Pool -> Repository -> Service
  // 起動時に一度だけ構築し、Stateとして注入
  let repository = CalligraphyRepository::new(pool);
  let service = CalligraphyService::new(repository);

  Router::new()
    .route(
      "/api/calligraphy",
      post(handlers::calligraphy::upsert::<CalligraphyRepository>),
    )
    .route(
      "/api/calligraphy",
      get(handlers::calligraphy::list::<CalligraphyRepository>),
    )
    .route(
      "/api/calligraphy/:id",
      get(handlers::calligraphy::get::<CalligraphyRepository>),
    )
    .route(
      "/api/calligraphy/:id",
      delete(handlers::calligraphy::delete::<CalligraphyRepository>),
    )
    .with_state(service)	// StateとしてServiceを注入
    .layer(CookieManagerLayer::new())	// Cookie管理ミドルウェアの追加 CookieManager: レスポンスが返される直前にSet-Cookieヘッダーを追加する
}
