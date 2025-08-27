import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 py-8 border-t border-gray-200 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* 注意事項バナー */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 text-center">
            <span className="font-semibold">⚠️ 個人開発アプリです</span> - 計算結果は参考程度にご利用ください
          </p>
        </div>

        {/* リンク・情報セクション */}
        <div className="text-center space-y-4">
          {/* ナビゲーションリンク */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
            <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
              利用規約
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
              プライバシーポリシー
            </Link>
            <a 
              href="https://github.com/[username]/FairSplit" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>
            <a 
              href="https://github.com/[username]/FairSplit/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              バグ報告・改善要望
            </a>
          </div>
          
          {/* フッター情報 */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">
              &copy; 2025 FairSplit - 個人開発プロジェクト
            </p>
            <p className="text-xs text-gray-500">
              データはブラウザ内でのみ処理されます
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}