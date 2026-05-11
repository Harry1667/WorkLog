import { NextRequest, NextResponse } from 'next/server';
import { createEntry, getEntries, deleteEntry, updateEntry } from '@/lib/storage';
import { checkAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const deny = checkAuth(req);
  if (deny) return deny;

  const body = await req.json().catch(() => ({})) as { content?: string; date?: string };
  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }
  const entry = createEntry(body.content.trim(), body.date);
  return NextResponse.json(entry, { status: 201 });
}

export async function GET(req: NextRequest) {
  const deny = checkAuth(req);
  if (deny) return deny;

  const date = req.nextUrl.searchParams.get('date');
  if (!date) {
    return NextResponse.json({ error: 'date query param required' }, { status: 400 });
  }
  const entries = getEntries(date);
  return NextResponse.json({ entries });
}

export async function PATCH(req: NextRequest) {
  const deny = checkAuth(req);
  if (deny) return deny;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id query param required' }, { status: 400 });
  }
  const body = await req.json().catch(() => ({})) as { content?: string };
  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }
  const updated = updateEntry(id, body.content.trim());
  if (!updated) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const deny = checkAuth(req);
  if (deny) return deny;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id query param required' }, { status: 400 });
  }
  const deleted = deleteEntry(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
