import { useQuery } from '@tanstack/react-query';
import { calligraphyApi } from './lib/api';
import { useCalligraphySubmit } from './lib/hooks';
import { CalligraphyForm } from './components/CalligraphyForm';
import { CalligraphyCard } from './components/CalligraphyCard';
import type { CreateCalligraphyRequest } from './types/calligraphy';
import './App.css';

/**
 * 書き初めアプリのメインコンポーネント
 */
function App() {
	// データ取得
	const { data: list, isLoading, error } = useQuery({
		queryKey: ['calligraphy', 'list'],
		queryFn: calligraphyApi.list,
	});

	// フォーム送信
	const { submit, isSubmitting } = useCalligraphySubmit(
		() => {
			alert('書き初めを奉納しました');
		},
		(err) => {
			alert(`エラー: ${err.message}`);
		}
	);

	const handleSubmit = (data: CreateCalligraphyRequest) => {
		submit(data);
	};

	return (
		<div className="app">
			<h1>書き初めアプリ 🎍</h1>

			{/* 投稿フォーム */}
			<CalligraphyForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />

			{/* 一覧表示 */}
			<section className="list-section">
				{isLoading && <p className="loading-text">読み込み中...</p>}
				{error && <p className="error-text">データの取得に失敗しました</p>}

				<div className="card-grid">
					{list?.map((item) => (
						<CalligraphyCard key={item.user_id} calligraphy={item} />
					))}
				</div>
			</section>
		</div>
	);
}

export default App;
