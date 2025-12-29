/**
 * アプリケーション全体で使用する定数
 */

// API設定
export const API_CONFIG = {
	BASE_URL: '/api',
	STALE_TIME: 60 * 1000, // 60秒はキャッシュを使用
	REFETCH_INTERVAL: 60 * 1000, // 60秒ごとに自動更新
} as const;

// フォームバリデーション
export const FORM_LIMITS = {
	USER_NAME_MAX_LENGTH: 20,
	CONTENT_MAX_LENGTH: 50,
	CONTENT_CENTER_THRESHOLD: 3, // 3行以下で中央揃え
} as const;

// UI設定
export const UI_CONFIG = {
	OPENING_FADE_DELAY: 100, // ミリ秒
	MODAL_DEFAULT_USER_NAME: '名無し',
} as const;

// メッセージ
export const MESSAGES = {
	LOADING: '読み込み中...',
	ERROR_FETCH: 'データの取得に失敗しました',
	EMPTY_LIST: 'まだ書き初めが投稿されていません。\n右下のボタンから書き初めを奉納しましょう。',
	DELETE_CONFIRM: '書き初めを削除してもよろしいですか？',
	DELETE_SUCCESS: '書き初めを削除しました',
	SUBMIT_ERROR: '書き初めの保存に失敗しました',
	DELETE_ERROR: '書き初めの削除に失敗しました',
} as const;

// モーダルタイトル
export const MODAL_TITLES = {
	EDIT: '書き初めを編集',
	CREATE: '書き初めを奉納',
	DELETE_CONFIRM: '削除の確認',
} as const;

// バリデーションメッセージ
export const VALIDATION_MESSAGES = {
	USER_NAME_REQUIRED: '名前を入力してください',
	USER_NAME_MAX_LENGTH: (max: number) => `${max}文字以内で入力してください`,
	CONTENT_REQUIRED: '入力してください',
	CONTENT_MAX_LENGTH: (max: number) => `${max}文字以内で入力してください`,
} as const;

// クエリキー
export const QUERY_KEYS = {
	CALLIGRAPHY_LIST: ['calligraphy', 'list'] as const,
} as const;

