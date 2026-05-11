'use client';

import { useState } from 'react';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function weeksAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n * 7);
  return d.toISOString().split('T')[0];
}

export function ReportGenerator() {
  const [from, setFrom] = useState(() => weeksAgoStr(1));
  const [to, setTo] = useState(() => todayStr());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<{ from: string; to: string; content: string; generatedAt: string } | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError('');
    setReport(null);
    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to }),
    });
    if (res.ok) {
      setReport(await res.json());
    } else {
      const err = await res.json().catch(() => ({})) as { error?: string };
      setError(err.error ?? '報告生成失敗');
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">開始日期</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">結束日期</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setFrom(weeksAgoStr(1)); setTo(todayStr()); }}
            className="px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            本週
          </button>
          <button
            onClick={() => { setFrom(weeksAgoStr(4)); setTo(todayStr()); }}
            className="px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            本月
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !from || !to}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-indigo-700 transition-colors"
          >
            {loading ? 'AI 生成中...' : '生成報告'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {report ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
          <p className="text-xs text-indigo-400 mb-3 font-mono">
            {report.from} ～ {report.to}　生成於 {new Date(report.generatedAt).toLocaleString('zh-TW')}
          </p>
          <div className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
            {report.content}
          </div>
        </div>
      ) : !loading && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-400 text-sm">
          選擇日期範圍後點擊「生成報告」
        </div>
      )}

      {loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center text-gray-400 text-sm animate-pulse">
          AI 正在整理您的工作報告...
        </div>
      )}
    </div>
  );
}
