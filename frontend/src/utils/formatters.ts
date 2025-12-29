/**
 * 日付を日本語形式でフォーマット
 */
export const formatDate = (date: string | Date): string => {
	return new Date(date).toLocaleString('ja-JP', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});
};

