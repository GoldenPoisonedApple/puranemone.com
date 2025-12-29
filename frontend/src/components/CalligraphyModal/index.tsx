import { useForm } from 'react-hook-form';
import { CharacterCounter } from '../CharacterCounter';
import { FORM_LIMITS } from '../../constants';
import { useModalEffects } from '../../hooks/useModalEffects';
import type { CreateCalligraphyRequest } from '../../types/calligraphy';
import './CalligraphyModal.css';

interface CalligraphyModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (data: CreateCalligraphyRequest) => void;
	onDelete?: () => void;
	isSubmitting: boolean;
	isDeleting?: boolean;
	initialData?: CreateCalligraphyRequest;
	isEdit: boolean;
	serverError?: string | null;
}

/**
 * 書き初め入力モーダルコンポーネント
 */
export const CalligraphyModal = ({ 
	isOpen, 
	onClose, 
	onSubmit, 
	onDelete,
	isSubmitting,
	isDeleting = false,
	initialData,
	isEdit,
	serverError
}: CalligraphyModalProps) => {
	const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<CreateCalligraphyRequest>({
		defaultValues: initialData
	});
	
	// 文字数をリアルタイムで監視
	const contentValue = watch('content', '');
	const contentLength = contentValue?.length || 0;

	// モーダルの共通効果（Escキー、bodyスクロール制御など）
	useModalEffects(isOpen, onClose, initialData, reset);

	if (!isOpen) return null;

	const handleFormSubmit = (data: CreateCalligraphyRequest) => {
		onSubmit(data);
	};

	return (
		<div 
			className="modal-overlay" 
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<button className="modal-close" onClick={onClose} aria-label="閉じる">
					×
				</button>
				
				<h2 className="modal-title">
					{isEdit ? '書き初めを編集' : '書き初めを奉納'}
				</h2>

				{serverError && (
					<div className="modal-server-error">
						{serverError}
					</div>
				)}

				<form onSubmit={handleSubmit(handleFormSubmit)} className="modal-form">
					<div className="modal-form-group">
						<label htmlFor="user_name" className="modal-label">
							ハンドルネーム
						</label>
						<input
							id="user_name"
							type="text"
							placeholder="お名前を入力"
							{...register('user_name', {
								required: '名前を入力してください',
								maxLength: { value: FORM_LIMITS.USER_NAME_MAX_LENGTH, message: `${FORM_LIMITS.USER_NAME_MAX_LENGTH}文字以内で入力してください` }
							})}
							className="modal-input"
						/>
						{errors.user_name && (
							<p className="modal-error">{errors.user_name.message}</p>
						)}
					</div>

					<div className="modal-form-group">
						<div className="modal-label-row">
							<label htmlFor="content" className="modal-label">
								今年の抱負
							</label>
							<CharacterCounter current={contentLength} max={FORM_LIMITS.CONTENT_MAX_LENGTH} />
						</div>
						<textarea
							id="content"
							placeholder={`今年の抱負を入力（${FORM_LIMITS.CONTENT_MAX_LENGTH}文字以内）`}
							{...register('content', {
								required: '入力してください',
								maxLength: { value: FORM_LIMITS.CONTENT_MAX_LENGTH, message: `${FORM_LIMITS.CONTENT_MAX_LENGTH}文字以内で入力してください` }
							})}
							className="modal-textarea"
							rows={4}
						/>
						{errors.content && (
							<p className="modal-error">{errors.content.message}</p>
						)}
					</div>

					<p className="modal-warning">
						※一応全世界公開なので個人情報の入力はお控えください。
					</p>

					<div className="modal-actions">
						{isEdit && onDelete && (
							<button 
								type="button" 
								onClick={onDelete}
								disabled={isDeleting}
								className="modal-button modal-button-delete"
							>
								{isDeleting ? '削除中...' : '削除する'}
							</button>
						)}
						<div className="modal-actions-right">
							<button 
								type="button" 
								onClick={onClose}
								className="modal-button modal-button-cancel"
							>
								キャンセル
							</button>
							<button 
								type="submit" 
								disabled={isSubmitting}
								className="modal-button modal-button-submit"
							>
								{isSubmitting ? '保存中...' : isEdit ? '更新する' : '奉納する'}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

