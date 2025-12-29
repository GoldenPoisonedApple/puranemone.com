use axum::{
  extract::State,
  http::StatusCode,
  response::IntoResponse,
  Json,
};
use sqlx::types::ipnetwork::IpNetwork;

use crate::{
  error::AppError,
  extractors::{AuthUser, ClientIp, UserAgent, AcceptLanguage},
  models::calligraphy::{CreateCalligraphyRequest, CalligraphyResponse},
  repositories::db_repository::CalligraphyRepositoryTrait,
  services::calligraphy::CalligraphyService,
};

// --- Handlers ---

/// 書き初め投稿・更新
pub async fn upsert<R: CalligraphyRepositoryTrait>(
  State(service): State<CalligraphyService<R>>, // State(service): Stateのserviceだけ取り出す
  auth_user: AuthUser,
  ClientIp(ip): ClientIp,
  UserAgent(user_agent): UserAgent,
  AcceptLanguage(accept_language): AcceptLanguage,
  Json(payload): Json<CreateCalligraphyRequest>,
) -> Result<impl IntoResponse, AppError> {
  // IPアドレスによるレート制限チェック
  if let Some(ip_addr) = ip {
    service.check_write_rate_limit(ip_addr).await?;
  }

  let ip_network = ip.map(IpNetwork::from);
  let calligraphy = service
    .upsert(
      auth_user.id,
      payload.user_name,
      payload.content,
      ip_network,
      user_agent,
      accept_language,
    )
    .await?;

  let response = CalligraphyResponse {
    user_name: calligraphy.user_name,
    content: calligraphy.content,
    created_at: calligraphy.created_at,
    updated_at: calligraphy.updated_at,
    is_mine: true,
  };

  Ok((StatusCode::OK, Json(response)))
}

/// 一覧取得
pub async fn list<R: CalligraphyRepositoryTrait>(
  State(service): State<CalligraphyService<R>>,
  auth_user: AuthUser,
  ClientIp(ip): ClientIp,
) -> Result<impl IntoResponse, AppError> {
  // IPアドレスによるレート制限チェック
  if let Some(ip_addr) = ip {
    service.check_read_rate_limit(ip_addr).await?;
  }

  let list = service.get_all().await?;
  let response: Vec<CalligraphyResponse> = list
    .into_iter()
    .map(|c| {
      let is_mine = c.user_id == auth_user.id;
      CalligraphyResponse {
        user_name: c.user_name,
        content: c.content,
        created_at: c.created_at,
        updated_at: c.updated_at,
        is_mine,
      }
    })
    .collect();
  Ok((StatusCode::OK, Json(response)))
}

/// 個別取得
pub async fn get<R: CalligraphyRepositoryTrait>(
  State(service): State<CalligraphyService<R>>,
  auth_user: AuthUser,
  ClientIp(ip): ClientIp,
) -> Result<impl IntoResponse, AppError> {
  // IPアドレスによるレート制限チェック
  if let Some(ip_addr) = ip {
    service.check_read_rate_limit(ip_addr).await?;
  }

  let calligraphy = service.get(auth_user.id).await?;

  let response = CalligraphyResponse {
    user_name: calligraphy.user_name,
    content: calligraphy.content,
    created_at: calligraphy.created_at,
    updated_at: calligraphy.updated_at,
    is_mine: true,
  };

  Ok((StatusCode::OK, Json(response)))
}

