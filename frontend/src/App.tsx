import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { calligraphyApi } from './lib/api';
import { useCalligraphySubmit, useCalligraphyDelete } from './lib/hooks';
import { Opening } from './components/Opening';
import { FloatingButton } from './components/FloatingButton';
import { CalligraphyModal } from './components/CalligraphyModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { CalligraphyCard } from './components/CalligraphyCard';
import { Footer } from './components/Footer';
import { API_CONFIG, QUERY_KEYS, MESSAGES, UI_CONFIG } from './constants';
import { findMyCalligraphy, generateCardId } from './utils/calligraphy';
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
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// 全ての書き初め一覧を取得
	const { data: list, isLoading, error } = useQuery({
		queryKey: QUERY_KEYS.CALLIGRAPHY_LIST,
		queryFn: calligraphyApi.list,
		staleTime: API_CONFIG.STALE_TIME,
	});

	// listから自分の書き初めを抽出（メモ化）
	const myCalligraphy = useMemo(() => {
		return list ? findMyCalligraphy(list) : undefined;
	}, [list]);

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

	// エラーリセット関数（重複削減）
	const resetError = useCallback(() => {
		setSubmitError(null);
	}, []);

	const handleSubmit = useCallback((data: CreateCalligraphyRequest) => {
		resetError();
		submit(data);
	}, [submit, resetError]);

	const handleDeleteClick = useCallback(() => {
		setIsDeleteConfirmOpen(true);
	}, []);

	const handleDeleteConfirm = useCallback(() => {
		setIsDeleteConfirmOpen(false);
		resetError();
		deleteCalligraphy();
		setIsModalOpen(false);
	}, [deleteCalligraphy, resetError]);

	const handleDeleteCancel = useCallback(() => {
		setIsDeleteConfirmOpen(false);
	}, []);

	const handleOpeningComplete = useCallback(() => {
		setShowOpening(false);
		// オープニング終了後、少し遅延してコンテンツをフェードイン
		setTimeout(() => {
			setShowContent(true);
		}, UI_CONFIG.OPENING_FADE_DELAY);
	}, []);

	const handleOpenModal = useCallback(() => {
		setIsModalOpen(true);
		resetError();
	}, [resetError]);

	const handleCloseModal = useCallback(() => {
		setIsModalOpen(false);
		resetError();
	}, [resetError]);

	const handleOpenPrivacy = useCallback(() => {
		setIsPrivacyOpen(true);
	}, []);

	const handleClosePrivacy = useCallback(() => {
		setIsPrivacyOpen(false);
	}, []);

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
						{list?.map((item) => {
							const isMyCard = item.is_mine;
							// user_name + created_at + updated_at の組み合わせで一意性を保証
							const cardId = generateCardId(item);
							return (
								<CalligraphyCard 
									key={cardId} 
									calligraphy={item} 
									isMine={isMyCard}
									onClick={isMyCard ? handleOpenModal : undefined}
								/>
							);
						})}
					</div>
				</section>

				{/* フッター */}
				{showContent && <Footer onOpenPrivacyPolicy={handleOpenPrivacy} />}
			</div>

			{/* フローティングボタン */}
			{showContent && <FloatingButton onClick={handleOpenModal} hasCalligraphy={!!myCalligraphy} />}

			{/* モーダル */}
			<CalligraphyModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSubmit={handleSubmit}
				onDelete={myCalligraphy ? handleDeleteClick : undefined}
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
				onClose={handleClosePrivacy} 
			/>

			{/* 削除確認ダイアログ */}
			<ConfirmDialog
				isOpen={isDeleteConfirmOpen}
				title="削除の確認"
				message={MESSAGES.DELETE_CONFIRM}
				onConfirm={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
			/>
		</>
	);
}

export default App;
