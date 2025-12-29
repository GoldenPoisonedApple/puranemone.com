import { useEffect } from 'react';
import './PrivacyPolicyModal.css';

interface PrivacyPolicyModalProps {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * プライバシーポリシーモーダル
 */
export const PrivacyPolicyModal = ({ isOpen, onClose }: PrivacyPolicyModalProps) => {
	// Escキーでモーダルを閉じる
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};
		window.addEventListener('keydown', handleEsc);
		return () => window.removeEventListener('keydown', handleEsc);
	}, [isOpen, onClose]);

	// モーダルが開いているときはbodyのスクロールを無効化
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div 
			className="privacy-modal-overlay" 
			onMouseDown={(e) => {
				// オーバーレイ（背景）をクリックした場合のみ閉じる
				// コンテンツ部分のクリックでは閉じない
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div className="privacy-modal-content" onClick={(e) => e.stopPropagation()}>
				<button className="privacy-modal-close" onClick={onClose} aria-label="閉じる">
					×
				</button>
				
				<h2 className="privacy-modal-title">プライバシーポリシー</h2>

				<div className="privacy-content">
					<section className="privacy-section">
						<h3>1. 取得する情報</h3>
						<p>当サイトでは、利用者がサービスを利用する際に、以下の情報を自動的に取得します。</p>
						<ul>
							<li>IPアドレス</li>
							<li>閲覧したページや日時</li>
							<li>利用環境（OS、ブラウザ情報など）</li>
							<li>Cookie（クッキー）情報</li>
						</ul>
					</section>

					<section className="privacy-section">
						<h3>2. 利用目的</h3>
						<p>取得した情報は、以下の目的で利用します。</p>
						<ul>
							<li>当サービスの提供・運営のため</li>
							<li>不正アクセス、スパム行為、荒らし行為などの防止および対応のため</li>
							<li>利用状況の分析によるサービス改善のため</li>
							<li>サーバーで発生した問題の原因究明および解決のため</li>
						</ul>
					</section>

					<section className="privacy-section">
						<h3>3. 情報の管理</h3>
						<p>
							取得した情報は適切に管理し、法令に基づく場合を除き、利用者の同意なく第三者に提供することはありません。
						</p>
					</section>
				</div>
			</div>
		</div>
	);
};
