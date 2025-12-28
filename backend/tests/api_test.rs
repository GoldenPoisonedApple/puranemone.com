use axum::{
  body::Body,
  http::{Request, StatusCode},
};
use http_body_util::BodyExt; // for collect
use server::create_app;
use sqlx::postgres::PgPoolOptions;
use tower::ServiceExt; // for oneshot

#[tokio::test]
async fn test_calligraphy_scenario() {
  // 1. Setup
  let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
  let pool = PgPoolOptions::new()
    .max_connections(1)
    .connect(&database_url)
    .await
    .expect("Failed to connect to DB");

  // アプリケーションの作成（状態を持つため、リクエストごとにクローンして使う）
  let app = create_app(pool);

  // --- Step 1: 新規作成 (POST) ---
  let response = app
    .clone()
    .oneshot(
      Request::builder()
        .method("POST")
        .uri("/api/calligraphy")
        .header("Content-Type", "application/json")
        .body(Body::from(r#"{ "user_name": "Test User", "content": "Integration Test Scenario"}"#))
        .unwrap(),
    )
    .await
    .unwrap();

  assert_eq!(response.status(), StatusCode::OK);

  // レスポンスからCookieを取得 (認証用)
  let cookie_header = response.headers().get("set-cookie").unwrap().clone();

  // レスポンスボディからIDを取得
  let body = response.into_body().collect().await.unwrap().to_bytes();
  let created_json: serde_json::Value = serde_json::from_slice(&body).unwrap();
  let created_id = created_json["user_id"].as_str().unwrap();
	assert_eq!(created_json["user_name"], "Test User");
  assert_eq!(created_json["content"], "Integration Test Scenario");

  println!("Step 1: Created with ID: {}", created_id);

  // --- Step 2: 自分のデータを取得 (GET /api/calligraphy/:id) ---
  // 注意: 本来は /api/calligraphy/me のようなエンドポイントが望ましいが、
  // 現状の実装に合わせて ID 指定で取得しつつ、Cookieで認証を通す
  let response = app
    .clone()
    .oneshot(
      Request::builder()
        .method("GET")
        .uri(format!("/api/calligraphy/{}", created_id))
        .header("Cookie", cookie_header.to_str().unwrap()) // Cookieをセット
        .body(Body::empty())
        .unwrap(),
    )
    .await
    .unwrap();

  assert_eq!(response.status(), StatusCode::OK);

  let body = response.into_body().collect().await.unwrap().to_bytes();
  let fetched_json: serde_json::Value = serde_json::from_slice(&body).unwrap();
  assert_eq!(fetched_json["content"], "Integration Test Scenario");
	assert_eq!(fetched_json["user_name"], "Test User");
  assert_eq!(fetched_json["user_id"], created_id);

  println!("Step 2: Fetched successfully");

  // --- Step 3: 削除 (DELETE) ---
  let response = app
    .clone()
    .oneshot(
      Request::builder()
        .method("DELETE")
        .uri(format!("/api/calligraphy/{}", created_id))
        .header("Cookie", cookie_header.to_str().unwrap())
        .body(Body::empty())
        .unwrap(),
    )
    .await
    .unwrap();

  assert_eq!(response.status(), StatusCode::NO_CONTENT);
  println!("Step 3: Deleted successfully");

  // --- Step 4: 削除確認 (GET -> 404 NotFound) ---
  let response = app
    .clone()
    .oneshot(
      Request::builder()
        .method("GET")
        .uri(format!("/api/calligraphy/{}", created_id))
        .header("Cookie", cookie_header.to_str().unwrap())
        .body(Body::empty())
        .unwrap(),
    )
    .await
    .unwrap();

  // 削除済みなので 404 が返るはず
  assert_eq!(response.status(), StatusCode::NOT_FOUND);
  println!("Step 4: Confirmed deletion (404)");
}
