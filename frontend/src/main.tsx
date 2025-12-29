import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/index.css';

/**
 * React Query用のQueryClientインスタンス
 */
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				// ウィンドウフォーカス時に自動再取得（他の人の投稿を確認）
				refetchOnWindowFocus: true,
				// 失敗時のリトライ回数
				retry: 1,
			},
		},
	});

/**
 * アプリケーションのエントリーポイント
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</React.StrictMode>,
);
