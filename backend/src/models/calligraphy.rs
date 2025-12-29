use serde::{Deserialize, Serialize};
use sqlx::types::ipnetwork::IpNetwork;
use sqlx::FromRow;
use time::OffsetDateTime;
use uuid::Uuid;

/**
 * 書き初めデータ
 * DBのcalligraphiesテーブルに対応するモデル
 */
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Calligraphy {
  /// ユーザーID
  pub user_id: Uuid,
  /// ユーザー名
  pub user_name: String,
  /// 書き初め内容
  pub content: String,

  /// IPアドレス (情報収集用)
  #[serde(skip)]
  pub ip_address: Option<IpNetwork>,
  /// User-Agent (情報収集用)
  #[serde(skip)]
  pub user_agent: Option<String>,
  /// Accept-Language (情報収集用)
  #[serde(skip)]
  pub accept_language: Option<String>,

  // JSONシリアライズ時はISO8601形式にするための指定。
  #[serde(with = "time::serde::iso8601")]
  pub created_at: OffsetDateTime,

  #[serde(with = "time::serde::iso8601")]
  pub updated_at: OffsetDateTime,
}

// --- DTOs (Data Transfer Objects) ---
/// フロントから受け取る書き初め作成・更新用のリクエストボディ
#[derive(Deserialize)]
pub struct CreateCalligraphyRequest {
  pub user_name: String,
  pub content: String,
}

/// APIレスポンス用のDTO
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalligraphyResponse {
  pub user_name: String,
  pub content: String,
  #[serde(with = "time::serde::iso8601")]
  pub created_at: OffsetDateTime,
  #[serde(with = "time::serde::iso8601")]
  pub updated_at: OffsetDateTime,
  pub is_mine: bool,
}
