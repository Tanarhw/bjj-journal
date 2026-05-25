import { useMemo, useState } from 'react';
import TagBadge from './TagBadge';

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ALL_TAGS = ['guard', 'half-guard', 'mount', 'side-control', 'back', 'turtle', 'standing', 'submissions', 'escapes', 'fundamentals'];

export default function TechniqueLibrary({ entries }) {
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [expanded, setExpanded] = useState(null);

  const library = useMemo(() => {
    const map = new Map();
    [...entries].sort((a, b) => a.date.localeCompare(b.date)).forEach(entry => {
      (entry.techniques || []).forEach(t => {
        if (!t.name?.trim()) return;
        const key = t.name.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, { name: t.name.trim(), tags: t.tags || [], steps: [], count: 0, dates: [] });
        }
        const item = map.get(key);
        item.count++;
        item.dates.push(entry.date);
        if (t.steps?.length) {
          item.steps = t.steps; // keep most recent version
          item.tags = [...new Set([...item.tags, ...(t.tags || [])])];
        }
      });
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [entries]);

  const filtered = useMemo(() => {
    return library.filter(t => {
      if (tagFilter && !t.tags.includes(tagFilter)) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [library, search, tagFilter]);

  if (!entries.length) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-3">📚</p>
        <p className="text-slate-400 font-medium">No entries yet</p>
        <p className="text-slate-600 text-sm mt-1">Your technique library will build up as you log classes.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Search + filter */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search techniques..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={tagFilter}
          onChange={e => setTagFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All positions</option>
          {ALL_TAGS.map(tag => (
            <option key={tag} value={tag}>{tag.replace('-', ' ')}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        {filtered.length} technique{filtered.length !== 1 ? 's' : ''}{tagFilter || search ? ' (filtered)' : ''}
      </p>

      <div className="space-y-2">
        {filtered.map(t => {
          const isOpen = expanded === t.name;
          return (
            <div key={t.name} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : t.name)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-wrap min-w-0">
                  <span className="font-medium text-slate-100">{t.name}</span>
                  {t.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs text-slate-500">
                    {t.count}× · last {formatDate(t.dates[t.dates.length - 1])}
                  </span>
                  <span className={`text-slate-500 text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-700 px-4 py-4">
                  {t.steps.length > 0 ? (
                    <ol className="space-y-2">
                      {t.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-300">
                          <span className="text-blue-400 font-semibold shrink-0">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-sm text-slate-500">No steps recorded.</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {t.dates.map(d => (
                      <span key={d} className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">{formatDate(d)}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
