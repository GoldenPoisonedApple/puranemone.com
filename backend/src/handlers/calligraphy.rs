use axum::{
  extract::{Path, State},
  http::StatusCode,
  response::IntoResponse,
  Json,
};
use serde::Deserialize;
use uuid::Uuid;

use crate::{
  error::AppError, repositories::db_repository::CalligraphyRepository,
  services::calligraphy::CalligraphyService,
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
  State(service): State<Service>,
  Json(payload): Json<CreateCalligraphyRequest>,
) -> Result<impl IntoResponse, AppError> {
  // TODO: 認証ミドルウェア実装後に、正規の方法でユーザーIDを取得する
  // 現在は開発用ダミーIDを使用
  let user_id = Uuid::parse_str("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11").unwrap();

  let calligraphy = service.upsert(user_id, payload.content).await?;

  Ok((StatusCode::OK, Json(calligraphy)))
}

/// 一覧取得
pub async fn list(State(service): State<Service>) -> Result<impl IntoResponse, AppError> {
  // Serviceのメソッド名は get_all なので修正
  let list = service.get_all().await?;
  Ok((StatusCode::OK, Json(list)))
}

/// 個別取得
pub async fn get(
  State(service): State<Service>,
  Path(user_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
  let calligraphy = service.get(user_id).await?;
  Ok((StatusCode::OK, Json(calligraphy)))
}

/// 削除
pub async fn delete(
  State(service): State<Service>,
  Path(user_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
  service.delete(user_id).await?;
  Ok(StatusCode::NO_CONTENT)
}
