import './FloatingButton.css';
import EditIcon from '../../assets/icons/筆の無料アイコン2.svg';

interface FloatingButtonProps {
	onClick: () => void;
}

/**
 * 右下のフローティングアクションボタン
 */
export const FloatingButton = ({ onClick }: FloatingButtonProps) => {
	return (
		<button 
			className="floating-button" 
			onClick={onClick}
			aria-label="書き初めを追加"
		>
			<img src={EditIcon} alt="✍️" className="floating-button-icon" />
			<span className="floating-button-text">書き初め</span>
		</button>
	);
};

