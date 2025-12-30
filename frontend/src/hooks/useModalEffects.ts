import { useEffect, useRef } from 'react';
import { UI_CONFIG } from '../constants';
import type { UseFormReset } from 'react-hook-form';
import type { CreateCalligraphyRequest } from '../types/calligraphy';

/**
 * モーダルの共通効果（Escキー、bodyスクロール制御、フォーカストラップなど）
 */
export const useModalEffects = (
	isOpen: boolean,
	onClose: () => void,
	initialData?: CreateCalligraphyRequest,
	reset?: UseFormReset<CreateCalligraphyRequest>,
	modalContentRef?: React.RefObject<HTMLDivElement | null>
) => {
	const previousActiveElementRef = useRef<HTMLElement | null>(null);

	// 初期データのリセット
	useEffect(() => {
		if (!isOpen || !reset) return;
		
		if (initialData) {
			reset(initialData);
		} else {
			reset({ user_name: UI_CONFIG.MODAL_DEFAULT_USER_NAME, content: '' });
		}
	}, [isOpen, initialData, reset]);

	// Escキーで閉じる
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};
		window.addEventListener('keydown', handleEsc);
		return () => window.removeEventListener('keydown', handleEsc);
	}, [isOpen, onClose]);

	// bodyスクロール制御
	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : 'unset';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	// フォーカストラップ（アクセシビリティ改善）
	useEffect(() => {
		if (!isOpen) return;

		// 現在のフォーカス要素を保存
		previousActiveElementRef.current = document.activeElement as HTMLElement;

		// モーダル内のフォーカス可能な要素を取得
		const modalContent = modalContentRef?.current || document.querySelector('.modal-content');
		if (!modalContent) return;

		const focusableElements = modalContent.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		// 最初の要素にフォーカス
		firstElement?.focus();

		// Tabキーでフォーカストラップ
		const handleTab = (e: KeyboardEvent) => {
			if (e.key !== 'Tab') return;

			if (e.shiftKey) {
				// Shift+Tab: 最後の要素から最初の要素へ
				if (document.activeElement === firstElement) {
					e.preventDefault();
					lastElement?.focus();
				}
			} else {
				// Tab: 最後の要素から最初の要素へ
				if (document.activeElement === lastElement) {
					e.preventDefault();
					firstElement?.focus();
				}
			}
		};

		document.addEventListener('keydown', handleTab);

		// クリーンアップ: モーダルが閉じられたら元の要素にフォーカスを戻す
		return () => {
			document.removeEventListener('keydown', handleTab);
			previousActiveElementRef.current?.focus();
		};
	}, [isOpen, modalContentRef]);
};

