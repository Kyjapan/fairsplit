import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FairSplit - スマート割り勘アプリ',
  description: '役職や年収に応じて飲み会の支払い額を自動で傾斜配分する、公平で気まずくない精算アプリ',
  keywords: ['割り勘', '精算', '飲み会', '公平', '役職'],
  authors: [{ name: 'FairSplit Development Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}