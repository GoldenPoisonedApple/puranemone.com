import './ConfirmDialog.css';

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
}

/**
 * 確認ダイアログコンポーネント
 * window.confirmの代替として使用
 */
export const ConfirmDialog = ({ 
	isOpen, 
	title, 
	message, 
	onConfirm, 
	onCancel 
}: ConfirmDialogProps) => {
	if (!isOpen) return null;

	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onCancel();
		}
	};

	return (
		<div 
			className="confirm-dialog-overlay" 
			onClick={handleOverlayClick}
			role="dialog"
			aria-modal="true"
			aria-labelledby="confirm-dialog-title"
			aria-describedby="confirm-dialog-message"
		>
			<div className="confirm-dialog-content">
				<h3 id="confirm-dialog-title" className="confirm-dialog-title">
					{title}
				</h3>
				<p id="confirm-dialog-message" className="confirm-dialog-message">
					{message}
				</p>
				<div className="confirm-dialog-actions">
					<button 
						type="button"
						onClick={onCancel}
						className="confirm-dialog-button confirm-dialog-button-cancel"
						autoFocus
					>
						キャンセル
					</button>
					<button 
						type="button"
						onClick={onConfirm}
						className="confirm-dialog-button confirm-dialog-button-confirm"
					>
						確認
					</button>
				</div>
			</div>
		</div>
	);
};

