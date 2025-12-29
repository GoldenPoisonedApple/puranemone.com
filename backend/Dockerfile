# --- Base Stage ---
# 共通(開発と本番)のベースイメージを定義
FROM rust:slim-bookworm AS base
WORKDIR /app
# pkg-config と libssl-dev (OpenSSL) をインストール
RUN apt-get update && apt-get install -y pkg-config libssl-dev curl && rm -rf /var/lib/apt/lists/*

# --- Build Stage ---
FROM base AS builder

WORKDIR /app

# ビルド時間を短縮するための依存関係キャッシュ層の作成は
# 本質的ですが複雑になるため、今回はシンプルに全コピーしてビルドします。
# (本格運用時は cargo-chef の導入を推奨)
COPY . .

# sqlx-data.json があればコピーされている
# オフラインモードでビルド (外部ネットワークにアクセスしない)
ENV SQLX_OFFLINE=true

# テスト実行
#RUN cargo test --release
# リリースビルド実行
RUN cargo build --release

# --- Runtime Stage ---
FROM debian:bookworm-slim

# 本番環境でも実行時にSSLライブラリが必要なためインストール
RUN apt-get update && apt-get install -y ca-certificates libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ビルドステージからバイナリだけをコピー
# "server" は Cargo.toml で定義するバイナリ名に合わせる必要があります
COPY --from=builder /app/target/release/server /usr/local/bin/server

# 実行ユーザーを非rootにする (セキュリティ推奨)
RUN useradd -m appuser
USER appuser

# ポート公開 (Rustアプリ側で合わせる)
EXPOSE 3000

CMD ["server"]