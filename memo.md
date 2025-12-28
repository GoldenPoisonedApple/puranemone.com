# ToDo
nginxのセキュリティ設定
DBのセキュリティ設定

node.jsの定期的な更新など pull

アプリ用のユーザは開発用と分けた方がいい(DB): 基本操作（SELECT, INSERT, UPDATE, DELETE）のみ

全件取得はリファクタリングのたまもの

CORS設定

## その他メモ
ユーザはクッキーの情報を元に認証
今回は互いのデータが干渉することがないから、データのアトミック性を考えていない

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
# DBコンテナ接続
make dbshell
# バックのコンテナ接続
make backendshell
# フロントのコンテナ接続
make frontendshell
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
簡易サーバ
```rust
use axum::{
	routing::get,
	Router,
};
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
	// ルーティング設定: ルート(/) にアクセスが来たら文字列を返す
	let app = Router::new().route("/", get(|| async { "Hello from Rust Backend!" }));

	// Docker内では 0.0.0.0 でリッスンしないと外部(Nginx)から繋がらない
	// 127.0.0.1 だとコンテナ内部に閉じこもってしまうため注意
	let addr = SocketAddr::from(([0, 0, 0, 0], 3000));
	
	println!("Listening on {}", addr);
	
	// サーバー起動
	let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
	axum::serve(listener, app).await.unwrap();
}
```

- フォーマッタ
```bash
rustup component add rustfmt
```

- 概念

[起動時]
Main -> Service(実体) -> Repository(実体) -> PgPool(実体: 接続数5)

[リクエストA]
Handler A -> Service(参照) -> Repository(参照) -> PgPool(参照) -> (実体のPgPoolを使う)


- --nocapture

テストでのprintln!()を出力する

- サーバ動作確認(サーバ内)
```bash
curl -v -c cookie.txt \
  -X POST http://localhost:3000/api/calligraphy \
  -H "Content-Type: application/json" \
  -d '{"content": "初回：テスト書き初め"}'
```
- 返答
```bash
root@d62fd47dbfe6:/app# curl -v -c cookie.txt \
  -X POST http://localhost:3000/api/calligraphy \
  -H "Content-Type: application/json" \
  -d '{"content": "\345\210\235\345\233\236\357\274\232\343\203\206\343\202\271\
343\203\210\346\233\270\343\201\215\345\210\235\343\202\201"}'
Note: Unnecessary use of -X or --request, POST is already inferred.
*   Trying 127.0.0.1:3000...
* Connected to localhost (127.0.0.1) port 3000 (#0)
> POST /api/calligraphy HTTP/1.1
> Host: localhost:3000
> User-Agent: curl/7.88.1
> Accept: */*
> Content-Type: application/json
> Content-Length: 45
> 
< HTTP/1.1 200 OK
< content-type: application/json
* Added cookie calli_user_id="9a303069-c91f-49be-bd23-7dc9e84cc993" for domain localhost, path /, expire 1798449418
< set-cookie: calli_user_id=9a303069-c91f-49be-bd23-7dc9e84cc993; HttpOnly; Path=/; Max-Age=31536000
< content-length: 191
< date: Sun, 28 Dec 2025 09:16:58 GMT
< 
* Connection #0 to host localhost left intact
{"user_id":"9a303069-c91f-49be-bd23-7dc9e84cc993","content":"初回：テスト書き初め","created_at":"+002025-12-28T09:16:58.323480000Z","updated_at":"+002025-12-28T09:16:58.323480000Z"}
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