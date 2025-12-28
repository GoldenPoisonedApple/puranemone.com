import { useEffect, useState } from 'react';
import './Opening.css';

interface OpeningProps {
	onComplete: () => void;
}

/**
 * オープニングアニメーションコンポーネント
 */
export const Opening = ({ onComplete }: OpeningProps) => {
	const [fadeOut, setFadeOut] = useState(false);

	useEffect(() => {
		// 2.5秒後にフェードアウト開始
		const fadeTimer = setTimeout(() => {
			setFadeOut(true);
		}, 2500);

		// 3秒後にオープニング完了
		const completeTimer = setTimeout(() => {
			onComplete();
		}, 3000);

		return () => {
			clearTimeout(fadeTimer);
			clearTimeout(completeTimer);
		};
	}, [onComplete]);

	return (
		<div className={`opening ${fadeOut ? 'fade-out' : ''}`}>
			<div className="opening-content">
				<div className="opening-ornament top"></div>
				
				<div className="opening-text">
					<h1 className="opening-title">書き初め</h1>
					<p className="opening-year">二〇二六年</p>
					<p className="opening-subtitle">丙午</p>
				</div>
				
				<div className="opening-ornament bottom"></div>
			</div>
		</div>
	);
};

