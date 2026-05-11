import type { Metadata } from 'next';
import { getAllDateStats } from '@/lib/storage';
import { Sidebar } from './Sidebar';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '工作日誌',
  description: 'Work Log',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const stats = getAllDateStats();

  return (
    <html lang="zh-TW">
      <body className="bg-white text-gray-900 antialiased">
        <div className="flex h-screen overflow-hidden">
          <Sidebar stats={stats} />
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
