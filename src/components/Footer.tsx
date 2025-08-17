export default function Footer() {
  return (
    <footer className="bg-neutral-100 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 mt-auto">
      <div className="container py-6">
        <div className="text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
            © 2024 FairSplit. データは保存されません。
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            プライバシーファースト・ステートレス設計
          </p>
        </div>
      </div>
    </footer>
  );
}