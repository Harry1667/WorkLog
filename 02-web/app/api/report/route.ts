import { NextRequest, NextResponse } from 'next/server';
import { getEntriesRange } from '@/lib/storage';
import { generateRangeReport } from '@/lib/proxycli';
import { checkAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const deny = checkAuth(req);
  if (deny) return deny;

  const body = await req.json().catch(() => ({})) as { from?: string; to?: string };
  if (!body.from || !body.to) {
    return NextResponse.json({ error: 'from and to dates are required' }, { status: 400 });
  }

  const entries = getEntriesRange(body.from, body.to);
  if (entries.length === 0) {
    return NextResponse.json({ error: '該期間沒有紀錄可供生成報告' }, { status: 400 });
  }

  const content = await generateRangeReport(entries, body.from, body.to);
  return NextResponse.json({ from: body.from, to: body.to, content, generatedAt: new Date().toISOString() });
}
