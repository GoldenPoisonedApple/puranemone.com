import type { Calligraphy, CreateCalligraphyRequest } from '../types/calligraphy';
import { API_CONFIG } from '../constants';

/**
 * 共通Fetchラッパー
 * - credentials: 'include' を自動付与 (Cookie送信用)
 * - エラーハンドリングの統一
 */
async function client<T>(path: string, options?: RequestInit): Promise<T> {
	const response = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options?.headers,
		},
		// CORS環境下でCookieを送信するために必須
		credentials: 'include',
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
		throw new Error(errorData.error || `HTTP Error: ${response.status}`);
	}

	// 204 No Content の場合は null を返す (JSONパースエラー防止)
	if (response.status === 204) {
		return null as T;
	}

	return response.json();
}

/**
 * 書き初めAPI
 */
export const calligraphyApi = {
	/**
	 * 書き初め一覧を取得
	 */
	list: () => client<Calligraphy[]>('/calligraphy'),

	/**
	 * 書き初めを作成・更新
	 */
	upsert: (data: CreateCalligraphyRequest) =>
		client<Calligraphy>('/calligraphy', {
			method: 'POST',
			body: JSON.stringify(data),
		}),

	/**
	 * 自分の書き初めを削除
	 */
	delete: () =>
		client<void>(`/calligraphy/me`, {
			method: 'DELETE',
		}),
};

