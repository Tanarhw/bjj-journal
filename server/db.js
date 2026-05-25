import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(join(__dirname, '../bjj.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    techniques TEXT DEFAULT '[]',
    concepts TEXT DEFAULT '[]',
    sparring_notes TEXT DEFAULT '',
    free_notes TEXT DEFAULT '',
    resources TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

try {
  db.exec("ALTER TABLE entries ADD COLUMN resources TEXT DEFAULT '[]'");
} catch {}
try {
  db.exec("ALTER TABLE entries ADD COLUMN raw_notes TEXT DEFAULT ''");
} catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

export default db;
