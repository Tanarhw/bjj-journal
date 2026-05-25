import TagBadge from './TagBadge';

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function SectionLabel({ children }) {
  return (
    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">{children}</h3>
  );
}

export default function EntryModal({ entry, onClose, onEdit, onDelete }) {
  const { date, techniques = [], concepts = [], sparring_notes, free_notes, resources = [], raw_notes } = entry;

  function handleDelete() {
    if (confirm('Delete this entry?')) onDelete(entry.id);
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-20 flex items-start justify-center p-4 pt-16 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black/50 mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="font-bold text-slate-100 text-lg">{formatDate(date)}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-2xl leading-none transition-colors">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {techniques.length > 0 && (
            <section>
              <SectionLabel>Techniques</SectionLabel>
              <div className="space-y-3">
                {techniques.map((t, i) => (
                  <div key={i} className="bg-slate-700/60 rounded-xl p-4">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-slate-100">{t.name}</span>
                      {t.tags?.map(tag => <TagBadge key={tag} tag={tag} />)}
                    </div>
                    {t.steps?.length > 0 && (
                      <ol className="list-decimal list-inside space-y-1">
                        {t.steps.map((step, j) => (
                          <li key={j} className="text-sm text-slate-400">{step}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {concepts.length > 0 && (
            <section>
              <SectionLabel>Positions & Concepts</SectionLabel>
              <div className="space-y-2">
                {concepts.map((c, i) => (
                  <div key={i} className="bg-slate-700/60 rounded-xl p-4">
                    <p className="font-semibold text-slate-100 mb-1">{c.name}</p>
                    {c.description && <p className="text-sm text-slate-400">{c.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {sparring_notes?.trim() && (
            <section>
              <SectionLabel>Sparring Notes</SectionLabel>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{sparring_notes}</p>
            </section>
          )}

          {free_notes?.trim() && (
            <section>
              <SectionLabel>Notes</SectionLabel>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{free_notes}</p>
            </section>
          )}

          {raw_notes?.trim() && (
            <section>
              <SectionLabel>Class Notes</SectionLabel>
              <p className="text-sm text-slate-400 whitespace-pre-wrap bg-slate-700/60 rounded-xl p-4">{raw_notes}</p>
            </section>
          )}

          {resources.length > 0 && (
            <section>
              <SectionLabel>Resources</SectionLabel>
              <div className="space-y-2">
                {resources.map((r, i) => (
                  <div key={i} className="border border-slate-700 rounded-xl p-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200">{r.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(r.searchQuery)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                      >YouTube ↗</a>
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent('bjj ' + r.searchQuery)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >Google ↗</a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-700">
          <button onClick={handleDelete} className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors">
            Delete
          </button>
          <button
            onClick={() => onEdit(entry)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
