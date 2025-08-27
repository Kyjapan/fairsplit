import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              最終更新日: 2025年8月27日
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">個人情報の取扱い</h2>
              <p className="text-gray-700 mb-4">
                当方は、利用者の個人情報を収集しておりません。
                氏名、住所、電話番号、メールアドレス等の入力は一切求めていません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">入力データの取扱い</h2>
              <p className="text-gray-700 mb-4">
                利用者が入力したデータ（イベント名、参加者名、金額等）は、
                利用者のデバイス内でのみ保存・処理され、当方のサーバーに送信されることはありません。
              </p>
              <p className="text-gray-700 mb-4">
                入力データの内容、正確性、適法性については、入力者である利用者の責任において管理されるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">URL共有機能</h2>
              <p className="text-gray-700 mb-4">
                URL共有機能を使用する場合、データは暗号化されてURL内に含まれますが、
                サーバー上での保存は行われません。
                URL共有時のデータの取扱いについても、利用者の責任において行われるものとします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第三者提供</h2>
              <p className="text-gray-700 mb-4">
                利用者のデータを第三者に提供することはありません。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">お問い合わせ</h2>
              <p className="text-gray-700 mb-4">
                <a href="https://github.com/[username]/FairSplit/issues" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">GitHub Issues</a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-center space-x-4">
              <Link 
                href="/terms" 
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                利用規約
              </Link>
              <Link 
                href="/" 
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                FairSplitに戻る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}