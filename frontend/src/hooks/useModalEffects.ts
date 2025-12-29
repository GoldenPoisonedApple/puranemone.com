import { useEffect } from 'react';
import { UI_CONFIG } from '../constants';
import type { UseFormReset } from 'react-hook-form';
import type { CreateCalligraphyRequest } from '../types/calligraphy';

/**
 * モーダルの共通効果（Escキー、bodyスクロール制御など）
 */
export const useModalEffects = (
	isOpen: boolean,
	onClose: () => void,
	initialData?: CreateCalligraphyRequest,
	reset?: UseFormReset<CreateCalligraphyRequest>
) => {
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
};

