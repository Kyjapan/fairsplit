/** @type {import('next').NextConfig} */
// Next.js設定ファイル for FairSplit
// Next.js 14 App Router + TypeScript + Docker環境用設定

const nextConfig = {
  // TypeScript設定
  typescript: {
    // 型チェックエラーでもビルドを継続（CIでは別途型チェック実行）
    ignoreBuildErrors: false,
  },

  // ESLint設定
  eslint: {
    // ESLintエラーでもビルドを継続（CIでは別途ESLint実行）
    ignoreDuringBuilds: false,
  },

  // 実験的機能
  experimental: {
    // TypedRoutes: 型安全なルーティング
    typedRoutes: true,
  },

  // 出力設定 - Docker環境での軽量化
  output: 'standalone',

  // SWCミニファイアーを使用（高速化）
  swcMinify: true,

  // 画像最適化設定
  images: {
    // 外部画像ドメインの許可リスト（必要に応じて追加）
    domains: [],
    
    // 画像フォーマット最適化
    formats: ['image/webp', 'image/avif'],
    
    // 画像サイズの設定
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // セキュリティヘッダー
  async headers() {
    return [
      {
        // すべてのルートに適用
        source: '/(.*)',
        headers: [
          // XSS攻撃防止
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // MIME typeスニッフィング防止
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Clickjacking攻撃防止（iframe埋め込み制限）
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // リファラーポリシー
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // コンテンツセキュリティポリシー（基本設定）
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self';"
          }
        ],
      },
    ]
  },

  // リダイレクト設定（必要に応じて追加）
  async redirects() {
    return []
  },

  // リライト設定（必要に応じて追加）
  async rewrites() {
    return []
  },

  // 環境変数の設定
  env: {
    // アプリケーション名
    APP_NAME: 'FairSplit',
    
    // バージョン情報
    APP_VERSION: process.env.npm_package_version || '1.0.0',
  },

  // Webpack設定のカスタマイズ
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 開発環境でのソースマップ改善
    if (dev) {
      config.devtool = 'eval-source-map'
    }

    // パフォーマンス最適化
    if (!dev && !isServer) {
      // Bundle Analyzer用設定（必要時に有効化）
      // config.optimization.minimize = true
    }

    return config
  },

  // 開発サーバー設定
  async rewrites() {
    return {
      beforeFiles: [
        // API routes用のリライト設定（必要に応じて追加）
      ],
    }
  },
}

module.exports = nextConfig