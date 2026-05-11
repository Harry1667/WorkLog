import type { LogEntry } from './types';

export async function generateSummary(entries: LogEntry[]): Promise<string> {
  const lines = entries.map(e => `[${e.time}] ${e.content}`).join('\n');
  const prompt =
    `以下是今天的工作日誌紀錄，請整理成一份清晰的工作總結報告：\n\n${lines}\n\n` +
    `請用繁體中文以條列式列出今天完成的事項、進展和重點，最後附上一段簡短摘要。`;

  return callProxy(prompt);
}

export async function generateRangeReport(entries: LogEntry[], from: string, to: string): Promise<string> {
  const byDate = entries.reduce<Record<string, LogEntry[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  const lines = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, es]) =>
      `【${date}】\n` + es.map(e => `  [${e.time}] ${e.content}`).join('\n')
    )
    .join('\n\n');

  const prompt =
    `以下是 ${from} 至 ${to} 期間的工作日誌紀錄：\n\n${lines}\n\n` +
    `請用繁體中文整理成一份週期性工作報告，條列各日的重點完成事項，最後附上整體進展摘要與建議。`;

  return callProxy(prompt);
}

async function callProxy(prompt: string): Promise<string> {
  const res = await fetch(`${process.env.PROXYCLI_URL}/api/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PROXYCLI_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      project: 'worklog',
      group: 'summary',
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`proxy-cli ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { content: string };
  return data.content;
}
