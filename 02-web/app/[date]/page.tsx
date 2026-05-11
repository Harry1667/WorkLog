import { getEntries, getSummary } from '@/lib/storage';
import { AddEntryForm } from './AddEntryForm';
import { SummarySection } from './SummarySection';
import { EntryItem } from './EntryItem';

export const dynamic = 'force-dynamic';

export default async function DatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const entries = getEntries(date);
  const summary = getSummary(date);

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-mono">{date}</h1>
        <p className="text-sm text-gray-400 mt-1">{entries.length} 筆紀錄</p>
      </div>

      <AddEntryForm date={date} />

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            今天還沒有紀錄，使用上方表單或透過 API 新增
          </div>
        ) : (
          entries.map(entry => (
            <EntryItem key={entry.id} entry={entry} />
          ))
        )}
      </div>

      <SummarySection date={date} initialSummary={summary} hasEntries={entries.length > 0} />
    </div>
  );
}
