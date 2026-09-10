import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';

export default function Footer() {
  const { t } = useSite();
  const location = useLocation();
  const navigate = useNavigate();

  const goTo = (page, id) => (e) => {
    e.preventDefault();
    if (location.pathname === page) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(page, { state: { scrollTo: id } });
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-arrival" aria-hidden="true">
        <span className="footer-arrival-line" />
        <span className="footer-arrival-dot" />
      </div>
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <div className="footer-brand-name">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M5 19L12 5L19 19" stroke="#F3C86B" strokeWidth="1.8" strokeLinejoin="round" />
              <circle cx="12" cy="5" r="1.6" fill="#FBFBFA" />
            </svg>
            Waypoint
          </div>
          <p className="footer-tagline">{t.footer.tagline}</p>
        </div>

        <div className="footer-links">
          <span className="footer-links-title">{t.footer.quickLinks}</span>
          <Link to="/">{t.nav.home}</Link>
          <a href="/features" onClick={goTo('/features', 'journey')}>{t.nav.journey}</a>
          <a href="/features" onClick={goTo('/features', 'match')}>{t.nav.match}</a>
          <a href="/features" onClick={goTo('/features', 'notes')}>{t.nav.notes}</a>
          <a href="/features" onClick={goTo('/features', 'rewards')}>{t.nav.rewards}</a>
          <Link to="/mentor">{t.nav.mentorView}</Link>
          <Link to="/problem-solution">{t.nav.problemSolution}</Link>
        </div>

        <div className="footer-meta">
          <span>{t.footer.line1}</span>
          <span>{t.footer.line2}</span>
        </div>
      </div>
    </footer>
  );
}
