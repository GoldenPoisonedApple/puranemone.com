import type { Calligraphy } from '../../types/calligraphy';
import './CalligraphyCard.css';

interface CalligraphyCardProps {
	calligraphy: Calligraphy;
	isMine?: boolean;
}

/**
 * 書き初めカード表示コンポーネント
 */
export const CalligraphyCard = ({ calligraphy, isMine = false }: CalligraphyCardProps) => {
	return (
		<div className={`calligraphy-card ${isMine ? 'my-card' : ''}`}>
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
