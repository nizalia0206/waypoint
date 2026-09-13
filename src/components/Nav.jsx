import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { getRequests, markRepliesSeen, markThankYousSeen } from '../data/requestsStore';
import AccessibilityPanel from './AccessibilityPanel';
import UserMenu from './UserMenu';
import NotificationsDialog from './NotificationsDialog';

export default function Nav({ toast }) {
  const [open, setOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(true);
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const featuresRef = useRef(null);
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
  // stays accurate without needing a navigation to refresh it.
  useEffect(() => {
    const recompute = () => {
      if (!user) { setNotifCount(0); return; }
      const requests = getRequests();
      if (user.role === 'mentor') {
        const pendingCount = requests.filter((r) => r.status === 'pending').length;
        const thankYouCount = requests.filter((r) => r.thankYouSentAt && !r.thankYouSeenByMentor).length;
        setNotifCount(pendingCount + thankYouCount);
      } else if (user.role === 'student') {
        setNotifCount(requests.filter((r) => r.studentName === user.name && r.reply && !r.replySeenByStudent).length);
      } else {
        setNotifCount(0);
      }
    };
    recompute();
    window.addEventListener('waypoint-requests-updated', recompute);
    return () => window.removeEventListener('waypoint-requests-updated', recompute);
  }, [user, location.pathname]);

  const goToNotifications = () => {
    close();
    if (!user) return;
    if (user.role === 'student') {
      markRepliesSeen(user.name);
      setNotifCount(0);
    } else if (user.role === 'mentor') {
      markThankYousSeen();
      // Pending requests still need a mentor decision (accept/decline), so
      // only the thank-you portion of the badge clears on open — the count
      // itself gets recomputed by the store-change listener regardless.
    }
    setNotifOpen(true);
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

          {!user && (
            <div className="mobile-nav-auth">
              <Link to="/signin" onClick={close}>{t.auth.signIn}</Link>
            </div>
          )}
        </div>
        <div className="nav-actions">
          <AccessibilityPanel />
          {user && (
            <button className="nav-bell" onClick={goToNotifications} aria-label={t.nav.notifications(notifCount)}>
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none">
                <path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 3h16l-2-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M9.5 20a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              {notifCount > 0 && <span className="nav-bell-badge">{notifCount > 9 ? '9+' : notifCount}</span>}
            </button>
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
      {notifOpen && <NotificationsDialog onClose={() => setNotifOpen(false)} />}
    </nav>
  );
}
