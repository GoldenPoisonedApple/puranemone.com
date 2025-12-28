import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calligraphyApi } from '../services/api';
import type { CreateCalligraphyRequest } from '../types/calligraphy';

/**
 * 書き初めデータ管理用カスタムフック
 */
export const useCalligraphy = () => {
	const queryClient = useQueryClient();

	// 書き初め一覧の取得
	const { data: list, isLoading, error } = useQuery({
		queryKey: ['calligraphy', 'list'],
		queryFn: calligraphyApi.list,
	});

	// 書き初めの作成・更新
	const mutation = useMutation({
		mutationFn: calligraphyApi.upsert,
		onSuccess: () => {
			// 成功したら一覧を再取得して最新化
			queryClient.invalidateQueries({ queryKey: ['calligraphy'] });
		},
	});

	return {
		list,
		isLoading,
		error,
		upsert: mutation.mutate,
		isSubmitting: mutation.isPending,
	};
};

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

