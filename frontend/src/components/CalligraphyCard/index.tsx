import type { Calligraphy } from '../../types/calligraphy';
import './CalligraphyCard.css';

interface CalligraphyCardProps {
	calligraphy: Calligraphy;
	isMine?: boolean;
	onClick?: () => void;
}

/**
 * 書き初めカード表示コンポーネント
 */
export const CalligraphyCard = ({ calligraphy, isMine = false, onClick }: CalligraphyCardProps) => {
	return (
		<div 
			className={`calligraphy-card ${isMine ? 'my-card' : ''} ${isMine && onClick ? 'clickable' : ''}`}
			onClick={isMine && onClick ? onClick : undefined}
			role={isMine && onClick ? 'button' : undefined}
			tabIndex={isMine && onClick ? 0 : undefined}
		>
			{isMine && <span className="my-badge">自分の書き初め</span>}
			<div className="card-content">{calligraphy.content}</div>
			<div className="card-footer">
				<span className="user-name">{calligraphy.user_name}</span>
				<small className="timestamp">
					{new Date(calligraphy.updated_at).toLocaleString()}
				</small>
			</div>
		</div>
	);
};
