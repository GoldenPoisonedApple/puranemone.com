/// アプリケーション全体で使用するエラー型を定義するモジュール

use axum::{
  http::StatusCode,
  response::{IntoResponse, Response},
  Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
  /// データベース内部のエラー (SQL構文ミス、接続断など)
  /// #[from] アトリビュートにより、sqlx::Error から自動変換される
  #[error("Database error: {0}")]
  Database(#[from] sqlx::Error),

  /// リソースが見つからない場合
  /// Repositoryは Option<T> を返すが、Service層ではこれを明示的なエラーとして扱う
  #[error("Resource not found")]
  NotFound,

  /// バリデーションエラー (文字数超過など、ビジネスロジック上の不正)
  #[error("Validation error: {0}")]
  Validation(String),

  /// レート制限超過
  #[error("Too many requests")]
  TooManyRequests,

  /// 予期しないサーバーエラー
  #[error("Internal server error")]
  Internal,
}

// AxumのIntoResponseを実装することで、Handlerから直接 Err(AppError::...) を返せるようになる
impl IntoResponse for AppError {
  fn into_response(self) -> Response {
    // ログ出力: サーバー内部エラーの場合は詳細をログに残す
    if let AppError::Database(ref e) = self {
      tracing::error!("Database error: {:?}", e);
    }

    // ステータスコードとエラーメッセージの決定
    let (status, error_message) = match self {
      AppError::Database(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error".to_string()),
      AppError::NotFound => (StatusCode::NOT_FOUND, "Resource Not Found".to_string()),
      AppError::Validation(msg) => (StatusCode::BAD_REQUEST, msg),
      AppError::TooManyRequests => (StatusCode::TOO_MANY_REQUESTS, "Too Many Requests".to_string()),
      AppError::Internal => (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error".to_string()),
    };

    // JSONボディの作成
    let body = Json(json!({
			"error": error_message
    }));

    (status, body).into_response()
  }
}
