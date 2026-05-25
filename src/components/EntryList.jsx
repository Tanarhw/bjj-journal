import EntryCard from './EntryCard';

function monthLabel(dateStr) {
  const [y, m] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function groupByMonth(entries) {
  const groups = [];
  let current = null;
  for (const entry of entries) {
    const label = monthLabel(entry.date);
    if (label !== current?.label) {
      current = { label, entries: [] };
      groups.push(current);
    }
    current.entries.push(entry);
  }
  return groups;
}

export default function EntryList({ entries, loading, onSelect }) {
  if (loading) {
    return <div className="text-center py-16 text-slate-600 text-sm">Loading...</div>;
  }
  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-3">🥋</p>
        <p className="text-slate-400 font-medium">No entries yet</p>
        <p className="text-slate-600 text-sm mt-1">Log your first class above.</p>
      </div>
    );
  }

  const groups = groupByMonth(entries);

  return (
    <div className="space-y-8">
      {groups.map(({ label, entries: monthEntries }) => (
        <div key={label}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600">{monthEntries.length}</span>
          </div>
          <div className="space-y-2">
            {monthEntries.map(entry => (
              <EntryCard key={entry.id} entry={entry} onClick={() => onSelect(entry)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
