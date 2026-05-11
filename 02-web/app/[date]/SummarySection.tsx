'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Summary } from '@/lib/types';

export function SummarySection({
  date,
  initialSummary,
  hasEntries,
}: {
  date: string;
  initialSummary: Summary | null;
  hasEntries: boolean;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [confirmRedo, setConfirmRedo] = useState(false);

  async function handleSummarize() {
    if (summary && !confirmRedo) {
      setConfirmRedo(true);
      return;
    }
    setConfirmRedo(false);
    setLoading(true);
    setError('');
    const res = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    if (res.ok) {
      setSummary(await res.json() as Summary);
      router.refresh();
    } else {
      const err = await res.json().catch(() => ({})) as { error?: string };
      setError(err.error ?? '總結生成失敗');
    }
    setLoading(false);
  }

  return (
    <div className="mt-10 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">今日總結</h2>
        {hasEntries && (
          <div className="flex items-center gap-2">
            {confirmRedo && (
              <span className="text-xs text-amber-600">確定要重新生成嗎？</span>
            )}
            {confirmRedo && (
              <button
                onClick={() => setConfirmRedo(false)}
                className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            )}
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-emerald-700 transition-colors"
            >
              {loading ? 'AI 生成中...' : confirmRedo ? '確認重新總結' : summary ? '重新總結' : '生成總結'}
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      {summary ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-xs text-emerald-500 mb-3">
            生成於 {new Date(summary.generatedAt).toLocaleString('zh-TW')}
          </p>
          <div className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
            {summary.content}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-400 text-sm">
          {hasEntries ? '點擊「生成總結」讓 AI 彙整今日工作' : '尚無紀錄可總結'}
        </div>
      )}
    </div>
  );
}
