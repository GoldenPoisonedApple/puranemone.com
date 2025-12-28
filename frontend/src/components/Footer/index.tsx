import './Footer.css';

/**
 * フッターコンポーネント
 */
export const Footer = () => {
	return (
		<footer className="app-footer">
			<div className="footer-content">
				<section className="footer-section">
					<h3 className="footer-section-title">制作</h3>
					<div className="footer-section-content grid-layout">
						<p className="footer-item">
							<span className="footer-label">主催:</span> ミソギンチャク
						</p>
						<p className="footer-item">
							<span className="footer-label">Backend:</span> 国士無双三十六面待ち
						</p>
						<p className="footer-item">
							<span className="footer-label">Frontend:</span> 丁寧な雑煮
						</p>
						<p className="footer-item">
							<span className="footer-label">Design:</span> へっへっへ
						</p>
						<p className="footer-item">
							<span className="footer-label">Infrastructure:</span> 二番煎じ専門店
						</p>
						<p className="footer-item">
							<span className="footer-label">Database:</span> cat_nyaaaaa
						</p>
					</div>
				</section>

				<section className="footer-section">
					<h3 className="footer-section-title">素材</h3>
					<div className="footer-section-content grid-layout">
						<p className="footer-item">
							<span className="footer-label">アイコン:</span>{' '}
							<a href="https://icooon-mono.com/" target="_blank" rel="noopener noreferrer" className="footer-link">
								ICOON-MONO様
							</a>
						</p>
						<p className="footer-item">
							<span className="footer-label">馬イラスト:</span>{' '}
							<a href="https://rikushoblog.com/nenga-2026-illust/" target="_blank" rel="noopener noreferrer" className="footer-link">
								りくうしょblog様
							</a>
						</p>
						<p className="footer-item">
							<span className="footer-label">金粉テクスチャ素材:</span>{' '}
							<a href="https://ja.pngtree.com/freepng/gold-powder-texture-creative-border_5103092.html" target="_blank" rel="noopener noreferrer" className="footer-link">
								pngtree様
							</a>
						</p>
					</div>
				</section>

				<section className="footer-section">
					<h3 className="footer-section-title">その他</h3>
					<div className="footer-section-content">
						<p className="footer-text">
							今年は午年。丙午(ひのえ・うま)らしいですね。丙午はどちらも火の性質を持ち、情熱・活力などを象徴するそうです。せっかくなので何か新しい事に挑戦してみてはいかがでしょうか。<br/>(私のおススメはVRChatです。楽しい！無料！)
						</p>
						<p className="footer-text">
							今年も皆様にとって素晴らしい一年となりますように。
						</p>
					</div>
				</section>
			</div>
		</footer>
	);
};

