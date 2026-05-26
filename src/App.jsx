import { useState, useEffect, useMemo, useCallback } from 'react';
import { getEntries, createEntry, updateEntry, deleteEntry } from './api';
import EntryList from './components/EntryList';
import EntryModal from './components/EntryModal';
import EntryForm from './components/EntryForm';
import SearchBar from './components/SearchBar';
import Heatmap from './components/Heatmap';
import ReviewMode from './components/ReviewMode';
import TechniqueLibrary from './components/TechniqueLibrary';
import Goals from './components/Goals';

const POSITION_TAGS = [
  'guard', 'half-guard', 'mount', 'side-control', 'back',
  'turtle', 'standing', 'submissions', 'escapes', 'fundamentals',
];

const TABS = [
  { id: 'journal', label: 'Journal' },
  { id: 'review',  label: 'Review'  },
  { id: 'library', label: 'Library' },
  { id: 'goals',   label: 'Goals'   },
];

const BELTS = [
  { id: 'white',  label: 'White',  badge: 'bg-slate-100 text-slate-900', dot: '#e2e8f0' },
  { id: 'blue',   label: 'Blue',   badge: 'bg-blue-600 text-white',      dot: '#2563eb' },
  { id: 'purple', label: 'Purple', badge: 'bg-purple-600 text-white',    dot: '#9333ea' },
  { id: 'brown',  label: 'Brown',  badge: 'bg-amber-900 text-white',     dot: '#92400e' },
  { id: 'black',  label: 'Black',  badge: 'bg-zinc-800 text-white border border-zinc-600', dot: '#27272a' },
];

function useLocalStorage(key, def) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? def; }
    catch { return def; }
  });
  function set(v) { setVal(v); localStorage.setItem(key, JSON.stringify(v)); }
  return [val, set];
}

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#1d4ed8"/>
      <path d="M8 10h12M14 10v9" stroke="white" strokeWidth="2.8" strokeLinecap="round"/>
    </svg>
  );
}

function BeltBadge() {
  const [belt, setBelt] = useLocalStorage('bjj-belt', 'white');
  const [open, setOpen] = useState(false);
  const current = BELTS.find(b => b.id === belt) ?? BELTS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold tracking-wide ${current.badge} transition-opacity hover:opacity-90`}
      >
        {current.label}
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" className="opacity-60">
          <path d="M0 2l4 4 4-4"/>
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-9 left-0 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[140px]">
            {BELTS.map(b => (
              <button
                key={b.id}
                onClick={() => { setBelt(b.id); setOpen(false); }}
                className={`flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                  b.id === belt
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-700/60 hover:text-slate-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: b.dot }} />
                {b.label} Belt
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('journal');
  const [allEntries, setAllEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setAllEntries(await getEntries());
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const entries = useMemo(() => {
    if (!search && !tagFilter) return allEntries;
    return allEntries.filter(e => {
      if (tagFilter && !e.techniques?.some(t => t.tags?.includes(tagFilter))) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.date.includes(q) ||
          e.sparring_notes?.toLowerCase().includes(q) ||
          e.free_notes?.toLowerCase().includes(q) ||
          e.raw_notes?.toLowerCase().includes(q) ||
          e.techniques?.some(t => t.name?.toLowerCase().includes(q) || t.steps?.join(' ').toLowerCase().includes(q)) ||
          e.concepts?.some(c => c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allEntries, search, tagFilter]);

  const totalTechniques = useMemo(
    () => allEntries.reduce((n, e) => n + (e.techniques?.length ?? 0), 0),
    [allEntries]
  );

  async function handleSave(data) {
    if (editingEntry) {
      const updated = await updateEntry(editingEntry.id, data);
      setSelectedEntry(updated);
    } else {
      await createEntry(data);
    }
    setShowForm(false);
    setEditingEntry(null);
    fetchEntries();
  }

  async function handleDelete(id) {
    await deleteEntry(id);
    setSelectedEntry(null);
    fetchEntries();
  }

  function handleEdit(entry) {
    setEditingEntry(entry);
    setSelectedEntry(null);
    setShowForm(true);
  }

  return (
    <div
      className="min-h-screen bg-slate-900"
      style={{
        backgroundImage: 'radial-gradient(rgba(148,163,184,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <header className="bg-slate-950/90 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
        {/* Top accent stripe */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

        <div className="max-w-3xl mx-auto px-4">
          {/* Title row */}
          <div className="flex items-center gap-3 py-3">
            <div className="flex items-center gap-2.5 mr-auto">
              <LogoMark />
              <h1 className="text-sm font-black text-white tracking-[0.12em] uppercase">
                BJJ Journal
              </h1>
            </div>
            <BeltBadge />
            {activeTab === 'journal' && (
              <button
                onClick={() => { setEditingEntry(null); setShowForm(true); }}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
              >
                + New Entry
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex -mb-px">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-blue-500'
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search — journal only */}
          {activeTab === 'journal' && (
            <div className="py-3">
              <SearchBar
                search={search}
                onSearch={setSearch}
                tagFilter={tagFilter}
                onTagFilter={setTagFilter}
                tags={POSITION_TAGS}
              />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {activeTab === 'journal' && (
          <>
            {!loading && allEntries.length > 0 && (
              <div className="mb-6">
                <Heatmap entries={allEntries} />
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-3">
                  <span>{allEntries.length} session{allEntries.length !== 1 ? 's' : ''}</span>
                  <span className="text-slate-700">·</span>
                  <span>{totalTechniques} techniques logged</span>
                </div>
              </div>
            )}
            <EntryList entries={entries} loading={loading} onSelect={setSelectedEntry} />
          </>
        )}
        {activeTab === 'review'  && <ReviewMode entries={allEntries} />}
        {activeTab === 'library' && <TechniqueLibrary entries={allEntries} />}
        {activeTab === 'goals'   && <Goals />}
      </main>

      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showForm && (
        <EntryForm
          entry={editingEntry}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingEntry(null); }}
          positionTags={POSITION_TAGS}
        />
      )}
    </div>
  );
}
