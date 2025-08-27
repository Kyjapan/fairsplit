import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              制定日: 2025年8月27日<br />
              最終更新日: 2025年8月27日
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第1条（規約の適用）</h2>
              <p className="text-gray-700 mb-4">
                この利用規約（以下「本規約」）は、FairSplit（以下「本サービス」）の利用に関する条件を定めるものです。本サービスをご利用になる場合には、本規約にご同意いただいたものとみなします。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第2条（サービス内容）</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                <li>本サービスは、割り勘計算を支援するWebアプリケーションです。</li>
                <li>本サービスは個人が開発・運営する無料サービスです。</li>
                <li>本サービスは営利を目的としていません。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第3条（利用資格）</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                <li>本サービスは、どなたでも無料でご利用いただけます。</li>
                <li>13歳未満の方は、保護者の同意を得てからご利用ください。</li>
                <li>利用者登録は不要です。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第4条（利用上の注意）</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                <li>計算結果は参考としてご利用ください。重要な金銭の精算では検算をお願いします。</li>
                <li>機密性の高い情報の入力はお控えください。</li>
                <li>本サービスは個人開発のため、商用サービスと同等の可用性は保証できません。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第5条（禁止行為）</h2>
              <p className="text-gray-700 mb-4">利用者は以下の行為を行ってはなりません：</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>法令または公序良俗に反する行為</li>
                <li>他の利用者や第三者に迷惑をかける行為</li>
                <li>本サービスの運営を妨害する行為</li>
                <li>過度な負荷をかける行為</li>
                <li>セキュリティを脅かす行為</li>
                <li>他者の権利を侵害する行為</li>
                <li>虚偽の情報を入力する行為</li>
                <li>本サービスを商用目的で過度に利用する行為</li>
                <li>その他、運営者が不適切と判断する行為</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第6条（知的財産権）</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                <li>本サービスに関する知的財産権は、運営者または正当な権利者に帰属します。</li>
                <li>ソースコードは<a href="https://github.com/[username]/FairSplit" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a>でMITライセンスにて公開しています。</li>
                <li>利用者は、ライセンスの範囲を超えて本サービスを複製・改変・再配布することはできません。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第7条（個人情報の取扱い）</h2>
              <p className="text-gray-700 mb-4">
                個人情報の取扱いについては、別途定める<Link href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>によります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第8条（免責事項）</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-3 ml-4">
                <li>運営者は、本サービスの品質、性能、正確性、安全性について、合理的な努力は行いますが、完全性を保証するものではありません。</li>
                <li>本サービスの利用により利用者に損害が生じた場合、運営者に故意または重大な過失がある場合を除き、運営者は責任を負いません。</li>
                <li>運営者が責任を負う場合であっても、その損害賠償は直接かつ通常の損害に限定され、間接損害や逸失利益については責任を負いません。</li>
                <li>天災、事故、システム障害等の不可抗力による損害については、運営者は責任を負いません。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第9条（サービスの変更・停止・終了）</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                <li>運営者は、本サービスの内容を変更または機能を追加することがあります。</li>
                <li>システム保守、障害対応等のため、本サービスを一時的に停止することがあります。</li>
                <li>運営上の理由により本サービスを終了する場合は、可能な限り事前にお知らせします。</li>
                <li>前各項によって利用者に損害が生じても、運営者は責任を負いません。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第10条（利用制限）</h2>
              <p className="text-gray-700 mb-4">
                利用者が本規約に違反した場合、または本サービスの運営に支障をきたすと判断した場合、
                運営者は当該利用者による本サービスの利用を制限することができます。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第11条（規約の変更）</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                <li>運営者は、必要に応じて本規約を変更することがあります。</li>
                <li>重要な変更の場合は、可能な限り事前にお知らせします。</li>
                <li>変更後の規約は、本サービス上への掲載をもって効力を生じます。</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第12条（お問い合わせ）</h2>
              <p className="text-gray-700 mb-4">
                本サービスに関するお問い合わせ、バグ報告、改善要望等は、
                <a href="https://github.com/[username]/FairSplit/issues" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">GitHub Issues</a>
                にて承ります。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第13条（準拠法・裁判管轄）</h2>
              <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                <li>本規約は日本法に準拠して解釈されます。</li>
                <li>本サービスに関する紛争については、運営者の住所地を管轄する地方裁判所を専属的合意管轄裁判所とします。</li>
              </ol>
            </section>

            <div className="bg-blue-50 rounded-lg p-4 mt-8">
              <p className="text-blue-800 text-sm">
                本規約は2025年8月27日より施行いたします。
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-center">
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