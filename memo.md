# ToDo
nginxのセキュリティ設定
DBのセキュリティ設定

node.jsの定期的な更新など pull

アプリ用のユーザは開発用と分けた方がいい(DB): 基本操作（SELECT, INSERT, UPDATE, DELETE）のみ

全権取得はリファクタリングのたまもの

## 技術メモ
### docker conpose
environmentに渡した変数は、環境変数となる
```bash
# 以下のような形で受け取れる
echo $DATABASE_URL
```

サービス間での通信（Compose 内のネットワーク）は、ポートを公開していなくても コンテナ名で接続可能
だからポートを開放してない

compose.override.yaml: 開発時のみ設定を上書きする仕組み
```ts
// 開発時はnginxがいないためAPIリクエストの転送をViteにやらせるため vite.config.tsに以下を追記
server: {
	// Docker内からのアクセス許可
	host: '0.0.0.0',
	port: 80, 
	allowedHosts: ['puranemone.com'],
	// APIプロキシ設定 (Nginxの代わり)
	proxy: {
		'/api': {
			target: 'http://backend:3000',
			changeOrigin: true,
			rewrite: (path) => path.replace(/^\/api/, ''),
		},
	},
},
```

### マルチステージ
Dockerfile内で複数のステージを使って、ビルド環境と実行環境を分ける手法
Rustはビルドに、Rustコンパイラやcargo、依存クレートが必要だが
最終的にはコンパイル済みバイナリだけで十分
```docker
# ビルド済みバイナリだけコピー
COPY --from=builder /app/target/release/server /usr/local/bin/server
```

### Makefile
定型shell操作の正式化
*.shと比較して、いくつかのターゲットを指定可能
各行が別shellで実行される
```makefile
bad:
	cd backend
	cargo build   # ← 別shellなので失敗
good:
	cd backend && cargo build
```

以下のシェルを動くようにした
```bash
# 開発環境
make dev
# 本番環境(反映)
make prod
# 停止
make down
# ログ監視
make logs
```

### 開発
container dev: VSCodeの拡張機能でコンテナ内部環境で開発可能に

# ビルド
```bash
# 開発モード
docker compose up -d --build
# 本番ビルド(compose.overrride.yamlを無視)
docker compose -f compose.yaml up -d --build
```

特定のものだけリスタート
```bash
docker compose restart frontend
```

# コンテナに接続
## フロント
EXPOSE 80
```bash
docker exec -it puranemone_frontend /bin/sh
```

- nginx.conf(Webサーバー兼リバースプロキシ)の設定反映
```bash
# テスト
nginx -t
# リロード
nginx -s reload
```

- // 環境構築時
```bash
# Frontendの初期化
docker run --rm \
  -v $(pwd)/frontend:/app \
  -w /app \
  node:20-alpine \
  sh -c "npm create vite@latest . -- --template react-ts && npm install"
```

## バック
EXPOSE 3000
```bash
docker exec -it puranemone_backend /bin/sh
```

- // 環境構築時
```bash
# Backendの初期化とライブラリ追加
docker run --rm \
  -v $(pwd)/backend:/app \
  -w /app \
  rust:1.83-slim-bookworm \
  sh -c "cargo init --name server && cargo add axum tokio --features tokio/full serde serde_json"
```

## DB
```bash
docker exec -it puranemone_db /bin/sh
```

- 基本操作
```postgreSQL
-- DB一覧
\l
-- DB切り替え
\c <db>
-- テーブル一覧
\dt
-- テーブル定義取得
\d <table>
-- 権限表示
\du
-- whoami
SELECT current_user;
```

- 初期セットアップ
```postgreSQL
-- ユーザ作成
CREATE USER <user> WITH PASSWORD <password>;
-- データベース作成
CREATE DATABASE <db> OWNER <user>
-- 権限付与
GRANT ALL PRIVILEGES ON DATABASE <\db> TO <user>;
```
- 操作ログイン
```bash
psql -h localhost -p 5432 -U <user> -d <db>
```


PostgreSQLは ポート5432を開放
```
# 接続
DATABASE_URL=postgres://<user>:<password>@<host>:5432/<db>
```

### 接続テスト
```bash
# 外部から
curl -v https://puranemone.com
# ローカルから
curl -v http://localhost
```

# ユーザの接続図
![alt text](memo_img/image.png)

# 構成図
![alt text](memo_img/image-1.png)