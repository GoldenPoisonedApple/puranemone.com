import { MESSAGES } from '../constants';

/**
 * エラーログを統一管理
 */
export const logError = (context: string, error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`[${context}]`, message);
};

/**
 * APIエラーの型判定
 */
export const isApiError = (error: unknown): error is Error => {
	return error instanceof Error;
};

/**
 * エラーメッセージを取得
 */
export const getErrorMessage = (error: unknown, fallback?: string): string => {
	if (error instanceof Error) {
		return error.message;
	}
	return fallback || MESSAGES.ERROR_FETCH;
};

