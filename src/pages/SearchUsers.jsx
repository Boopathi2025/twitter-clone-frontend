import { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers } from '../services/api';

export default function SearchUsers() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchUsers(query.trim());
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <form className="search-form" onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username…"
        />
        <button type="submit">Search</button>
      </form>

      {loading && <p className="muted">Searching…</p>}
      {!loading && searched && results.length === 0 && <p className="muted">No users found.</p>}

      <div className="user-list">
        {results.map((u) => (
          <Link key={u.id} to={`/profile/${u.username}`} className="user-list__item">
            {u.profileImageUrl ? (
              <img src={u.profileImageUrl} alt={u.username} className="user-list__avatar" />
            ) : (
              <div className="user-list__avatar user-list__avatar--placeholder">{u.username[0].toUpperCase()}</div>
            )}
            <div>
              <div className="user-list__username">@{u.username}</div>
              {u.bio && <div className="muted">{u.bio}</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
