-- インサート方法
-- -i: 標準入力からSQLを読み込む
-- psql: PostgreSQLのコマンドラインクライアント
-- -U: ユーザー名を指定
-- -d: データベース名を指定
-- docker exec -i puranemone_db psql -U <user> -d <db> < sql/create_test_data.sql

INSERT INTO calligraphy (
  user_id,
  user_name,
  content,
  ip_address,
  user_agent,
  accept_language,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  'User_' || i,
  
  -- 【ここが変更点】可変長のコンテンツ生成 (5文字〜50文字)
  left(
    '新春の候、謹んで新年のご挨拶を申し上げます。今年の抱負はRustとReactを極めて最強のエンジニアになることと、毎日筋トレをして健康的に過ごし、美味しい焼肉をお腹いっぱい食べることです。',
    (floor(random() * 46) + 5)::int -- 5文字から50文字の間でランダムな長さを決定
  ),

  ('192.168.1.' || (i % 250 + 1))::inet,
  'Mozilla/5.0 (TestRunner; Bot ' || i || ')',
  CASE WHEN i % 2 = 0 THEN 'ja-JP' ELSE 'en-US' END,
  NOW() - (i || ' minutes')::interval,
  NOW() - (i || ' minutes')::interval
FROM generate_series(1, 100) as i;