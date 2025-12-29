CREATE TABLE IF NOT EXISTS calligraphy (
	user_id UUID PRIMARY KEY,                   								-- UUID型 (主キー)
	user_name text NOT NULL DEFAULT '' CHECK (char_length(user_name) <= 20),	-- ユーザー名
	content TEXT NOT NULL DEFAULT '' CHECK (char_length(content) <= 50), 			-- 書き初めの内容
	ip_address INET,                            							-- IPアドレス
	user_agent TEXT,                                							-- ユーザーエージェント
	accept_language VARCHAR(255),                     				-- Accept-Language ヘッダー
	created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,       				-- 作成日時 (タイムゾーン付き)
	updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL        				-- 更新日時
);