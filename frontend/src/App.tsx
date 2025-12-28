import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { calligraphyApi } from './lib/api';
import { useCalligraphySubmit } from './lib/hooks';
import { Opening } from './components/Opening';
import { FloatingButton } from './components/FloatingButton';
import { CalligraphyModal } from './components/CalligraphyModal';
import { CalligraphyCard } from './components/CalligraphyCard';
import type { CreateCalligraphyRequest } from './types/calligraphy';
import './App.css';

/**
 * 書き初めアプリのメインコンポーネント
 */
function App() {
	const [showOpening, setShowOpening] = useState(true);
	const [showContent, setShowContent] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// データ取得
	const { data: list, isLoading, error } = useQuery({
		queryKey: ['calligraphy', 'list'],
		queryFn: calligraphyApi.list,
	});

	// 自分の書き初めを探す（最初の1件を自分のものとして扱う）
	// 実際にはuser_idで判定するが、Cookieベースなので最初の投稿が自分のもの
	const myCalligraphy = list?.[0];

	// フォーム送信
	const { submit, isSubmitting } = useCalligraphySubmit(
		() => {
			alert(myCalligraphy ? '書き初めを更新しました' : '書き初めを奉納しました');
			setIsModalOpen(false);
		},
		(err) => {
			alert(`エラー: ${err.message}`);
		}
	);

	const handleSubmit = (data: CreateCalligraphyRequest) => {
		submit(data);
	};

	const handleOpeningComplete = () => {
		setShowOpening(false);
		// オープニング終了後、少し遅延してコンテンツをフェードイン
		setTimeout(() => {
			setShowContent(true);
		}, 100);
	};

	const handleOpenModal = () => {
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	return (
		<>
			{showOpening && <Opening onComplete={handleOpeningComplete} />}
			
			<div className={`app ${showContent ? 'show' : ''}`}>
				<h1>書き初め</h1>

				{/* 一覧表示 */}
				<section className="list-section">
					{isLoading && <p className="loading-text">読み込み中...</p>}
					{error && <p className="error-text">データの取得に失敗しました</p>}

					{!isLoading && !error && list && list.length === 0 && (
						<p className="empty-text">まだ書き初めが投稿されていません。<br />右下のボタンから書き初めを奉納しましょう。</p>
					)}

					<div className="card-grid">
						{list?.map((item) => (
							<CalligraphyCard key={item.user_id} calligraphy={item} />
						))}
					</div>
				</section>
			</div>

			{/* フローティングボタン */}
			{showContent && <FloatingButton onClick={handleOpenModal} />}

			{/* モーダル */}
			<CalligraphyModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
				initialData={myCalligraphy ? {
					user_name: myCalligraphy.user_name,
					content: myCalligraphy.content
				} : undefined}
				isEdit={!!myCalligraphy}
			/>
		</>
	);
}

export default App;
