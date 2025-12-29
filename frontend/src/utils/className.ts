/**
 * クラス名を結合するユーティリティ関数
 * 条件付きクラス名を簡単に扱える
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
	return classes.filter((cls): cls is string => Boolean(cls)).join(' ');
};

