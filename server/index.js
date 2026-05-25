import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import db from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ maxRetries: 4 });

function parseEntry(e) {
  return {
    ...e,
    techniques: JSON.parse(e.techniques || '[]'),
    concepts: JSON.parse(e.concepts || '[]'),
    resources: JSON.parse(e.resources || '[]'),
  };
}

app.get('/api/entries', (req, res) => {
  const { search, tag } = req.query;
  let entries = db.prepare('SELECT * FROM entries ORDER BY date DESC, created_at DESC').all().map(parseEntry);

  if (search) {
    const q = search.toLowerCase();
    entries = entries.filter(e =>
      e.date.includes(q) ||
      e.sparring_notes?.toLowerCase().includes(q) ||
      e.free_notes?.toLowerCase().includes(q) ||
      e.techniques.some(t =>
        t.name?.toLowerCase().includes(q) ||
        t.steps?.join(' ').toLowerCase().includes(q)
      ) ||
      e.concepts.some(c =>
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      )
    );
  }

  if (tag) {
    entries = entries.filter(e =>
      e.techniques.some(t => t.tags?.includes(tag))
    );
  }

  res.json(entries);
});

app.get('/api/entries/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM entries WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(parseEntry(row));
});

app.post('/api/entries', (req, res) => {
  const { date, techniques = [], concepts = [], sparring_notes = '', free_notes = '', resources = [], raw_notes = '' } = req.body;
  const result = db.prepare(`
    INSERT INTO entries (date, techniques, concepts, sparring_notes, free_notes, resources, raw_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(date, JSON.stringify(techniques), JSON.stringify(concepts), sparring_notes, free_notes, JSON.stringify(resources), raw_notes);
  res.status(201).json(parseEntry(db.prepare('SELECT * FROM entries WHERE id = ?').get(result.lastInsertRowid)));
});

app.put('/api/entries/:id', (req, res) => {
  const { date, techniques = [], concepts = [], sparring_notes = '', free_notes = '', resources = [], raw_notes = '' } = req.body;
  db.prepare(`
    UPDATE entries SET date=?, techniques=?, concepts=?, sparring_notes=?, free_notes=?, resources=?, raw_notes=? WHERE id=?
  `).run(date, JSON.stringify(techniques), JSON.stringify(concepts), sparring_notes, free_notes, JSON.stringify(resources), raw_notes, req.params.id);
  const row = db.prepare('SELECT * FROM entries WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(parseEntry(row));
});

app.delete('/api/entries/:id', (req, res) => {
  db.prepare('DELETE FROM entries WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

app.post('/api/enhance', async (req, res) => {
  try {
    const { rawNotes } = req.body;
    if (!rawNotes?.trim()) return res.status(400).json({ error: 'No notes provided' });
    if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: `You are a BJJ (Brazilian Jiu-Jitsu) training assistant helping a student organize their class notes.
Given rough notes, return a structured JSON object. Rules:
- techniques: for each technique mentioned (even briefly), provide accurate step-by-step breakdown using your BJJ knowledge
  - tags must only be from: guard, half-guard, mount, side-control, back, turtle, standing, submissions, escapes, fundamentals
- concepts: higher-level principles or positions discussed (not specific techniques)
- sparring_notes: observations from rolling/sparring
- free_notes: instructor tips, questions, goals, anything else
- resources: 2-3 suggested ways to learn more, each with title, description (one sentence), and searchQuery (for YouTube/Google)
Return only valid JSON with this exact shape, no markdown:
{"techniques":[{"name":"","steps":[],"tags":[]}],"concepts":[{"name":"","description":""}],"sparring_notes":"","free_notes":"","resources":[{"title":"","description":"","searchQuery":""}]}`,
      messages: [{ role: 'user', content: rawNotes }],
    });

    const raw = message.content[0].text;
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: 'AI returned no JSON' });
    res.json(JSON.parse(match[0]));
  } catch (e) {
    console.error('Enhance error:', e.message);
    const msg = e.status === 529
      ? 'Anthropic is overloaded — wait a few seconds and try again'
      : (e.message || 'Enhance failed');
    res.status(500).json({ error: msg });
  }
});

app.get('/api/goals', (req, res) => {
  res.json(db.prepare('SELECT * FROM goals ORDER BY completed ASC, created_at DESC').all());
});

app.post('/api/goals', (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'text required' });
  const result = db.prepare('INSERT INTO goals (text) VALUES (?)').run(text.trim());
  res.status(201).json(db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid));
});

app.patch('/api/goals/:id', (req, res) => {
  db.prepare('UPDATE goals SET completed = ? WHERE id = ?').run(req.body.completed ? 1 : 0, req.params.id);
  res.json(db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id));
});

app.delete('/api/goals/:id', (req, res) => {
  db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

app.listen(3001, () => console.log('Server: http://localhost:3001'));
