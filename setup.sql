CREATE TABLE IF NOT EXISTS calligraphy (
	user_id UUID PRIMARY KEY,                   								-- UUID型 (主キー)
	content TEXT NOT NULL CHECK (char_length(content) <= 50), 	-- 書き初めの内容
	created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,       				-- 作成日時 (タイムゾーン付き)
	updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL        				-- 更新日時
);