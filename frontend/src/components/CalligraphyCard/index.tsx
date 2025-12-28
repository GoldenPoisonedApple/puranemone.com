import { useState } from 'react';
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
	const [isExpanded, setIsExpanded] = useState(false);
	
	// 改行の数をカウント（実際の行数 = 改行数 + 1）
	const lineCount = (calligraphy.content.match(/\n/g) || []).length + 1;
	const hasMoreLines = lineCount > 5;
	
	const handleToggleExpand = (e: React.MouseEvent) => {
		e.stopPropagation(); // カード全体のクリックイベントを防ぐ
		setIsExpanded(!isExpanded);
	};

	return (
		<div 
			className={`calligraphy-card ${isMine ? 'my-card' : ''} ${isMine && onClick ? 'clickable' : ''}`}
			onClick={isMine && onClick ? onClick : undefined}
			role={isMine && onClick ? 'button' : undefined}
			tabIndex={isMine && onClick ? 0 : undefined}
		>
			{isMine && <span className="my-badge">自分の書き初め</span>}
			<div className={`card-content ${isExpanded ? 'expanded' : ''}`}>
				{calligraphy.content}
			</div>
			{hasMoreLines && (
				<button 
					className="expand-button" 
					onClick={handleToggleExpand}
					type="button"
				>
					{isExpanded ? '閉じる' : 'さらに表示'}
				</button>
			)}
			<div className="card-footer">
				<span className="user-name">{calligraphy.user_name}</span>
				<small className="timestamp">
					{new Date(calligraphy.updated_at).toLocaleString()}
				</small>
			</div>
		</div>
	);
};
