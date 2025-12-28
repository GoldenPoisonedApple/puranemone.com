/**
 * 書き初めデータの型定義
 */
export interface Calligraphy {
	user_id: string;
	user_name: string;
	content: string;
	created_at: string;
	updated_at: string;
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
}

