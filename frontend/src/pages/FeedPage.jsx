import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../api';

const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const excerpt = (s, n = 170) => s.length > n ? s.slice(0, n) + '…' : s;
const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

export default function FeedPage() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      getPosts(query ? { q: query } : {})
        .then(r => setPosts(r.data.posts))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <main className="page">
      <div className="dateline">{today}</div>

      <div className="section-head">
        <h1 className="section-title">Latest Dispatches</h1>
        <span className="ai-badge">✦ AI‑Enhanced</span>
      </div>

      <div className="search-bar">
        <input
          placeholder="Search posts…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {loading && <div className="loading">Loading…</div>}

      {!loading && posts.length === 0 && (
        <div className="empty">No posts found — be the first to write something.</div>
      )}

      {!loading && posts.map(p => (
        <article className="post-card" key={p.id} onClick={() => navigate(`/posts/${p.id}`)}>
          <div>
            <div className="post-meta">
              <span className="by">{p.author_name}</span>
              {' · '}{fmt(p.created_at)}
              {p.tag && <> · {p.tag}</>}
            </div>
            <h2 className="post-headline">{p.title}</h2>
            <p className="post-excerpt">{excerpt(p.content)}</p>
            {p.tag && <span className="post-tag">{p.tag}</span>}
          </div>
          <div className="post-side">
            <span className="comment-count">💬 {p.comment_count}</span>
          </div>
        </article>
      ))}
    </main>
  );
}
