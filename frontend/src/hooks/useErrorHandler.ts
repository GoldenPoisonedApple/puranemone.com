import { useState, useCallback } from 'react';

/**
 * エラーハンドリング用カスタムフック
 */
export const useErrorHandler = () => {
	const [error, setError] = useState<string | null>(null);

	const resetError = useCallback(() => {
		setError(null);
	}, []);

	const handleError = useCallback((err: Error) => {
		setError(err.message);
	}, []);

	return {
		error,
		resetError,
		handleError,
	};
};

