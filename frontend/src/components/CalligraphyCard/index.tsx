import type { Calligraphy } from '../../types/calligraphy';
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
export const CalligraphyCard = ({ calligraphy, isMine = false, onClick }: CalligraphyCardProps) => {
	// 5行未満かどうかを判定（改行で分割）
	const lineCount = calligraphy.content.split('\n').length;
	const isCentered = lineCount < 5;

	return (
		<div 
			className={`calligraphy-card ${isMine ? 'my-card' : ''} ${isMine && onClick ? 'clickable' : ''} ${isCentered ? 'centered-content' : ''}`}
			onClick={isMine && onClick ? onClick : undefined}
			role={isMine && onClick ? 'button' : undefined}
			tabIndex={isMine && onClick ? 0 : undefined}
		>
			<div className="card-author">
				<span className="user-name">{calligraphy.user_name}</span>
			</div>
			<div className="card-content">
				{calligraphy.content}
			</div>
			{isMine && <img src={PenIcon} alt="" className="pen-icon" />}
		</div>
	);
};
