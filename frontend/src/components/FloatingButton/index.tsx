import './FloatingButton.css';

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
			<span className="floating-button-icon">✍️</span>
			<span className="floating-button-text">書き初め</span>
		</button>
	);
};

