import './CharacterCounter.css';

interface CharacterCounterProps {
	current: number;
	max: number;
}

/**
 * Twitter風の円形文字数カウンター
 */
export const CharacterCounter = ({ current, max }: CharacterCounterProps) => {
	const remaining = max - current;
	const percentage = (current / max) * 100;
	
	// 色の決定
	let color = '#1DA1F2'; // 通常（青）
	if (percentage >= 90) {
		color = '#E0245E'; // 危険（赤）
	} else if (percentage >= 80) {
		color = '#FFAD1F'; // 警告（黄）
	}
	
	// 円の描画用（circumference = 2 * π * r）
	const radius = 10;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (percentage / 100) * circumference;
	
	return (
		<div className="character-counter">
			<svg className="counter-circle" width="24" height="24" viewBox="0 0 24 24">
				{/* 背景の円 */}
				<circle
					cx="12"
					cy="12"
					r={radius}
					fill="none"
					stroke="#E1E8ED"
					strokeWidth="2"
				/>
				{/* 進行状況の円 */}
				<circle
					cx="12"
					cy="12"
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth="2"
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					transform="rotate(-90 12 12)"
					className="counter-progress"
				/>
			</svg>
			{remaining < 10 && (
				<span className="counter-number" style={{ color }}>
					{remaining}
				</span>
			)}
		</div>
	);
};

