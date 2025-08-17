# Dockerfile for FairSplit Development Environment
# Next.js 14 + TypeScript development setup

# Alpine Linuxベースの軽量なNode.js 18イメージを使用
# Alpine版は本番レディでセキュリティパッチが頻繁に提供される
FROM node:18-alpine

# 開発に必要な追加パッケージをインストール
# libc6-compat: Node.jsのネイティブモジュール互換性のため
# git: npm installでGitリポジトリから依存関係を取得する際に必要
RUN apk add --no-cache libc6-compat git

# コンテナ内の作業ディレクトリを設定
# すべての後続コマンドはこのディレクトリで実行される
WORKDIR /app

# 開発環境ではrootユーザーで実行（権限問題回避のため）
# 本番環境では非rootユーザーを使用するが、開発では利便性を優先

# Next.jsの匿名使用統計データ収集を無効化
# 開発環境では不要なテレメトリーを停止
ENV NEXT_TELEMETRY_DISABLED 1

# コンテナのポート3000を外部に公開
# Next.jsのデフォルト開発サーバーポート
EXPOSE 3000

# 開発環境用の環境変数を設定
# NODE_ENV=development: 開発モードでの実行を指定
ENV NODE_ENV development
# PORT=3000: Next.jsサーバーのポートを明示的に指定
ENV PORT 3000
# HOSTNAME="0.0.0.0": すべてのネットワークインターフェースでリッスン
# コンテナ外からのアクセスを可能にする
ENV HOSTNAME "0.0.0.0"

# デフォルトコマンド（docker-composeで上書きされることを想定）
# npm run dev: Next.jsの開発サーバーを起動（ホットリロード有効）
CMD ["npm", "run", "dev"]