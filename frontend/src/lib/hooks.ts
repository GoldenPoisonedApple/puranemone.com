import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calligraphyApi } from './api';
import type { CreateCalligraphyRequest, Calligraphy } from '../types/calligraphy';

/**
 * 自分の書き初めを取得するカスタムフック
 */
export const useMyCalligraphy = () => {
	return useQuery({
		queryKey: ['calligraphy', 'mine'],
		queryFn: calligraphyApi.get,
		retry: false, // 404の場合はリトライしない
	});
};

/**
 * 書き初め投稿用カスタムフック
 */
export const useCalligraphySubmit = (onSuccess?: (data: Calligraphy) => void, onError?: (error: Error) => void) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: calligraphyApi.upsert,
		onSuccess: (data) => {
			queryClient.setQueryData(['calligraphy', 'mine'], data);
			queryClient.invalidateQueries({ queryKey: ['calligraphy', 'list'] });
			onSuccess?.(data);
		},
		onError: (error: Error) => {
			onError?.(error);
		},
	});

	const submit = (data: CreateCalligraphyRequest) => {
		mutation.mutate(data);
	};

	return {
		submit,
		isSubmitting: mutation.isPending,
	};
};

/**
 * 書き初め削除用カスタムフック
 */
export const useCalligraphyDelete = (onSuccess?: () => void, onError?: (error: Error) => void) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: calligraphyApi.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['calligraphy'] });
			onSuccess?.();
		},
		onError: (error: Error) => {
			onError?.(error);
		},
	});

	return {
		deleteCalligraphy: mutation.mutate,
		isDeleting: mutation.isPending,
	};
};

