import './FloatingButton.css';
import EditIcon from '../../assets/icons/筆の無料アイコン2.svg';

interface FloatingButtonProps {
	onClick: () => void;
	hasCalligraphy: boolean;
}

/**
 * 右下のフローティングアクションボタン
 */
export const FloatingButton = ({ onClick, hasCalligraphy }: FloatingButtonProps) => {
	return (
		<button 
			className="floating-button" 
			onClick={onClick}
			aria-label={hasCalligraphy ? "書き初めを編集" : "書き初めを追加"}
		>
			<img src={EditIcon} alt="✍️" className="floating-button-icon" />
			<span className="floating-button-text">{hasCalligraphy ? '編集' : '追加'}</span>
		</button>
	);
};
