use axum::{
  extract::State,
  http::StatusCode,
  response::IntoResponse,
  Json,
};
use serde::Deserialize;

use crate::{
  error::AppError, repositories::db_repository::CalligraphyRepository,
  services::calligraphy::CalligraphyService,
	extractors::AuthUser,
};

// サービスの具体的な型定義
// ジェネリクスを含む型を毎回書くのは冗長なのでエイリアスを作成
// これにより、ハンドラのシグネチャがスッキリします
type Service = CalligraphyService<CalligraphyRepository>;

// --- DTOs (Data Transfer Objects) ---

#[derive(Deserialize)]
pub struct CreateCalligraphyRequest {
  pub content: String,
}

// --- Handlers ---

/// 書き初め投稿・更新
pub async fn upsert(
  State(service): State<Service>,	// State(service): Stateのserviceだけ取り出す
	auth_user: AuthUser,	
  Json(payload): Json<CreateCalligraphyRequest>,
) -> Result<impl IntoResponse, AppError> {
  let calligraphy = service.upsert(auth_user.id, payload.content).await?;
  Ok((StatusCode::OK, Json(calligraphy)))
}

/// 一覧取得
pub async fn list(
  State(service): State<Service>) -> Result<impl IntoResponse, AppError> {
  let list = service.get_all().await?;
  Ok((StatusCode::OK, Json(list)))
}

/// 個別取得
pub async fn get(
  State(service): State<Service>,
  auth_user: AuthUser
) -> Result<impl IntoResponse, AppError> {
  let calligraphy = service.get(auth_user.id).await?;
  Ok((StatusCode::OK, Json(calligraphy)))
}

/// 削除
pub async fn delete(
  State(service): State<Service>,
  auth_user: AuthUser
) -> Result<impl IntoResponse, AppError> {
  service.delete(auth_user.id).await?;
  Ok(StatusCode::NO_CONTENT)
}
