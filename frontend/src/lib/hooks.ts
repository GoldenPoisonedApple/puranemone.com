import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calligraphyApi } from './api';
import type { CreateCalligraphyRequest } from '../types/calligraphy';

/**
 * 書き初め投稿用カスタムフック
 */
export const useCalligraphySubmit = (onSuccess?: () => void, onError?: (error: Error) => void) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: calligraphyApi.upsert,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['calligraphy'] });
			onSuccess?.();
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

