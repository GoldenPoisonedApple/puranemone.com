import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api, type Calligraphy, type CreateCalligraphyRequest } from './lib/api';
import './App.css';

function App() {
	const queryClient = useQueryClient();

	// 1. フォーム管理
	const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCalligraphyRequest>();

	// 2. データ取得 (一覧)
	// Cookieはブラウザが自動管理するため、APIを叩くだけでOK
	const { data: list, isLoading, error } = useQuery({
		queryKey: ['calligraphy', 'list'],
		queryFn: api.list,
	});

	// 3. データ送信 (作成・更新)
	// ここでもIDを送る必要はない。サーバーがCookieを見て特定する。
	const mutation = useMutation({
		mutationFn: api.upsert,
		onSuccess: () => {
			// 成功したら一覧を再取得して最新化
			queryClient.invalidateQueries({ queryKey: ['calligraphy'] });
			reset();
			alert('書き初めを奉納しました');
		},
		onError: (err: Error) => {
			alert(`エラー: ${err.message}`);
		},
	});

	const onSubmit = (data: CreateCalligraphyRequest) => {
		mutation.mutate(data);
	};

	return (
		<div className="container">
			<h1>書き初めアプリ 🎍</h1>

			{/* --- 投稿フォーム --- */}
			<section className="input-section">
				<form onSubmit={handleSubmit(onSubmit)}>
					<input
						type="text"
						placeholder="名前"
						{...register('user_name', {
							required: '名前を入力してください',
							maxLength: { value: 20, message: '20文字以内で入力してください' }
						})}
						className="input-text"
						style={{ marginBottom: '0.5rem' }}
					/>
					<input
						type="text"
						placeholder="今年の抱負 (50文字以内)"
						{...register('content', {
							required: '入力してください',
							maxLength: { value: 50, message: '50文字以内で入力してください' }
						})}
						className="input-text"
					/>
					<button type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? '奉納中...' : '奉納する'}
					</button>
				</form>
				{errors.user_name && <p className="error">{errors.user_name.message}</p>}
				{errors.content && <p className="error">{errors.content.message}</p>}
			</section>

			{/* --- 一覧表示 --- */}
			<section className="list-section">
				{isLoading && <p>読み込み中...</p>}
				{error && <p className="error">データの取得に失敗しました</p>}

				<div className="card-grid">
					{list?.map((item: Calligraphy) => (
						<div key={item.user_id} className="card">
							{/* ID情報などを意識せず、純粋に内容だけを表示 */}
							<div className="card-content">{item.content}</div>
							<div className="card-footer">
								<span className="user-name">{item.user_name}</span>
								<small>{new Date(item.updated_at).toLocaleString()}</small>
							</div>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}

export default App;