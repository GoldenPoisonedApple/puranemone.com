// エクストラクター: コンストラクタみたいなリクエストのたびに実行されるファクトリーのようなもの
// リクエストがハンドラーに到達する前に実行され、必要なデータを抽出・変換してハンドラーに渡す役割を果たす
// Axumが勝手にねじ込んでくれる


use axum::{
  async_trait,
  extract::FromRequestParts,
  http::{request::Parts, StatusCode},
};
use time::Duration;
use tower_cookies::{Cookie, Cookies};
use uuid::Uuid; // cookieの有効期限用

// ハンドラーで受け取るための型
pub struct AuthUser {
  pub id: Uuid,
}

// 定数定義
const COOKIE_NAME: &str = "calli_user_id";

/// AuthUser用のエクストラクター実装
#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
  S: Send + Sync,
{
  type Rejection = (StatusCode, &'static str);

	/// リクエストのPartsからAuthUserを生成する
  async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
    // 1. request extensionsからCookiesを取り出す
    // (main.rsでCookieManagerLayerを追加していないとここでpanicする)
    let cookies = parts
      .extensions
      .get::<Cookies>()
      .ok_or((StatusCode::INTERNAL_SERVER_ERROR, "Cookies layer missing"))?;

    // 2. クッキーの確認
    if let Some(cookie) = cookies.get(COOKIE_NAME) {
      // クッキーがある場合: UUIDとしてパースを試みる
      if let Ok(parsed_id) = Uuid::parse_str(cookie.value()) {
        return Ok(AuthUser { id: parsed_id });
      }
    }

    // 3. クッキーがない (または不正) 場合: 新規発行
    let new_id = Uuid::new_v4();
    let mut cookie = Cookie::new(COOKIE_NAME, new_id.to_string());

    // クッキーのセキュリティ設定 (本番ではSecure属性などを調整)
    cookie.set_http_only(true);
    cookie.set_path("/");
    cookie.set_max_age(Duration::days(365)); // 1年間有効

    // レスポンスヘッダーへの書き込み予約
    cookies.add(cookie);

    Ok(AuthUser { id: new_id })
  }
}
