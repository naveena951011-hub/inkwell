import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, login } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode]       = useState('login');
  const [form, setForm]       = useState({ username: '', email: '', password: '', bio: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { signin } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Please fill all required fields.'); return; }
    if (mode === 'register' && !form.username) { setError('Username is required.'); return; }
    setLoading(true);
    try {
      const res = mode === 'register'
        ? await register({ username: form.username, email: form.email, password: form.password, bio: form.bio })
        : await login({ email: form.email, password: form.password });
      signin(res.data.user, res.data.token);
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong.');
    }
    setLoading(false);
  };

  const toggle = () => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); };

  return (
    <main className="page">
      <div className="auth-wrap">
        <div className="auth-box">
          <h2 className="auth-title">{mode === 'login' ? 'Sign In to Inkwell' : 'Create an Account'}</h2>

          {mode === 'register' && (
            <div className="field">
              <label>Username *</label>
              <input value={form.username} onChange={set('username')} placeholder="your_pen_name" />
            </div>
          )}

          <div className="field">
            <label>Email *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
          </div>

          <div className="field">
            <label>Password *</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" />
          </div>

          {mode === 'register' && (
            <div className="field">
              <label>Short Bio</label>
              <input value={form.bio} onChange={set('bio')} placeholder="A sentence about yourself…" />
            </div>
          )}

          {error && <div className="field-error">{error}</div>}

          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Register'}
            </button>
          </div>

          <div className="auth-toggle">
            {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
            <button onClick={toggle}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button>
          </div>
        </div>
      </div>
    </main>
  );
}
