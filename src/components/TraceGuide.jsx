import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Mascot from './Mascot';
import { useSite } from '../context/SiteContext';

export default function TraceGuide() {
  const { t } = useSite();
  const location = useLocation();
  const navigate = useNavigate();
  const onFeatures = location.pathname === '/features';
  const [visible, setVisible] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [lineIndex] = useState(() => Math.floor(Math.random() * t.guide.lines.length));

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToMatch = () => {
    if (onFeatures) {
      document.getElementById('match')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/features', { state: { scrollTo: 'match' } });
    }
  };

  if (!visible) return null;

  const line = t.guide.lines[lineIndex] || t.guide.lines[0];

  return (
    <div className="trace-guide" role="button" tabIndex={0}
      onMouseEnter={() => setBubbleOpen(true)}
      onMouseLeave={() => setBubbleOpen(false)}
      onFocus={() => setBubbleOpen(true)}
      onBlur={() => setBubbleOpen(false)}
      onClick={goToMatch}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToMatch(); }}
      aria-label={line}
    >
      <span className="trace-footprints" aria-hidden="true">
        <span className="footprint fp1" />
        <span className="footprint fp2" />
        <span className="footprint fp3" />
      </span>
      {bubbleOpen && <div className="trace-guide-bubble">{line}</div>}
      <Mascot className="trace-guide-img" />
    </div>
  );
}
