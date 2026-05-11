import { NextRequest, NextResponse } from 'next/server';
import { getEntries, saveSummary } from '@/lib/storage';
import { generateSummary } from '@/lib/proxycli';
import { checkAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const deny = checkAuth(req);
  if (deny) return deny;

  const body = await req.json().catch(() => ({})) as { date?: string };
  if (!body.date) {
    return NextResponse.json({ error: 'date is required' }, { status: 400 });
  }

  const entries = getEntries(body.date);
  if (entries.length === 0) {
    return NextResponse.json({ error: '該日期沒有紀錄可供總結' }, { status: 400 });
  }

  const content = await generateSummary(entries);
  const summary = saveSummary(body.date, content);
  return NextResponse.json(summary);
}
