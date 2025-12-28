import type { Calligraphy } from '../../types/calligraphy';
import './CalligraphyCard.css';

interface CalligraphyCardProps {
	calligraphy: Calligraphy;
}

/**
 * 書き初めカード表示コンポーネント
 */
export const CalligraphyCard = ({ calligraphy }: CalligraphyCardProps) => {
	return (
		<div className="calligraphy-card">
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
