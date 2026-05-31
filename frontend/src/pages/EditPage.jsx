import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPost, updatePost } from '../api';
import { useAuth } from '../context/AuthContext';

export default function EditPage({ showToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm]     = useState({ title: '', content: '', tag: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPost(id).then(r => {
      const p = r.data.post;
      if (!user || user.id !== p.author_id) { navigate('/'); return; }
      setForm({ title: p.title, content: p.content, tag: p.tag || '' });
    }).finally(() => setLoading(false));
  }, [id]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) { showToast('Title and content required', 'error'); return; }
    setSaving(true);
    try {
      await updatePost(id, form);
      showToast('Post updated!');
      navigate(`/posts/${id}`);
    } catch (e) {
      showToast(e.response?.data?.error || 'Error saving', 'error');
    }
    setSaving(false);
  };

  if (loading) return <div className="loading">Loading…</div>;

  return (
    <main className="page">
      <div className="compose-wrap">
        <h1 className="compose-title">Edit Post</h1>
        <div className="field"><label>Headline *</label><input value={form.title} onChange={set('title')} /></div>
        <div className="field"><label>Tag</label><input value={form.tag} onChange={set('tag')} /></div>
        <div className="field">
          <label>Body *</label>
          <textarea value={form.content} onChange={set('content')} style={{ minHeight: '260px' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button className="btn btn-outline" onClick={() => navigate(`/posts/${id}`)}>Cancel</button>
        </div>
      </div>
    </main>
  );
}
