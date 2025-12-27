use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use time::OffsetDateTime;
use uuid::Uuid;

/**
 * 書き初めデータ
 * DBのcalligraphiesテーブルに対応するモデル
 */
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Calligraphy {
	pub user_id: Uuid,
	pub content: String,
	
	// JSONシリアライズ時はISO8601形式にするための指定。
	#[serde(with = "time::serde::iso8601")]
	pub created_at: OffsetDateTime,

	#[serde(with = "time::serde::iso8601")]
	pub updated_at: OffsetDateTime,
}

/**
 * フロントから受け取るDTO
 */
#[derive(Debug, Deserialize)]
pub struct CreateCalligraphy {
	// contentだけで良い（user_idは認証情報から、日時はDB自動生成）
	pub content: String,
}