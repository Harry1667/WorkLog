'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AddEntryForm({ date }: { date: string }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), date }),
    });
    setContent('');
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="新增工作紀錄..."
        rows={3}
        className="w-full border border-gray-200 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
      />
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-indigo-700 transition-colors"
      >
        {loading ? '新增中...' : '新增'}
      </button>
    </form>
  );
}
