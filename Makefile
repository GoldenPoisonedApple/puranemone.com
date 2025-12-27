# Makefile
# PHONY: ファイルではないという指定(ファイルは更新されていないと実行されない): 命令である
.PHONY: dev prod down logs

# 開発モードで起動 (Override有効)
dev:
	docker compose up -d --build

# 本番モードで起動 (Override無視)
prod:
	docker compose -f compose.yaml up -d --build

# 停止
down:
	docker compose down

# ログ監視
logs:
	docker compose logs -f