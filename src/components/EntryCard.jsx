import TagBadge from './TagBadge';

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function EntryCard({ entry, onClick }) {
  const { date, techniques = [], concepts = [], sparring_notes } = entry;

  return (
    <div
      onClick={onClick}
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-slate-500 hover:bg-slate-750 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-semibold text-slate-100 group-hover:text-white transition-colors">
          {formatDate(date)}
        </span>
        <div className="flex gap-3 text-xs text-slate-500 shrink-0 ml-2">
          {techniques.length > 0 && (
            <span>{techniques.length} technique{techniques.length !== 1 ? 's' : ''}</span>
          )}
          {concepts.length > 0 && (
            <span>{concepts.length} concept{concepts.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {techniques.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {techniques.map((t, i) => (
            <div key={i} className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-slate-300 font-medium">{t.name}</span>
              {t.tags?.map(tag => <TagBadge key={tag} tag={tag} />)}
            </div>
          ))}
        </div>
      )}

      {sparring_notes?.trim() && (
        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{sparring_notes}</p>
      )}
    </div>
  );
}
