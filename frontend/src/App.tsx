import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { calligraphyApi } from './lib/api';
import { useMyCalligraphy, useCalligraphySubmit, useCalligraphyDelete } from './lib/hooks';
import { Opening } from './components/Opening';
import { FloatingButton } from './components/FloatingButton';
import { CalligraphyModal } from './components/CalligraphyModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { CalligraphyCard } from './components/CalligraphyCard';
import { Footer } from './components/Footer';
import type { CreateCalligraphyRequest } from './types/calligraphy';
import './App.css';

/**
 * 書き初めアプリのメインコンポーネント
 */
function App() {
	const [showOpening, setShowOpening] = useState(true);
	const [showContent, setShowContent] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// 全ての書き初め一覧を取得
	const { data: list, isLoading, error } = useQuery({
		queryKey: ['calligraphy', 'list'],
		queryFn: calligraphyApi.list,
	});

	// 自分の書き初めを取得
	const { data: myCalligraphy} = useMyCalligraphy();

	// フォーム送信
	const { submit, isSubmitting } = useCalligraphySubmit(
		() => {
			setIsModalOpen(false);
			setSubmitError(null);
		},
		(err) => {
			console.error('書き初めの保存に失敗しました:', err);
			setSubmitError(err.message);
		}
	);

	// 削除
	const { deleteCalligraphy, isDeleting } = useCalligraphyDelete(
		() => {
			console.log('書き初めを削除しました');
			setSubmitError(null);
		},
		(err) => {
			console.error('書き初めの削除に失敗しました:', err);
			setSubmitError(err.message);
		}
	);

	const handleSubmit = (data: CreateCalligraphyRequest) => {
		setSubmitError(null);
		submit(data);
	};

	const handleDelete = () => {
		if (window.confirm('書き初めを削除してもよろしいですか？')) {
			setSubmitError(null);
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
		setSubmitError(null);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSubmitError(null);
	};

	return (
		<>
			{showOpening && <Opening onComplete={handleOpeningComplete} />}
			
			<div className={`app ${showContent ? 'show' : ''}`}>
				<h1>書き初め</h1>
				<h3>2026年  丙午<br/>あけましておめでとうございます</h3>
				<p>せっかくなので、今年の抱負を書き初めにしてみてはいかがでしょうか。<br/>本サイトのSNSへの共有はお控えください。<br/>ご友人方とのご共有に留めていただけると私のPCが生き延びます。</p>

				{/* 一覧表示 */}
				<section className="list-section">
					{isLoading && <p className="loading-text">読み込み中...</p>}
					{error && <p className="error-text">データの取得に失敗しました</p>}

					{!isLoading && !error && list && list.length === 0 && (
						<p className="empty-text">まだ書き初めが投稿されていません。<br />右下のボタンから書き初めを奉納しましょう。</p>
					)}

					<div className="card-grid">
						{list?.map((item, index) => {
							const isMyCard = item.is_mine;
							return (
								<CalligraphyCard 
									key={index} 
									calligraphy={item} 
									isMine={isMyCard}
									onClick={isMyCard ? handleOpenModal : undefined}
								/>
							);
						})}
					</div>
				</section>

				{/* フッター */}
				{showContent && <Footer onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)} />}
			</div>

			{/* フローティングボタン */}
			{showContent && <FloatingButton onClick={handleOpenModal} hasCalligraphy={!!myCalligraphy} />}

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
				serverError={submitError}
			/>

			<PrivacyPolicyModal 
				isOpen={isPrivacyOpen} 
				onClose={() => setIsPrivacyOpen(false)} 
			/>
		</>
	);
}

export default App;
