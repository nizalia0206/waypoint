import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { getRequests, markRepliesSeen } from '../data/requestsStore';
import AccessibilityPanel from './AccessibilityPanel';
import UserMenu from './UserMenu';

export default function Nav({ toast }) {
  const [open, setOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(true);
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState([]);
  const featuresRef = useRef(null);
  const notifRef = useRef(null);
  const close = () => setOpen(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useSite();
  const { user } = useAuth();
  const onHome = location.pathname === '/';

  useEffect(() => {
    const onDocClick = (e) => {
      if (featuresRef.current && !featuresRef.current.contains(e.target)) {
        setFeaturesOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // The transparent-over-hero nav treatment only makes sense on Home, where a
  // dark hero sits directly under it. Every other page keeps the solid nav.
  useEffect(() => {
    if (!onHome) { setScrolled(true); return undefined; }
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onHome]);

  // Recompute on route change and whenever the store actually changes
  // anywhere in the app (accepting a request, sending a reply), so the bell
  // stays accurate without needing a navigation to refresh it. For students
  // this counts unseen replies AND unseen status changes (a mentor accepting
  // — i.e. scheduling a call — or declining), not just replies.
  useEffect(() => {
    const recompute = () => {
      if (!user) { setNotifCount(0); return; }
      const requests = getRequests();
      if (user.role === 'mentor') {
        setNotifCount(requests.filter((r) => r.status === 'pending').length);
      } else if (user.role === 'student') {
        setNotifCount(requests.filter((r) => r.studentName === user.name
          && ((r.reply && !r.replySeenByStudent) || (r.status !== 'pending' && !r.statusSeenByStudent))).length);
      } else {
        setNotifCount(0);
      }
    };
    recompute();
    window.addEventListener('waypoint-requests-updated', recompute);
    return () => window.removeEventListener('waypoint-requests-updated', recompute);
  }, [user, location.pathname]);

  // Opens the small notifications dialog under the bell. For a student this
  // snapshots their recent updates (replies, scheduled calls, declines) to
  // show in the dialog, then marks them seen so the badge clears. For a
  // mentor it's a quick summary of what's waiting in their inbox.
  const toggleNotifPanel = () => {
    if (!user) return;
    setNotifOpen((prevOpen) => {
      const next = !prevOpen;
      if (next) {
        const requests = getRequests();
        if (user.role === 'student') {
          const items = requests
            .filter((r) => r.studentName === user.name && (r.reply || r.status !== 'pending'))
            .sort((a, b) => (a.id < b.id ? 1 : -1))
            .slice(0, 6);
          setNotifItems(items);
          markRepliesSeen(user.name);
          setNotifCount(0);
        } else if (user.role === 'mentor') {
          setNotifItems(requests.filter((r) => r.status === 'pending'));
        }
      }
      return next;
    });
  };

  const goToYourMessages = () => {
    setNotifOpen(false);
    close();
    if (location.pathname === '/features') {
      document.getElementById('your-messages')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/features', { state: { scrollTo: 'your-messages' } });
    }
  };

  const goToMentorRequests = () => {
    setNotifOpen(false);
    close();
    navigate('/mentor');
  };

  // Never touch window.location.hash here — this app uses HashRouter, which
  // owns the URL hash for routing. Scroll manually instead, routing to the
  // target page first if we're not already on it.
  const goTo = (page, id) => (e) => {
    e.preventDefault();
    close();
    setFeaturesOpen(false);
    if (location.pathname === page) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(page, { state: { scrollTo: id } });
    }
  };

  const isActive = (path) => location.pathname === path;
  const dot = (active) => <span className={`nav-waypoint-dot${active ? ' active' : ''}`} aria-hidden="true" />;

  return (
    <nav className={`top${scrolled ? ' scrolled' : ''}`}>
      <div className="wrap">
        <Link to="/" className="brand" onClick={close}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 19L12 5L19 19" stroke="#4D1717" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx="12" cy="5" r="1.6" fill="#174D38" />
          </svg>
          Waypoint
        </Link>
        <div className={`navlinks${open ? ' open' : ''}`} id="navlinks">
          <a href="/" className={isActive('/') ? 'active' : ''} onClick={goTo('/', 'hero')}>{dot(isActive('/'))}{t.nav.home}</a>

          <div className="nav-features" ref={featuresRef}>
            <button
              className={`nav-features-btn${isActive('/features') ? ' active' : ''}`}
              onClick={() => setFeaturesOpen(o => !o)}
              aria-expanded={featuresOpen}
            >
              {dot(isActive('/features'))}
              {t.nav.features}
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" style={{ transform: featuresOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s ease' }}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {featuresOpen && (
              <div className="nav-features-menu">
                <a href="/features" onClick={goTo('/features', 'journey')}><span className="nav-features-mile">01</span>{t.nav.journey}</a>
                <a href="/features" onClick={goTo('/features', 'match')}><span className="nav-features-mile">02</span>{t.nav.match}</a>
                <a href="/features" onClick={goTo('/features', 'notes')}><span className="nav-features-mile">03</span>{t.nav.notes}</a>
                <a href="/features" onClick={goTo('/features', 'rewards')}><span className="nav-features-mile">04</span>{t.nav.rewards}</a>
              </div>
            )}
          </div>

          <Link to="/mentor" className={isActive('/mentor') ? 'active' : ''} onClick={close}>{dot(isActive('/mentor'))}{t.nav.mentorView}</Link>
          <Link to="/problem-solution" className={isActive('/problem-solution') ? 'active' : ''} onClick={close}>{dot(isActive('/problem-solution'))}{t.nav.problemSolution}</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AccessibilityPanel />
          {user && (
            <div className="notif-wrap" ref={notifRef}>
              <button className="nav-bell" onClick={toggleNotifPanel} aria-expanded={notifOpen} aria-label={t.nav.notifications(notifCount)}>
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
                  <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 3h16l-2-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <path d="M9.5 20a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                {notifCount > 0 && <span className="nav-bell-badge">{notifCount > 9 ? '9+' : notifCount}</span>}
              </button>

              {notifOpen && (
                <div className="notif-panel" role="dialog" aria-label={t.nav.notifPanel.title}>
                  <div className="notif-panel-title">{t.nav.notifPanel.title}</div>

                  {user.role === 'mentor' ? (
                    notifItems.length > 0 ? (
                      <>
                        <p className="notif-empty" style={{ fontStyle: 'normal' }}>{t.nav.notifPanel.pendingSummary(notifItems.length)}</p>
                        <button className="notif-view-all" onClick={goToMentorRequests}>{t.nav.notifPanel.goToRequests}</button>
                      </>
                    ) : (
                      <p className="notif-empty">{t.nav.notifPanel.mentorEmpty}</p>
                    )
                  ) : notifItems.length > 0 ? (
                    <>
                      {notifItems.map((r) => (
                        <div className="notif-item" key={r.id} onClick={goToYourMessages}>
                          <div className="notif-item-top">
                            <span>{r.mentorName}</span>
                            <span className="notif-item-meta">{t.match.ask[r.askType] || r.askType}</span>
                          </div>
                          <p className="notif-item-text">
                            {r.status === 'accepted'
                              ? t.nav.notifPanel.scheduled(r.mentorName.split(' ')[0], r.slot)
                              : r.status === 'declined'
                                ? t.nav.notifPanel.declined(r.mentorName.split(' ')[0])
                                : t.nav.notifPanel.replied(r.mentorName.split(' ')[0])}
                          </p>
                        </div>
                      ))}
                      <button className="notif-view-all" onClick={goToYourMessages}>{t.nav.notifPanel.viewAll}</button>
                    </>
                  ) : (
                    <p className="notif-empty">{t.nav.notifPanel.empty}</p>
                  )}
                </div>
              )}
            </div>
          )}
          {user ? (
            <UserMenu toast={toast} />
          ) : (
            <>
              <Link to="/signin" className="nav-signin-link" onClick={close}>{t.auth.signIn}</Link>
              <Link to="/signup" className="nav-signup-btn" onClick={close}>{t.auth.signUp}</Link>
            </>
          )}
          <a className="nav-cta" href="/features" onClick={goTo('/features', 'match')}>{t.nav.cta}</a>
          <button className="mobile-toggle" aria-label="Toggle menu" onClick={() => setOpen(o => !o)}>☰</button>
        </div>
      </div>
    </nav>
  );
}
