use crate::error::AppError;
use crate::models::calligraphy::Calligraphy;
use crate::repositories::db_repository::CalligraphyRepositoryTrait;
use uuid::Uuid;

/// ビジネスロジックを担当するサービス
/// データの加工、バリデーション、エラーの意味付けを行う
#[derive(Clone)]
pub struct CalligraphyService<R: CalligraphyRepositoryTrait> {
  repository: R,
}

impl<R: CalligraphyRepositoryTrait> CalligraphyService<R> {
  pub fn new(repository: R) -> Self {
    Self { repository }
  }

  /// 書き初めを作成・更新する
  /// 文字数制限などのビジネスルールがあればここで検証する
  pub async fn upsert(
    &self,
    user_id: Uuid,
    user_name: String,
    content: String,
  ) -> Result<Calligraphy, AppError> {
    // バリデーション例 (DBのCHECK制約もあるが、アプリ側でも弾く場合)
    if content.chars().count() > 50 {
      return Err(AppError::Validation(
        "Content must be 50 chars or less".to_string(),
      ));
    }
    if user_name.chars().count() > 20 {
      return Err(AppError::Validation(
        "User name must be 30 chars or less".to_string(),
      ));
    }

    // Repositoryの呼び出し。
    let calligraphy = self.repository.create(user_id, user_name, content).await?;
    Ok(calligraphy)
  }

  /// IDで取得する
  /// データが存在しない場合、AppError::NotFound を返すように変換する
  pub async fn get(&self, user_id: Uuid) -> Result<Calligraphy, AppError> {
    let opt = self.repository.find_by_id(user_id).await?;

    // Option -> Result 変換
    opt.ok_or(AppError::NotFound)
  }

  /// 一覧を取得する
  pub async fn get_all(&self) -> Result<Vec<Calligraphy>, AppError> {
    let list = self.repository.find_all().await?;
    Ok(list)
  }

  /// 削除する
  /// 削除対象が存在しなかった場合もエラーとみなす設計にする
  pub async fn delete(&self, user_id: Uuid) -> Result<(), AppError> {
    let count = self.repository.delete(user_id).await?;

    if count == 0 {
      // 削除しようとしたが無い = NotFound
      return Err(AppError::NotFound);
    }

    Ok(())
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::repositories::db_repository::MockCalligraphyRepositoryTrait;
  use time::OffsetDateTime;

  /// 書き初めサービスの単体テスト
  #[tokio::test]
  async fn test_upsert_success() {
    let mut mock_repo = MockCalligraphyRepositoryTrait::new();
    let user_id = Uuid::new_v4();
    let user_name = "テストユーザー".to_string();
    let content = "Happy New Year".to_string();
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
    let result = service.upsert(user_id, user_name.clone(), content).await;

    assert!(result.is_ok());
    assert_eq!(result.as_ref().unwrap().user_name, user_name);
    assert_eq!(result.unwrap().content, "Happy New Year");
  }

  /// 書き込み バリデーションエラーのテスト
  #[tokio::test]
  async fn test_upsert_validation_error() {
    let mock_repo = MockCalligraphyRepositoryTrait::new();
    let service = CalligraphyService::new(mock_repo);
    let user_id = Uuid::new_v4();
    let long_content = "a".repeat(51);
    let user_name = "テストユーザー".to_string();

    let result = service.upsert(user_id, user_name, long_content).await;

    assert!(matches!(result, Err(AppError::Validation(_))));
  }

  /// 書き込み ユーザー名バリデーションエラーのテスト
  #[tokio::test]
  async fn test_upsert_username_validation_error() {
    let mock_repo = MockCalligraphyRepositoryTrait::new();
    let service = CalligraphyService::new(mock_repo);
    let user_id = Uuid::new_v4();
    let content = "Valid content".to_string();
    let long_user_name = "a".repeat(21);

    let result = service.upsert(user_id, long_user_name, content).await;

    assert!(matches!(result, Err(AppError::Validation(_))));
  }

  /// ID取得 成功のテスト
  #[tokio::test]
  async fn test_get_found() {
    let mut mock_repo = MockCalligraphyRepositoryTrait::new();
    let user_id = Uuid::new_v4();
    let user_name = "テストユーザー".to_string();
    let content = "Found".to_string();
    let expected_calligraphy = Calligraphy {
      user_id,
      user_name: user_name.clone(),
      content: content.clone(),
      created_at: OffsetDateTime::now_utc(),
      updated_at: OffsetDateTime::now_utc(),
    };
    let returned_calligraphy = expected_calligraphy.clone();

    mock_repo
      .expect_find_by_id()
      .with(mockall::predicate::eq(user_id))
      .times(1)
      .returning(move |_| Ok(Some(returned_calligraphy.clone())));

    let service = CalligraphyService::new(mock_repo);
    let result = service.get(user_id).await;

    assert!(result.is_ok());
    assert_eq!(result.as_ref().unwrap().user_name, user_name);
    assert_eq!(result.unwrap().content, content);
  }

  /// ID取得 NotFoundエラーのテスト
  #[tokio::test]
  async fn test_get_not_found() {
    let mut mock_repo = MockCalligraphyRepositoryTrait::new();
    let user_id = Uuid::new_v4();

    mock_repo
      .expect_find_by_id()
      .with(mockall::predicate::eq(user_id))
      .times(1)
      .returning(|_| Ok(None));

    let service = CalligraphyService::new(mock_repo);
    let result = service.get(user_id).await;

    assert!(matches!(result, Err(AppError::NotFound)));
  }

  /// 削除 成功のテスト
  #[tokio::test]
  async fn test_delete_success() {
    let mut mock_repo = MockCalligraphyRepositoryTrait::new();
    let user_id = Uuid::new_v4();

    mock_repo
      .expect_delete()
      .with(mockall::predicate::eq(user_id))
      .times(1)
      .returning(|_| Ok(1));

    let service = CalligraphyService::new(mock_repo);
    let result = service.delete(user_id).await;

    assert!(result.is_ok());
  }

  /// 削除 NotFoundエラーのテスト
  #[tokio::test]
  async fn test_delete_not_found() {
    let mut mock_repo = MockCalligraphyRepositoryTrait::new();
    let user_id = Uuid::new_v4();

    mock_repo
      .expect_delete()
      .with(mockall::predicate::eq(user_id))
      .times(1)
      .returning(|_| Ok(0));

    let service = CalligraphyService::new(mock_repo);
    let result = service.delete(user_id).await;

    assert!(matches!(result, Err(AppError::NotFound)));
  }
}
