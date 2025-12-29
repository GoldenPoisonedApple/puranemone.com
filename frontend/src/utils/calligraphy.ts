import { FORM_LIMITS } from '../constants';
import type { Calligraphy } from '../types/calligraphy';

/**
 * 書き初めの行数をカウント
 */
export const getLineCount = (content: string): number => {
	return content.split('\n').length;
};

/**
 * 中央揃えが必要かどうかを判定
 */
export const shouldCenterContent = (content: string): boolean => {
	return getLineCount(content) <= FORM_LIMITS.CONTENT_CENTER_THRESHOLD;
};

/**
 * 自分の書き初めを抽出
 */
export const findMyCalligraphy = (list: Calligraphy[]): Calligraphy | undefined => {
	return list.find(item => item.is_mine);
};

