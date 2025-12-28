# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# 開発時に curl を使うためにインストール
RUN apk add --no-cache curl

# キャッシュを効かせるためにpackage.jsonを先にコピー
COPY package.json package-lock.json ./
# npm install (ci は clean install。再現性を保証)
RUN npm ci

# ソースコードをコピーしてビルド
COPY . .
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine

# Nginxの設定ファイルをコピー (後述)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルド成果物をNginxの公開ディレクトリへ配置
# Viteのデフォルト出力先は dist です
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]