import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api';

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

export default function ComposePage({ showToast }) {
  const [form, setForm]         = useState({ title: '', content: '', tag: '' });
  const [aiHint, setAiHint]     = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const aiReview = async () => {
    if (!form.title && !form.content) { setAiHint('Add a title or content first.'); return; }
    setAiLoading(true);
    const res = await callClaude(
      'You are a literary editor at a prestigious magazine. Be concise.',
      `Give 2-3 brief, specific editorial suggestions to improve this blog post draft. One sentence each.\n\nTitle: ${form.title}\n\nContent: ${form.content}`
    );
    setAiHint(res);
    setAiLoading(false);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) { showToast('Title and content are required', 'error'); return; }
    setSaving(true);
    try {
      const r = await createPost({ title: form.title.trim(), content: form.content.trim(), tag: form.tag.trim() });
      showToast('Post published!');
      navigate(`/posts/${r.data.post.id}`);
    } catch (e) {
      showToast(e.response?.data?.error || 'Error publishing', 'error');
    }
    setSaving(false);
  };

  return (
    <main className="page">
      <div className="compose-wrap">
        <h1 className="compose-title">New Dispatch</h1>

        <div className="field">
          <label>Headline *</label>
          <input value={form.title} onChange={set('title')} placeholder="A compelling title…" />
        </div>

        <div className="field">
          <label>Section / Tag</label>
          <input value={form.tag} onChange={set('tag')} placeholder="Culture, Technology, Essay…" />
        </div>

        <div className="field">
          <label>Body *</label>
          <textarea
            value={form.content}
            onChange={set('content')}
            placeholder="Start writing your piece…"
            style={{ minHeight: '260px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
          <button className="btn btn-outline btn-sm" onClick={aiReview} disabled={aiLoading}>
            {aiLoading ? 'Consulting editor…' : '✦ AI Editorial Review'}
          </button>
        </div>

        {aiHint && (
          <div className="ai-panel" style={{ marginBottom: '1.25rem' }}>
            <div className="ai-panel-label">✦ Editorial Notes</div>
            {aiHint}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={submit} disabled={saving || !form.title.trim() || !form.content.trim()}>
            {saving ? 'Publishing…' : 'Publish'}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/')}>Cancel</button>
        </div>
      </div>
    </main>
  );
}
