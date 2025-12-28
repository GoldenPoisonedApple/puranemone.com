INSERT INTO calligraphy (user_id, user_name, content, updated_at)
VALUES (
	'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- クッキーからのUUID
	'ユーザー名',
	'新しい目標',
	NOW()
)
ON CONFLICT (user_id) -- 主キー重複時
DO UPDATE SET
	content = EXCLUDED.content,    -- 新しい値で上書き
	user_name = EXCLUDED.user_name, -- 新しいユーザー名で上書き
	updated_at = NOW();            -- 更新日時を現在に