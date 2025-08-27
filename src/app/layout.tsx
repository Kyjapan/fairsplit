import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FairSplit - 公平な割り勘計算アプリ',
  description: '役職に応じた傾斜配分で公平な割り勘計算を実現。複数次会対応、CSV出力、URL共有機能搭載。データはブラウザ内でのみ処理されプライバシーも安心。',
  keywords: ['割り勘', '精算', '飲み会', '公平', '役職', '傾斜配分', 'CSV出力'],
  authors: [{ name: 'FairSplit' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'FairSplit - 公平な割り勘計算アプリ',
    description: '役職に応じた傾斜配分で公平な割り勘計算を実現。複数次会対応、CSV出力、URL共有機能搭載。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'FairSplit',
  },
  twitter: {
    card: 'summary',
    title: 'FairSplit - 公平な割り勘計算アプリ',
    description: '役職に応じた傾斜配分で公平な割り勘計算を実現。複数次会対応、CSV出力、URL共有機能搭載。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: '/',
  },
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