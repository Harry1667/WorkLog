import path from 'path';
import type { LogEntry, Summary, DateStats } from './types';

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');

function getDb() {
  // Dynamic import so Next.js doesn't try to resolve bun:sqlite at build-time on non-Bun runners
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Database } = require('bun:sqlite') as typeof import('bun:sqlite');
  const db = new Database(path.join(DATA_DIR, 'worklog.db'), { create: true });
  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date)`);
  db.run(`
    CREATE TABLE IF NOT EXISTS summaries (
      date TEXT PRIMARY KEY,
      generated_at TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `);
  return db;
}

function toTaiwanParts(d: Date) {
  const fmt = (unit: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', ...unit }).format(d);
  const date = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' });
  const time = fmt({ hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return { date, time };
}

export function createEntry(content: string, date?: string): LogEntry {
  const db = getDb();
  const now = new Date();
  const { date: twDate, time } = toTaiwanParts(now);
  const entryDate = date ?? twDate;
  const timestamp = now.toISOString();
  const id = `${entryDate}-${timestamp.replace(/[-:.TZ]/g, '').slice(0, 15)}`;

  const entry: LogEntry = { id, date: entryDate, time, timestamp, content };
  db.run(
    'INSERT INTO entries (id, date, time, timestamp, content) VALUES (?, ?, ?, ?, ?)',
    [entry.id, entry.date, entry.time, entry.timestamp, entry.content]
  );
  db.close();
  return entry;
}

export function updateEntry(id: string, content: string): boolean {
  const db = getDb();
  const result = db.run('UPDATE entries SET content = ? WHERE id = ?', [content, id]);
  db.close();
  return result.changes > 0;
}

export function deleteEntry(id: string): boolean {
  const db = getDb();
  const result = db.run('DELETE FROM entries WHERE id = ?', [id]);
  db.close();
  return result.changes > 0;
}

export function getEntries(date: string): LogEntry[] {
  const db = getDb();
  const rows = db.query<LogEntry, [string]>(
    'SELECT id, date, time, timestamp, content FROM entries WHERE date = ? ORDER BY timestamp ASC'
  ).all(date);
  db.close();
  return rows;
}

export function getEntriesRange(from: string, to: string): LogEntry[] {
  const db = getDb();
  const rows = db.query<LogEntry, [string, string]>(
    'SELECT id, date, time, timestamp, content FROM entries WHERE date >= ? AND date <= ? ORDER BY date ASC, timestamp ASC'
  ).all(from, to);
  db.close();
  return rows;
}

export function getSummary(date: string): Summary | null {
  const db = getDb();
  const row = db.query<{ date: string; generated_at: string; content: string }, [string]>(
    'SELECT date, generated_at, content FROM summaries WHERE date = ?'
  ).get(date);
  db.close();
  if (!row) return null;
  return { date: row.date, generatedAt: row.generated_at, content: row.content };
}

export function saveSummary(date: string, content: string): Summary {
  const db = getDb();
  const generatedAt = new Date().toISOString();
  db.run(
    'INSERT INTO summaries (date, generated_at, content) VALUES (?, ?, ?) ON CONFLICT(date) DO UPDATE SET generated_at=excluded.generated_at, content=excluded.content',
    [date, generatedAt, content]
  );
  db.close();
  return { date, generatedAt, content };
}

export function listDates(): string[] {
  const db = getDb();
  const rows = db.query<{ date: string }, []>(
    'SELECT DISTINCT date FROM entries ORDER BY date DESC'
  ).all();
  db.close();
  return rows.map(r => r.date);
}

export function getDateStats(date: string): DateStats {
  const db = getDb();
  const countRow = db.query<{ count: number }, [string]>(
    'SELECT COUNT(*) as count FROM entries WHERE date = ?'
  ).get(date);
  const summaryRow = db.query<{ count: number }, [string]>(
    'SELECT COUNT(*) as count FROM summaries WHERE date = ?'
  ).get(date);
  db.close();
  return {
    date,
    entryCount: countRow?.count ?? 0,
    hasSummary: (summaryRow?.count ?? 0) > 0,
  };
}

export function getAllDateStats(): DateStats[] {
  const db = getDb();
  const rows = db.query<{ date: string; entryCount: number; hasSummary: number }, []>(`
    SELECT
      e.date,
      COUNT(e.id) as entryCount,
      CASE WHEN s.date IS NOT NULL THEN 1 ELSE 0 END as hasSummary
    FROM entries e
    LEFT JOIN summaries s ON e.date = s.date
    GROUP BY e.date
    ORDER BY e.date DESC
  `).all();
  db.close();
  return rows.map(r => ({ date: r.date, entryCount: r.entryCount, hasSummary: r.hasSummary === 1 }));
}
