import { CalligraphyCard } from '../CalligraphyCard';
import { MESSAGES } from '../../constants';
import { generateCardId } from '../../utils/calligraphy';
import type { Calligraphy } from '../../types/calligraphy';
import './CalligraphyList.css';

interface CalligraphyListProps {
	list: Calligraphy[] | undefined;
	isLoading: boolean;
	error: Error | null;
	onCardClick?: (calligraphy: Calligraphy) => void;
}

/**
 * 書き初めリスト表示コンポーネント
 */
export const CalligraphyList = ({ list, isLoading, error, onCardClick }: CalligraphyListProps) => {
	if (isLoading) {
		return <p className="loading-text">{MESSAGES.LOADING}</p>;
	}

	if (error) {
		return <p className="error-text">{MESSAGES.ERROR_FETCH}</p>;
	}

	if (!list || list.length === 0) {
		return (
			<p className="empty-text">
				{MESSAGES.EMPTY_LIST.split('\n').map((line, i, arr) => (
					<span key={i}>
						{line}
						{i < arr.length - 1 && <br />}
					</span>
				))}
			</p>
		);
	}

	return (
		<div className="card-grid">
			{list.map((item) => {
				const isMyCard = item.is_mine;
				const cardId = generateCardId(item);
				return (
					<CalligraphyCard
						key={cardId}
						calligraphy={item}
						isMine={isMyCard}
						onClick={isMyCard && onCardClick ? () => onCardClick(item) : undefined}
					/>
				);
			})}
		</div>
	);
};

