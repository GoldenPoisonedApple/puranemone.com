/**
 * 書き初めデータの型定義
 */
export interface Calligraphy {
	user_id?: string; // 一意のID（keyとして使用）
	user_name: string;
	content: string;
	created_at: string;
	updated_at: string;
	is_mine: boolean;
}

/**
 * 書き初め作成リクエストの型定義
 */
export interface CreateCalligraphyRequest {
	user_name: string;
	content: string;
}

/**
 * APIエラーの型定義
 */
export interface ApiError {
	error: string;
	code?: string;
	details?: Record<string, unknown>;
}

/**
 * APIエラーレスポンスの型定義
 */
export interface ApiErrorResponse {
	error: string;
	code?: string;
	details?: Record<string, unknown>;
}

