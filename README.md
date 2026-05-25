# BJJ Journal

A personal training journal for Brazilian Jiu-Jitsu. Log classes, review techniques, and track consistency over time.

## Features

- **Journal** — log techniques (with steps + position tags), concepts, sparring notes, and free-form notes after each class
- **AI enhance** — paste rough bullet points and Claude will structure them, fill in technique steps, and suggest learning resources
- **Review** — flashcard mode to drill your logged techniques; cards cycle back until you mark them done
- **Library** — all techniques aggregated across entries, sorted by how often you've drilled them
- **Goals** — focus areas checklist to carry into each class
- **Heatmap** — GitHub-style training consistency grid for the last 6 months

## Stack

- **Frontend** — React + Vite + Tailwind CSS
- **Backend** — Express + SQLite (Node built-in `node:sqlite`, no native deps)
- **AI** — Anthropic Claude API (`claude-sonnet-4-6`)

## Setup

**Prerequisites:** Node.js 22+ (uses `node:sqlite`), an [Anthropic API key](https://console.anthropic.com)

```bash
git clone https://github.com/Tanarhw/bjj-journal.git
cd bjj-journal
npm install
```

Create a `.env` file in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Running

```bash
npm run dev
```

Opens the Express server on `http://localhost:3001` and Vite on `http://localhost:5173`. Visit the Vite URL in your browser.

The SQLite database (`bjj.db`) is created automatically on first run.
