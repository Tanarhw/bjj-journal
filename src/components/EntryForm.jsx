import { useState } from 'react';
import { enhanceNotes } from '../api';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyTechnique() {
  return { name: '', steps: [''], tags: [] };
}

function emptyConcept() {
  return { name: '', description: '' };
}

const TAG_ACTIVE = {
  'guard':        'bg-blue-600 border-blue-600 text-white',
  'half-guard':   'bg-indigo-600 border-indigo-600 text-white',
  'mount':        'bg-red-600 border-red-600 text-white',
  'side-control': 'bg-orange-500 border-orange-500 text-white',
  'back':         'bg-purple-600 border-purple-600 text-white',
  'turtle':       'bg-amber-500 border-amber-500 text-white',
  'standing':     'bg-green-600 border-green-600 text-white',
  'submissions':  'bg-rose-600 border-rose-600 text-white',
  'escapes':      'bg-teal-600 border-teal-600 text-white',
  'fundamentals': 'bg-slate-500 border-slate-500 text-white',
};

const inputCls = 'bg-slate-700 border border-slate-600 text-slate-100 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function SectionLabel({ children }) {
  return <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">{children}</h3>;
}

export default function EntryForm({ entry, onSave, onCancel, positionTags = [] }) {
  const [date, setDate] = useState(entry?.date ?? today());
  const [techniques, setTechniques] = useState(
    entry?.techniques?.length
      ? entry.techniques.map(t => ({ ...t, steps: t.steps?.length ? t.steps : [''] }))
      : [emptyTechnique()]
  );
  const [concepts, setConcepts] = useState(
    entry?.concepts?.length ? entry.concepts : [emptyConcept()]
  );
  const [spNotes, setSpNotes] = useState(entry?.sparring_notes ?? '');
  const [freeNotes, setFreeNotes] = useState(entry?.free_notes ?? '');
  const [resources, setResources] = useState(entry?.resources ?? []);
  const [rawNotes, setRawNotes] = useState(entry?.raw_notes ?? '');
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState('');

  async function handleEnhance() {
    if (!rawNotes.trim()) return;
    setEnhancing(true);
    setEnhanceError('');
    try {
      const result = await enhanceNotes(rawNotes);
      if (result.techniques?.length) {
        setTechniques(result.techniques.map(t => ({ ...t, steps: t.steps?.length ? t.steps : [''] })));
      }
      if (result.concepts?.length) setConcepts(result.concepts);
      if (result.sparring_notes) setSpNotes(result.sparring_notes);
      if (result.free_notes) setFreeNotes(result.free_notes);
      if (result.resources?.length) setResources(result.resources);
    } catch (e) {
      setEnhanceError(e.message);
    } finally {
      setEnhancing(false);
    }
  }

  function updTech(i, field, val) {
    setTechniques(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
  }
  function updStep(ti, si, val) {
    setTechniques(prev => prev.map((t, idx) => {
      if (idx !== ti) return t;
      const steps = [...t.steps];
      steps[si] = val;
      return { ...t, steps };
    }));
  }
  function addStep(ti) {
    setTechniques(prev => prev.map((t, idx) =>
      idx === ti ? { ...t, steps: [...t.steps, ''] } : t
    ));
  }
  function removeStep(ti, si) {
    setTechniques(prev => prev.map((t, idx) => {
      if (idx !== ti) return t;
      const steps = t.steps.filter((_, i) => i !== si);
      return { ...t, steps: steps.length ? steps : [''] };
    }));
  }
  function toggleTag(ti, tag) {
    setTechniques(prev => prev.map((t, idx) => {
      if (idx !== ti) return t;
      const tags = t.tags?.includes(tag)
        ? t.tags.filter(x => x !== tag)
        : [...(t.tags ?? []), tag];
      return { ...t, tags };
    }));
  }
  function updConcept(i, field, val) {
    setConcepts(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: val } : c));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      date,
      techniques: techniques
        .filter(t => t.name.trim())
        .map(t => ({ ...t, steps: t.steps.filter(s => s.trim()) })),
      concepts: concepts.filter(c => c.name.trim()),
      sparring_notes: spNotes,
      free_notes: freeNotes,
      resources,
      raw_notes: rawNotes,
    });
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-20 flex items-start justify-center p-4 pt-8 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black/50 mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="font-bold text-slate-100 text-lg">{entry ? 'Edit Entry' : 'New Entry'}</h2>
          <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 text-2xl leading-none transition-colors">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className={inputCls}
            />
          </div>

          {/* Quick notes */}
          <section className="bg-blue-950/40 border border-blue-900/50 rounded-xl p-4">
            <label className="block text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">
              Quick Notes → Enhance with AI
            </label>
            <textarea
              placeholder="Dump your rough notes here — technique names, what you drilled, sparring observations, anything. Claude will structure it all."
              value={rawNotes}
              onChange={e => setRawNotes(e.target.value)}
              rows={5}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
            />
            {enhanceError && <p className="text-xs text-red-400 mb-2">{enhanceError}</p>}
            <button
              type="button"
              onClick={handleEnhance}
              disabled={enhancing || !rawNotes.trim()}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {enhancing ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enhancing...
                </>
              ) : '✦ Enhance with AI'}
            </button>
          </section>

          {/* Techniques */}
          <section>
            <SectionLabel>Techniques</SectionLabel>
            <div className="space-y-4">
              {techniques.map((t, ti) => (
                <div key={ti} className="border border-slate-700 rounded-xl p-4 relative">
                  <button
                    type="button"
                    onClick={() => setTechniques(prev => prev.filter((_, idx) => idx !== ti))}
                    className="absolute top-3 right-3 text-slate-600 hover:text-red-400 text-xl leading-none transition-colors"
                  >&times;</button>

                  <input
                    placeholder="Technique name"
                    value={t.name}
                    onChange={e => updTech(ti, 'name', e.target.value)}
                    className={`${inputCls} w-full mb-3 pr-8`}
                  />

                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-1.5">Steps</p>
                    {t.steps.map((step, si) => (
                      <div key={si} className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-slate-600 w-5 text-right shrink-0">{si + 1}.</span>
                        <input
                          placeholder={`Step ${si + 1}`}
                          value={step}
                          onChange={e => updStep(ti, si, e.target.value)}
                          className={`${inputCls} flex-1`}
                        />
                        <button
                          type="button"
                          onClick={() => removeStep(ti, si)}
                          className="text-slate-600 hover:text-red-400 text-lg leading-none shrink-0 transition-colors"
                        >&times;</button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addStep(ti)}
                      className="text-xs text-blue-400 hover:text-blue-300 ml-7 mt-0.5 transition-colors"
                    >+ add step</button>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-2">Position tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {positionTags.map(tag => {
                        const active = t.tags?.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(ti, tag)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              active
                                ? TAG_ACTIVE[tag] ?? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-slate-700 text-slate-400 border-slate-600 hover:border-slate-400'
                            }`}
                          >
                            {tag.replace('-', ' ')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setTechniques(prev => [...prev, emptyTechnique()])}
                className="w-full border-2 border-dashed border-slate-700 rounded-xl py-3 text-sm text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-colors"
              >
                + Add technique
              </button>
            </div>
          </section>

          {/* Concepts */}
          <section>
            <SectionLabel>Positions & Concepts</SectionLabel>
            <div className="space-y-3">
              {concepts.map((c, ci) => (
                <div key={ci} className="border border-slate-700 rounded-xl p-4 relative">
                  <button
                    type="button"
                    onClick={() => setConcepts(prev => prev.filter((_, idx) => idx !== ci))}
                    className="absolute top-3 right-3 text-slate-600 hover:text-red-400 text-xl leading-none transition-colors"
                  >&times;</button>
                  <input
                    placeholder="Concept or position name"
                    value={c.name}
                    onChange={e => updConcept(ci, 'name', e.target.value)}
                    className={`${inputCls} w-full mb-2 pr-8`}
                  />
                  <textarea
                    placeholder="Description, key details..."
                    value={c.description}
                    onChange={e => updConcept(ci, 'description', e.target.value)}
                    rows={2}
                    className={`${inputCls} w-full resize-none`}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setConcepts(prev => [...prev, emptyConcept()])}
                className="w-full border-2 border-dashed border-slate-700 rounded-xl py-3 text-sm text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-colors"
              >
                + Add concept
              </button>
            </div>
          </section>

          <section>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Sparring Notes</label>
            <textarea
              placeholder="What worked, what didn't, patterns you noticed..."
              value={spNotes}
              onChange={e => setSpNotes(e.target.value)}
              rows={3}
              className={`${inputCls} w-full resize-none`}
            />
          </section>

          <section>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Notes</label>
            <textarea
              placeholder="Instructor tips, questions, goals..."
              value={freeNotes}
              onChange={e => setFreeNotes(e.target.value)}
              rows={3}
              className={`${inputCls} w-full resize-none`}
            />
          </section>

          {resources.length > 0 && (
            <section>
              <SectionLabel>Suggested Resources</SectionLabel>
              <div className="space-y-2">
                {resources.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 bg-slate-700/60 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200">{r.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>
                    </div>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(r.searchQuery)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                    >YouTube ↗</a>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              {entry ? 'Save changes' : 'Save entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
