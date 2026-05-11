import { ReportGenerator } from './ReportGenerator';

export const dynamic = 'force-dynamic';

export default function ReportPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">週期報告</h1>
        <p className="text-sm text-gray-400 mt-1">選擇日期範圍，讓 AI 彙整工作進展</p>
      </div>
      <ReportGenerator />
    </div>
  );
}
