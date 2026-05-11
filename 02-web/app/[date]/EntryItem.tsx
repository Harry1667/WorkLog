'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LogEntry } from '@/lib/types';

export function EntryItem({ entry }: { entry: LogEntry }) {
  const [deleting, setDeleting] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setDeleting(true);
    await fetch(`/api/log?id=${encodeURIComponent(entry.id)}`, { method: 'DELETE' });
    router.refresh();
  }

  async function handleSave() {
    if (!editContent.trim() || editContent.trim() === entry.content) {
      setEditing(false);
      setEditContent(entry.content);
      return;
    }
    setSaving(true);
    await fetch(`/api/log?id=${encodeURIComponent(entry.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent.trim() }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  function handleCancelEdit() {
    setEditing(false);
    setEditContent(entry.content);
  }

  if (editing) {
    return (
      <div className="bg-white border border-blue-300 rounded-lg p-4">
        <p className="text-xs text-gray-400 font-mono mb-2">{entry.time}</p>
        <textarea
          className="w-full text-sm text-gray-800 border border-gray-200 rounded p-2 resize-none focus:outline-none focus:border-blue-400 min-h-[80px]"
          value={editContent}
          onChange={e => setEditContent(e.target.value)}
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Escape') handleCancelEdit();
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave();
          }}
        />
        <div className="flex gap-2 mt-2 justify-end">
          <button
            onClick={handleCancelEdit}
            className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-40 transition-colors"
          >
            {saving ? '儲存中...' : '儲存'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 group relative">
      <p className="text-xs text-gray-400 font-mono mb-1">{entry.time}</p>
      <p className="text-sm text-gray-800 whitespace-pre-wrap pr-20">{entry.content}</p>
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {confirm ? (
          <>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-40 transition-colors"
            >
              {deleting ? '...' : '確認刪除'}
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="text-sm px-3 py-1.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="text-base w-8 h-8 flex items-center justify-center rounded text-gray-300 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
              title="編輯此紀錄"
            >
              ✎
            </button>
            <button
              onClick={() => setConfirm(true)}
              className="text-base w-8 h-8 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              title="刪除此紀錄"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  );
}
