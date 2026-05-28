# WorkLog

AI 工作日誌網站 — Claude Code 透過 CLI 自動新增每日工作紀錄，網頁端一鍵生成當日工作總結。

## 功能
- AI（Claude Code）透過 API 直接寫入工作紀錄
- 每次工作進程自動建立當日日期的記錄條目
- 網頁端查看全部日誌，依日期分類
- 一鍵「總結」：彙整當日所有紀錄為一份工作摘要文件

## 技術棧
- Next.js 15 + TypeScript
- 部署：worklog.looptw.com

## 快速開始
```bash
cd 02-web
npm install
npm run dev
```

---

## English

An AI-written work journal. Claude Code appends entries via CLI throughout the day; the web UI generates a one-click summary of everything you shipped.

### Features
- Claude Code writes entries directly via API
- Each work session auto-creates an entry under today's date
- Browse all entries on the web, grouped by date
- One-click "Summarize": rolls the day's entries into a single work-summary document

### Tech stack
- Next.js 15 + TypeScript
- Deployed at worklog.looptw.com

### Quick start
```bash
cd 02-web
npm install
npm run dev
```
