'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { DateStats } from '@/lib/types';

export function Sidebar({ stats }: { stats: DateStats[] }) {
  const pathname = usePathname();

  return (
    <aside className="w-52 shrink-0 border-r border-gray-200 bg-white flex flex-col h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-gray-100">
        <h1 className="font-bold text-gray-900 text-base">工作日誌</h1>
        <p className="text-xs text-gray-400 mt-0.5">Work Log</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 pb-0">
        {stats.length === 0 && (
          <p className="text-xs text-gray-400 px-3 py-2">尚無日誌</p>
        )}
        {stats.map(({ date, entryCount, hasSummary }) => {
          const isActive = pathname === `/${date}`;
          return (
            <Link
              key={date}
              href={`/${date}`}
              className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="font-mono text-xs">{date}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs text-gray-400">{entryCount}</span>
                {hasSummary && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="已總結" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-gray-100">
        <Link
          href="/report"
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
            pathname === '/report'
              ? 'bg-indigo-50 text-indigo-700 font-medium'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <span className="text-base">📊</span>
          <span>週期報告</span>
        </Link>
      </div>
    </aside>
  );
}
