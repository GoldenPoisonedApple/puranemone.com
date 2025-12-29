import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { calligraphyApi } from './lib/api';
import { useCalligraphySubmit, useCalligraphyDelete } from './lib/hooks';
import { Opening } from './components/Opening';
import { FloatingButton } from './components/FloatingButton';
import { CalligraphyModal } from './components/CalligraphyModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { CalligraphyCard } from './components/CalligraphyCard';
import { Footer } from './components/Footer';
import { API_CONFIG, QUERY_KEYS, MESSAGES, UI_CONFIG } from './constants';
import { findMyCalligraphy } from './utils/calligraphy';
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
		queryKey: QUERY_KEYS.CALLIGRAPHY_LIST,
		queryFn: calligraphyApi.list,
		staleTime: API_CONFIG.STALE_TIME,
	});

	// listから自分の書き初めを抽出
	const myCalligraphy = list ? findMyCalligraphy(list) : undefined;

	// フォーム送信
	const { submit, isSubmitting } = useCalligraphySubmit({
		onSuccess: () => {
			setIsModalOpen(false);
			setSubmitError(null);
		},
		onError: (err) => {
			setSubmitError(err.message);
		},
	});

	// 削除
	const { deleteCalligraphy, isDeleting } = useCalligraphyDelete({
		onSuccess: () => {
			setSubmitError(null);
		},
		onError: (err) => {
			setSubmitError(err.message);
		},
	});

	const handleSubmit = (data: CreateCalligraphyRequest) => {
		setSubmitError(null);
		submit(data);
	};

	const handleDelete = () => {
		if (window.confirm(MESSAGES.DELETE_CONFIRM)) {
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
		}, UI_CONFIG.OPENING_FADE_DELAY);
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
				<p>せっかくなので、今年の抱負を書き初めにしてみてはいかがでしょう。<br/>SNSへの本サイトの共有はお控えください。<br/>ご友人方との共有に留めていただけると私のPCが生き延びます。<br/>※ブラウザを変更したりクッキーを削除すると違うユーザ判定となります。</p>

				{/* 一覧表示 */}
				<section className="list-section">
					{isLoading && <p className="loading-text">{MESSAGES.LOADING}</p>}
					{error && <p className="error-text">{MESSAGES.ERROR_FETCH}</p>}

					{!isLoading && !error && list && list.length === 0 && (
						<p className="empty-text">
							{MESSAGES.EMPTY_LIST.split('\n').map((line, i, arr) => (
								<span key={i}>
									{line}
									{i < arr.length - 1 && <br />}
								</span>
							))}
						</p>
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
