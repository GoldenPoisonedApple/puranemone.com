import { useMutation, useQueryClient } from '@tanstack/react-query';
import { calligraphyApi } from './api';
import { QUERY_KEYS } from '../constants';
import { logError, getErrorMessage } from '../utils/errorHandler';
import type { CreateCalligraphyRequest, Calligraphy } from '../types/calligraphy';

// コールバック型の定義
type MutationCallbacks<T = void> = {
	onSuccess?: (data: T) => void;
	onError?: (error: Error) => void;
};

/**
 * 書き初め投稿用カスタムフック
 */
export const useCalligraphySubmit = (callbacks?: MutationCallbacks<Calligraphy>) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: calligraphyApi.upsert,
		onSuccess: (data) => {
			// listを再取得すればis_mineも更新される
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CALLIGRAPHY_LIST });
			callbacks?.onSuccess?.(data);
		},
		onError: (error: Error) => {
			logError('書き初めの保存', error);
			callbacks?.onError?.(error);
		},
	});

	const submit = (data: CreateCalligraphyRequest) => {
		mutation.mutate(data);
	};

	return {
		submit,
		isSubmitting: mutation.isPending,
		error: mutation.error ? getErrorMessage(mutation.error) : null,
	};
};

/**
 * 書き初め削除用カスタムフック
 */
export const useCalligraphyDelete = (callbacks?: MutationCallbacks) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: calligraphyApi.delete,
		onSuccess: () => {
			// listを再取得すればis_mineも更新される
			queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CALLIGRAPHY_LIST });
			callbacks?.onSuccess?.();
		},
		onError: (error: Error) => {
			logError('書き初めの削除', error);
			callbacks?.onError?.(error);
		},
	});

	return {
		deleteCalligraphy: mutation.mutate,
		isDeleting: mutation.isPending,
		error: mutation.error ? getErrorMessage(mutation.error) : null,
	};
};

