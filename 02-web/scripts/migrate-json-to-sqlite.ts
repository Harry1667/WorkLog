#!/usr/bin/env bun
/**
 * One-time migration: JSON files in data/logs/ → SQLite worklog.db
 * Run: bun scripts/migrate-json-to-sqlite.ts
 */
import { Database } from 'bun:sqlite';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data');
const JSON_DIR = path.join(path.dirname(DATA_DIR), 'data', 'logs');

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

let entryCount = 0;
let summaryCount = 0;

try {
  const dateDirs = await fs.readdir(JSON_DIR, { withFileTypes: true });
  for (const d of dateDirs) {
    if (!d.isDirectory() || !/^\d{4}-\d{2}-\d{2}$/.test(d.name)) continue;
    const dateDir = path.join(JSON_DIR, d.name);
    const files = await fs.readdir(dateDir);

    for (const file of files) {
      if (file.startsWith('entry-') && file.endsWith('.json')) {
        const raw = await fs.readFile(path.join(dateDir, file), 'utf-8');
        const entry = JSON.parse(raw) as { id: string; date: string; time: string; timestamp: string; content: string };
        db.run(
          'INSERT OR IGNORE INTO entries (id, date, time, timestamp, content) VALUES (?, ?, ?, ?, ?)',
          [entry.id, entry.date, entry.time, entry.timestamp, entry.content]
        );
        entryCount++;
      } else if (file === 'summary.json') {
        const raw = await fs.readFile(path.join(dateDir, file), 'utf-8');
        const s = JSON.parse(raw) as { date: string; generatedAt: string; content: string };
        db.run(
          'INSERT OR IGNORE INTO summaries (date, generated_at, content) VALUES (?, ?, ?)',
          [s.date, s.generatedAt, s.content]
        );
        summaryCount++;
      }
    }
  }
} catch (e) {
  console.log(`No JSON data found at ${JSON_DIR} (or already migrated):`, (e as Error).message);
}

db.close();
console.log(`Migration complete: ${entryCount} entries, ${summaryCount} summaries`);
