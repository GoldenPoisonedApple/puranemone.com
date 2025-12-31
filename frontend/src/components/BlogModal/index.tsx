import React, { useState, useEffect } from 'react';
import './BlogModal.css';

interface BlogEntry {
	date: string;
	title: string;
	content: string;
	image?: string;
}

const BLOG_DATA: BlogEntry[] = [
	{
		date: '12/22',
		title: 'プロジェクト始動',
		content: '今日から書き初めアプリの開発を始めました。今年はWebサイト形式で公開することにしました。技術選定はReactとViteで。',
	},
	{
		date: '12/23',
		title: 'デザイン検討',
		content: '和風のデザインにするために、フォントやカラーパレットを選定中。縦書きのCSSは難しいけど、雰囲気が出るので頑張りたい。',
	},
	{
		date: '12/24',
		title: 'クリスマスイブ',
		content: '世間はクリスマスですが、私はコードを書いています。モーダルのアニメーションが良い感じに動くようになってきました。',
	},
	{
		date: '12/25',
		title: 'API連携',
		content: 'バックエンドとの通信部分を実装。Dockerでの環境構築に少し手間取ったけど、なんとか疎通確認完了。',
	},
	{
		date: '12/26',
		title: '筆文字の実装',
		content: '書き初めなので、フォント選びが重要。Google Fontsから良さそうな明朝体を探してきました。',
	},
	{
		date: '12/27',
		title: 'レスポンシブ対応',
		content: 'スマホでの表示崩れを修正中。縦書きと横書きの切り替えが複雑...。',
	},
	{
		date: '12/28',
		title: '隠し要素',
		content: 'ちょっとした遊び心が欲しくて、隠し要素を入れることにしました。見つけてくれるかな？',
	},
	{
		date: '12/29',
		title: 'バグ修正',
		content: '細かいバグを潰していく作業。iOSのSafariで挙動がおかしいところがあったので修正。',
	},
	{
		date: '12/30',
		title: '最終調整',
		content: 'アニメーションのタイミングや、文字の大きさを微調整。リリースまであと少し！',
	},
	{
		date: '12/31',
		title: '大晦日',
		content: 'いよいよ公開日。今年も一年ありがとうございました。来年も良い年になりますように。',
	},
];

interface BlogModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const BlogModal: React.FC<BlogModalProps> = ({ isOpen, onClose }) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	// モーダルが開かれたときにリセットするかどうかはお好みで。
	// 今回は状態を維持する（または初期化するならuseEffectで）
	useEffect(() => {
		if (isOpen) {
			setCurrentIndex(0);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const currentEntry = BLOG_DATA[currentIndex];
	const isFirst = currentIndex === 0;
	const isLast = currentIndex === BLOG_DATA.length - 1;

	const handlePrev = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isFirst) {
			setCurrentIndex(prev => prev - 1);
		}
	};

	const handleNext = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isLast) {
			setCurrentIndex(prev => prev + 1);
		}
	};

	return (
		<div className="blog-modal-overlay" onClick={onClose}>
			<div className="blog-modal-content" onClick={e => e.stopPropagation()}>
				<button className="blog-modal-close" onClick={onClose}>×</button>

				<div className="blog-header">
					<span className="blog-date">{currentEntry.date}</span>
				</div>

				<div className="blog-body">
					<div className="blog-image-container">
						{currentEntry.image ? (
							<img src={currentEntry.image} alt={currentEntry.title} />
						) : (
							<div className="blog-image-placeholder">
								<span>NO IMAGE</span>
							</div>
						)}
					</div>
					<p className="blog-text">{currentEntry.content}</p>
				</div>

				<div className="blog-footer">
					<button 
						className="nav-button prev" 
						onClick={handlePrev} 
						disabled={isFirst}
					>
						&lt;
					</button>
					<span className="page-indicator">
						{currentIndex + 1} / {BLOG_DATA.length}
					</span>
					<button 
						className="nav-button next" 
						onClick={handleNext} 
						disabled={isLast}
					>
						&gt;
					</button>
				</div>
			</div>
		</div>
	);
};
