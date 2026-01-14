import React, { useState, useEffect } from 'react';
import vrchatImage from '../../assets/blog/VRChat.png';
import miniPCImage from '../../assets/blog/MiniPC.jpg';
import komikeDay1Image from '../../assets/blog/KomikeDay1.jpg';
import karaokeImage from '../../assets/blog/karaoke.jpg';
import './BlogModal.css';


interface BlogEntry {
	date: string;
	title: string;
	content: string;
	image?: string;
}

const BLOG_DATA: BlogEntry[] = [
	{
		date: '8月',
		title: 'VRChat開始',
		content: 'VRChatにドハマりして睡眠をキャンセルしていた。\n英語を話す練習という建前で初めたのだが、単純に海外の文化に触れるのは存外に楽しく、ウガンダのバナナ経済とか、イタリアにおいて「ピザにケチャップをかけるのは寿司にマヨネーズをかけるようなもの」だとか、中国はGFW(国家規模のネット検閲)があるから皆VPN使ってるよ、など面白い話を気軽にできる。\nあと何が嬉しいかと言うと皆ヲタクな訳であって、そうなると必然的に日本のコンテンツに詳しい。実際話した日本語の話せる人のうち10割はアニメで勉強したと言っていた。怖い。\nということで日本人においては、拙い英語でも根気よく付き合ってくれて、話題も困ることなく話せる確率が高いと思う。本当に語学において最も向いているツールであることは間違いないと思う。おススメです。',
		image: vrchatImage,
	},
	{
		date: '～12/26',
		title: '年末開発決意',
		content: '謎の忙しさによりこの時点まで何もしていない。年末にこのアプリを作ることは去年から決めていたのに。全くもって終わりである。ミニPCのUbuntu化はしていた。',
		image: miniPCImage,
	},
	{
		date: '12/27',
		title: '開発開始',
		content: '開発。なんだかんだ言ってサーバーで一から作るのは初めてである。なぜ2日間しか開発期間が無い？？？',
	},
	{
		date: '12/28',
		title: '形作り完了',
		content: '睡眠キャンセルで形はなんとか作り終わった。フロント(見た目)はLLM様様である。これを書いている今は2025年12月31日23時08分である。終わらない。',
	},
	{
		date: '12/29',
		title: '帰省',
		content: '帰省。電車に荷物を置き忘れる。徹夜明けの電車移動はしないほうがいいらしい。泣く。',
	},
	{
		date: '12/30',
		title: 'コミケ初日',
		content: 'コミケ初日。なぜか東京のホテルで未だに開発をしている。なぜ',
		image: komikeDay1Image,
	},
	{
		date: '12/31',
		title: 'コミケ二日目',
		content: '今日である。ギリギリである。なんなら今カラオケにいます。若いが故の無茶',
		image: karaokeImage,

	}
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
					<h2 className="blog-title">{currentEntry.title}</h2>
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
