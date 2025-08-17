/** @type {import('postcss-load-config').Config} */
// PostCSS設定ファイル for FairSplit
// Tailwind CSS + Next.js環境用設定

const config = {
  plugins: {
    // Tailwind CSSの処理
    tailwindcss: {},
    
    // ベンダープレフィックスの自動付与
    autoprefixer: {},
  },
}

module.exports = config