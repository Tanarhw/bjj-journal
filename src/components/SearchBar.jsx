export default function SearchBar({ search, onSearch, tagFilter, onTagFilter, tags }) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Search techniques, notes..."
        value={search}
        onChange={e => onSearch(e.target.value)}
        className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <select
        value={tagFilter}
        onChange={e => onTagFilter(e.target.value)}
        className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All positions</option>
        {tags.map(tag => (
          <option key={tag} value={tag}>{tag.replace('-', ' ')}</option>
        ))}
      </select>
    </div>
  );
}
