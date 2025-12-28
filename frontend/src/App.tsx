import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { calligraphyApi } from './lib/api';
import { useMyCalligraphy, useCalligraphySubmit, useCalligraphyDelete } from './lib/hooks';
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

	// 全ての書き初め一覧を取得
	const { data: list, isLoading, error } = useQuery({
		queryKey: ['calligraphy', 'list'],
		queryFn: calligraphyApi.list,
	});

	// 自分の書き初めを取得
	const { data: myCalligraphy, error: myError } = useMyCalligraphy();

	// フォーム送信
	const { submit, isSubmitting } = useCalligraphySubmit(
		() => {
			setIsModalOpen(false);
		},
		(err) => {
			console.error('書き初めの保存に失敗しました:', err);
		}
	);

	// 削除
	const { deleteCalligraphy, isDeleting } = useCalligraphyDelete(
		() => {
			console.log('書き初めを削除しました');
		},
		(err) => {
			console.error('書き初めの削除に失敗しました:', err);
		}
	);

	const handleSubmit = (data: CreateCalligraphyRequest) => {
		submit(data);
	};

	const handleDelete = () => {
		if (window.confirm('書き初めを削除してもよろしいですか？')) {
			deleteCalligraphy();
			setIsModalOpen(false);
		}
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
							<CalligraphyCard 
								key={item.user_id} 
								calligraphy={item} 
								isMine={myCalligraphy?.user_id === item.user_id}
							/>
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
				onDelete={myCalligraphy ? handleDelete : undefined}
				isSubmitting={isSubmitting}
				isDeleting={isDeleting}
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
