export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex items-center justify-center h-full text-gray-400">
      <div className="text-center">
        <p className="text-lg">← 點選左側日期查看工作日誌</p>
        <p className="text-sm mt-2 font-mono">POST /api/log 新增紀錄</p>
      </div>
    </div>
  );
}
