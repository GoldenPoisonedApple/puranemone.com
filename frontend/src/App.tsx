import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { calligraphyApi } from './lib/api';
import { useCalligraphySubmit, useCalligraphyDelete } from './lib/hooks';
import { Opening } from './components/Opening';
import { FloatingButton } from './components/FloatingButton';
import { CalligraphyModal } from './components/CalligraphyModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { CalligraphyList } from './components/CalligraphyList';
import { Footer } from './components/Footer';
import { API_CONFIG, QUERY_KEYS, MESSAGES, UI_CONFIG, MODAL_TITLES } from './constants';
import { findMyCalligraphy, toInitialData } from './utils/calligraphy';
import { useErrorHandler } from './hooks/useErrorHandler';
import { useModalState } from './hooks/useModalState';
import type { CreateCalligraphyRequest } from './types/calligraphy';
import './App.css';

/**
 * 書き初めアプリのメインコンポーネント
 */
function App() {
	const [showOpening, setShowOpening] = useState(true);
	const [showContent, setShowContent] = useState(false);
	
	// モーダル状態管理
	const modalState = useModalState();
	
	// エラーハンドリング
	const { error: submitError, resetError, handleError } = useErrorHandler();

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
			modalState.close();
			resetError();
		},
		onError: handleError,
	});

	// 削除
	const { deleteCalligraphy, isDeleting } = useCalligraphyDelete({
		onSuccess: () => {
			resetError();
		},
		onError: handleError,
	});

	// 書き初めを送信
	const handleSubmit = useCallback((data: CreateCalligraphyRequest) => {
		resetError();
		submit(data);
	}, [submit, resetError]);

	// 書き初めを削除
	const handleDeleteClick = useCallback(() => {
		modalState.open('deleteConfirm');
	}, [modalState]);

	// 書き初めを削除確認
	const handleDeleteConfirm = useCallback(() => {
		modalState.close();
		resetError();
		deleteCalligraphy();
	}, [deleteCalligraphy, resetError, modalState]);

	// 書き初めを削除キャンセル
	const handleDeleteCancel = useCallback(() => {
		modalState.close();
	}, [modalState]);

	// オープニング終了後、コンテンツをフェードイン
	const handleOpeningComplete = useCallback(() => {
		setShowOpening(false);
		// オープニング終了後、少し遅延してコンテンツをフェードイン
		setTimeout(() => {
			setShowContent(true);
		}, UI_CONFIG.OPENING_FADE_DELAY);
	}, []);

	// モーダルを開く
	const handleOpenModal = useCallback(() => {
		modalState.open('calligraphy');
		resetError();
	}, [resetError, modalState]);

	// モーダルを閉じる
	const handleCloseModal = useCallback(() => {
		modalState.close();
		resetError();
	}, [resetError, modalState]);

	// カードをクリックした時にモーダルを開く
	const handleCardClick = useCallback(() => {
		modalState.open('calligraphy');
		resetError();
	}, [resetError, modalState]);

	return (
		<>
			{showOpening && <Opening onComplete={handleOpeningComplete} />}
			
			<div className={`app ${showContent ? 'show' : ''}`}>
				<h1>書き初め</h1>
				<h3>2026年  丙午<br/>あけましておめでとうございます</h3>
				<p>せっかくなので、今年の抱負を書き初めにしてみてはいかがでしょう。<br/>SNSへの本サイトの共有はお控えください。<br/>ご友人方との共有に留めていただけると私のPCが生き延びます。<br/>※ブラウザを変更したりクッキーを削除すると違うユーザ判定となります。</p>

				{/* 一覧表示 */}
				<section className="list-section">
					<CalligraphyList
						list={list}
						isLoading={isLoading}
						error={error}
						onCardClick={handleCardClick}
					/>
				</section>

				{/* フッター */}
				{showContent && <Footer onOpenPrivacyPolicy={() => modalState.open('privacy')} />}
			</div>

			{/* フローティングボタン */}
			{showContent && <FloatingButton onClick={handleOpenModal} hasCalligraphy={!!myCalligraphy} />}

			{/* モーダル */}
			<CalligraphyModal
				isOpen={modalState.isOpen('calligraphy')}
				onClose={handleCloseModal}
				onSubmit={handleSubmit}
				onDelete={myCalligraphy ? handleDeleteClick : undefined}
				isSubmitting={isSubmitting}
				isDeleting={isDeleting}
				initialData={toInitialData(myCalligraphy)}
				isEdit={!!myCalligraphy}
				serverError={submitError}
			/>

			{/* プライバシーポリシーモーダル */}
			<PrivacyPolicyModal 
				isOpen={modalState.isOpen('privacy')} 
				onClose={() => modalState.close()} 
			/>

			{/* 削除確認ダイアログ */}
			<ConfirmDialog
				isOpen={modalState.isOpen('deleteConfirm')}
				title={MODAL_TITLES.DELETE_CONFIRM}
				message={MESSAGES.DELETE_CONFIRM}
				onConfirm={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
			/>
		</>
	);
}

export default App;
