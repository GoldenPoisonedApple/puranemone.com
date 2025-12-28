import { useForm } from 'react-hook-form';
import type { CreateCalligraphyRequest } from '../../types/calligraphy';
import './CalligraphyForm.css';

interface CalligraphyFormProps {
	onSubmit: (data: CreateCalligraphyRequest) => void;
	isSubmitting: boolean;
}

/**
 * 書き初め投稿フォームコンポーネント
 */
export const CalligraphyForm = ({ onSubmit, isSubmitting }: CalligraphyFormProps) => {
	const { register, handleSubmit, formState: { errors } } = useForm<CreateCalligraphyRequest>();

	return (
		<section className="form-section">
			<form onSubmit={handleSubmit(onSubmit)} className="calligraphy-form">
				<div className="form-group">
					<input
						type="text"
						placeholder="名前"
						{...register('user_name', {
							required: '名前を入力してください',
							maxLength: { value: 20, message: '20文字以内で入力してください' }
						})}
						className="input-text"
					/>
					{errors.user_name && (
						<p className="error-message">{errors.user_name.message}</p>
					)}
				</div>

				<div className="form-group">
					<input
						type="text"
						placeholder="今年の抱負 (50文字以内)"
						{...register('content', {
							required: '入力してください',
							maxLength: { value: 50, message: '50文字以内で入力してください' }
						})}
						className="input-text"
					/>
					{errors.content && (
						<p className="error-message">{errors.content.message}</p>
					)}
				</div>

				<button 
					type="submit" 
					disabled={isSubmitting}
					className="submit-button"
				>
					{isSubmitting ? '奉納中...' : '奉納する'}
				</button>
			</form>
		</section>
	);
};
