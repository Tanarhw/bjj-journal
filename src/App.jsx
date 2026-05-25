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
  { id: 'review', label: 'Review' },
  { id: 'library', label: 'Library' },
  { id: 'goals', label: 'Goals' },
];

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
    const data = await getEntries();
    setAllEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Client-side filtering for journal view
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

  const totalTechniques = useMemo(
    () => allEntries.reduce((n, e) => n + (e.techniques?.length ?? 0), 0),
    [allEntries]
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4">
          {/* Title row */}
          <div className="flex items-center justify-between py-3">
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-blue-400">◆</span> BJJ Journal
            </h1>
            {activeTab === 'journal' && (
              <button
                onClick={() => { setEditingEntry(null); setShowForm(true); }}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
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

          {/* Search bar — journal only */}
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
              <div className="mb-5">
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

        {activeTab === 'review' && <ReviewMode entries={allEntries} />}
        {activeTab === 'library' && <TechniqueLibrary entries={allEntries} />}
        {activeTab === 'goals' && <Goals />}
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
