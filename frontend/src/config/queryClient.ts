import { QueryClient } from '@tanstack/react-query';

/**
 * React Query用のQueryClientインスタンス
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// ウィンドウフォーカス時の自動再取得を無効化 (開発中のチラつき防止)
			refetchOnWindowFocus: false,
			// 失敗時のリトライ回数
			retry: 1,
		},
	},
});

