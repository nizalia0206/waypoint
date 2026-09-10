import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMentorRelationships } from '../context/MentorRelationshipsContext';

const TYPE_ICON = {
  call: '📞',
  message: '💬',
  booking: '📅',
  milestone: '🏅',
  reminder: '⏰',
  connection: '🤝',
};

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export default function NotificationCenter() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useMentorRelationships();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleClick = (n) => {
    markNotificationRead(n.id);
    setOpen(false);
    navigate('/features', { state: { scrollTo: 'mentors' } });
  };

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="notif-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Notifications">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
          <path d="M6 10a6 6 0 1 1 12 0c0 3.2 1 5 1.6 5.8H4.4C5 15 6 13.2 6 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="notif-panel">
          <div className="notif-panel-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button className="notif-markall" onClick={markAllNotificationsRead}>Mark all read</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="notif-empty">Nothing yet — your calls and messages will show up here.</p>
          ) : (
            <div className="notif-list">
              {notifications.slice(0, 12).map((n) => (
                <button key={n.id} className={`notif-item${n.read ? '' : ' unread'}`} onClick={() => handleClick(n)}>
                  <span className="notif-icon">{TYPE_ICON[n.type] || '•'}</span>
                  <span className="notif-text">
                    {n.text}
                    <span className="notif-time">{timeAgo(n.ts)}</span>
                  </span>
                  {!n.read && <span className="notif-dot" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
