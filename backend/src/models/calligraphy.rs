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
	/// ユーザーID
	pub user_id: Uuid,
	/// ユーザー名
	pub user_name: String,
	/// 書き初め内容
	pub content: String,
	
	// JSONシリアライズ時はISO8601形式にするための指定。
	#[serde(with = "time::serde::iso8601")]
	pub created_at: OffsetDateTime,

	#[serde(with = "time::serde::iso8601")]
	pub updated_at: OffsetDateTime,
}