/// 削除
pub async fn delete<R: CalligraphyRepositoryTrait>(
  State(service): State<CalligraphyService<R>>,
  auth_user: AuthUser,
  ClientIp(ip): ClientIp,
) -> Result<impl IntoResponse, AppError> {
  // IPアドレスによるレート制限チェック
  if let Some(ip_addr) = ip {
    service.check_write_rate_limit(ip_addr).await?;
  }

  service.delete(auth_user.id).await?;
  Ok(StatusCode::NO_CONTENT)
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::calligraphy::Calligraphy;
  use crate::repositories::db_repository::MockCalligraphyRepositoryTrait;
  use async_trait::async_trait;
  use sqlx::types::ipnetwork::IpNetwork;
  use std::net::IpAddr;
  use std::sync::Arc;
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
      ip_address: Some(IpNetwork::from(IpAddr::V4(std::net::Ipv4Addr::new(
        127, 0, 0, 1,
      )))),
      user_agent: None,
      accept_language: None,
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
        mockall::predicate::always(), // ip_address
        mockall::predicate::always(), // user_agent
        mockall::predicate::always(), // accept_language
      )
      .times(1)
      .returning(move |_, _, _, _, _, _| Ok(returned_calligraphy.clone()));

    let service = CalligraphyService::new(mock_repo);
    let state = State(service);
    let auth_user = AuthUser { id: user_id };
    let payload = Json(CreateCalligraphyRequest { user_name, content });
    // ダミーIPアドレスを使用
    let client_ip = ClientIp(Some("127.0.0.1".parse().unwrap()));
		let user_agent = UserAgent(None);
		let accept_language = AcceptLanguage(None);
    let response = upsert(state, auth_user, client_ip, user_agent, accept_language, payload).await;

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
			ip_address: None,
      user_agent: None,
      accept_language: None,
      created_at: OffsetDateTime::now_utc(),
      updated_at: OffsetDateTime::now_utc(),
    };

    mock_repo
      .expect_find_all()
      .times(1)
      .returning(move || Ok(vec![expected_calligraphy.clone()]));

    let service = CalligraphyService::new(mock_repo);
    let state = State(service);
    let client_ip = ClientIp(Some("127.0.0.1".parse().unwrap()));
    let response = list(state, AuthUser { id: Uuid::new_v4() }, client_ip).await;

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
			ip_address: None,
      user_agent: None,
      accept_language: None,
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
    let client_ip = ClientIp(Some("127.0.0.1".parse().unwrap()));
    let response = get(state, auth_user, client_ip).await;

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
    let client_ip = ClientIp(Some("127.0.0.1".parse().unwrap()));
    let response = delete(state, auth_user, client_ip).await;

    assert!(response.is_ok());
  }

  // Arc<MockCalligraphyRepositoryTrait> に CalligraphyRepositoryTrait を実装する
  #[async_trait]
  impl crate::repositories::db_repository::CalligraphyRepositoryTrait
    for Arc<MockCalligraphyRepositoryTrait>
  {
    async fn create(
      &self,
      user_id: Uuid,
      user_name: String,
      content: String,
			ip_address: Option<IpNetwork>,
      user_agent: Option<String>,
      accept_language: Option<String>,
    ) -> Result<Calligraphy, sqlx::Error> {
      self.as_ref().create(user_id, user_name, content, ip_address, user_agent, accept_language).await
    }
    async fn find_all(&self) -> Result<Vec<Calligraphy>, sqlx::Error> {
      self.as_ref().find_all().await
    }
    async fn find_by_id(&self, id: Uuid) -> Result<Option<Calligraphy>, sqlx::Error> {
      self.as_ref().find_by_id(id).await
    }
    async fn delete(&self, id: Uuid) -> Result<u64, sqlx::Error> {
      self.as_ref().delete(id).await
    }
  }

  /// レート制限（書き込み）のテスト
  #[tokio::test]
  async fn test_write_rate_limit() {
    let mut mock_repo = MockCalligraphyRepositoryTrait::new();
    let user_id = Uuid::new_v4();
    let user_name = "RateLimitUser".to_string();
    let content = "Content".to_string();

    // 1回目の呼び出しは成功するので、リポジトリが呼ばれる
    mock_repo
      .expect_create()
      .times(2) // 2回だけ呼ばれるはず
      .returning(move |uid, uname, c, _ip, _ua, _al| {
        Ok(Calligraphy {
          user_id: uid,
          user_name: uname,
          content: c,
          ip_address: None,
          user_agent: None,
          accept_language: None,
          created_at: OffsetDateTime::now_utc(),
          updated_at: OffsetDateTime::now_utc(),
        })
      });

    // MockをArcでラップしてClone可能にする
    let service = CalligraphyService::new(Arc::new(mock_repo));
    let state = State(service); // serviceはCloneされるので、状態（キャッシュ）は共有され

    // 1回目: 成功するはず
    let response1 = upsert(
      state.clone(),
      AuthUser { id: user_id },
      ClientIp(Some("192.168.1.1".parse().unwrap())),
			UserAgent(None),
			AcceptLanguage(None),
      Json(CreateCalligraphyRequest {
        user_name: user_name.clone(),
        content: content.clone(),
      }),
    )
    .await;
    assert!(response1.is_ok());

    // 2回目: 同じIPなので失敗するはず (TooManyRequests)
    let response2 = upsert(
      state.clone(),
      AuthUser { id: user_id },
      ClientIp(Some("192.168.1.1".parse().unwrap())),
			UserAgent(None),
			AcceptLanguage(None),
      Json(CreateCalligraphyRequest {
        user_name: user_name.clone(),
        content: content.clone(),
      }),
    )
    .await;

    match response2 {
      Err(AppError::TooManyRequests) => assert!(true),
      _ => assert!(false, "Should return TooManyRequests error"),
    }

    // 3回目: IP B (成功 - 別IPなので通る)
    let res3 = upsert(
      state.clone(),
      AuthUser { id: user_id },
      ClientIp(Some("192.168.1.2".parse().unwrap())), // IPを変更
			UserAgent(None),
			AcceptLanguage(None),
      Json(CreateCalligraphyRequest {
        user_name: user_name.clone(),
        content: content.clone(),
      }),
    )
    .await;
    assert!(res3.is_ok());
  }

  /// レート制限（読み込み）のテスト
  #[tokio::test]
  async fn test_read_rate_limit() {
    let mut mock_repo = MockCalligraphyRepositoryTrait::new();

    // 1回目の呼び出しは成功するので、リポジトリが呼ばれる
    mock_repo
      .expect_find_all()
      .times(1)
      .returning(|| Ok(vec![]));

    let service = CalligraphyService::new(Arc::new(mock_repo));
    let state = State(service);

    // 1回目: 成功
    let response1 = list(state.clone(), AuthUser { id: Uuid::new_v4() }, ClientIp(Some("10.0.0.1".parse().unwrap()))).await;
    assert!(response1.is_ok());

    // 2回目: 失敗 (TooManyRequests)
    let response2 = list(state.clone(), AuthUser { id: Uuid::new_v4() }, ClientIp(Some("10.0.0.1".parse().unwrap()))).await;
    match response2 {
      Err(AppError::TooManyRequests) => assert!(true),
      _ => assert!(false, "Should return TooManyRequests error"),
    }
  }
}
