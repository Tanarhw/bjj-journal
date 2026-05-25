const COLORS = {
  'guard':        'bg-blue-500/20 text-blue-300 ring-1 ring-inset ring-blue-500/30',
  'half-guard':   'bg-indigo-500/20 text-indigo-300 ring-1 ring-inset ring-indigo-500/30',
  'mount':        'bg-red-500/20 text-red-300 ring-1 ring-inset ring-red-500/30',
  'side-control': 'bg-orange-500/20 text-orange-300 ring-1 ring-inset ring-orange-500/30',
  'back':         'bg-purple-500/20 text-purple-300 ring-1 ring-inset ring-purple-500/30',
  'turtle':       'bg-amber-500/20 text-amber-300 ring-1 ring-inset ring-amber-500/30',
  'standing':     'bg-green-500/20 text-green-300 ring-1 ring-inset ring-green-500/30',
  'submissions':  'bg-rose-500/20 text-rose-300 ring-1 ring-inset ring-rose-500/30',
  'escapes':      'bg-teal-500/20 text-teal-300 ring-1 ring-inset ring-teal-500/30',
  'fundamentals': 'bg-slate-500/20 text-slate-300 ring-1 ring-inset ring-slate-500/30',
};

export default function TagBadge({ tag }) {
  const color = COLORS[tag] ?? 'bg-slate-500/20 text-slate-300 ring-1 ring-inset ring-slate-500/30';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {tag.replace('-', ' ')}
    </span>
  );
}
