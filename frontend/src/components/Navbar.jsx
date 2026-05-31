import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <header className="masthead">
      <div className="masthead-inner">
        <div className="masthead-top">
          <div>
            <div className="logo" onClick={() => navigate('/')}>
              Ink<span>well</span>
            </div>
            <div className="tagline">An independent literary platform · Est. 2025</div>
          </div>
          <div className="user-chip">
            {user
              ? <><span className="user-dot" />{user.username}</>
              : <span>Not signed in</span>}
          </div>
        </div>

        <nav className="masthead-nav">
          <button className={`nav-link${pathname === '/' ? ' active' : ''}`} onClick={() => navigate('/')}>
            All Posts
          </button>

          {user && (
            <button
              className={`nav-link${pathname === '/compose' ? ' active' : ''}`}
              onClick={() => navigate('/compose')}
            >
              Write
            </button>
          )}

          {user ? (
            <button className="nav-link" onClick={() => { signout(); navigate('/'); }}>
              Sign Out
            </button>
          ) : (
            <button className="nav-link cta" onClick={() => navigate('/auth')}>
              Sign In
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
