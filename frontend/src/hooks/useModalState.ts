import { useState, useCallback } from 'react';

type ModalType = 'calligraphy' | 'privacy' | 'deleteConfirm';

/**
 * モーダル状態管理用カスタムフック
 */
export const useModalState = () => {
	const [openModal, setOpenModal] = useState<ModalType | null>(null);

	const open = useCallback((type: ModalType) => {
		setOpenModal(type);
	}, []);

	const close = useCallback(() => {
		setOpenModal(null);
	}, []);

	const isOpen = useCallback((type: ModalType) => {
		return openModal === type;
	}, [openModal]);

	return {
		isOpen,
		open,
		close,
	};
};

