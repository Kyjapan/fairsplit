export default function Header() {
  return (
    <header className="bg-white dark:bg-neutral-800 shadow-soft border-b border-neutral-200 dark:border-neutral-700">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FS</span>
            </div>
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
              FairSplit
            </h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a 
              href="#" 
              className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              使い方
            </a>
            <a 
              href="#" 
              className="text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              プライバシー
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}