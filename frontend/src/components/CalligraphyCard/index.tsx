import { memo } from 'react';
import type { Calligraphy } from '../../types/calligraphy';
import { shouldCenterContent, generateCardId } from '../../utils/calligraphy';
import { formatDate } from '../../utils/formatters';
import PenIcon from '../../assets/icons/筆の無料アイコン2.svg';
import './CalligraphyCard.css';

interface CalligraphyCardProps {
	calligraphy: Calligraphy;
	isMine?: boolean;
	onClick?: () => void;
}

/**
 * 書き初めカード表示コンポーネント
 */
export const CalligraphyCard = memo(({ calligraphy, isMine = false, onClick }: CalligraphyCardProps) => {
	const isCentered = shouldCenterContent(calligraphy.content);
	const formattedDate = formatDate(calligraphy.updated_at);
	const isClickable = isMine && !!onClick;

	return (
		<div 
			className={`calligraphy-card ${isMine ? 'my-card' : ''} ${isClickable ? 'clickable' : ''} ${isCentered ? 'centered-content' : ''}`}
			onClick={isClickable ? onClick : undefined}
			role={isClickable ? 'button' : undefined}
			tabIndex={isClickable ? 0 : undefined}
		>
			<div className="card-main-content">
				<div className="card-author">
					<span className="user-name">{calligraphy.user_name}</span>
				</div>
				<div className="card-content">
					{calligraphy.content}
				</div>
				{isMine && <img src={PenIcon} alt="" className="pen-icon" />}
			</div>
			<div className="card-timestamp">
				{formattedDate}
			</div>
		</div>
	);
}, (prevProps, nextProps) => {
	// カスタム比較関数：必要なプロパティのみ比較
	const prevCardId = generateCardId(prevProps.calligraphy);
	const nextCardId = generateCardId(nextProps.calligraphy);
	
	return (
		prevCardId === nextCardId &&
		prevProps.calligraphy.content === nextProps.calligraphy.content &&
		prevProps.isMine === nextProps.isMine &&
		prevProps.onClick === nextProps.onClick
	);
});
