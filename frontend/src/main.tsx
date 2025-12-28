import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

// QueryClientの初期化
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// ウィンドウフォーカス時の自動再取得を無効化 (開発中のチラつき防止)
			refetchOnWindowFocus: false,
			// 失敗時のリトライ回数
			retry: 1,
		},
	},
});

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</React.StrictMode>,
);