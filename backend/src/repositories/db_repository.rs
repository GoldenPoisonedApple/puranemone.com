use crate::models::calligraphy::Calligraphy;
use async_trait::async_trait;
use sqlx::PgPool;
use uuid::Uuid;

#[cfg_attr(test, mockall::automock)]
#[async_trait] // 非同期関数を含むトレイト用のマクロ
pub trait CalligraphyRepositoryTrait: Send + Sync {
  async fn create(&self, user_id: Uuid, content: String) -> Result<Calligraphy, sqlx::Error>;
  async fn find_by_id(&self, user_id: Uuid) -> Result<Option<Calligraphy>, sqlx::Error>;
  async fn find_all(&self) -> Result<Vec<Calligraphy>, sqlx::Error>;
  async fn delete(&self, user_id: Uuid) -> Result<u64, sqlx::Error>;
}

/// Calligraphyテーブルへのアクセスを担当するリポジトリ
/// PgPoolは内部でArc(参照カウント)を使用しているため、Cloneコストは低い
#[derive(Clone)]
pub struct CalligraphyRepository {
  pool: PgPool,
}

impl CalligraphyRepository {
  /// コンストラクタ
  pub fn new(pool: PgPool) -> Self {
    Self { pool }
  }
}

#[async_trait]
impl CalligraphyRepositoryTrait for CalligraphyRepository {
  /// 新規書き初めの作成 (INSERT)
  ///
  /// # 引数
  /// * `user_id` - Cookie等から特定されたユーザーID (信頼できる値)
  /// * `content` - ユーザー入力内容
  ///
  /// # 戻り値
  /// * `Ok(Calligraphy)` - DBにより生成されたタイムスタンプを含む完全なモデル
  async fn create(&self, user_id: Uuid, content: String) -> Result<Calligraphy, sqlx::Error> {
    // query_as! マクロ:
    // コンパイル時にSQL構文と、戻り値(Calligraphy構造体)の型整合性をチェックする。
    // フィールド名とカラム名が完全に一致している必要がある。
    sqlx::query_as!(
      Calligraphy,
      r#"
						INSERT INTO calligraphy (user_id, content, updated_at)
						VALUES ($1, $2, NOW())
						ON CONFLICT (user_id)
						DO UPDATE SET	-- 重複時は内容を上書き
								content = EXCLUDED.content,
								updated_at = NOW()
						RETURNING user_id, content, created_at, updated_at
						"#,
      user_id,
      content,
    )
    .fetch_one(&self.pool)
    .await
  }

  /// IDによる検索 (SELECT)
  ///
  /// 戻り値Option<Calligraphy>
  async fn find_by_id(&self, user_id: Uuid) -> Result<Option<Calligraphy>, sqlx::Error> {
    sqlx::query_as!(
      Calligraphy,
      r#"
						SELECT user_id, content, created_at, updated_at
						FROM calligraphy
						WHERE user_id = $1
						"#,
      user_id
    )
    .fetch_optional(&self.pool)
    .await
  }

  /// 全件取得 (一覧表示用)
  ///
  /// 作成日時の新しい順（降順）で取得する。
  async fn find_all(&self) -> Result<Vec<Calligraphy>, sqlx::Error> {
    sqlx::query_as!(
      Calligraphy,
      r#"
            SELECT user_id, content, created_at, updated_at
            FROM calligraphy
            ORDER BY created_at DESC
            LIMIT 100 -- 安全のため上限を設定（必要に応じてページネーションに変更）
            "#
    )
    .fetch_all(&self.pool)
    .await
  }

  /// 削除
  /// 戻り値は影響を受けた行数
  async fn delete(&self, user_id: Uuid) -> Result<u64, sqlx::Error> {
    let result = sqlx::query!(
      r#"
			DELETE FROM calligraphy
			WHERE user_id = $1
			"#,
      user_id
    )
    .execute(&self.pool)
    .await?;

    Ok(result.rows_affected())
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use sqlx::postgres::PgPoolOptions;

  // 実際にDBに接続して動作確認を行うテスト
  #[tokio::test]
  async fn test_crud_scenario() {
    // 1. 環境設定の読み込み
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    // 2. テスト用プール作成
    let pool = PgPoolOptions::new()
      .max_connections(1)
      .connect(&database_url)
      .await
      .expect("Failed to connect to DB");

    let repository = CalligraphyRepository::new(pool.clone());

    // 3. テストデータの準備 (衝突しないようランダムなUUID生成)
    let user_id = Uuid::new_v4();
    let content_1 = "今年の抱負：早起き";
    let content_2 = "今年の抱負：やっぱり筋トレ";

    // --- Test A: 新規作成 (Create/Upsert) ---
    let created = repository
      .create(user_id, content_1.to_string())
      .await
      .expect("Failed to create calligraphy");

    assert_eq!(created.user_id, user_id);
    assert_eq!(created.content, content_1);
    println!("Test A Passed: Created successfully");

    // --- Test B: ID検索 (Read) ---
    let found = repository
      .find_by_id(user_id)
      .await
      .expect("Failed to find calligraphy")
      .expect("Calligraphy not found"); // Option unwrapping

    assert_eq!(found.content, content_1);
    println!("Test B Passed: Found by ID");

    // --- Test C: 更新確認 (Upsert Update) ---
    let updated = repository
      .create(user_id, content_2.to_string())
      .await
      .expect("Failed to update calligraphy");

    assert_eq!(updated.content, content_2);
    assert!(
      updated.updated_at > created.updated_at,
      "Updated time should be newer"
    );
    println!("Test C Passed: Updated content");

    // --- Test D: 一覧取得 (Find All) ---
    let list = repository.find_all().await.expect("Failed to find all");

    // 自分のデータが含まれているか確認
    let my_data = list.iter().find(|c| c.user_id == user_id);
    assert!(my_data.is_some());
    assert_eq!(my_data.unwrap().content, content_2); // 最新の内容であること
    println!("Test D Passed: Found in list");

    // --- Cleanup: テストデータの削除 (行儀よく後始末) ---
    let deleted_count = repository
      .delete(user_id)
      .await
      .expect("Failed to delete calligraphy");
    assert_eq!(deleted_count, 1);
    println!("Cleanup Passed: Deleted test data");
  }
}
