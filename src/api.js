const BASE = '/api';

export async function getEntries() {
  const res = await fetch(`${BASE}/entries`);
  return res.json();
}

export async function createEntry(data) {
  const res = await fetch(`${BASE}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateEntry(id, data) {
  const res = await fetch(`${BASE}/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteEntry(id) {
  await fetch(`${BASE}/entries/${id}`, { method: 'DELETE' });
}

export async function enhanceNotes(rawNotes) {
  const res = await fetch(`${BASE}/enhance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawNotes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Enhance failed');
  return data;
}

export async function getGoals() {
  const res = await fetch(`${BASE}/goals`);
  return res.json();
}

export async function createGoal(text) {
  const res = await fetch(`${BASE}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return res.json();
}

export async function toggleGoal(id, completed) {
  const res = await fetch(`${BASE}/goals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  return res.json();
}

export async function deleteGoal(id) {
  await fetch(`${BASE}/goals/${id}`, { method: 'DELETE' });
}
