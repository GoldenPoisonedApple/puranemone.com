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

# DBコンテナに入る
dbshell:
	docker exec -it puranemone_db /bin/sh

# Backendコンテナに入る
backendshell:
	docker exec -it puranemone_backend /bin/sh

# Frontendコンテナに入る
frontendshell:
	docker exec -it puranemone_frontend /bin/sh