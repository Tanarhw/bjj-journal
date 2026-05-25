import { useState, useMemo } from 'react';
import TagBadge from './TagBadge';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ALL_TAGS = ['guard', 'half-guard', 'mount', 'side-control', 'back', 'turtle', 'standing', 'submissions', 'escapes', 'fundamentals'];

export default function ReviewMode({ entries }) {
  const [tagFilter, setTagFilter] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const fullDeck = useMemo(() => {
    const cards = [];
    entries.forEach(entry => {
      (entry.techniques || []).forEach(t => {
        if (t.name?.trim() && t.steps?.length) {
          cards.push({ ...t, entryDate: entry.date });
        }
      });
    });
    return shuffle(cards);
  }, [entries, sessionKey]); // eslint-disable-line

  const deck = useMemo(() =>
    tagFilter ? fullDeck.filter(t => t.tags?.includes(tagFilter)) : fullDeck,
    [fullDeck, tagFilter]
  );

  const [queue, setQueue] = useState(deck);
  const [gotIt, setGotIt] = useState(0);
  const total = useMemo(() => deck.length, [deck]);

  // Reset when deck changes (filter or new session)
  useMemo(() => {
    setQueue(deck);
    setGotIt(0);
    setRevealed(false);
  }, [deck]);

  if (!entries.length) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-3">📖</p>
        <p className="text-slate-400 font-medium">No entries yet</p>
        <p className="text-slate-600 text-sm mt-1">Add some class notes first.</p>
      </div>
    );
  }

  if (!total) {
    return (
      <div className="text-center py-24">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-slate-400 font-medium">No techniques with steps to review</p>
        <p className="text-slate-600 text-sm mt-1">
          {tagFilter ? 'Try a different position filter.' : 'Add technique steps in your entries.'}
        </p>
      </div>
    );
  }

  // Completion screen
  if (queue.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <p className="text-5xl mb-4">🎯</p>
        <h2 className="text-xl font-bold text-slate-100 mb-2">Session complete</h2>
        <p className="text-slate-400 mb-8">
          You got <span className="text-blue-400 font-semibold">{gotIt}</span> of <span className="font-semibold text-slate-300">{total}</span> techniques
        </p>
        <button
          onClick={() => setSessionKey(k => k + 1)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
        >
          Restart deck
        </button>
      </div>
    );
  }

  const card = queue[0];
  const reviewed = total - queue.length;

  function handleGotIt() {
    setGotIt(g => g + 1);
    setQueue(q => q.slice(1));
    setRevealed(false);
  }

  function handleReviewAgain() {
    setQueue(q => [...q.slice(1), q[0]]);
    setRevealed(false);
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Tag filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setTagFilter('')}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            !tagFilter
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
          }`}
        >
          All
        </button>
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              tagFilter === tag
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {tag.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-500">{reviewed} / {total} reviewed</span>
        <span className="text-xs text-slate-500">{queue.length} remaining</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1 mb-6">
        <div
          className="bg-blue-500 h-1 rounded-full transition-all"
          style={{ width: `${(reviewed / total) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl shadow-black/30 mb-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100 mb-3">{card.name}</h2>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {card.tags?.map(tag => <TagBadge key={tag} tag={tag} />)}
          </div>
          <p className="text-xs text-slate-600 mt-3">{formatDate(card.entryDate)}</p>
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-3 border-2 border-dashed border-slate-600 rounded-xl text-sm text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-colors"
          >
            Reveal steps
          </button>
        ) : (
          <ol className="space-y-2 border-t border-slate-700 pt-5">
            {card.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="text-blue-400 font-semibold shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Action buttons */}
      {revealed && (
        <div className="flex gap-3">
          <button
            onClick={handleReviewAgain}
            className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-600 transition-colors"
          >
            ↺ Review again
          </button>
          <button
            onClick={handleGotIt}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors"
          >
            ✓ Got it
          </button>
        </div>
      )}
    </div>
  );
}
