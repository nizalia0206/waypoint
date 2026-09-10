import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';

export default function UserMenu({ toast }) {
  const { user, signOut } = useAuth();
  const { t } = useSite();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  if (!user) return null;

  const initials = user.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const dashboardPath = user.role === 'mentor' ? '/mentor' : '/features';

  const handleSignOut = () => {
    signOut();
    setOpen(false);
    toast(t.auth.signedOutToast);
    navigate('/');
  };

  return (
    <div className="user-menu-wrap" ref={ref}>
      <button className="user-menu-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="user-menu-avatar">{initials}</span>
        <span className="user-menu-name">{user.name.split(' ')[0]}</span>
      </button>
      {open && (
        <div className="user-menu-panel">
          <div className="user-menu-info">
            <strong>{user.name}</strong>
            <span className="user-menu-role">{user.role === 'mentor' ? t.auth.roleMentor : t.auth.roleStudent}</span>
          </div>
          <button className="user-menu-item" onClick={() => { setOpen(false); navigate(dashboardPath); }}>
            {t.auth.dashboard}
          </button>
          <button className="user-menu-item signout" onClick={handleSignOut}>
            {t.auth.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
