use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde::Deserialize;

use crate::{
  error::AppError, extractors::AuthUser, repositories::db_repository::CalligraphyRepositoryTrait,
  services::calligraphy::CalligraphyService,
};

// --- DTOs (Data Transfer Objects) ---
/// フロントから受け取る書き初め作成・更新用のリクエストボディ
#[derive(Deserialize)]
pub struct CreateCalligraphyRequest {
	pub user_name: String,
  pub content: String,
}

// --- Handlers ---

/// 書き初め投稿・更新
pub async fn upsert<R: CalligraphyRepositoryTrait>(
  State(service): State<CalligraphyService<R>>, // State(service): Stateのserviceだけ取り出す
  auth_user: AuthUser,
  Json(payload): Json<CreateCalligraphyRequest>,
) -> Result<impl IntoResponse, AppError> {
  let calligraphy = service.upsert(auth_user.id, payload.user_name, payload.content).await?;
  Ok((StatusCode::OK, Json(calligraphy)))
}

/// 一覧取得
pub async fn list<R: CalligraphyRepositoryTrait>(
  State(service): State<CalligraphyService<R>>,
) -> Result<impl IntoResponse, AppError> {
  let list = service.get_all().await?;
  Ok((StatusCode::OK, Json(list)))
}

/// 個別取得
pub async fn get<R: CalligraphyRepositoryTrait>(
  State(service): State<CalligraphyService<R>>,
  auth_user: AuthUser,
) -> Result<impl IntoResponse, AppError> {
  let calligraphy = service.get(auth_user.id).await?;
  Ok((StatusCode::OK, Json(calligraphy)))
}

/// 削除
pub async fn delete<R: CalligraphyRepositoryTrait>(
  State(service): State<CalligraphyService<R>>,
  auth_user: AuthUser,
) -> Result<impl IntoResponse, AppError> {
  service.delete(auth_user.id).await?;
  Ok(StatusCode::NO_CONTENT)
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::calligraphy::Calligraphy;
  use crate::repositories::db_repository::MockCalligraphyRepositoryTrait;
  use time::OffsetDateTime;
  use uuid::Uuid;

	/// upsertハンドラーのテスト
  #[tokio::test]
  async fn test_upsert_handler() {
    let mut mock_repo = MockCalligraphyRepositoryTrait::new();
    let user_id = Uuid::new_v4();
		let user_name = "テストユーザー".to_string();
    let content = "Test Content".to_string();

    let expected_calligraphy = Calligraphy {
      user_id,
			user_name: user_name.clone(),
      content: content.clone(),
      created_at: OffsetDateTime::now_utc(),
      updated_at: OffsetDateTime::now_utc(),
    };
    let returned_calligraphy = expected_calligraphy.clone();

    mock_repo
      .expect_create()
      .with(
        mockall::predicate::eq(user_id),
				mockall::predicate::eq(user_name.clone()),
        mockall::predicate::eq(content.clone()),
      )
      .times(1)
      .returning(move |_, _, _| Ok(returned_calligraphy.clone()));

    let service = CalligraphyService::new(mock_repo);
    let state = State(service);
    let auth_user = AuthUser { id: user_id };
    let payload = Json(CreateCalligraphyRequest { user_name, content });
    let response = upsert(state, auth_user, payload).await;

    assert!(response.is_ok());
  }

	/// listハンドラーのテスト
  #[tokio::test]
  async fn test_list_handler() {
    let mut mock_repo = MockCalligraphyRepositoryTrait::new();
    let user_id = Uuid::new_v4();
		let user_name = "テストユーザー".to_string();
    let content = "List Item".to_string();

    let expected_calligraphy = Calligraphy {
      user_id,
			user_name: user_name.clone(),
      content: content.clone(),
      created_at: OffsetDateTime::now_utc(),
      updated_at: OffsetDateTime::now_utc(),
    };

    mock_repo
      .expect_find_all()
      .times(1)
      .returning(move || Ok(vec![expected_calligraphy.clone()]));

    let service = CalligraphyService::new(mock_repo);
    let state = State(service);

    let response = list(state).await;

    assert!(response.is_ok());
  }

	/// getハンドラーのテスト
  #[tokio::test]
  async fn test_get_handler() {
    let mut mock_repo = MockCalligraphyRepositoryTrait::new();
    let user_id = Uuid::new_v4();
		let user_name = "テストユーザー".to_string();
    let content = "Get Item".to_string();

    let expected_calligraphy = Calligraphy {
      user_id,
			user_name: user_name.clone(),
      content: content.clone(),
      created_at: OffsetDateTime::now_utc(),
      updated_at: OffsetDateTime::now_utc(),
    };

    mock_repo
      .expect_find_by_id()
      .with(mockall::predicate::eq(user_id))
      .times(1)
      .returning(move |_| Ok(Some(expected_calligraphy.clone())));

    let service = CalligraphyService::new(mock_repo);
    let state = State(service);
    let auth_user = AuthUser { id: user_id };

    let response = get(state, auth_user).await;

    assert!(response.is_ok());
  }

	/// deleteハンドラーのテスト
  #[tokio::test]
  async fn test_delete_handler() {
    let mut mock_repo = MockCalligraphyRepositoryTrait::new();
    let user_id = Uuid::new_v4();

    mock_repo
      .expect_delete()
      .with(mockall::predicate::eq(user_id))
      .times(1)
      .returning(|_| Ok(1));

    let service = CalligraphyService::new(mock_repo);
    let state = State(service);
    let auth_user = AuthUser { id: user_id };

    let response = delete(state, auth_user).await;

    assert!(response.is_ok());
  }
}
