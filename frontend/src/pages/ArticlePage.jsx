import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, getComments, addComment, deleteComment, deletePost } from '../api';
import { useAuth } from '../context/AuthContext';

const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

async function callClaude(systemPrompt, userMsg) {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!key) return 'Add VITE_ANTHROPIC_API_KEY to .env to enable AI features.';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 512, system: systemPrompt, messages: [{ role: 'user', content: userMsg }] })
  });
  const data = await res.json();
  return data.content?.map(b => b.text || '').join('') || '';
}

export default function ArticlePage({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost]           = useState(null);
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cmtBody, setCmtBody]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiNote, setAiNote]       = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    Promise.all([getPost(id), getComments(id)])
      .then(([pr, cr]) => { setPost(pr.data.post); setComments(cr.data.comments); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    await deletePost(id);
    showToast('Post deleted');
    navigate('/');
  };

  const handleAddComment = async () => {
    if (!cmtBody.trim()) return;
    setSubmitting(true);
    try {
      const r = await addComment(id, { body: cmtBody });
      setComments(c => [...c, r.data.comment]);
      setPost(p => ({ ...p, comment_count: (p.comment_count || 0) + 1 }));
      setCmtBody('');
    } catch (e) {
      showToast(e.response?.data?.error || 'Error posting comment', 'error');
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (cid) => {
    await deleteComment(id, cid);
    setComments(c => c.filter(x => x.id !== cid));
    setPost(p => ({ ...p, comment_count: Math.max(0, (p.comment_count || 1) - 1) }));
  };

  const getSummary = async () => {
    setAiLoading(true);
    const res = await callClaude(
      "You are a literary editor. Write a 2-sentence Editor's Note summarising this post in an elegant magazine style.",
      `Title: ${post.title}\n\n${post.content}`
    );
    setAiNote(res);
    setAiLoading(false);
  };

  if (loading) return <div className="loading">Loading…</div>;
  if (!post)   return null;

  const isOwner = user && user.id === post.author_id;

  return (
    <main className="page">
      <button className="back-link" onClick={() => navigate('/')}>← All Posts</button>

      {post.tag && <div className="article-kicker">{post.tag}</div>}
      <h1 className="article-title">{post.title}</h1>
      <div className="article-deck">{post.content.slice(0, 200)}{post.content.length > 200 ? '…' : ''}</div>

      <div className="byline">
        <span>By <strong>{post.author_name}</strong> · {fmt(post.created_at)}
          {post.updated_at !== post.created_at && <> · Updated {fmt(post.updated_at)}</>}
        </span>
        <div className="byline-actions">
          <button className="btn btn-outline btn-sm" onClick={getSummary} disabled={aiLoading}>
            {aiLoading ? 'Thinking…' : '✦ AI Summary'}
          </button>
          {isOwner && <>
            <button className="btn btn-outline btn-sm" onClick={() => navigate(`/posts/${id}/edit`)}>Edit</button>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </>}
        </div>
      </div>

      {aiNote && (
        <div className="ai-panel">
          <div className="ai-panel-label">✦ Editor's Note</div>
          {aiNote}
        </div>
      )}

      <div className="article-body">
        {post.content.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {/* Comments */}
      <section className="comments-section">
        <div className="comments-head">Correspondence ({comments.length})</div>

        {comments.length === 0 && (
          <p style={{ color: 'var(--ink3)', fontStyle: 'italic', fontSize: '0.9rem', paddingBottom: '1rem' }}>
            No letters yet — be the first to respond.
          </p>
        )}

        {comments.map(c => (
          <div className="comment-item" key={c.id}>
            <div className="comment-meta">
              <span><span className="comment-author">{c.author_name}</span> · {fmt(c.created_at)}</span>
              {user && (user.id === c.author_id || user.id === post.author_id) && (
                <button className="btn btn-danger" onClick={() => handleDeleteComment(c.id)}>Remove</button>
              )}
            </div>
            <div className="comment-body">{c.body}</div>
          </div>
        ))}

        {user ? (
          <div className="add-comment">
            <div className="add-comment-title">Leave a Response</div>
            <div className="field">
              <textarea
                value={cmtBody}
                onChange={e => setCmtBody(e.target.value)}
                placeholder="Write your response…"
                style={{ minHeight: '90px' }}
              />
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleAddComment} disabled={submitting || !cmtBody.trim()}>
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        ) : (
          <p className="sign-in-prompt">
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/auth')}>Sign in</button>
            {' '}to leave a response.
          </p>
        )}
      </section>
    </main>
  );
}
