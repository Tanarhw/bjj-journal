import { useState, useEffect } from 'react';
import { getGoals, createGoal, toggleGoal, deleteGoal } from '../api';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGoals().then(data => { setGoals(data); setLoading(false); });
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const goal = await createGoal(input.trim());
    setGoals(prev => [goal, ...prev]);
    setInput('');
  }

  async function handleToggle(goal) {
    const updated = await toggleGoal(goal.id, !goal.completed);
    setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
  }

  async function handleDelete(id) {
    await deleteGoal(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  }

  const active = goals.filter(g => !g.completed);
  const done = goals.filter(g => g.completed);

  if (loading) return <div className="text-center py-16 text-slate-600 text-sm">Loading...</div>;

  return (
    <div className="max-w-xl">
      {/* Add goal */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-8">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a focus area, e.g. 'Work on guard retention'"
          className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </form>

      {/* Active goals */}
      {active.length === 0 && done.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">🎯</p>
          <p className="text-slate-400 font-medium">No goals yet</p>
          <p className="text-slate-600 text-sm mt-1">Add something to focus on in your next class.</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-2 mb-8">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">In progress</p>
              {active.map(goal => (
                <GoalRow key={goal.id} goal={goal} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {done.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Completed</p>
              {done.map(goal => (
                <GoalRow key={goal.id} goal={goal} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GoalRow({ goal, onToggle, onDelete }) {
  return (
    <div className={`flex items-center gap-3 bg-slate-800 border rounded-xl px-4 py-3 group transition-colors ${
      goal.completed ? 'border-slate-800' : 'border-slate-700'
    }`}>
      <button
        onClick={() => onToggle(goal)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          goal.completed
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'border-slate-600 hover:border-blue-500'
        }`}
      >
        {goal.completed && <span className="text-[10px] leading-none">✓</span>}
      </button>
      <span className={`flex-1 text-sm ${goal.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
        {goal.text}
      </span>
      <button
        onClick={() => onDelete(goal.id)}
        className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
